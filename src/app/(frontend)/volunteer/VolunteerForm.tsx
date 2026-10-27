"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { Alert, Button, Checkbox, Paper, Select, ThemeIcon } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Archive, Check, Home } from "pixelarticons/react";
import { getEventDays } from "#/utilities/getEventDays";
import { VOLUNTEER_ROLES, type VolunteerRole } from "./RoleCards";
import { VolunteerFields } from "./VolunteerFields";

import { submitVolunteer } from "./volunteerAction";
import { getVolunteerErrors, toSubmissionData, type VolunteerFormValues } from "./validateVolunteer";

const ROLES = VOLUNTEER_ROLES;

interface VolunteerFormProps {
	events: {
		id: number;
		shortName: string;
		startDate: string;
		endDate: string;
		eventTimezone: string;
	}[];
	appliedEventIds: number[];
}

export function VolunteerForm(props: VolunteerFormProps) {
	const [submitted, setSubmitted] = useState<{ roles: VolunteerRole[]; eventName?: string } | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [appliedEventIds, setAppliedEventIds] = useState(props.appliedEventIds);
	const formRef = useRef<HTMLFormElement>(null);

	const firstOpenEvent = props.events.find((event) => !props.appliedEventIds.includes(event.id)) ?? props.events[0];

	const form = useForm<VolunteerFormValues>({
		mode: "controlled",
		initialValues: {
			event: firstOpenEvent.id,
			roles: [],
			confirm: false,
			dayTimes: [],
			maxTime: "",
			maxDailyHostTime: "",
			specificGame: "",
			specificRunner: "",
			additionalInfo: "",
			techExperience: "",
		},
		validate: (values) => getVolunteerErrors(values, eventLength),
	});

	const currentEvent = props.events.find((event) => event.id === form.values.event);
	const eventLength: number = currentEvent ? getEventDays(currentEvent.startDate, currentEvent.endDate) : 0;
	const alreadyApplied = currentEvent ? appliedEventIds.includes(currentEvent.id) : false;

	useEffect(() => {
		form.setFieldValue("dayTimes", Array<string>(eventLength).fill(""));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventLength, form.values.event]);

	function scrollToFirstError() {
		// Wait for the error messages to render first
		requestAnimationFrame(() => {
			formRef.current
				?.querySelector('[aria-invalid="true"], .mantine-InputWrapper-error, .mantine-Checkbox-error')
				?.scrollIntoView({ behavior: "smooth", block: "center" });
		});
	}

	async function handleSubmit(values: VolunteerFormValues) {
		if (submitting) return;

		setSubmitting(true);
		setServerError(null);

		try {
			const result = await submitVolunteer(toSubmissionData(values, eventLength));

			if (!result.success) {
				setServerError(result.error ?? "Something went wrong. Please try again.");
				return;
			}

			setAppliedEventIds((ids) => [...ids, values.event]);
			setSubmitted({ roles: values.roles, eventName: currentEvent?.shortName });
			form.reset();
			window.scrollTo({ top: 0, behavior: "smooth" });
		} catch (error) {
			console.error("Volunteer submission failed", error);
			setServerError("Network error. Please check your connection and try again.");
		} finally {
			setSubmitting(false);
		}
	}

	if (submitted) {
		return (
			<div className={styles.volunteer}>
				<ConfirmedSubmission
					eventName={submitted.eventName}
					roles={submitted.roles}
					canApplyAgain={props.events.some((event) => !appliedEventIds.includes(event.id))}
					onApplyAgain={() => {
						const nextEvent = props.events.find((event) => !appliedEventIds.includes(event.id));
						if (nextEvent) form.setFieldValue("event", nextEvent.id);
						setSubmitted(null);
					}}
				/>
			</div>
		);
	}

	return (
		<div className={styles.volunteer}>
			<header className={styles.intro}>
				<h1>{props.events.length === 1 ? `${currentEvent?.shortName} ` : ""}Volunteer Application</h1>
				<p>
					AusSpeedruns events are run by volunteers. Pick the roles you&apos;re interested in and let us know
					when you&apos;re available.
				</p>
			</header>

			{props.events.length > 1 && (
				<Select
					label="Event"
					data={props.events.map((event) => ({
						value: String(event.id),
						label: `${event.shortName}${appliedEventIds.includes(event.id) ? " (already applied)" : ""}`,
					}))}
					value={String(form.values.event)}
					onChange={(value) => {
						if (!value) return;
						form.setFieldValue("event", Number(value));
						setServerError(null);
					}}
					allowDeselect={false}
					required
				/>
			)}

			{alreadyApplied ? (
				<Paper withBorder className={styles.card}>
					<div className={styles.applied}>
						<h2>You&apos;ve already applied for {currentEvent?.shortName}</h2>
						<p>
							Only one application per event is allowed, but you can update yours from your account while
							it&apos;s still pending.
						</p>
						<Button component="a" href="/account/volunteer" leftSection={<Archive />}>
							View my applications
						</Button>
					</div>
				</Paper>
			) : (
				<Paper
					withBorder
					component="form"
					ref={formRef}
					className={styles.card}
					noValidate
					onSubmit={form.onSubmit(handleSubmit, scrollToFirstError)}
				>
					<VolunteerFields form={form} event={currentEvent} eventLength={eventLength} />

					<section className={styles.submitSection}>
						<Checkbox
							label="I'm willing to be present at the venue for the duration of all my shifts."
							{...form.getInputProps("confirm", { type: "checkbox" })}
						/>

						{serverError && (
							<Alert color="red" variant="light" title="Couldn't submit your application">
								{serverError}
							</Alert>
						)}

						<Button type="submit" loading={submitting} className={styles.submitButton}>
							Submit application
						</Button>
					</section>
				</Paper>
			)}
		</div>
	);
}

function ConfirmedSubmission(props: {
	eventName?: string;
	roles: VolunteerRole[];
	canApplyAgain: boolean;
	onApplyAgain: () => void;
}) {
	const roleNames = ROLES.filter((role) => props.roles.includes(role.value)).map((role) => role.name);

	return (
		<Paper withBorder className={`${styles.card} ${styles.success}`}>
			<ThemeIcon size={56} radius="xl" color="green" variant="light">
				<Check style={{ width: 32, height: 32 }} />
			</ThemeIcon>
			<h2>Thank you for volunteering!</h2>
			<p>
				Your application{props.eventName ? ` for ${props.eventName}` : ""} as{" "}
				<strong>{roleNames.join(", ")}</strong> has been received. We&apos;ll be in touch with more information
				soon.
			</p>
			<div className={styles.actionRow}>
				<Button variant="default" component="a" href="/account/volunteer" leftSection={<Archive />}>
					View my applications
				</Button>
				{props.canApplyAgain ? (
					<Button onClick={props.onApplyAgain}>Apply for another event</Button>
				) : (
					<Button component="a" href="/" leftSection={<Home />}>
						Home
					</Button>
				)}
			</div>
		</Paper>
	);
}
