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
import React, { useState } from 'react';
import { useMutation } from 'urql';

import { UserPageData } from '../../pages/user/[username]';

import styles from './SubmissionEditDialog.module.scss';

type AgeRatingLiterals = 'm_or_lower' | 'ma15' | 'ra18';
type RaceLiterals = 'no' | 'solo' | 'only';

type SubmissionEditProps = {
	open: boolean;
	submission: UserPageData['submissions'][0];
	handleClose: () => void;
};

const SubmissionEditDialog = ({ open, submission, handleClose }: SubmissionEditProps) => {
	const [deleteDialog, setDeleteDialog] = useState(false);

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
				}
			) {
				__typename
			}
		}
	`);

	// Mutation for game submission
	const [deleteResult, deleteSubmission] = useMutation(gql`
		mutation ($submissionID: ID) {
			deleteSubmission(where: { id: $submissionID }) {
				__typename
			}
		}
	`);

	const UpdateSubmission = () => {
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

	return (
		<Dialog onClose={handleClose} open={open}>
			<DialogTitle>
				Edit {submission.game} - {submission.category}
			</DialogTitle>
			<DialogContent className={styles.content} style={{ paddingTop: 8 }}>
				<TextField label="Game" value={game} onChange={(e) => setGame(e.target.value)} />
				<TextField label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
				<TextField
					label="Estimate"
					helperText="e.g. 01:20:00 for 1 hour and 20 mins"
					required
					value={estimate}
					onChange={(e) => setEstimate(e.target.value)}
				/>
				<TextField label="Platform/Console" value={platform} onChange={(e) => setPlatform(e.target.value)} />
				<TextField label="Video" value={video} onChange={(e) => setVideo(e.target.value)} />
				<TextField
					label="Donation Incentive"
					value={donationIncentive}
					onChange={(e) => setDonationIncentive(e.target.value)}
				/>
				<FormControl fullWidth>
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

				<FormControlLabel
					control={<Checkbox onChange={(e) => setRace(e.target.checked ? 'solo' : 'no')} checked={race !== 'no'} />}
					label="Race/co-op?"
				/>

				{race !== 'no' && (
					<>
						<FormControlLabel
							control={<Checkbox onChange={(e) => setCoop(e.target.checked)} checked={coop} />}
							label="Co-op"
						/>
						<FormControl>
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
						<TextField value={racer} onChange={(e) => setRacer(e.target.value)} label="Name of other player(s)" />
					</>
				)}
			</DialogContent>
			<DialogActions style={{ justifyContent: 'space-between' }}>
				<Button color="error" variant="outlined" onClick={() => setDeleteDialog(true)}>
					Delete
				</Button>
				<Button color="primary" variant="contained" onClick={UpdateSubmission}>
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
