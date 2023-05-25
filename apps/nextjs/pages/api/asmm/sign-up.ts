import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { connect } from './db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") {
		return res.status(405).setHeader("Allow", "POST");
	}

	try {
		const body = JSON.parse(req.body);
		await connect(sql);

		const data = await sql.query`
		INSERT INTO [dbo].[Participants]
		VALUES (${body.username},${body.ticketID ?? "NULL"})`;

		return res.status(200).json({ success: true });
	} catch (error) {
		return res.status(500).json({ error: error });
	}
}
