import { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { connect } from './db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	
	try {	
		await connect(sql);

		//Try find barcode for setSignedUp
		if (req.method === "GET") {

			const data = await sql.query`
			SELECT Barcode
			FROM [dbo].[Participants]
			WHERE Username = ${req.query.username}
			`;

			console.log(data)

			if (!data.recordset[0]) return res.status(200).json({ barcode: NULL });
			
			return res.status(200).json({ barcode: data.recordset[0].Barcode });

		}

		if (req.method === "POST") {
			
		    	const body = JSON.parse(req.body);
		    
			const userExists = await sql.query`
			SELECT [ParticipantId] FROM [dbo].[Participants]
			WHERE Username = ${body.username}`;
		
		if (userExists.recordset.length === 0) {
		
			const data = await sql.query`
			INSERT INTO [dbo].[Participants]
			VALUES (${body.username},${body.ticketID ?? "NULL"})`;
			
			console.log(JSON.stringify(data))
		} else {
			
			const editData = await sql.query`
			UPDATE [dbo].[Participants]
			SET Barcode = ${body.ticketId ?? "NULL"}
			WHERE Username = ${body.username}`;
			
			console.log(JSON.stringify(editData))
		}

			return res.status(200).json({ success: true });
		}

	} catch (error) {
		return res.status(500).json({ error: error });
	}

	return res.status(405).setHeader("Allow", ["POST", "GET"]);
}
