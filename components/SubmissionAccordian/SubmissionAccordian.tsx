import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, Button } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

import { UserPageData } from '../../pages/user/[username]';

import styles from './SubmissionAccordian.module.scss';
import SubmissionEditDialog from './SubmissionEditDialog';

type SubmissionProps = {
	submission: UserPageData['submissions'][0];
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
		case 'solo':
			return 'Can run solo';
		case 'only':
			return 'Only run as race/co-op';
		default:
			return `Unknown race type (${raceType})`;
	}
}

const StyledAccordian = styled(Accordion)(({ theme }) => ({
	backgroundColor: '#F9F9F9',
}));

const SubmissionAccordian = ({ submission, event }: SubmissionProps) => {
	const [editDialog, setEditDialog] = useState(false);

	const closeDialog = () => {
		setEditDialog(false);
	};

	const isRace = submission.race !== 'no';
	const raceOrCoop = submission.coop ? 'Coop' : 'Race';

	let colour = '';
	let fontColor = '';
	switch (submission.status) {
		case 'accepted':
			colour = '#64ba69';
			break;
		case 'backup':
			colour = '#42a5f5';
			break;
		case 'rejected':
			colour = '#ef5350';
			fontColor = '#FFFFFF';
			break;
		default:
			break;
	}

	return (
		<StyledAccordian className={styles.submission}>
			<AccordionSummary expandIcon={<FontAwesomeIcon icon={faAngleDown} />} className={styles.submissionHeader}>
				{submission.status !== 'submitted' && (
					<span className={styles.submissionStatus} style={{ backgroundColor: colour, color: fontColor }}>
						{submission.status}
					</span>
				)}
				<span>
					{submission.game} - {submission.category}
					{isRace && ` - ${raceOrCoop}`}
				</span>
			</AccordionSummary>
			<AccordionDetails className={styles.submissionDetails}>
				<span>Event</span>
				<span>{submission.event.name}</span>
				{submission.willingBackup ? <span>Willing to be backup</span> : <div />}
				<div />
				<span>Game</span>
				<span>{submission.game}</span>
				<span>Category</span>
				<span>{submission.category}</span>
				<span>Estimate</span>
				<span>{submission.estimate}</span>
				<span>Platform</span>
				<span>{submission.platform}</span>
				<span>Video</span>
				<a href={submission.video}>{submission.video}</a>
				{submission.donationIncentive && (
					<>
						<span>Donation Incentive</span>
						<span>{submission.donationIncentive}</span>
					</>
				)}
				{isRace && (
					<>
						<h3>{raceOrCoop} Details</h3>
						<span />
						<span />
						<span />
						<span>{raceOrCoop} Type</span>
						<span>{RaceTypeLabels(submission.race)}</span>
						<span>Player(s)</span>
						<span>{submission.racer}</span>
					</>
				)}
			</AccordionDetails>
			{(submission.status === 'submitted' || submission.status === 'rejected') &&
				(event.acceptingSubmissions || event.acceptingBackups) && (
					<AccordionActions>
						<Button color="primary" variant="contained" onClick={() => setEditDialog(true)}>
							Edit
						</Button>
					</AccordionActions>
				)}
			<SubmissionEditDialog submission={submission} event={event} handleClose={closeDialog} open={editDialog} />
		</StyledAccordian>
	);
};

export default SubmissionAccordian;
