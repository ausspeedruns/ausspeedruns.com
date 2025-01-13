"use client";

import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import styles from "./submissions.module.scss";
import SubmissionAccordion from "../../../components/SubmissionAccordian/SubmissionAccordion";
import { Submission } from "./submission";

export default function Submissions({ submissions }: { submissions: Submission[] }) {
	const [submissionTab, setSubmissionTab] = useState(0);

	// Get all event names for tabs
	// Would just do [...new Set(****)] buuuuuuuut... https://stackoverflow.com/questions/33464504/using-spread-syntax-and-new-set-with-typescript
	const allSubmissionEvents = [...Array.from(new Set(submissions.map((submission) => submission.event?.shortname)))];

	return (
		<div className={styles.submissions}>
			<h3>Submissions (Private)</h3>
			<Box>
				<Tabs value={submissionTab} onChange={(_e: any, newVal: number) => setSubmissionTab(newVal)}>
					{allSubmissionEvents.map((event) => (
						<Tab label={event} key={event} />
					))}
				</Tabs>
			</Box>
			{submissions.map((submission) => {
				if (submission.event?.shortname !== allSubmissionEvents[submissionTab]) return;
				return <SubmissionAccordion key={submission.id} submission={submission} event={submission.event} />;
			})}
		</div>
	);
}
