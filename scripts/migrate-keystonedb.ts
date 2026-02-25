import type { User } from "#payload-types.ts";
import * as dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { BasePayload } from "payload";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// load envs explicitly (supports .env.local too)
for (const envFile of [".env.local", ".env"]) {
	const full = path.join(projectRoot, envFile);
	if (fs.existsSync(full)) dotenv.config({ path: full });
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

	// Add default admin user
	try {
		await payload.create({
			collection: "users",
			draft: false,
			data: {
				username: "admin",
				email: "test@example.com",
				password: "123456789",
				dateOfBirth: new Date(0).toISOString(),
			},
		});
	} catch (e) {
		handlePayloadCreateError(e, "default admin user");
	}

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

	for (const role of data.rows) {
		const { id, name, admin, canManageContent, canManageUsers, colour, textColour } = role;
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
	}
}

async function migrateUsers(payload: BasePayload, pgClient: pg.Client) {
	console.log("Migrating users...");
	const data = await pgClient.query('SELECT * FROM public."User"');

	for (const user of data.rows) {
		const { id, name, username, email, password, dateOfBirth, pronouns, state, discord, twitter, twitch, bluesky } =
			user;

		// console.log("Email for user", username, "is", email);

		let newState: User["state"] = state;
		if (state === "none") {
			newState = undefined;
		} else if (state === "outer") {
			newState = "international";
		}

		// continue;

		try {
			await payload.create({
				collection: "users",
				draft: false,
				data: {
					id,
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
	}
}

async function migrateEvents(payload: BasePayload, pgClient: pg.Client) {
	console.log("Migrating events...");
	const data = await pgClient.query('SELECT * FROM public."Event"');

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

			await payload.create({
				collection: "events",
				draft: false,
				data: {
					id,
					name,
					shortname,
					settings: {
						isPublished: published,
						isAcceptingSubmissions: acceptingSubmissions,
						isAcceptingBackups: acceptingBackups,
						isScheduleReleased: scheduleReleased,
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
						horaro,
						oengus,
						scheduleBlocks: scheduleBlocks ? JSON.parse(scheduleBlocks) : undefined,
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

	for (const submission of data.rows) {
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
			specialReqs,
			race,
			racer,
			coop,
			video,
			status,
			willingBackup,
		} = submission;

		try {
			const submission = await payload.create({
				collection: "submissions",
				draft: false,
				data: {
					id,
					runner,
					game,
					category,
					platform,
					techPlatform,
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
					legacyKeystoneId: id, // Store the old Keystone ID for reference (to be removed later)
				},
			});

			// Link submission to event
			if (event) {
				try {
					const eventId = await payload.find({
						collection: "events",
						where: {
							legacyKeystoneId: { equals: event },
						},
					});

					if (eventId.totalDocs === 1) {
						await payload.update({
							collection: "submissions",
							id: submission.id,
							data: {
								event: eventId.docs[0].id,
							},
						});
					}
				} catch (e) {
					handlePayloadCreateError(e, `linking submission ${id} to event ${event}`);
				}
			}
		} catch (e) {
			handlePayloadCreateError(e, `submission ${id}`);
		}
	}
}

async function migrateRuns(payload: BasePayload, pgClient: pg.Client) {
	console.log("Migrating runs...");
	const data = await pgClient.query('SELECT * FROM public."Run"');

	for (const run of data.rows) {
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
		} = run;
		try {
			const run = await payload.create({
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
					scheduledTime: scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
					racers: racer,
					legacyKeystoneId: id, // Store the old Keystone ID for reference (to be removed later)
				},
			});

			// Link to original submission and event
			if (originalSubmission) {
				try {
					const submission = await payload.find({
						collection: "submissions",
						where: {
							legacyKeystoneId: { equals: originalSubmission },
						},
					});
					if (submission.totalDocs === 1) {
						await payload.update({
							collection: "runs",
							id: run.id,
							data: {
								submission: submission.docs[0].id,
							},
						});
					}
				} catch (e) {
					handlePayloadCreateError(e, `linking run ${run.id} to submission ${originalSubmission}`);
				}
			}

			if (event) {
				try {
					const eventId = await payload.find({
						collection: "events",
						where: {
							legacyKeystoneId: { equals: event },
						},
					});
					if (eventId.totalDocs === 1) {
						await payload.update({
							collection: "runs",
							id: run.id,
							data: {
								event: eventId.docs[0].id,
							},
						});
					}
				} catch (e) {
					handlePayloadCreateError(e, `linking run ${run.id} to event ${event}`);
				}
			}
		} catch (e) {
			handlePayloadCreateError(e, `run ${id}`);
		}
	}
}

async function migrateIncentives(payload: BasePayload, pgClient: pg.Client) {
	console.log("Migrating incentives...");
	const data = await pgClient.query('SELECT * FROM public."Incentive"');

	for (const incentive of data.rows) {
		const { id, title, run, event, notes, active, data: incentiveData } = incentive;
		try {
			const incentive = await payload.create({
				collection: "incentives",
				draft: false,
				data: {
					id,
					title,
					notes,
					isActive: active,
					data: incentiveData,
				},
			});

			// Link to run and event
			if (run) {
				try {
					const runId = await payload.find({
						collection: "runs",
						where: {
							legacyKeystoneId: { equals: run },
						},
					});

					if (runId.totalDocs === 1) {
						await payload.update({
							collection: "incentives",
							id: incentive.id,
							data: {
								run: runId.docs[0].id,
							},
						});
					}
				} catch (e) {
					handlePayloadCreateError(e, `linking incentive ${id} to run ${run}`);
				}
			}

			if (event) {
				try {
					const eventId = await payload.find({
						collection: "events",
						where: {
							legacyKeystoneId: { equals: event },
						},
					});
					if (eventId.totalDocs === 1) {
						await payload.update({
							collection: "incentives",
							id: incentive.id,
							data: {
								event: eventId.docs[0].id,
							},
						});
					}
				} catch (e) {
					handlePayloadCreateError(e, `linking incentive ${id} to event ${event}`);
				}
			}
		} catch (e) {
			handlePayloadCreateError(e, `incentive ${id}`);
		}
	}
}

async function migrateVolunteers(payload: BasePayload, pgClient: pg.Client) {
	console.log("Migrating volunteers...");
	const data = await pgClient.query('SELECT * FROM public."Volunteer"');

	for (const volunteer of data.rows) {
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
			experience,
			favMeme,
			runnerManagementAvailability,
			techAvailablity,
			techExperience,
		} = volunteer;

		// Roles in Keystone was a multiselect, in Payload it's a single select. We'll just take the first one or default to 'host'
		let role: "host" | "runnerManagement" | "socialMedia" | "tech" = "host";
		if (roles) {
			try {
				if (Array.isArray(roles) && roles.length > 0) {
					const firstRole = roles[0];
					if (firstRole === "runMgmt") role = "runnerManagement";
					else if (firstRole === "social") role = "socialMedia";
					else if (firstRole === "tech") role = "tech";
				}
			} catch (e) {}
		}

		try {
			const volunteer = await payload.create({
				collection: "volunteers",
				draft: false,
				data: {
					id,
					volunteer: userId,
					role,
					availability: dayTimes,
					eventHostTime,
					maxDailyHostTime,
					hostSpecificGame: specificGame,
					hostSpecificRunner: specificRunner,
					hostOtherInformation: additionalInfo,
					techExperience,
					socialMediaExperience: experience,
					socialMediaFavouriteMeme: favMeme,
				},
			});

			// Link to event
			if (event) {
				try {
					const eventId = await payload.find({
						collection: "events",
						where: {
							legacyKeystoneId: { equals: event },
						},
					});
					if (eventId.totalDocs === 1) {
						await payload.update({
							collection: "volunteers",
							id: volunteer.id,
							data: {
								event: eventId.docs[0].id,
							},
						});
					}
				} catch (e) {
					handlePayloadCreateError(e, `linking volunteer ${id} to event ${event}`);
				}
			}
		} catch (e) {
			handlePayloadCreateError(e, `volunteer ${id}`);
		}
	}
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
