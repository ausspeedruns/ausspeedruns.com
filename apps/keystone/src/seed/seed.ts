import { events, users, roles, volunteers, submissions, runs, incentives, images_files } from './data';
import { Context } from '.keystone/types';
// import { prepareToUpload } from './parseToUpload';

const SeedSettings = {
	events: true,
	users: true,
	roles: true,
	submissions: true,
	runs: true,
	incentives: true,
	volunteers: true,
	files: true,
}

export async function insertSeedData(context: Context) {
	console.log(`🌱 Inserting seed data`);

	const createEvent = async (eventData) => {
		let event = await context.query.Event.findOne({
			where: { shortname: eventData.shortname },
			query: 'id',
		});

		if (!event) {
			await context.query.Event.createOne({
				data: eventData,
				query: 'id',
			});
		}
	};

	const createUser = async (userData) => {
		let user = await context.query.User.findOne({
			where: { username: userData.username },
			query: 'id',
		});

		if (!user) {
			await context.query.User.createOne({
				data: userData,
				query: 'id',
			});
		}
	}

	const createRole = async (roleData) => {
		let role = await context.query.Role.findMany({
			where: { name: { equals: roleData.name } },
			query: 'id',
		});

		if (!role) {
			await context.query.Role.createOne({
				data: { ...roleData, event: roleData.event ? { connect: { shortname: roleData.event } } : null },
				query: 'id',
			});
		}
	}

	const createSubmission = async (submissionData) => {
		await context.query.Submission.createOne({
			data: { ...submissionData, runner: { connect: { username: submissionData.runner } }, event: { connect: { shortname: submissionData.event } } },
			query: 'id',
		});
	}

	const createVolunteer = async (volunteerData) => {
		await context.query.Volunteer.createOne({
			data: { ...volunteerData, volunteer: { connect: { username: volunteerData.volunteer } }, event: { connect: { shortname: volunteerData.event } } },
			query: 'id',
		});
	}

	const createRun = async (runData) => {
		await context.query.Run.createOne({
			data: {
				...runData,
				...(runData.runners ? {
					runners: {
						connect: runData.runners.map(runner => {
							return { username: runner }
						})
					}
				} : {}),
				event: {
					connect: {
						shortname: runData.event
					}
				}
			},
			query: 'id',
		});
	};

	const createIncentive = async (incentiveData) => {
		let runs = await context.query.Run.findMany({
			where: { game: { equals: incentiveData.run }, event: { shortname: { equals: incentiveData.event } } },
			query: 'id',
		});

		await context.query.Incentive.createOne({
			data: {
				...incentiveData, ...(runs.length > 0 ? {
					run: { connect: { id: runs[0].id } }, event: {
						connect: { shortname: incentiveData.event }
					}
				} : {})
			},
			query: 'id',
		});
	};

	// const uploadFile = async (fileData) => {
	// 	await context.query[fileData.list].updateOne({
	// 		where: fileData.id,
	// 		data: {
	// 			[fileData.key]: {
	// 				upload: prepareToUpload(__dirname + fileData.file)
	// 			}
	// 		},
	// 		query: 'id',
	// 	})
	// }

	// EVENTS
	// TODO: Add event page data
	if (SeedSettings.events) {
		for (const event of events) {
			console.log(`🎟️  Adding event: ${event.name}`);
			await createEvent(event);
		}
	} else {
		console.log('🎟️  Skipping events')
	}

	// USERS
	if (SeedSettings.users) {
		for (const user of users) {
			if (user.username === "Chell") {
				console.log(`👩 Adding user: ${user.username}`);
			} else {
				console.log(`🤖 Adding user: ${user.username}`);
			}
			await createUser(user);
		}
	} else {
		console.log('🤖 Skipping users');
	}

	// ROLES
	if (SeedSettings.roles) {
		for (const role of roles) {
			console.log(`📛 Adding role: ${role.name}`);
			await createRole(role);
		}
	} else {
		console.log('📛 Skipping roles');
	}

	// POSTS
	// TODO: Add posts

	// SUBMISSIONS
	if (SeedSettings.submissions) {
		for (const submission of submissions) {
			console.log(`📝 Adding submission: ${submission.game}`);
			await createSubmission(submission);
		}
	} else {
		console.log('📝 Skipping submissions');
	}

	// RUNS
	if (SeedSettings.runs) {
		for (const run of runs) {
			console.log(`🏃 Adding run: ${run.game} - ${run.event}`);
			await createRun(run);
		}
	} else {
		console.log('🏃 Skipping runs');
	}

	// INCENTIVES
	if (SeedSettings.incentives) {
		for (const incentive of incentives) {
			console.log(`💰 Adding incentive: ${incentive.run} - ${incentive.title}`);
			await createIncentive(incentive);
		}
	} else {
		console.log('💰 Skipping incentives');
	}

	// VOLUNTEERS
	if (SeedSettings.volunteers) {
		for (const volunteer of volunteers) {
			console.log(`🙋 Adding volunteer submission: ${volunteer.volunteer} - ${volunteer.jobType}`);
			await createVolunteer(volunteer);
		}
	} else {
		console.log('🙋 Skipping volunteers');
	}

	// IMAGES/FILES
	if (SeedSettings.files) {
		// for (const file of images_files) {
		// 	console.log(`📦 Adding image/file: ${file.file} to ${file.list}`);
		// 	await uploadFile(file);
		// }
		console.log(`📦 CURRENTLY AUTOMATICALLY UPLOADING FILES IS UNAVAILABLE. You must manuall upload images :(`)
	} else {
		console.log('📦 Skipping images/files');
	}

	console.log(`✅ Seed data inserted`);
	console.log(`👋 Please start the process with \`yarn run dev\``);
	process.exit();
}