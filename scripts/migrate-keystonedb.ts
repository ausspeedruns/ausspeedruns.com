import type { User } from "#payload-types.ts";
import * as dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { BasePayload } from "payload";
import pg from "pg";
import type { Volunteer } from "#/payload-types.ts";

import { seed } from "./seed/seed.ts";

// --- Concurrency helper ---
const BATCH_SIZE = 10;
async function runInBatches<T>(items: T[], fn: (item: T) => Promise<void>, batchSize = BATCH_SIZE) {
	for (let i = 0; i < items.length; i += batchSize) {
		await Promise.allSettled(items.slice(i, i + batchSize).map(fn));
	}
}

// --- Lookup caches (legacyKeystoneId → Payload ID) ---
const eventIdMap = new Map<string, number>();
const submissionIdMap = new Map<string, number>();
const runIdMap = new Map<string, number>();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// load envs explicitly (supports .env.local too)
for (const envFile of [".env.local", ".env"]) {
	const full = path.join(projectRoot, envFile);
	if (fs.existsSync(full)) dotenv.config({ path: full, quiet: true });
}

if (process.argv.includes("--reset")) {
	console.log("Resetting database...");
	await resetDatabase();
	console.log("Database reset. Exiting.");
	process.exit(0);
}

async function resetDatabase() {
	const client = new pg.Client({
		// Replace with your actual connection details or use env vars
		connectionString: process.env.DATABASE_URI,
	});

	try {
		await client.connect();

		await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO public;
    `);

		console.log("Database reset complete.");
	} catch (error) {
		console.error("Error resetting database:", error);
		process.exit(1);
	} finally {
		await client.end();
	}
}

async function migrate() {
	const { getPayload } = await import("payload");
	const { default: config } = await import("../src/payload.config.ts");

	const payload = await getPayload({ config });
	const client = new pg.Client({
		connectionString: "postgresql://payloadcms:testing@localhost:5433/keystone_staging",
	});
	await client.connect();

	await migrateRoles(payload, client);
	await migrateUsers(payload, client);
	await migrateEvents(payload, client);
	await migrateSubmissions(payload, client);
	await migrateRuns(payload, client);
	await migrateIncentives(payload, client);
	await migrateVolunteers(payload, client);
	await migrateOrders(payload, client);

	// Add default admin user
	const adminRole = await payload.find({
		collection: "roles",
		where: {
			admin: { equals: true },
		},
		pagination: false,
	});

	if (adminRole.docs.length === 0) {
		console.warn("No admin role found, skipping default admin user creation");
	} else {
		const adminRoleId = adminRole.docs[0].id;

		try {
			await payload.create({
				collection: "users",
				draft: false,
				data: {
					username: "DELETE_ME_POST_SEED",
					email: "test@example.com",
					password: "123456789",
					dateOfBirth: new Date(0).toISOString(),
					_verified: true,
					roles: [adminRoleId],
				},
			});
		} catch (e) {
			handlePayloadCreateError(e, "default admin user");
		}
	}

	await seed(payload);

	await client.end();
	process.exit(0);
}

migrate().catch((err) => {
	console.error(err);
	process.exit(1);
});

async function migrateRoles(payload: BasePayload, pgClient: pg.Client) {
	console.log("Migrating roles...");
	const data = await pgClient.query('SELECT * FROM public."Role"');

	await runInBatches(data.rows, async (role) => {
		const { name, admin, canManageContent, canManageUsers, colour, textColour } = role;
		try {
			await payload.create({
				collection: "roles",
				draft: false,
				data: {
					name,
					admin,
					canManageContent,
					canManageUsers,
					colour,
					textColour,
				},
			});
		} catch (e) {
			handlePayloadCreateError(e, `role ${name}`);
		}
	});
}

async function migrateUsers(payload: BasePayload, pgClient: pg.Client) {
	console.log("Migrating users...");
	const data = await pgClient.query('SELECT * FROM public."User"');

	await runInBatches(data.rows, async (user) => {
		const {
			id,
			name,
			username,
			email,
			password,
			verified,
			dateOfBirth,
			pronouns,
			state,
			discord,
			twitch,
			bluesky,
		} = user;

		let newState: User["state"] = state;
		if (state === "none") {
			newState = undefined;
		} else if (state === "outer") {
			newState = "international";
		}

		try {
			await payload.create({
				collection: "users",
				draft: false,
				data: {
					id,
					_verified: verified,
					name,
					username,
					email,
					password,
					dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : new Date().toISOString(),
					pronouns,
					state: newState,
					socials: {
						Discord: discord,
						Twitch: twitch,
						Bluesky: bluesky,
					},
				},
			});
		} catch (e) {
			handlePayloadCreateError(e, `user ${username}`);
		}
	});
}

async function migrateEvents(payload: BasePayload, pgClient: pg.Client) {
	console.log("Migrating events...");
	const data = await pgClient.query('SELECT * FROM public."Event"');

	// Events have media uploads so we keep them sequential to avoid file I/O contention
	for (const event of data.rows) {
		const {
			id,
			name,
			shortname,
			published,
			acceptingSubmissions,
			acceptingBackups,
			scheduleReleased,
			acceptingVolunteers,
			startDate,
			endDate,
			eventTimezone,
			raised,
			horaro,
			oengus,
			scheduleBlocks,
		} = event;

		const images = await getEventImage(shortname);

		if (!images) {
			console.warn("MISSING IMAGES for event", shortname);
			continue;
		}

		if (!images.logoLight && !images.logoDark) {
			console.warn("MISSING LOGO VARIANT for event", shortname);
		}

		if (!images.hero) {
			console.warn("MISSING HERO IMAGE for event", shortname);
		}

		if (!images.embed) {
			console.warn("MISSING EMBED IMAGE for event", shortname);
		}

		try {
			const imageMediaIds: Record<string, number> = {};

			for (const key in images) {
				const imagePath = images[key as keyof typeof images];
				if (imagePath) {
					const media = await payload.create({
						collection: "media",
						data: {
							alt: `${shortname} ${key}`,
						},
						filePath: imagePath,
					});
					imageMediaIds[key] = media.id;
				}
			}

			const created = await payload.create({
				collection: "events",
				draft: false,
				data: {
					_status: published ? "published" : "draft",
					id,
					name,
					shortName: shortname,
					settings: {
						isAcceptingSubmissions: acceptingSubmissions,
						isAcceptingBackups: acceptingBackups,
						isAcceptingVolunteers: acceptingVolunteers,
					},
					timeSettings: {
						timezone: eventTimezone,
						startTime: startDate ? new Date(startDate).toISOString() : undefined,
						endTime: endDate ? new Date(endDate).toISOString() : undefined,
					},
					postEvent: {
						raised,
					},
					scheduleMetadata: {
						published: scheduleReleased,
						horaro,
						oengus,
						// scheduleBlocks: scheduleBlocks ? JSON.parse(scheduleBlocks) : undefined,
					},
					legacyKeystoneId: id, // Store the old Keystone ID for reference (to be removed later)
					media: {
						hero: imageMediaIds.hero,
						logo: imageMediaIds.logoLight,
						logoDarkMode: imageMediaIds.logoDark,
						embed: imageMediaIds.embed,
					},
				},
			});

			// Cache the legacy → payload ID mapping
			eventIdMap.set(id, created.id);
		} catch (e) {
			handlePayloadCreateError(e, `event ${name}`);
		}
	}
}

const shortnameToFolder = {
	ASAP2025: "PAX2025",
	ASAP2024: "PAX2024",
	ASAP2023: "PAX2023",
	ASAP2022: "PAX2022",
	PAXxAusSpeedruns2021: "PAX2021",
	AusSpeedrunsxPAX2020: "PAX2020",
};

async function getEventImage(eventShortname: string) {
	const folder = shortnameToFolder[eventShortname as keyof typeof shortnameToFolder] || eventShortname;
	const assetsPath = path.join(projectRoot, "scripts/assets", folder);

	if (!fs.existsSync(assetsPath)) {
		console.warn(`Assets folder for event ${eventShortname} not found at path: ${assetsPath}`);
		return null;
	}

	const images: Record<string, string | null> = {
		embed: null,
		hero: null,
		logoLight: null,
		logoDark: null,
	};

	const files = fs.readdirSync(assetsPath);

	for (const file of files) {
		const name = path.parse(file).name.toLowerCase();
		if (name === "embed") images.embed = path.join(assetsPath, file);
		else if (name === "hero") images.hero = path.join(assetsPath, file);
		else if (name === "logo-light-mode") images.logoLight = path.join(assetsPath, file);
		else if (name === "logo-dark-mode") images.logoDark = path.join(assetsPath, file);
		else if (name === "logo" && !images.logoLight) images.logoLight = path.join(assetsPath, file);
	}

	return images;
}

async function migrateSubmissions(payload: BasePayload, pgClient: pg.Client) {
	console.log("Migrating submissions...");
	const data = await pgClient.query('SELECT * FROM public."Submission"');

	await runInBatches(data.rows, async (row) => {
		const {
			id,
			runner,
			game,
			category,
			platform,
			techPlatform,
			estimate,
			possibleEstimate,
			possibleEstimateReason,
			event,
			ageRating,
			specialReqs,
			race,
			racer,
			coop,
			video,
			status,
			willingBackup,
		} = row;

		try {
			const created = await payload.create({
				collection: "submissions",
				draft: false,
				data: {
					id,
					runner,
					game,
					category,
					platform,
					techPlatform,
					ageRating: ageRating === "ra18" ? "r18" : ageRating,
					estimate,
					possibleEstimate,
					possibleEstimateReason,
					specialRequirements: specialReqs,
					raceType: race === "no" ? "noRace" : race === "solo" ? "solo" : race === "only" ? "only" : "noRace",
					racer,
					isCoop: coop,
					video,
					status: status === "submitted" ? "pending" : status,
					canBackup: willingBackup,
					legacyKeystoneId: id,
					// Resolve event from cache instead of querying DB
					...(event && eventIdMap.has(event) ? { event: eventIdMap.get(event) } : {}),
				},
			});

			// Cache the legacy → payload ID mapping
			submissionIdMap.set(id, created.id);
		} catch (e) {
			handlePayloadCreateError(e, `submission ${id}`);
		}
	});
}

async function migrateRuns(payload: BasePayload, pgClient: pg.Client) {
	console.log("Migrating runs...");

	const eventTimezoneData = await payload
		.find({
			collection: "events",
			pagination: false,
		})
		.then((res) => {
			const map = new Map<string, string>();
			res.docs.forEach((event) => {
				if (event.legacyKeystoneId && event.timeSettings?.timezone) {
					map.set(event.legacyKeystoneId, event.timeSettings.timezone);
				}
			});
			return map;
		});

	const runIdRunnersMap = new Map<string, string[]>();
	const runRunnersData = await pgClient.query('SELECT * from public."_Run_runners"');

	for (const row of runRunnersData.rows) {
		const { A: runId, B: runnerId } = row;
		if (!runIdRunnersMap.has(runId)) {
			runIdRunnersMap.set(runId, []);
		}
		runIdRunnersMap.get(runId)!.push(runnerId);
	}

	const data = await pgClient.query('SELECT * FROM public."Run"');

	await runInBatches(data.rows, async (row) => {
		const {
			id,
			game,
			category,
			platform,
			estimate,
			finalTime,
			event,
			youtubeVOD,
			twitchVOD,
			specialRequirements,
			race,
			coop,
			techPlatform,
			scheduledTime,
			racer,
			originalSubmission,
		} = row;
		try {
			// Correct the schedule time to be in the correct UTC time
			// Currently all times are like double timezoned away from what they should be
			const scheduledTimeInEventTZ = scheduledTime
				? new Date(new Date(scheduledTime).getTime() - new Date(scheduledTime).getTimezoneOffset() * 60000)
				: null;

			const created = await payload.create({
				collection: "runs",
				draft: false,
				data: {
					id,
					game,
					category,
					platform,
					estimate,
					time: finalTime,
					youtube: youtubeVOD,
					twitch: twitchVOD,
					specialRequirements,
					isRace: race,
					isCoop: coop,
					techPlatform,
					scheduledTime: scheduledTimeInEventTZ?.toISOString(),
					scheduledTime_tz: (eventTimezoneData.get(event) as "Australia/Melbourne") ?? "Australia/Melbourne", // Cheeky hack
					otherRunners: racer,
					legacyKeystoneId: id,
					// Resolve relationships from cache instead of querying DB
					...(originalSubmission && submissionIdMap.has(originalSubmission)
						? { submission: submissionIdMap.get(originalSubmission) }
						: {}),
					...(event && eventIdMap.has(event) ? { event: eventIdMap.get(event) } : {}),
					runners: runIdRunnersMap.has(id) ? runIdRunnersMap.get(id) : [],
				},
			});

			// Cache the legacy → payload ID mapping
			runIdMap.set(id, created.id);
		} catch (e) {
			handlePayloadCreateError(e, `run ${id}`);
		}
	});
}

async function migrateIncentives(payload: BasePayload, pgClient: pg.Client) {
	console.log("Migrating incentives...");
	const data = await pgClient.query('SELECT * FROM public."Incentive"');

	await runInBatches(data.rows, async (row) => {
		const { id, title, run, event, notes, active, data: incentiveData, type } = row;
		try {
			await payload.create({
				collection: "incentives",
				draft: false,
				data: {
					id,
					title,
					notes,
					isActive: active,
					type,
					data: incentiveData,
					// Resolve relationships from cache instead of querying DB
					...(run && runIdMap.has(run) ? { run: runIdMap.get(run) } : {}),
					...(event && eventIdMap.has(event) ? { event: eventIdMap.get(event) } : {}),
				},
			});
		} catch (e) {
			handlePayloadCreateError(e, `incentive ${id}`);
		}
	});
}

async function migrateVolunteers(payload: BasePayload, pgClient: pg.Client) {
	console.log("Migrating volunteers...");
	const data = await pgClient.query('SELECT * FROM public."Volunteer"');

	await runInBatches(data.rows, async (row) => {
		const {
			id,
			volunteer: userId,
			event,
			roles,
			dayTimes,
			eventHostTime,
			maxDailyHostTime,
			specificGame,
			specificRunner,
			additionalInfo,
		} = row;

		// Roles in Keystone was a multiselect, in Payload it's a single select. We'll just take the first one or default to 'host'
		let role: Volunteer["role"] = ["host"];
		if (roles) {
			try {
				if (Array.isArray(roles)) {
					role = roles.map((role) => {
						switch (role) {
							case "runMgmt":
								return "frontDesk";
							case "social":
								return "stageHand";
							case "tech":
								return "tech";
							case "host":
							default:
								return "host";
						}
					});
				}
			} catch (e) {
				console.warn(`Error processing roles for volunteer ${id}, defaulting to 'host'. Error:`, e);
			}
		}

		let availability: Volunteer["availability"] = [];
		if (dayTimes) {
			try {
				if (Array.isArray(dayTimes)) {
					availability = dayTimes.map((time) => ({ time }));
				}
			} catch (e) {
				console.warn(`Error processing availability for volunteer ${id}, defaulting to empty. Error:`, e);
			}
		}

		try {
			await payload.create({
				collection: "volunteers",
				draft: false,
				data: {
					id,
					volunteer: userId,
					role,
					availability,
					maximumTime: eventHostTime,
					maxDailyHostTime,
					hostSpecificGame: specificGame,
					hostSpecificRunner: specificRunner,
					hostOtherInformation: additionalInfo,
					// Resolve event from cache instead of querying DB
					...(event && eventIdMap.has(event) ? { event: eventIdMap.get(event) } : {}),
				},
			});
		} catch (e) {
			handlePayloadCreateError(e, `volunteer ${id}`);
		}
	});
}

async function migrateOrders(payload: BasePayload, pgClient: pg.Client) {
	console.log("Migrating orders...");

	console.log("\tCreating products");
	const ticketData = await pgClient.query('SELECT * FROM public."Ticket"');
	const shirtData = await pgClient.query('SELECT * FROM public."ShirtOrder"');

	// Go through all the tickets and create products for each unique item
	const uniqueEvents = new Set<string>();
	for (const row of ticketData.rows) {
		if (row.event) uniqueEvents.add(row.event);
	}

	let ticketMap: Record<string, number> = {};

	for (const eventId of uniqueEvents) {
		const eventName = await payload
			.find({ collection: "events", where: { legacyKeystoneId: { equals: eventId } }, pagination: false })
			.then((res) => (res.docs[0] ? res.docs[0].shortName : `Event ${eventId}`));
		try {
			const product = await payload.create({
				collection: "products",
				data: {
					name: `${eventName} Ticket`,
					slug: `ticket-${eventId}`,
					type: "ticket",
					variants: [
						{
							label: "General Admission",
							priceInCents: 3000,
						},
					],
					allowBankTransfer: true,
				},
			});

			ticketMap[eventId] = product.id;
		} catch (e) {
			handlePayloadCreateError(e, `product for event ${eventId}`);
		}
	}

	// Manual Shirt Products
	const shirt2022 = await payload.create({
		collection: "products",
		data: {
			name: `ASM2022 Shirt`,
			slug: `shirt-asm2022`,
			type: "merchandise",
			variants: [
				{ label: "Blue Small", priceInCents: 3050 },
				{ label: "Blue Medium", priceInCents: 3050 },
				{ label: "Blue Large", priceInCents: 3050 },
				{ label: "Blue X-Large", priceInCents: 3050 },
				{ label: "Blue 2 X-Large", priceInCents: 3050 },
				{ label: "Blue 3 X-Large", priceInCents: 3050 },
				{ label: "Blue 4 X-Large", priceInCents: 3050 },
				{ label: "Purple Small", priceInCents: 3050 },
				{ label: "Purple Medium", priceInCents: 3050 },
				{ label: "Purple Large", priceInCents: 3050 },
				{ label: "Purple X-Large", priceInCents: 3050 },
				{ label: "Purple 2 X-Large", priceInCents: 3050 },
				{ label: "Purple 3 X-Large", priceInCents: 3050 },
				{ label: "Purple 4 X-Large", priceInCents: 3050 },
			],
			allowBankTransfer: true,
		},
	});

	const shirt2023 = await payload.create({
		collection: "products",
		data: {
			name: `ASM2023 Shirt`,
			slug: `shirt-asm2023`,
			type: "merchandise",
			variants: [
				{ label: "Small", priceInCents: 3050 },
				{ label: "Medium", priceInCents: 3050 },
				{ label: "Large", priceInCents: 3050 },
				{ label: "X-Large", priceInCents: 3050 },
				{ label: "2 X-Large", priceInCents: 3050 },
				{ label: "3 X-Large", priceInCents: 3050 },
				{ label: "4 X-Large", priceInCents: 3050 },
			],
			allowBankTransfer: true,
		},
	});

	const shirt2024 = await payload.create({
		collection: "products",
		data: {
			name: `ASM2024 Shirt`,
			slug: `shirt-asm2024`,
			type: "merchandise",
			variants: [
				{ label: "Small", priceInCents: 3000 },
				{ label: "Medium", priceInCents: 3000 },
				{ label: "Large", priceInCents: 3000 },
				{ label: "X-Large", priceInCents: 3000 },
				{ label: "2 X-Large", priceInCents: 3000 },
				{ label: "3 X-Large", priceInCents: 3000 },
				{ label: "4 X-Large", priceInCents: 3000 },
			],
			allowBankTransfer: true,
		},
	});

	const shirt2025 = await payload.create({
		collection: "products",
		data: {
			name: `ASM2025 Shirt`,
			slug: `shirt-asm2025`,
			type: "merchandise",
			variants: [
				{ label: "Small", priceInCents: 3000 },
				{ label: "Medium", priceInCents: 3000 },
				{ label: "Large", priceInCents: 3000 },
				{ label: "X-Large", priceInCents: 3000 },
				{ label: "2 X-Large", priceInCents: 3000 },
				{ label: "3 X-Large", priceInCents: 3000 },
				{ label: "4 X-Large", priceInCents: 3000 },
			],
			allowBankTransfer: true,
		},
	});

	console.log("\tConverting shirt orders...");

	await runInBatches(shirtData.rows, async (row) => {
		const { id, user, taken, method, shirtID, paid, notes, size, colour, stripeID, created } = row;

		let productId: number | null = null;
		let shirtColour: string | null = null;
		const createdYear = created ? new Date(created).getFullYear() : null;
		if (createdYear === 2022) {
			productId = shirt2022.id;
			shirtColour = colour === "blue" ? "Blue" : colour === "purple" ? "Purple" : null;
		} else if (createdYear === 2023) productId = shirt2023.id;
		else if (createdYear === 2024) productId = shirt2024.id;
		else if (createdYear === 2025) productId = shirt2025.id;

		let sizeConversion = size;
		if (size === "xs") sizeConversion = "X-Small";
		else if (size === "s") sizeConversion = "Small";
		else if (size === "m") sizeConversion = "Medium";
		else if (size === "l") sizeConversion = "Large";
		else if (size === "xl") sizeConversion = "X-Large";
		else if (size === "xl2") sizeConversion = "2 X-Large";
		else if (size === "xl3") sizeConversion = "3 X-Large";
		else if (size === "xl4") sizeConversion = "4 X-Large";

		if (!productId) {
			console.warn(`No product found for shirt order ${id} with event ${event}, skipping...`);
			return;
		}

		try {
			await payload.create({
				collection: "orders",
				draft: false,
				data: {
					id,
					reference: "ORD-" + shirtID, // You can customize this reference format as needed
					user,
					status: taken ? "collected" : paid ? "completed" : "pending",
					purchaseType: method === "bank" ? "bankTransfer" : method === "stripe" ? "stripe" : "other",
					items: [
						{
							product: productId,
							variantLabel: `${shirtColour ? `${shirtColour} ` : ""}${sizeConversion}`,
							quantity: 1,
							unitPriceInCents: 0, // Price is determined by the product variant, so we can set this to 0
						},
					],
					notes,
					stripe: stripeID ? { sessionId: stripeID } : undefined,
					createdAt: created ? new Date(created).toISOString() : new Date().toISOString(),
					totalInCents: 0,
				},
			});
		} catch (e) {
			handlePayloadCreateError(e, `order (shirt) ${id}`);
		}
	});

	console.log("\tConverting tickets...");

	await runInBatches(ticketData.rows, async (row) => {
		const { id, user, event, taken, method, ticketID, paid, notes, numberOfTickets, stripeID, created } = row;

		try {
			await payload.create({
				collection: "orders",
				draft: false,
				data: {
					id,
					user,
					status: taken ? "collected" : paid ? "completed" : "pending",
					reference: ticketID,
					purchaseType: method === "bank" ? "bankTransfer" : method === "stripe" ? "stripe" : "other",
					items: [
						{
							product: ticketMap[event], // This is a placeholder. You may want to create actual product entries for each ticket type.
							variantLabel: ticketID,
							quantity: numberOfTickets || 1,
							unitPriceInCents: 0,
						},
					],
					notes,
					stripe: stripeID ? { sessionId: stripeID } : undefined,
					createdAt: created ? new Date(created).toISOString() : new Date().toISOString(),
					totalInCents: 0,
				},
			});
		} catch (e) {
			handlePayloadCreateError(e, `order (ticket) ${id}`);
		}
	});
}

function handlePayloadCreateError(e: unknown, context: string) {
	const errors = (e as any)?.data?.errors;

	if (errors) {
		console.error(`Failed to create ${context} due to the following validation errors:`);
		for (const error of errors) {
			console.error(`- ${error.message} (field: ${error.field})`);
		}
	} else {
		console.error(`Failed to create ${context} due to an unexpected error:`, e);
	}
}
