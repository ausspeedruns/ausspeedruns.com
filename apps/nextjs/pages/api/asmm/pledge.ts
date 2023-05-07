import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { connect } from './db';
import { z } from "zod";

const bodyData = z.object({
	pledge: z.number({ coerce: true }).optional(),
	username: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	await connect(sql);

	if (req.method === "GET") {
		const data = await sql.query`
		SELECT Amount
		FROM [dbo].[Pledges]
		WHERE EventId = 1
		AND ParticipantId = (SELECT [ParticipantId] FROM [dbo].[Participants] WHERE Username = ${req.query.username})
		`;

		console.log(data)

		if (!data.recordset[0]) return res.status(200).json({ pledge: 0 });

		return res.status(200).json({ pledge: data.recordset[0].Amount });
	}

	const userData = bodyData.safeParse(JSON.parse(req.body));

	if (!userData.success) {
		return res.status(400).json({ error: userData.error });
	}

	// Set pledge
	if (req.method === "POST") {
		if (!userData.data.pledge) return res.status(400).json({ error: "Missing pledge amount" })
		// const userExists = await sql.query`
		// SELECT [ParticipantId] FROM [dbo].[Participants]
		// WHERE Username = '${userData.data.username}'`;
		const userExists = await sql.query`
		SELECT [ParticipantId] FROM [dbo].[Participants]
		WHERE Username = 'Softy'`;

		if (userExists.recordset.length === 0) {
			// Make user
			const createUser = await sql.query`
			INSERT INTO [dbo].[Participants]
			VALUES ('${userData.data.username}','NULL')`;

			console.log(JSON.stringify(createUser))
		}

		const existingPledge = await sql.query`
		SELECT PledgeId
		FROM [dbo].[Pledges]
		WHERE EventId = 1
		AND ParticipantId = (SELECT [ParticipantId] FROM [dbo].[Participants] WHERE Username = ${userData.data.username})
		`;

		if (existingPledge.recordset.length === 0) {
			// Create
			const newPledge = await sql.query`
			INSERT INTO [dbo].[Pledges]
			VALUES((SELECT [ParticipantId] FROM [dbo].[Participants] WHERE Username = ${userData.data.username}),1,${userData.data.pledge})
			`;
			console.log("Creating pledge!");
			console.log(JSON.stringify(newPledge));
		} else {
			// Update
			const newPledge = await sql.query`
			UPDATE [dbo].[Pledges]
			SET Amount = ${userData.data.pledge}
			WHERE EventId = 1
			AND ParticipantId = (SELECT [ParticipantId] FROM [dbo].[Participants] WHERE Username = ${userData.data.username})
			`;
			console.log("Updating pledge!");
			console.log(JSON.stringify(newPledge));
		}

		return res.status(200).json({ pledge: userData.data.pledge });
	}

	return res.status(405).setHeader("Allow", ["POST", "GET"]);
}
