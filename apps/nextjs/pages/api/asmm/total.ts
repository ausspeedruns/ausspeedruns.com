import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { connect } from './db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "GET") {
		return res.status(405).setHeader("Allow", "GET");
	}

	try {
		await connect(sql);
		const data = await sql.query`
		SELECT CONVERT(DECIMAL(10,2),SUM([Steps]) * 0.71628 / 1000) As KmCount
		FROM [dbo].[StepData]
		WHERE EventId = 1`;
		return res.status(200).json(data.recordset[0]);
	} catch (error) {
		return res.status(500).json({ error: error });
	}
}
