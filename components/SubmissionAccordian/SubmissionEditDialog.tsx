import { gql } from '@keystone-6/core';
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
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	TextField,
} from '@mui/material';
import { addDays, differenceInDays } from 'date-fns';
import React, { useState } from 'react';
import { useMutation } from 'urql';

import { UserPageData } from '../../pages/user/[username]';

import styles from './SubmissionEditDialog.module.scss';

type AgeRatingLiterals = 'm_or_lower' | 'ma15' | 'ra18';
type RaceLiterals = 'no' | 'solo' | 'only';

type SubmissionEditProps = {
	open: boolean;
	submission: UserPageData['submissions'][0];
	event: {
		acceptingSubmissions: boolean;
		acceptingBackups: boolean;
		startDate: string;
		endDate: string;
		eventTimezone: string;
	};
	handleClose: () => void;
};

const SubmissionEditDialog = ({ open, submission, handleClose, event }: SubmissionEditProps) => {
	const [deleteDialog, setDeleteDialog] = useState(false);

	const [backup, setBackup] = useState(submission.willingBackup);
	const [game, setGame] = useState(submission.game);
	const [category, setCategory] = useState(submission.category);
	const [estimate, setEstimate] = useState(submission.estimate);
	const [platform, setPlatform] = useState(submission.platform);
	const [race, setRace] = useState(submission.race);
	const [coop, setCoop] = useState(submission.coop);
	const [racer, setRacer] = useState(submission.racer);
	const [video, setVideo] = useState(submission.video);
	const [ageRating, setAgeRating] = useState(submission.ageRating);
	const [donationIncentive, setDonationIncentive] = useState(submission.donationIncentive);
	const [specialRequirements, setSpecialRequirements] = useState(submission.specialReqs);
	const [availableDates, setAvailableDates] = useState<boolean[]>(submission.availability);

	const closeDeleteDialog = () => {
		setDeleteDialog(false);
	};

	// Mutation for game submission
	const [submissionResult, editSubmission] = useMutation(gql`
		mutation (
			$submissionID: ID
			$game: String
			$category: String
			$platform: String
			$estimate: String
			$ageRating: SubmissionAgeRatingType!
			$donationIncentive: String!
			$race: SubmissionRaceType!
			$racer: String!
			$coop: Boolean!
			$video: String
			$specialReqs: String!
			$willingBackup: Boolean!
		) {
			updateSubmission(
				where: { id: $submissionID }
				data: {
					game: $game
					category: $category
					platform: $platform
					estimate: $estimate
					ageRating: $ageRating
					donationIncentive: $donationIncentive
					race: $race
					racer: $racer
					coop: $coop
					video: $video
					specialReqs: $specialReqs
					willingBackup: $willingBackup
				}
			) {
				__typename
			}
		}
	`);

	// Mutation for backup
	const [backupResult, editBackup] = useMutation(gql`
		mutation ($submissionID: ID, $willingBackup: Boolean!) {
			updateSubmission(where: { id: $submissionID }, data: { willingBackup: $willingBackup }) {
				__typename
			}
		}
	`);

	// Mutation for deleting game submission
	const [deleteResult, deleteSubmission] = useMutation(gql`
		mutation ($submissionID: ID) {
			deleteSubmission(where: { id: $submissionID }) {
				__typename
			}
		}
	`);

	const UpdateSubmission = () => {
		if (!event.acceptingSubmissions) return;
		editSubmission({
			submissionID: submission.id,
			game,
			category,
			platform,
			estimate,
			ageRating,
			donationIncentive,
			race,
			racer,
			coop,
			video,
			specialReqs: specialRequirements,
			willingBackup: backup,
		}).then((result) => {
			if (!result.error) {
				handleClose();
			} else {
				console.error(result.error);
			}
		});
	};

	const BackupSubmission = () => {
		if (!event.acceptingBackups && submission.status !== 'accepted') return;
		editBackup({
			submissionID: submission.id,
			willingBackup: backup,
		}).then((result) => {
			if (!result.error) {
				handleClose();
			} else {
				console.error(result.error);
			}
		});
	};

	const DeleteSubmission = () => {
		deleteSubmission({ submissionID: submission.id });
	};

	const eventLength = differenceInDays(new Date(event.endDate), new Date(event.startDate)) + 1;

	let dateCheckboxes = [];
	for (let i = 0; i < eventLength; i++) {
		const date = addDays(new Date(event.startDate), i);
		dateCheckboxes.push(
			<FormControlLabel
				key={i}
				control={
					<Checkbox
						onChange={(e) => {
							const newDates = availableDates;
							newDates[i] = e.target.checked;
							setAvailableDates(newDates);
						}}
						checked={availableDates[i]}
					/>
				}
				label={date.toLocaleDateString('en-AU', {
					weekday: 'long',
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
					timeZone: event.eventTimezone || 'Australia/Melbourne',
				})}
			/>
		);
	}

	return (
		<Dialog onClose={handleClose} open={open}>
			<DialogTitle>
				Edit {submission.game} - {submission.category}
			</DialogTitle>
			<DialogContent className={styles.content} style={{ paddingTop: 8 }}>
				<h3>Basic Run Info</h3>

				<TextField
					disabled={!event.acceptingSubmissions}
					label="Game"
					value={game}
					onChange={(e) => setGame(e.target.value)}
				/>
				<TextField
					disabled={!event.acceptingSubmissions}
					label="Category"
					value={category}
					onChange={(e) => setCategory(e.target.value)}
				/>
				<TextField
					disabled={!event.acceptingSubmissions}
					label="Estimate"
					helperText="e.g. 01:20:00 for 1 hour and 20 mins"
					required
					value={estimate}
					onChange={(e) => setEstimate(e.target.value)}
				/>
				<TextField
					disabled={!event.acceptingSubmissions}
					label="Platform/Console"
					value={platform}
					onChange={(e) => setPlatform(e.target.value)}
				/>
				<FormControl fullWidth disabled={!event.acceptingSubmissions}>
					<InputLabel id="age-rating-label">Age Rating</InputLabel>
					<Select
						labelId="age-rating-label"
						value={ageRating}
						label="Age Rating"
						onChange={(e) => setAgeRating(e.target.value as AgeRatingLiterals)}
						required
					>
						<MenuItem value={'m_or_lower'}>G, PG or M</MenuItem>
						<MenuItem value={'ma15'}>MA15+</MenuItem>
						<MenuItem value={'ra18'}>RA18+</MenuItem>
					</Select>
					<FormHelperText>
						If unsure please search for the game title here:{' '}
						<a href="https://www.classification.gov.au/" target="_blank" rel="noreferrer">
							https://www.classification.gov.au/
						</a>
					</FormHelperText>
				</FormControl>
				<h3>Run misc</h3>
				<TextField
					disabled={!event.acceptingSubmissions}
					label="Donation Incentive"
					value={donationIncentive}
					onChange={(e) => setDonationIncentive(e.target.value)}
					inputProps={{ maxLength: 300 }}
				/>
				<TextField
					disabled={!event.acceptingSubmissions}
					label="Special Requirements"
					value={specialRequirements}
					onChange={(e) => setSpecialRequirements(e.target.value)}
					inputProps={{ maxLength: 300 }}
					helperText="This involves any: mods, downpatches, software, controllers (if a PC game) and any other requirements."
				/>

				<h3>Race/Co-op Info</h3>
				<FormControlLabel
					disabled={!event.acceptingSubmissions}
					control={<Checkbox onChange={(e) => setRace(e.target.checked ? 'solo' : 'no')} checked={race !== 'no'} />}
					label="Race/co-op?"
				/>

				{race !== 'no' && (
					<>
						<FormControlLabel
							disabled={!event.acceptingSubmissions}
							control={<Checkbox onChange={(e) => setCoop(e.target.checked)} checked={coop} />}
							label="Co-op"
						/>
						<FormControl disabled={!event.acceptingSubmissions}>
							{/* Don't think "type" is a good descriptor */}
							<FormLabel id="race-type-label">Race/Co-op Type</FormLabel>
							<RadioGroup
								aria-labelledby="race-type-label"
								value={race}
								onChange={(e) => setRace(e.target.value as RaceLiterals)}
							>
								<FormControlLabel value="solo" control={<Radio />} label="Possible to do solo" />
								<FormControlLabel value="only" control={<Radio />} label="Only race/co-op" />
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
				{dateCheckboxes}
				<h3>Final run info</h3>
				<TextField
					disabled={!event.acceptingSubmissions}
					label="Video"
					value={video}
					onChange={(e) => setVideo(e.target.value)}
				/>
				{event.acceptingBackups && (
					<FormControlLabel
						control={<Checkbox onChange={(e) => setBackup(e.target.checked)} checked={backup} />}
						label="Willing to be backup?"
					/>
				)}
			</DialogContent>
			<DialogActions style={{ justifyContent: 'space-between' }}>
				<Button
					disabled={!event.acceptingSubmissions}
					color="error"
					variant="outlined"
					onClick={() => setDeleteDialog(true)}
				>
					Delete
				</Button>
				<Button
					disabled={!event.acceptingSubmissions && !event.acceptingBackups}
					color="primary"
					variant="contained"
					onClick={event.acceptingBackups && !event.acceptingSubmissions ? BackupSubmission : UpdateSubmission}
				>
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
				<DialogActions style={{ justifyContent: 'space-between' }}>
					<Button color="error" variant="contained" onClick={DeleteSubmission}>
						Delete
					</Button>
					<Button color="success" variant="contained" onClick={closeDeleteDialog}>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</Dialog>
	);
};

export default SubmissionEditDialog;
