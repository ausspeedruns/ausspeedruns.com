"use client";

import { DocumentRenderer } from "@keystone-6/document-renderer";
import { GameSubmitPage } from "../components/GameSubmitPage";
import { Checkbox, FormControlLabel } from "@mui/material";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { SubmissionPageRef } from "../submissionTypes";

type AcknowledgementProps = {
	show: boolean;
	acceptingBackups: boolean;
	acceptingSubmissions: boolean;
	submissionInstructions?: any;
};

export const Acknowledgement = forwardRef<SubmissionPageRef, AcknowledgementProps>((props, ref) => {
	const [backup, setBackup] = useState(true);

	useImperativeHandle(ref, () => ({
		reset: () => setBackup(true),
		canContinue: true,
	}));

	return (
		<GameSubmitPage title="Submit" show={props.show} childrenJustify="space-evenly">
			{props.acceptingBackups && props.acceptingSubmissions && (
				<FormControlLabel
					control={
						<Checkbox
							onChange={(e) => setBackup(e.target.checked)}
							value={backup}
							checked={backup}
							name="willingBackup"
						/>
					}
					label="Allow as backup run"
				/>
			)}
			{props.submissionInstructions && (
				<div>
					<DocumentRenderer document={props.submissionInstructions} />
				</div>
			)}
		</GameSubmitPage>
	);
});
