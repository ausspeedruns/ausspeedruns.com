import { Stack } from '@keystone-ui/core';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { gql, useLazyQuery } from '@keystone-6/core/admin-ui/apollo';
import { Button } from '@keystone-ui/button';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';
import { Autocomplete, Paper, Stepper, Step, StepButton, MobileStepper } from '@mui/material';

const ALL_RUNNER_NAMES_QUERY = gql`
	query GetAllRunners {
		users {
			id
			username
		}
	}
`;

interface AllRunnerNames {
	users: {
		id: string;
		username: string;
	}[];
}

export interface RaceRunnerMatcherRef {
	getRaceRunners: () => {
		gameId: string;
		runners: string[];
	}[];
	isDone: () => boolean;
}

interface RaceRunnerMatcherProps {
	races: {
		internalRacers: string;
		id: string;
		game: string;
		category: string;
		runner: string;
		runnerId: string;
		foundNormalRunner: boolean;
	}[];
}

export const RaceRunnerMatcher = forwardRef<RaceRunnerMatcherRef, RaceRunnerMatcherProps>((props, ref) => {
	const [raceStep, setRaceStep] = useState(0);
	const [allRaces, setAllRaces] = useState<{
		[k: number]: { gameId: string; runners: { label: string; value: string }[] };
	}>({});

	const [selectedRunner, setSelectedRunner] = useState({ label: '', value: '' });
	const [currentRunners, setCurrentRunners] = useState<{ label: string; value: string }[]>([]);
	const [allRunnerNames, setAllRunnerNames] = useState<{ label: string; value: string }[]>([]);
	const [queryAllRunnerNames] = useLazyQuery<AllRunnerNames>(ALL_RUNNER_NAMES_QUERY);

	const enabled = props.races.length > 0;

	const totalSteps = () => {
		return props.races.length;
	};

	const completedSteps = () => {
		return Object.keys(allRaces).length;
	};

	const isLastStep = () => {
		return raceStep === totalSteps() - 1;
	};

	const allStepsCompleted = () => {
		return completedSteps() === totalSteps();
	};

	const handleNext = () => {
		AddRunners();

		const newActiveStep =
			isLastStep() && !allStepsCompleted()
				? // It's the last step, but not all steps have been completed,

				  // find the first step that has been completed
				  props.races.findIndex((step, i) => !(i in allRaces))
				: raceStep + 1;
		setRaceStep(newActiveStep);
	};

	const handleBack = () => {
		AddRunners();
		setRaceStep((prevActiveStep) => prevActiveStep - 1);
	};

	const handleStep = (step: number) => () => {
		AddRunners();
		setRaceStep(step);
	};

	function RaceIndexExists(index: number) {
		return Object.hasOwn(allRaces, index);
	}

	function AddRunners() {
		if (!isRaceComplete() || raceStep >= totalSteps()) return;

		const newIncentives = allRaces;

		newIncentives[raceStep] = { gameId: props.races[raceStep].id, runners: currentRunners };

		setAllRaces(newIncentives);
	}

	function addRunnerToList() {
		const runners = [...currentRunners];
		runners.push(selectedRunner);
		setCurrentRunners(runners);
	}

	function removeRunnerFromList(id: string) {
		const runners = [...currentRunners];
		const index = runners.findIndex((runner) => runner.value === id);
		if (index !== -1) {
			runners.splice(index, 1);
		}
		setCurrentRunners(runners);
	}

	function isRaceComplete(index?: number) {
		let runners: { label: string; value: string }[];

		if (index) {
			if (RaceIndexExists(index)) {
				runners = allRaces[index].runners;
			} else {
				return false;
			}
		} else {
			runners = currentRunners;
		}

		return runners.length > 1;
	}

	async function getAllRunnerNames() {
		const { data } = await queryAllRunnerNames();

		if (!data) return;

		setAllRunnerNames(
			data.users.map((runner) => {
				return { label: runner.username, value: runner.id };
			})
		);
	}

	useEffect(() => {
		if (RaceIndexExists(raceStep)) {
			setCurrentRunners(allRaces[raceStep].runners);
		} else if (props.races[raceStep]) {
			if (props.races[raceStep].foundNormalRunner) {
				setCurrentRunners([{ label: props.races[raceStep].runner, value: props.races[raceStep].runnerId }]);
			} else {
				setCurrentRunners([]);
			}
		}

		setSelectedRunner({ label: '', value: '' });
	}, [raceStep, props.races]);

	useEffect(() => {
		getAllRunnerNames();
	}, [props.races]);

	useImperativeHandle(ref, () => ({
		getRaceRunners: () => {
			return Object.values(allRaces).map((race) => {
				return { gameId: race.gameId, runners: race.runners.map((runners) => runners.value) };
			});
		},
		isDone: () => {
			return allStepsCompleted();
		},
	}));

	return (
		<Paper elevation={2} sx={{ p: 2, flexGrow: 1, maxWidth: '50%' }}>
			<h2 style={{ textAlign: 'center', margin: '0' }}>Race/Coop Runners</h2>
			<h3 style={{ textAlign: 'center', margin: '0' }}>
				{completedSteps()}/{totalSteps()} {allStepsCompleted() && totalSteps() > 0 && <span>Done!</span>}
			</h3>
			{/* <Button onClick={getAllRunnerNames}>Query all runner names</Button> */}
			{/* <Stepper nonLinear activeStep={raceStep}>
				{props.races.map((run, index) => (
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
				activeStep={raceStep}
				sx={{ flexGrow: 1, justifyContent: 'center' }}
				nextButton={<></>}
				backButton={<></>}
			/>
			{props.races[raceStep] && (
				<>
					<h1 style={{ margin: 0, textAlign: 'center' }}>{props.races[raceStep].game}</h1>
					<h3 style={{ margin: 0, textAlign: 'center' }}>{props.races[raceStep].category}</h3>
				</>
			)}
			<Stack gap="medium">
				<span>
					{RaceIndexExists(raceStep) && (
						<>
							{props.races[raceStep].game} - {props.races[raceStep].category}
						</>
					)}
				</span>
				<FieldContainer>
					<FieldLabel>Expected Runner Names</FieldLabel>
					<span>
						{props.races?.[raceStep] && (
							<span>
								{props.races[raceStep].runner}, {props.races[raceStep].internalRacers}
							</span>
						)}
					</span>
				</FieldContainer>
				<Autocomplete
					options={[...allRunnerNames, { label: '', value: '' }]}
					getOptionLabel={(option: { value: string; label: string }) => option.label}
					onChange={(e, newVal) => setSelectedRunner(newVal as { value: string; label: string })}
					value={selectedRunner}
					renderInput={(params) => (
						<FieldContainer ref={params.InputProps.ref}>
							<FieldLabel>Runner Name</FieldLabel>
							<div style={{ display: 'flex' }}>
								<TextInput
									disabled={!enabled || allRunnerNames.length === 0}
									{...params.inputProps}
									inputMode="text"
									size="medium"
									width="full"
									type="text"
								/>
								<Button style={{ marginLeft: 8 }} onClick={addRunnerToList} tone="positive" weight="bold">
									+
								</Button>
							</div>
						</FieldContainer>
					)}
				/>
				<div style={{ display: 'flex', gap: 8 }}>
					{currentRunners.map((runner) => (
						<Paper elevation={4} key={runner.value} sx={{ p: 1, width: 'fit-content' }}>
							<span style={{ display: 'block', color: 'gray', fontSize: 10 }}>{runner.value}</span>
							<a href={`http://localhost:8000/users/${runner.value}`} target="_blank" rel="noopener noreferrer">
								{runner.label}
							</a>
							<Button
								tone="negative"
								style={{ marginLeft: 16 }}
								onClick={() => {
									removeRunnerFromList(runner.value);
								}}
							>
								–
							</Button>
						</Paper>
					))}
				</div>
			</Stack>
			<div style={{ display: 'flex', flexDirection: 'row', marginTop: 16 }}>
				<Button isDisabled={!enabled} color="inherit" disabled={raceStep === 0} onClick={handleBack} tone="active">
					Back
				</Button>
				<div style={{ flex: '1 1 auto' }} />
				{allRaces[raceStep] && isRaceComplete() ? (
					<Button isDisabled={!enabled} onClick={handleNext} tone="active" weight="bold">
						Update
					</Button>
				) : isRaceComplete() ? (
					!isLastStep() ? (
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
