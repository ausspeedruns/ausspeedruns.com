"use client";

import type { ReactNode } from "react";
import { Alert, Input, NumberInput, Textarea, TextInput } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { addDays } from "date-fns";

import styles from "./page.module.css";
import { RoleCards } from "./RoleCards";
import type { VolunteerFormValues } from "./validateVolunteer";

export function Section(props: { title: string; description?: ReactNode; children: ReactNode }) {
	return (
		<section className={styles.section}>
			<div className={styles.sectionHeader}>
				<h2>{props.title}</h2>
				{props.description && <p>{props.description}</p>}
			</div>
			{props.children}
		</section>
	);
}

interface VolunteerFieldsProps {
	form: UseFormReturnType<VolunteerFormValues>;
	event?: { startDate: string; eventTimezone: string };
	eventLength: number;
}

/** Roles, role-specific questions and availability, shared by the application and edit forms. */
export function VolunteerFields({ form, event, eventLength }: VolunteerFieldsProps) {
	const roles = form.values.roles;

	const dayInputs = [];
	if (event) {
		for (let i = 0; i < eventLength; i++) {
			const date = addDays(event.startDate, i);
			dayInputs.push(
				<TextInput
					key={i}
					label={date.toLocaleDateString("en-AU", {
						weekday: "long",
						day: "numeric",
						month: "long",
						timeZone: event.eventTimezone || undefined,
					})}
					placeholder="e.g. 10am – 6pm, or leave blank if unavailable"
					value={form.values.dayTimes[i] ?? ""}
					onChange={(e) => {
						const newDates = [...form.values.dayTimes];
						newDates[i] = e.currentTarget.value;
						form.setFieldValue("dayTimes", newDates);
					}}
				/>,
			);
		}
	}

	return (
		<>
			<Section title="Roles" description="Select every role you'd like to apply for.">
				<RoleCards
					value={roles}
					error={form.errors.roles}
					onChange={(value) => form.setFieldValue("roles", value)}
				/>
			</Section>

			{roles.includes("host") && (
				<Section title="Hosting">
					<NumberInput
						label="Longest hosting shift"
						description="E.g. 3 hours means you'd like each hosting shift to be no longer than 3 hours."
						suffix=" hours"
						min={0}
						max={24}
						allowNegative={false}
						required
						{...form.getInputProps("maxDailyHostTime")}
					/>
					<div className={styles.fieldRow}>
						<TextInput
							label="Specific game to host"
							description="If you've organised with a runner to host their run"
							{...form.getInputProps("specificGame")}
						/>
						<TextInput
							label="Runner"
							description="Who you've organised it with"
							{...form.getInputProps("specificRunner")}
						/>
					</div>
					<Textarea
						label="Anything else we should know?"
						autosize
						minRows={3}
						{...form.getInputProps("additionalInfo")}
					/>
				</Section>
			)}

			{roles.includes("tech") && (
				<Section title="Tech">
					<Textarea
						label="Previous tech experience"
						description="Mention any experience with OBS, analogue upscalers (e.g. RetroTINK) or audio mixing. It's ok if you don't have any!"
						autosize
						minRows={3}
						required
						{...form.getInputProps("techExperience")}
					/>
				</Section>
			)}

			{roles.length > 0 && (
				<Section
					title="Availability"
					description={
						eventLength > 0
							? "Enter the times you're available on each day. Leave a day blank if you can't make it."
							: undefined
					}
				>
					{eventLength > 0 ? (
						<div className={styles.dayList}>
							{dayInputs}
							{form.errors.dayTimes && <Input.Error>{form.errors.dayTimes}</Input.Error>}
						</div>
					) : (
						<Alert variant="light" color="blue" title="Event dates not announced yet">
							We&apos;ll check your availability once the event dates are set.
						</Alert>
					)}
					<NumberInput
						label="Total hours across the event"
						description="The most you'd like to volunteer overall. This could be all at once or across multiple shifts."
						suffix=" hours"
						min={0}
						allowNegative={false}
						required
						{...form.getInputProps("maxTime")}
					/>
				</Section>
			)}
		</>
	);
}
