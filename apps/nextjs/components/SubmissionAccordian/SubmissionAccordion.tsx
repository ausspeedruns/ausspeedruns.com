import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import {
	Accordion,
	AccordionActions,
	AccordionDetails,
	AccordionSummary,
	Alert,
	Button,
	IconButton,
	Snackbar,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import CloseIcon from "@mui/icons-material/Close";

import { QUERY_PRIVATE_RESULTS } from "../../pages/user/[username]";

import styles from "./SubmissionAccordion.module.scss";
import SubmissionEditDialog from "./SubmissionEditDialog";

type SubmissionProps = {
	submission: QUERY_PRIVATE_RESULTS["user"]["submissions"][0];
	event: {
		acceptingSubmissions: boolean;
		acceptingBackups: boolean;
		startDate: string;
		endDate: string;
		eventTimezone: string;
	};
};

function RaceTypeLabels(raceType: string) {
	switch (raceType) {
		case "solo":
			return "Can run solo";
		case "only":
			return "Only run as race/co-op";
		default:
			return `Unknown race type (${raceType})`;
	}
}

const StyledAccordion = styled(Accordion)(({ theme }) => ({
	backgroundColor: "#F9F9F9",
}));

const SubmissionAccordion = ({ submission, event }: SubmissionProps) => {
	const [editDialog, setEditDialog] = useState(false);
	const [showSnackbar, setSnackbar] = useState({ error: false, reason: "" });

	const closeDialog = ({ error }: { error?: string }) => {
		setEditDialog(false);
		if (error) {
			setSnackbar({ error: true, reason: error });
		} else {
			setSnackbar({
				error: false,
				reason: `Successfully edited ${submission.game}!`,
			});
		}
	};

	const closeSnackbar = () => {
		setSnackbar({ error: false, reason: "" });
	};

	const isRace = submission.race !== "no";
	const raceOrCoop = submission.coop ? "Co-op" : "Race";

	let colour = "";
	let fontColor = "";
	switch (submission.status) {
		case "accepted":
			colour = "#64ba69";
			break;
		case "backup":
			colour = "#42a5f5";
			break;
		case "rejected":
			colour = "#ef5350";
			fontColor = "#FFFFFF";
			break;
		default:
			break;
	}

	return (
		<StyledAccordion className={styles.submission}>
			<AccordionSummary
				expandIcon={<FontAwesomeIcon icon={faAngleDown} />}
				className={styles.submissionHeader}>
				{submission.status !== "submitted" && (
					<span
						className={styles.submissionStatus}
						style={{ backgroundColor: colour, color: fontColor }}>
						{submission.status}
					</span>
				)}
				<span>
					{submission.game} - {submission.category}
					{isRace && ` - ${raceOrCoop}`}
				</span>
			</AccordionSummary>
			<AccordionDetails className={styles.submissionDetails}>
				<table>
					<tbody>
						<tr>
							<td>Event</td>
							<td>{submission.event.name}</td>
							<td>Game</td>
							<td>{submission.game}</td>
						</tr>
						<tr>
							<td>Category</td>
							<td>{submission.category}</td>
							<td>
								Estimate{" "}
								{submission.possibleEstimate && "between"}
							</td>
							<td>
								{Boolean(submission.possibleEstimate) &&
									submission.possibleEstimate !==
										"00:00:00" &&
									`${submission.possibleEstimate} – `}
								{submission.estimate}
							</td>
						</tr>
						<tr>
							<td>Platform</td>
							<td>{submission.platform}</td>
							<td>Video</td>
							<td>
								<a href={submission.video}>
									{submission.video}
								</a>
							</td>
						</tr>
						<tr>
							<td>Willing to be backup</td>
							<td>{submission.willingBackup ? "Yes" : "No"}</td>
							{submission.newDonationIncentives &&
								submission.newDonationIncentives?.length >
									0 && (
									<>
										<td>
											Donation Challenge
											{submission.newDonationIncentives
												?.length > 1 && "s"}
										</td>
										<td>
											{submission.newDonationIncentives
												.map(
													(incentive) =>
														incentive.title,
												)
												.join(", ")}
										</td>
									</>
								)}
						</tr>
					</tbody>
				</table>
				{isRace && (
					<>
						<h3>{raceOrCoop} Details</h3>
						<table>
							<tbody>
								<tr>
									<td>{raceOrCoop} Type</td>
									<td>
										{RaceTypeLabels(submission.race ?? "")}
									</td>
								</tr>
								<tr>
									<td>Player(s)</td>
									<td>{submission.racer}</td>
								</tr>
							</tbody>
						</table>
					</>
				)}
			</AccordionDetails>
			{(submission.status === "submitted" ||
				submission.status === "rejected") &&
				(event.acceptingSubmissions || event.acceptingBackups) && (
					<AccordionActions>
						<Button
							color="primary"
							variant="contained"
							onClick={() => setEditDialog(true)}>
							Edit
						</Button>
					</AccordionActions>
				)}
			<SubmissionEditDialog
				submission={submission}
				event={event}
				handleClose={closeDialog}
				open={editDialog}
			/>
			<Snackbar
				anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				open={Boolean(showSnackbar.reason)}
				autoHideDuration={showSnackbar.error ? null : 6000}
				onClose={closeSnackbar}
				action={
					showSnackbar.error ? (
						<IconButton
							size="small"
							aria-label="close"
							color="inherit"
							onClick={closeSnackbar}>
							<CloseIcon fontSize="small" />
						</IconButton>
					) : (
						<></>
					)
				}>
				<Alert
					variant="filled"
					severity={showSnackbar.error ? "error" : "success"}
					sx={{ width: "100%" }}>
					{showSnackbar.reason}
				</Alert>
			</Snackbar>
		</StyledAccordion>
	);
};

export default SubmissionAccordion;
