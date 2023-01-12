import { Stack } from '@keystone-ui/core';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button } from '@keystone-ui/button';
import { Select, FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';
import { Paper, Stepper, Step, StepButton, MobileStepper } from '@mui/material';
import { Goal, War } from '../../schema/incentives';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

interface DonationIncentiveCreatorProps {
	donationIncentiveStrings: {
		id: string;
		incentive: string;
		game: string;
		category: string;
		runner: string;
	}[];
}

const incentiveTypes = [
	{ label: 'Goal', value: 'goal', defaultValue: { current: 0, goal: 0 } },
	{ label: 'War', value: 'war', defaultValue: { options: [] } },
];

export const DonationIncentiveCreator = forwardRef((props: DonationIncentiveCreatorProps, ref) => {
	const [donationIncentiveStep, setDonationIncentiveStep] = useState(0);
	const [allNewIncentives, setAllNewIncentives] = useState<{
		[k: number]: Record<string, any>;
	}>({});

	const [newIncentiveTitle, setNewIncentiveTitle] = useState('');
	const [newIncentiveNotes, setNewIncentiveNotes] = useState('');
	const [newIncentiveType, setNewIncentiveType] = useState<Omit<typeof incentiveTypes[0], 'defaultValue'>>(
		incentiveTypes[0]
	);
	const [newIncentiveData, setNewIncentiveData] = useState<Goal | War>(incentiveTypes[0].defaultValue);

	const enabled = props.donationIncentiveStrings.length > 0;

	const totalSteps = () => {
		return props.donationIncentiveStrings.length;
	};

	const completedSteps = () => {
		return Object.keys(allNewIncentives).length;
	};

	const isLastStep = () => {
		return donationIncentiveStep === totalSteps() - 1;
	};

	const allStepsCompleted = () => {
		return completedSteps() === totalSteps();
	};

	const handleNext = () => {
		AddIncentive();

		const newActiveStep =
			isLastStep() && !allStepsCompleted()
				? // It's the last step, but not all steps have been completed,

				  // find the first step that has been completed
				  props.donationIncentiveStrings.findIndex((step, i) => !(i in allNewIncentives))
				: donationIncentiveStep + 1;
		setDonationIncentiveStep(newActiveStep);
	};

	const handleBack = () => {
		AddIncentive();
		setDonationIncentiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleStep = (step: number) => () => {
		AddIncentive();
		setDonationIncentiveStep(step);
	};

	function IncentiveIndexExists(index: number) {
		return Object.hasOwn(allNewIncentives, index);
	}

	function AddIncentive() {
		if (!isIncentiveComplete() || donationIncentiveStep >= totalSteps()) return;

		if (newIncentiveType.value === 'goal' && !Object.hasOwn(newIncentiveData, 'current')) {
			setNewIncentiveData({ ...newIncentiveData, current: 0 });
		}

		const newIncentives = allNewIncentives;

		newIncentives[donationIncentiveStep] = {
			title: newIncentiveTitle,
			notes: newIncentiveNotes,
			type: newIncentiveType.value,
			data: newIncentiveData,
			submissionId: props.donationIncentiveStrings[donationIncentiveStep].id,
		};

		setAllNewIncentives(newIncentives);
	}

	function isIncentiveComplete(index?: number) {
		let incentiveTitle: string;
		let incentiveType: string;
		let incentiveData: object;

		if (index) {
			if (IncentiveIndexExists(index)) {
				incentiveTitle = allNewIncentives[index].title;
				incentiveType = incentiveTypes.find((incentive) => incentive.value === allNewIncentives[index].type).value;
				incentiveData = allNewIncentives[index].data;
			} else {
				return false;
			}
		} else {
			incentiveTitle = newIncentiveTitle;
			incentiveType = newIncentiveType.value;
			incentiveData = newIncentiveData;
		}

		let dataGood = false;

		switch (incentiveType) {
			case 'goal':
				dataGood = Object.hasOwn(incentiveData, 'goal') && (incentiveData as Goal).goal > 0;
				break;
			case 'war':
				dataGood = Object.hasOwn(incentiveData, 'options');
				break;
			default:
				break;
		}

		return incentiveTitle && incentiveType && dataGood;
	}

	useEffect(() => {
		if (IncentiveIndexExists(donationIncentiveStep)) {
			setNewIncentiveTitle(allNewIncentives[donationIncentiveStep].title);
			setNewIncentiveNotes(allNewIncentives[donationIncentiveStep].notes);
			setNewIncentiveType(
				incentiveTypes.find((incentive) => incentive.value === allNewIncentives[donationIncentiveStep].type)
			);
			setNewIncentiveData(allNewIncentives[donationIncentiveStep].data);
		} else if (props.donationIncentiveStrings[donationIncentiveStep]) {
			setNewIncentiveTitle(props.donationIncentiveStrings[donationIncentiveStep].incentive);
			setNewIncentiveNotes('');
			setNewIncentiveType(incentiveTypes[0]);
			setNewIncentiveData(incentiveTypes[0].defaultValue);
		}
	}, [donationIncentiveStep, props.donationIncentiveStrings]);

	useImperativeHandle(ref, () => ({
		getDonationIncentives: () => {
			return Object.values(allNewIncentives);
		},
		isDone: () => {
			return allStepsCompleted();
		},
	}));

	return (
		<Paper elevation={2} sx={{ p: 2, flexGrow: 1, maxWidth: '50%' }}>
			<h2 style={{ textAlign: 'center', margin: '0' }}>Donation Incentives</h2>
			<h3 style={{ textAlign: 'center', margin: '0' }}>
				{completedSteps()}/{totalSteps()} {allStepsCompleted() && <span>Done!</span>}
			</h3>
			{/* <Stepper nonLinear activeStep={donationIncentiveStep}>
				{props.donationIncentiveStrings.map((run, index) => (
					<Step key={run.id}>
						<StepButton color="inherit" onClick={handleStep(index)}>
							{run.game}
						</StepButton>
					</Step>
				))}
			</Stepper> */}
			<MobileStepper
				variant="dots"
				steps={totalSteps()}
				position="static"
				activeStep={donationIncentiveStep}
				sx={{ flexGrow: 1, justifyContent: 'center' }}
				nextButton={<></>}
				backButton={<></>}
			/>
			<Stack gap="medium">
				{props.donationIncentiveStrings[donationIncentiveStep] && (
					<>
						<h1 style={{margin: 0, textAlign: 'center'}}>{props.donationIncentiveStrings[donationIncentiveStep].game}</h1>
						<h3 style={{margin: 0, textAlign: 'center'}}>
							{props.donationIncentiveStrings[donationIncentiveStep].category} by{' '}
							{props.donationIncentiveStrings[donationIncentiveStep].runner}
						</h3>
					</>
				)}
				<FieldContainer>
					<FieldLabel>Incentive Name</FieldLabel>
					<TextInput
						disabled={!enabled}
						onChange={(e) => setNewIncentiveTitle(e.target.value)}
						value={newIncentiveTitle}
					/>
				</FieldContainer>
				<FieldContainer>
					<FieldLabel>Notes/Instructions</FieldLabel>
					<TextInput
						disabled={!enabled}
						onChange={(e) => setNewIncentiveNotes(e.target.value)}
						value={newIncentiveNotes}
					/>
				</FieldContainer>
				<FieldContainer>
					<FieldLabel>Type</FieldLabel>
					<Select
						isDisabled={!enabled}
						onChange={(e) => {
							switch (e.value) {
								case 'goal':
									setNewIncentiveData({ goal: 0, current: 0 });
									break;
								case 'war':
									setNewIncentiveData({ options: [] });
									break;
							}
							setNewIncentiveType(e);
						}}
						value={newIncentiveType}
						options={incentiveTypes}
					/>
				</FieldContainer>
				{newIncentiveType.value === 'goal' && (
					<>
						<FieldContainer>
							<FieldLabel>Goal ${(newIncentiveData as Goal)?.goal?.toLocaleString() ?? 0}</FieldLabel>
							<TextInput
								disabled={!enabled}
								onChange={(e) => setNewIncentiveData({ ...newIncentiveData, goal: parseInt(e.target.value) })}
								type="number"
								value={(newIncentiveData as Goal)?.goal ?? 0}
							/>
						</FieldContainer>
					</>
				)}
				{newIncentiveType.value === 'war' && (
					<>
						<FieldContainer>
							<FieldLabel>Options</FieldLabel>
							{(newIncentiveData as War)?.options.map((item, i) => {
								return (
									<TextInput
										key={i}
										placeholder="Name"
										onChange={(e) => {
											const mutableOptions = [...(newIncentiveData as War).options];
											mutableOptions[i].name = e.target.value;
											setNewIncentiveData({ ...newIncentiveData, options: mutableOptions });
										}}
										value={item.name}
									/>
								);
							})}
						</FieldContainer>
						<Button
							isDisabled={!enabled}
							tone="positive"
							weight="bold"
							onClick={() => {
								const mutableOptions = [...(newIncentiveData as War).options];
								mutableOptions.push({ name: '', total: 0 });
								setNewIncentiveData({
									...newIncentiveData,
									options: mutableOptions,
								});
							}}
						>
							+ Add
						</Button>
					</>
				)}
			</Stack>
			<div style={{ display: 'flex', flexDirection: 'row', marginTop: 16 }}>
				<Button
					isDisabled={!enabled}
					color="inherit"
					disabled={donationIncentiveStep === 0}
					onClick={handleBack}
					tone="active"
				>
					Back
				</Button>
				<div style={{ flex: '1 1 auto' }} />
				{allNewIncentives[donationIncentiveStep] && isIncentiveComplete() ? (
					<Button isDisabled={!enabled} onClick={handleNext} tone="active" weight="bold">
						Update
					</Button>
				) : isIncentiveComplete() ? (
					donationIncentiveStep !== props.donationIncentiveStrings.length - 1 ? (
						<Button isDisabled={!enabled} onClick={handleNext} tone="active" weight="bold">
							Next
						</Button>
					) : (
						<Button isDisabled={!enabled} onClick={handleNext} tone="active" weight="bold">
							Finish
						</Button>
					)
				) : (
					<Button isDisabled={!enabled} onClick={handleNext} tone="active" weight="bold">
						Skip
					</Button>
				)}
			</div>
		</Paper>
	);
});
