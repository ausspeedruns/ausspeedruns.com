import { gql } from "urql";
import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	FormHelperText,
	FormLabel,
	InputLabel,
	Radio,
	RadioGroup,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import { useState } from "react";
import { useMutation } from "urql";

import { UserPagePrivateData } from "../../pages/user/[username]";

import styles from "./SubmissionEditDialog.module.scss";
import Availability from "../GameSubmission/Availability";
import { DonationIncentive } from "../GameSubmission/submissionTypes";
import DonationIncentiveInput from "../GameSubmission/DonationIncentive";
import EstimateInput from "../GameSubmission/EstimateInput";

type AgeRatingLiterals = "m_or_lower" | "ma15" | "ra18";
type RaceLiterals = "no" | "solo" | "only";

const MUTATION_SUBMISSION = gql`
	mutation (
		$submissionID: ID!
		$game: String!
		$category: String!
		$platform: String!
		$techPlatform: String!
		$estimate: String!
		$possibleEstimate: String
		$possibleEstimateReason: String
		$ageRating: SubmissionAgeRatingType
		$newDonationIncentives: JSON
		$race: SubmissionRaceType
		$racer: String
		$coop: Boolean
		$video: String!
		$specialReqs: String
		$willingBackup: Boolean
		$availableDates: JSON!
	) {
		updateSubmission(
			where: { id: $submissionID }
			data: {
				game: $game
				category: $category
				platform: $platform
				techPlatform: $techPlatform
				estimate: $estimate
				possibleEstimate: $possibleEstimate
				possibleEstimateReason: $possibleEstimateReason
				ageRating: $ageRating
				newDonationIncentives: $newDonationIncentives
				race: $race
				racer: $racer
				coop: $coop
				video: $video
				specialReqs: $specialReqs
				willingBackup: $willingBackup
				availability: $availableDates
			}
		) {
			__typename
		}
	}
`;

const MUTATION_BACKUP = gql`
	mutation ($submissionID: ID, $willingBackup: Boolean!) {
		updateSubmission(
			where: { id: $submissionID }
			data: { willingBackup: $willingBackup }
		) {
			__typename
		}
	}
`;

const MUTATION_DELETE = gql`
	mutation ($submissionID: ID) {
		deleteSubmission(where: { id: $submissionID }) {
			__typename
		}
	}
`;

type SubmissionEditProps = {
	open: boolean;
	submission: UserPagePrivateData["user"]["submissions"][0];
	event: {
		acceptingSubmissions: boolean;
		acceptingBackups: boolean;
		startDate: string;
		endDate: string;
		eventTimezone: string;
	};
	handleClose: (error?: string) => void;
};

const SubmissionEditDialog = ({
	open,
	submission,
	handleClose,
	event,
}: SubmissionEditProps) => {
	const [deleteDialog, setDeleteDialog] = useState(false);

	const [backup, setBackup] = useState(submission.willingBackup);
	const [game, setGame] = useState(submission.game);
	const [category, setCategory] = useState(submission.category);
	const [estimate, setEstimate] = useState(submission.estimate);
	const [possibleEstimate, setPossibleEstimate] = useState(
		submission.possibleEstimate,
	);
	const [possibleEstimateReason, setPossibleEstimateReason] = useState(
		submission.possibleEstimateReason,
	);
	const [platform, setPlatform] = useState(submission.platform);
	const [techPlatform, setTechPlatform] = useState(submission.techPlatform);
	const [race, setRace] = useState(submission.race);
	const [coop, setCoop] = useState(submission.coop);
	const [racer, setRacer] = useState(submission.racer);
	const [video, setVideo] = useState(submission.video);
	const [ageRating, setAgeRating] = useState(submission.ageRating);
	const [donationIncentives, setDonationIncentives] = useState(
		submission.newDonationIncentives,
	);
	const [specialRequirements, setSpecialRequirements] = useState(
		submission.specialReqs,
	);
	const [availableDates, setAvailableDates] = useState<boolean[]>(
		submission.availability,
	);
	const [showPossibleEstimate, setShowPossibleEstimate] = useState(
		Boolean(submission.possibleEstimate) &&
		submission.possibleEstimate !== "00:00:00",
	);

	const closeDeleteDialog = () => {
		setDeleteDialog(false);
	};

	// Mutation for game submission
	const [submissionResult, editSubmission] = useMutation(MUTATION_SUBMISSION);

	// Mutation for backup
	const [backupResult, editBackup] = useMutation(MUTATION_BACKUP);

	// Mutation for deleting game submission
	const [deleteResult, deleteSubmission] = useMutation(MUTATION_DELETE);

	function handleNewDonationIncentive() {
		if (typeof donationIncentives === "undefined") {
			setDonationIncentives([{ title: "" }]);
		} else {
			setDonationIncentives((prev) => [...prev, { title: "" }]);
		}
	}

	function handleDonationIncentiveCancel(index: number) {
		if (donationIncentives.length === 1) {
			setDonationIncentives(undefined);
		} else {
			setDonationIncentives(
				donationIncentives.filter((_, i) => i !== index),
			);
		}
	}

	function handleDonationIncentiveChange(
		updatedIncentive: DonationIncentive,
		updateIndex: number,
	) {
		setDonationIncentives(
			donationIncentives.map((incentive, i) => {
				if (i === updateIndex) {
					return updatedIncentive;
				} else {
					return incentive;
				}
			}),
		);
	}

	const UpdateSubmission = () => {
		if (!event.acceptingSubmissions) return;
		editSubmission({
			submissionID: submission.id,
			game,
			category,
			platform,
			techPlatform,
			estimate,
			possibleEstimate:
				possibleEstimate === "00:00:00" ? "" : possibleEstimate,
			possibleEstimateReason,
			ageRating,
			newDonationIncentives: donationIncentives,
			race,
			racer,
			coop,
			video,
			specialReqs: specialRequirements,
			willingBackup: backup,
			availableDates,
		}).then((result) => {
			if (!result.error) {
				handleClose();
			} else {
				handleClose(result.error.message);
				console.error(result.error);
			}
		});
	};

	const BackupSubmission = () => {
		if (!event.acceptingBackups && submission.status !== "accepted") return;
		editBackup({
			submissionID: submission.id,
			willingBackup: backup,
		}).then((result) => {
			if (!result.error) {
				handleClose();
			} else {
				handleClose(result.error.message);
				console.error(result.error);
			}
		});
	};

	const DeleteSubmission = () => {
		deleteSubmission({ submissionID: submission.id });
	};

	return (
		<Dialog onClose={handleClose} open={open}>
			<DialogTitle>
				Edit {submission.game} – {submission.category}
			</DialogTitle>
			<DialogContent className={styles.content} style={{ paddingTop: 8 }}>
				<h3>Speedrun Info</h3>
				<TextField
					disabled={!event.acceptingSubmissions}
					label="Category"
					value={category}
					onChange={(e) => setCategory(e.target.value)}
				/>
				<EstimateInput
					value={estimate}
					disabled={!event.acceptingSubmissions}
					required
					onTimeChange={(time) => setEstimate(time)}
				/>

				<FormControlLabel
					control={
						<Checkbox
							onChange={(e) =>
								setShowPossibleEstimate(e.target.checked)
							}
							checked={showPossibleEstimate}
						/>
					}
					label="Could this run finish 15 minutes or more under estimate?"
				/>
				{showPossibleEstimate && (
					<>
						<TextField
							value={possibleEstimateReason}
							onChange={(e) =>
								setPossibleEstimateReason(e.target.value)
							}
							label="Provide details as to why"
							autoComplete="off"
							inputProps={{ maxLength: 200 }}
							required
							multiline
							rows={2}
						/>
						<EstimateInput
							value={possibleEstimate}
							disabled={!event.acceptingSubmissions}
							required
							label="Possible Estimate"
							onTimeChange={(time) => setPossibleEstimate(time)}
						/>
					</>
				)}

				<TextField
					disabled={!event.acceptingSubmissions}
					label="Special Requirements"
					value={specialRequirements}
					onChange={(e) => setSpecialRequirements(e.target.value)}
					inputProps={{ maxLength: 300 }}
					helperText="This involves any: mods, downpatches, software, controllers (if a PC game) and any other requirements."
				/>
				{typeof donationIncentives !== "undefined" && (
					<InputLabel>Donation Challenges</InputLabel>
				)}
				{donationIncentives?.map((donationIncentive, i) => {
					return (
						<div className={styles.optionalTextInputs} key={i}>
							<DonationIncentiveInput
								value={donationIncentive}
								onDonationChange={handleDonationIncentiveChange}
								index={i}
							/>
							<Button
								variant="outlined"
								onClick={() => handleDonationIncentiveCancel(i)}
								color="error">
								Delete
							</Button>
						</div>
					);
				})}

				<Button
					variant="contained"
					onClick={handleNewDonationIncentive}
					disabled={
						typeof donationIncentives !== "undefined" &&
						!donationIncentives?.at(-1).title
					}>
					Add{" "}
					{typeof donationIncentives !== "undefined"
						? "another"
						: "a"}{" "}
					donation challenge
				</Button>
				<TextField
					disabled={!event.acceptingSubmissions}
					label="Video"
					value={video}
					onChange={(e) => setVideo(e.target.value)}
				/>
				{event.acceptingBackups && (
					<FormControlLabel
						control={
							<Checkbox
								onChange={(e) => setBackup(e.target.checked)}
								checked={backup}
							/>
						}
						label="Willing to be backup?"
					/>
				)}

				<h3>Game Info</h3>
				<TextField
					disabled={!event.acceptingSubmissions}
					label="Game"
					value={game}
					onChange={(e) => setGame(e.target.value)}
				/>
				<TextField
					disabled={!event.acceptingSubmissions}
					label="Platform/Console"
					value={platform}
					onChange={(e) => setPlatform(e.target.value)}
				/>
				<TextField
					disabled={!event.acceptingSubmissions}
					label="Tech Platform/Console"
					value={techPlatform}
					onChange={(e) => setTechPlatform(e.target.value)}
				/>
				<InputLabel required>Age Rating</InputLabel>
				<ToggleButtonGroup
					disabled={!event.acceptingSubmissions}
					fullWidth
					value={ageRating}
					onChange={(_, newVal) => {
						setAgeRating(newVal as AgeRatingLiterals);
					}}
					color="primary"
					exclusive>
					<ToggleButton value="m_or_lower">G, PG or M</ToggleButton>
					<ToggleButton value="ma15">MA15+</ToggleButton>
					<ToggleButton value="ra18">RA18+</ToggleButton>
				</ToggleButtonGroup>
				<FormHelperText>
					If unsure please search for the game title here:{" "}
					<a
						href="https://www.classification.gov.au/"
						target="_blank"
						rel="noreferrer">
						https://www.classification.gov.au/
					</a>
				</FormHelperText>

				<h3>Race/Co-op Info</h3>
				<FormControlLabel
					disabled={!event.acceptingSubmissions}
					control={
						<Checkbox
							onChange={(e) =>
								setRace(e.target.checked ? "solo" : "no")
							}
							checked={race !== "no"}
						/>
					}
					label="Race/Co-op?"
				/>

				{race !== "no" && (
					<>
						<FormControl disabled={!event.acceptingSubmissions}>
							<RadioGroup
								aria-labelledby="race-type-label"
								value={coop}
								onChange={(_, value) =>
									setCoop(value === "true")
								}>
								<FormControlLabel
									value={false}
									control={<Radio />}
									label="Race"
								/>
								<FormControlLabel
									value={true}
									control={<Radio />}
									label="Co-op"
								/>
							</RadioGroup>
						</FormControl>
						<FormControl disabled={!event.acceptingSubmissions}>
							{/* Don't think "type" is a good descriptor */}
							<FormLabel id="race-type-label">
								Race/Co-op Type
							</FormLabel>
							<RadioGroup
								aria-labelledby="race-type-label"
								value={race}
								onChange={(e) =>
									setRace(e.target.value as RaceLiterals)
								}>
								<FormControlLabel
									value="solo"
									control={<Radio />}
									label="Possible to do solo"
								/>
								<FormControlLabel
									value="only"
									control={<Radio />}
									label="Only race/co-op"
								/>
							</RadioGroup>
						</FormControl>
						<TextField
							disabled={!event.acceptingSubmissions}
							value={racer}
							onChange={(e) => setRacer(e.target.value)}
							label="Name of other player(s)"
						/>
					</>
				)}
				<h3>Availability</h3>
				<Availability
					onAvailabilityUpdate={(newDates) =>
						setAvailableDates(newDates)
					}
					value={availableDates}
					event={event}
				/>
			</DialogContent>
			<DialogActions style={{ justifyContent: "space-between" }}>
				<Button
					disabled={!event.acceptingSubmissions}
					color="error"
					variant="outlined"
					onClick={() => setDeleteDialog(true)}>
					Delete
				</Button>
				<Button
					disabled={
						!event.acceptingSubmissions && !event.acceptingBackups
					}
					color="primary"
					variant="contained"
					onClick={
						event.acceptingBackups && !event.acceptingSubmissions
							? BackupSubmission
							: UpdateSubmission
					}>
					Update
				</Button>
			</DialogActions>
			<Dialog open={deleteDialog} onClose={closeDeleteDialog}>
				<DialogTitle>Are you sure?</DialogTitle>
				<DialogContent>
					You are about to delete this submission.
					<br />
					<b>This cannot be undone.</b>
				</DialogContent>
				<DialogActions style={{ justifyContent: "space-between" }}>
					<Button
						color="error"
						variant="contained"
						onClick={DeleteSubmission}>
						Delete
					</Button>
					<Button
						color="success"
						variant="contained"
						onClick={closeDeleteDialog}>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</Dialog>
	);
};

export default SubmissionEditDialog;
