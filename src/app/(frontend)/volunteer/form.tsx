"use client";

import { type ReactNode, useEffect, useState } from "react";
import styles from "./Volunteer.module.css";
import { Button, Checkbox, NumberInput, Select, Group, Textarea, TextInput, Tooltip } from "@mantine/core";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import type { Volunteer } from "#/payload-types";

import { submitVolunteer, type VolunteerSubmissionData } from "./vounteer-action";

type VolunteerRole = Volunteer["role"][number];

const VolunteerFullNames: Record<VolunteerRole, string> = {
	host: "Host",
	frontDesk: "Front Desk",
	tech: "Tech",
	stageHand: "Stage Hand",
};

const VolunteerDescriptions = {
	host: (
		<>
			You are the voice of the event reading off donations and letting the viewers know about the charity and any
			sponsors.
			<br />
			Any queries please contact <i>Kenorah</i> on Discord.
		</>
	),
	frontDesk: (
		<>
			As the first point of contact, your roles include handing out passes to attendees, taking in person
			donations and general queries from the public, and making sure runners are present for their runs.
			<br />
			Any queries please contact <i>JTMagicman</i> on Discord.
		</>
	),
	tech: (
		<>
			Members of this team will balance the stream and in-person audio, crop the game feeds and camera, and
			transition between runs and intermission.
			<br />
			Any queries please contact <i>nei</i> on Discord.
		</>
	),
	stageHand: (
		<>
			Assisting runners by plugging in their consoles during setup, and taking photos of the runners, crowd, and
			event as a whole the rest of the time.
			<br />
			Any queries please contact <i>Kuiperbole</i> or <i>nei</i> on Discord.
		</>
	),
} as const satisfies Record<VolunteerRole, ReactNode>;

interface VolunteerFormProps {
	events: {
		id: number;
		shortName: string;
		startDate: string;
		endDate: string;
		eventTimezone: string;
	}[];
}

export function VolunteerForm(props: VolunteerFormProps) {
	const [successSubmit, setSuccessSubmit] = useState(false);
	const [selectedRoles, setSelectedRoles] = useState<VolunteerRole[]>([]);

	const form = useForm<VolunteerSubmissionData & { confirm: boolean }>({
		mode: "uncontrolled",
		initialValues: {
			event: props.events[0].id,
			roles: [],
			confirm: false,
			dayTimes: [],
			maxTime: 0,
			maxDailyHostTime: 0,
			specificGame: "",
			specificRunner: "",
			additionalInfo: "",
			techExperience: "",
		},
		validate: {
			event: (value) => (value ? null : "Please select an event"),
			roles: (value) => (value.length > 0 ? null : "Please select at least one role"),
			confirm: (value) => (value ? null : "You must confirm your availability"),
			maxTime: (value, values) => {
				if (values.roles.includes("host")) {
					return isNaN(value) || value <= 0 ? "Please enter your maximum total volunteer hours" : null;
				}
				return null;
			},
			maxDailyHostTime: (value, values) => {
				if (values.roles.includes("host")) {
					return isNaN(value) || value <= 0 ? "Please enter your maximum hosting hours per sitting" : null;
				}
				return null;
			},
			dayTimes: (value, values) => {
				const needsDayTimes = values.roles.some((r) => ["host", "frontDesk", "stageHand", "tech"].includes(r));
				if (needsDayTimes && value.some((t) => !t.trim())) {
					return "Please fill in your availability for each day";
				}
				return null;
			},
		},
	});

	const currentEvent = props.events.find((eventResult) => eventResult.id === form.values.event);

	let eventLength = 0;
	if (currentEvent) {
		eventLength = dayjs(currentEvent.endDate).diff(dayjs(currentEvent.startDate), "day") + 1;
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		form.setFieldValue("dayTimes", Array<string>(eventLength).fill(""));
	}, [eventLength]);

	if (successSubmit) {
		return <ConfirmedSubmission />;
	}

	const eventDatesAvailability = [];
	if (currentEvent) {
		for (let i = 0; i < eventLength; i++) {
			const date = dayjs(currentEvent.startDate).add(i, "day").toDate();
			eventDatesAvailability.push(
				<TextInput
					key={i}
					label={date.toLocaleDateString("en-AU", {
						weekday: "long",
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
						timeZone: currentEvent.eventTimezone || undefined,
					})}
					value={form.values.dayTimes[i] ?? ""}
					onChange={(e) => {
						const newDates = [...form.values.dayTimes];
						newDates[i] = e.target.value;
						form.setFieldValue("dayTimes", newDates);
					}}
				/>,
			);
		}
	}

	async function handleSubmit(values: typeof form.values) {
		console.log("Submitting volunteer form with values:", values);
		const isValid = form.validate();

		if (isValid.hasErrors) {
			console.warn("Validation errors:", isValid.errors);
			return;
		}

		const result = await submitVolunteer({
			event: values.event,
			roles: values.roles,
			maxTime: values.maxTime,
			maxDailyHostTime: values.maxDailyHostTime,
			dayTimes: values.dayTimes,
			specificGame: values.specificGame,
			specificRunner: values.specificRunner,
			additionalInfo: values.additionalInfo,
			techExperience: values.techExperience,
		});
		console.log(result);

		if (!result.success) {
			console.error(result.error);
			return;
		}

		form.reset();
		setSelectedRoles([]);
		window.scrollTo(0, 0);
		setSuccessSubmit(true);
	}

	return (
		<form className={styles.volunteerForm} onSubmit={form.onSubmit(handleSubmit)}>
			<h1>{currentEvent?.shortName} Volunteer Submission</h1>

			{props.events.length > 1 && (
				<Select
					label="Event"
					data={props.events.map((event) => ({ value: String(event.id), label: event.shortName }))}
					required
					key={form.key("event")}
					{...form.getInputProps("event")}
				/>
			)}

			<Checkbox.Group
				label="Roles to apply to"
				key={form.key("roles")}
				value={selectedRoles}
				error={form.errors.roles}
				onChange={(value) => {
					const roles = value as VolunteerRole[];
					setSelectedRoles(roles);
					form.setFieldValue("roles", roles);
				}}
			>
				<Group mt="xs">
					{(["host", "frontDesk", "tech", "stageHand"] as const).map((job) => (
						<Checkbox
							key={job}
							value={job}
							label={
								<span style={{ display: "flex", alignItems: "center", gap: 4 }}>
									{VolunteerFullNames[job]}
									<Tooltip label={VolunteerDescriptions[job]} multiline w={300}>
										<span style={{ cursor: "pointer" }} tabIndex={0}>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<circle cx="12" cy="12" r="10" />
												<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
												<path d="M12 17h.01" />
											</svg>
										</span>
									</Tooltip>
								</span>
							}
						/>
					))}
				</Group>
			</Checkbox.Group>

			<hr />

			{selectedRoles.includes("host") && (
				<>
					<h2>Host</h2>
					<div className={styles.question}>
						<span>
							What is the maximum amount of hours you are comfortable hosting for in one sitting?*
						</span>
						<span className={styles.subtitle}>
							E.g. 3 hours would mean you want all your shifts to be no longer than 3 hours each.
						</span>
						<NumberInput
							min={0}
							required
							key={form.key("maxDailyHostTime")}
							{...form.getInputProps("maxDailyHostTime")}
						/>
					</div>
					<div className={styles.question}>
						<span>
							If you have organised with a specific runner that they would like you to host their run:
						</span>
						<TextInput
							label="Game"
							key={form.key("specificGame")}
							{...form.getInputProps("specificGame")}
						/>
						<TextInput
							label="Runner"
							key={form.key("specificRunner")}
							{...form.getInputProps("specificRunner")}
						/>
					</div>
					<div className={styles.question}>
						<span>Any other specifications you would like to let us know about?</span>
						<Textarea
							minRows={4}
							key={form.key("additionalInfo")}
							{...form.getInputProps("additionalInfo")}
						/>
					</div>
					<hr />
				</>
			)}

			{selectedRoles.includes("frontDesk") && (
				<>
					<h2>Front Desk</h2>
					{selectedRoles.length > 1 && <p>No extra questions, just submit your availability.</p>}
					<hr />
				</>
			)}

			{selectedRoles.includes("tech") && (
				<>
					<h2>Tech</h2>
					<div className={styles.question}>
						<span>Previous tech experience.</span>
						<Textarea
							minRows={4}
							description="Mention if you have any experience with OBS, Analogue Upscalers (e.g. RetroTINK), or Audio Mixing. It's ok if you don't!"
							required
							key={form.key("techExperience")}
							{...form.getInputProps("techExperience")}
						/>
					</div>
					<hr />
				</>
			)}

			{selectedRoles.includes("stageHand") && (
				<>
					<h2>Stage Hand</h2>
					{selectedRoles.length > 1 && <p>No extra questions, just submit your availability.</p>}
					<hr />
				</>
			)}

			{selectedRoles.length > 0 && (
				<>
					<div className={styles.question}>
						<span>What times are you available on each day?*</span>
						{eventDatesAvailability}
					</div>
					<div className={styles.question}>
						<span>
							What is the maximum amount of hours you are comfortable volunteering for the entire event?*
						</span>
						<span className={styles.subtitle}>This could be all at once, or in multiple sessions.</span>
						<NumberInput min={0} required key={form.key("maxTime")} {...form.getInputProps("maxTime")} />
					</div>
					<hr />
				</>
			)}

			<Checkbox
				label="You agree that you are willing to be present at the venue for the duration of all of your shifts."
				key={form.key("confirm")}
				{...form.getInputProps("confirm", { type: "checkbox" })}
			/>
			<Button variant="filled" type="submit">
				Submit
			</Button>
		</form>
	);
}

function ConfirmedSubmission() {
	return (
		<main className={`content ${styles.noEvents}`}>
			<h2>Submitted!</h2>
			<p>
				Thank you so much for offering to volunteer!
				<br />
				We'll get back to you soon about more information.
			</p>
		</main>
	);
}
