"use client";

import { GameSubmitPage } from "../components/GameSubmitPage";
import { Checkbox } from "@mantine/core";
import { useState } from "react";
import RichText from "#components/RichText/RichText.tsx";
import type { UseFormReturnType } from "@mantine/form";
import type { GameSubmissionResults } from "../submissionTypes";

interface AcknowledgementProps {
	acceptingBackups: boolean;
	acceptingSubmissions: boolean;
	submissionInstructions?: any;
	form: UseFormReturnType<GameSubmissionResults>;
}

export function Acknowledgement(props: AcknowledgementProps) {
	const [backup, setBackup] = useState(true);

	return (
		<>
			{props.acceptingBackups && props.acceptingSubmissions && (
				<Checkbox
					onChange={(e) => setBackup(e.currentTarget.checked)}
					checked={backup}
					name="willingBackup"
					label="Allow as backup run"
				/>
			)}
			{props.submissionInstructions && (
				<div>
					<RichText data={props.submissionInstructions} enableGutter={false} />
				</div>
			)}
		</>
	);
}
