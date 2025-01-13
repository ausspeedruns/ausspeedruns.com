"use client";

import { useEffect, useState } from "react";
import styles from "../../styles/Volunteers.module.scss";
import {
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
import { addDays, differenceInDays } from "date-fns";

import { createSubmission } from "./volunteer-action";

const VolunteerTypes = {
	host: "Host",
	runMgmt: "Runner Manager",
	tech: "Tech",
	social: "Social Media",
} as const;

type ExperienceLiterals = "None" | "Casual" | "Enthusiast" | "Expert";

type Props = {
	events: {
		id: string;
		shortname: string;
		startDate: string;
		endDate: string;
		eventTimezone: string;
	}[];
	userId: string;
};

export function Form({ events, userId }: Props) {
	const [event, setEvent] = useState("");
	const [jobType, setJobType] = useState<keyof typeof VolunteerTypes>("host");
	const [confirmation, setConfirmation] = useState(false);
	const [successSubmit, setSuccessSubmit] = useState(false);

	const [availabilityDates, setAvailabilityDates] = useState<string[]>([]);

	// Host
	const [eventHostTime, setEventHostTime] = useState(0);
	const [maxDailyHostTime, setMaxDailyHostTime] = useState(0);
	const [specificGame, setSpecificGame] = useState("");
	const [specificRunner, setSpecificRunner] = useState("");
	const [additionalInfo, setAdditionalInfo] = useState("");

	// Social Media
	const [experience, setExperience] = useState<ExperienceLiterals>("None");
	const [favMeme, setFavMeme] = useState("");

	// Runner Management
	const [runnerManagementAvailability, setRunnerManagementAvailability] = useState("");

	// Tech
	const [techAvailability, setTechAvailability] = useState("");
	const [techExperience, setTechExperience] = useState("");

	
	if (successSubmit) {
		return <ConfirmedSubmission role={VolunteerTypes[jobType]} reset={clearInputs} />;
	}

	const currentEvent = events.find((eventResult) => eventResult.id === event);

	let eventLength = 0;
	if (currentEvent) {
		eventLength = differenceInDays(new Date(currentEvent.endDate), new Date(currentEvent.startDate)) + 1;
	}

	useEffect(() => {
		clearAvailabilityDates(eventLength);
	}, [eventLength]);

	function clearAvailabilityDates(numberOfDays: number) {
		const cleanArray = [];

		for (let i = 0; i < numberOfDays; i++) {
			cleanArray.push("");
		}

		setAvailabilityDates(cleanArray);
	}

	function clearInputs() {
		setSuccessSubmit(false);
		setConfirmation(false);

		clearAvailabilityDates(eventLength);

		// Host
		setEventHostTime(0);
		setMaxDailyHostTime(0);
		setSpecificGame("");
		setSpecificRunner("");
		setAdditionalInfo("");

		// Social Media
		setExperience("None");
		setFavMeme("");

		// Runner Management
		setRunnerManagementAvailability("");

		// Tech
		setTechAvailability("");
		setTechExperience("");
	}

	let disableSend = !confirmation;
	switch (jobType) {
		case "host":
			if (
				isNaN(eventHostTime) ||
				eventHostTime <= 0 ||
				isNaN(maxDailyHostTime) ||
				maxDailyHostTime <= 0 ||
				!availabilityDates
			) {
				disableSend = true;
			}
			break;
		case "runMgmt":
			if (!runnerManagementAvailability) {
				disableSend = true;
			}
			break;
		case "social":
			if (!availabilityDates) {
				disableSend = true;
			}
			break;
		case "tech":
			if (!techAvailability) {
				disableSend = true;
			}
			break;

		default:
			// What
			disableSend = true;
			break;
	}

	const eventDatesAvailability = [];
	if (currentEvent) {
		for (let i = 0; i < eventLength; i++) {
			const date = addDays(new Date(currentEvent.startDate), i);
			eventDatesAvailability.push(
				<TextField
					fullWidth
					key={i}
					label={date.toLocaleDateString("en-AU", {
						weekday: "long",
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
						timeZone: currentEvent.eventTimezone || undefined,
					})}
					onChange={(e) => {
						const newDates = [...availabilityDates];
						newDates[i] = e.target.value;
						setAvailabilityDates(newDates);
					}}
					value={availabilityDates[i] ?? ""}
				/>,
			);
		}
	}

	return (
		<form
			className={styles.volunteerForm}
			onSubmit={(e) => {
				e.preventDefault();
				if (!disableSend) {
					createSubmission({
						userId: userId,
						jobType,
						eventHostTime,
						maxDailyHostTime,
						dayTimes: availabilityDates,
						specificGame,
						specificRunner,
						additionalInfo,
						experience,
						favMeme,
						runnerManagementAvailability,
						techAvailability: techAvailability,
						techExperience,
						eventId: event,
					}).then((result) => {
						if (!result.error) {
							clearInputs();
							window.scrollY = 0;
							setSuccessSubmit(true);
						} else {
							console.error(result.error);
						}
					});
				}
			}}>
			<h1>{currentEvent?.shortname} Volunteer Submission</h1>

			{events.length > 1 && (
				<FormControl fullWidth>
					<InputLabel id="event-label">Event</InputLabel>
					<Select
						labelId="event-label"
						value={event}
						label="Event"
						onChange={(e) => setEvent(e.target.value)}
						required>
						{events.map((event) => {
							return (
								<MenuItem value={event.id} key={event.id}>
									{event.shortname}
								</MenuItem>
							);
						})}
					</Select>
				</FormControl>
			)}

			<FormControl fullWidth>
				<InputLabel id="job-type-label">Job Type</InputLabel>
				<Select
					labelId="job-type-label"
					value={jobType}
					label="Job Type"
					onChange={(e) => setJobType(e.target.value as keyof typeof VolunteerTypes)}
					required>
					<MenuItem value={"host"}>Host</MenuItem>
					<MenuItem value={"social"}>Social Media</MenuItem>
					<MenuItem value={"runMgmt"}>Runner Management</MenuItem>
					<MenuItem value={"tech"}>Tech</MenuItem>
				</Select>
			</FormControl>

			<hr />

			{jobType === "host" && (
				<>
					<p>
						You are the voice of the event reading off donations and letting the viewers know about the
						charity and any sponsors.
						<br />
						Any queries please contact <i>werster</i> on Discord.
					</p>
					<div className={styles.question}>
						<span>
							What is the maximum amount of hours you are comfortable hosting for the entire event?*
						</span>
						<span className={styles.subtitle}>This could be all at once, or in multiple sessions.</span>
						<TextField
							type="number"
							fullWidth
							value={eventHostTime}
							onChange={(e) => setEventHostTime(parseInt(e.target.value))}
							required
						/>
					</div>
					<div className={styles.question}>
						<span>
							What is the maximum amount of hours you are comfortable hosting for in one sitting?*
						</span>
						<span className={styles.subtitle}>
							E.g. 3 hours would mean you want all your shifts to be no longer than 3 hours each.
						</span>
						<TextField
							type="number"
							fullWidth
							value={maxDailyHostTime}
							onChange={(e) => setMaxDailyHostTime(parseInt(e.target.value))}
							required
						/>
					</div>
					<div className={styles.question}>
						<span>What times are you available to host on each day?*</span>
						{eventDatesAvailability}
					</div>
					<div className={styles.question}>
						<span>
							If you have organised with a specific runner that they would like you to host their run:
						</span>
						<TextField
							fullWidth
							value={specificGame}
							onChange={(e) => setSpecificGame(e.target.value)}
							label="Game"
						/>
						<TextField
							fullWidth
							value={specificRunner}
							onChange={(e) => setSpecificRunner(e.target.value)}
							label="Runner"
						/>
					</div>
					<div className={styles.question}>
						<span>Any other specifications you would like to let us know about?</span>
						<TextField
							multiline
							minRows={4}
							fullWidth
							value={additionalInfo}
							onChange={(e) => setAdditionalInfo(e.target.value)}
						/>
					</div>
				</>
			)}

			{jobType === "social" && (
				<>
					<p>
						In charge of creating and posting social media content throughout the event (ie. tweets of
						upcoming runs, Instagram stories, photos).
						<br />
						Any queries please contact <i>Kuiperbole</i> on Discord.
					</p>
					<FormControl fullWidth>
						<InputLabel id="socialmedia-experience-label">Experience level</InputLabel>
						<Select
							labelId="socialmedia-experience-label"
							value={experience}
							label="Experience level"
							onChange={(e) => setExperience(e.target.value as ExperienceLiterals)}
							required>
							<MenuItem value={"None"}>None</MenuItem>
							<MenuItem value={"Casual"}>Casual</MenuItem>
							<MenuItem value={"Expert"}>Expert</MenuItem>
						</Select>
					</FormControl>
					<div className={styles.question}>
						<span>What times are you available on each day?*</span>
						{eventDatesAvailability}
					</div>
					<div className={styles.question}>
						<span>Post a link to your favourite meme</span>
						<TextField fullWidth value={favMeme} onChange={(e) => setFavMeme(e.target.value)} />
					</div>
				</>
			)}

			{jobType === "runMgmt" && (
				<>
					<p>
						Assisting runners with any queries they may have throughout the events, making sure runners are
						present for their runs, updating the whiteboard and handing out passes to attendees.
						<br />
						Any queries please contact <i>LaceyStripes</i> on Discord.
					</p>
					<div className={styles.question}>
						<span>
							What is your availability? This should include the setup day as well as the actual marathon
							days.*
						</span>
						<TextField
							fullWidth
							value={runnerManagementAvailability}
							onChange={(e) => setRunnerManagementAvailability(e.target.value)}
							label=""
							required
							multiline
							minRows={4}
						/>
					</div>
				</>
			)}

			{jobType === "tech" && (
				<>
					<p>
						Setting up next runs and managing the stream. Some roles vary in difficulty and experience
						required.
						<br />
						Any queries please contact <i>nei</i> or <i>Clubwho</i> on Discord.
					</p>
					<div className={styles.question}>
						<span>
							What is your availability? This should include the setup day as well as the actual marathon
							days.*
						</span>
						<TextField
							fullWidth
							value={techAvailability}
							onChange={(e) => setTechAvailability(e.target.value)}
							required
							multiline
							minRows={4}
						/>
					</div>
					<div className={styles.question}>
						<span>Previous tech experience.</span>
						<TextField
							multiline
							minRows={4}
							fullWidth
							value={techExperience}
							onChange={(e) => setTechExperience(e.target.value)}
							label=""
							required
						/>
					</div>
				</>
			)}

			<FormControlLabel
				control={<Checkbox onChange={(e) => setConfirmation(e.target.checked)} checked={confirmation} />}
				label="You agree that you are willing to be present at the venue for the duration of all of your shifts."
			/>
			<Button variant="contained" type="submit" disabled={disableSend}>
				Submit
			</Button>
			{/* {submissionResult.error && <h2>{HumanErrorMsg(submissionResult.error.message)}</h2>} */}
		</form>
	);
}

const ConfirmedSubmission = (props: { role: string; reset: () => void }) => {
	return (
		<main className={`content ${styles.content} ${styles.noEvents}`}>
			<h2>{props.role} volunteer submitted!</h2>
			<p>Thank you so much for offering to volunteer! We'll get back to you soon about more information.</p>
		</main>
	);
};
