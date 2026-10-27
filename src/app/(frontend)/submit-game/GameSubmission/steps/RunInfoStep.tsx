"use client";

import { useState } from "react";
import styles from "../GameSubmission.module.css";
import { Button, Checkbox, Input, TextInput, Textarea } from "@mantine/core";
import DonationIncentiveInput from "../components/DonationIncentive.tsx";
import EstimateInput from "../components/EstimateInput";
import type { DonationIncentive, GameSubmissionResults } from "../submissionTypes";
import type { UseFormReturnType } from "@mantine/form";

interface RunInfoProps {
	form: UseFormReturnType<GameSubmissionResults>;
}

export function RunInfo(props: RunInfoProps) {
	const showPossibleEstimate = props.form.values.possibleEstimate !== undefined;
	const [showSpecialReqs, setShowSpecialReqs] = useState(Boolean(props.form.values.specialRequirements));

	function togglePossibleEstimate(checked: boolean) {
		props.form.setFieldValue("possibleEstimate", checked ? "00:00:00" : undefined);
		props.form.setFieldValue("possibleEstimateReason", checked ? "" : undefined);
		props.form.clearFieldError("possibleEstimate");
		props.form.clearFieldError("possibleEstimateReason");
	}

	function removeSpecialReqs() {
		props.form.setFieldValue("specialRequirements", "");
		setShowSpecialReqs(false);
	}

	function handleNewDonationIncentive() {
		if (typeof props.form.values.donationIncentives === "undefined") {
			props.form.setFieldValue("donationIncentives", [{ title: "" }]);
		} else {
			props.form.setFieldValue("donationIncentives", [
				...(props.form.values.donationIncentives as DonationIncentive[]),
				{ title: "" },
			]);
		}
	}

	function handleDonationIncentiveCancel(index: number) {
		if (props.form.values.donationIncentives?.length === 1) {
			props.form.setFieldValue("donationIncentives", undefined);
		} else {
			props.form.setFieldValue(
				"donationIncentives",
				props.form.values.donationIncentives?.filter((_, i) => i !== index),
			);
		}
	}

	return (
		<div className={styles.pageContent}>
			<div className={styles.pageHeader}>
				<h3>Speedrun Details</h3>
				<p>Provide details about your run category and timing.</p>
			</div>

			<TextInput
				label="Category"
				autoComplete="category"
				description="Do not use uncommon acronyms."
				maxLength={100}
				required
				name="category"
				key={props.form.key("category")}
				{...props.form.getInputProps("category")}
			/>

			<TextInput
				label="Video of your own run"
				description="A link to a YouTube, Twitch or similar video, e.g. https://youtu.be/..."
				type="url"
				autoComplete="off"
				maxLength={100}
				required
				name="video"
				key={props.form.key("video")}
				{...props.form.getInputProps("video")}
			/>

			<div className={styles.fieldGroup}>
				<p className={styles.fieldGroupLabel}>Timing</p>
				<EstimateInput
					required
					name="estimate"
					key={props.form.key("estimate")}
					{...props.form.getInputProps("estimate")}
				/>
				<Checkbox
					onChange={(e) => togglePossibleEstimate(e.currentTarget.checked)}
					checked={showPossibleEstimate}
					label="Possible to go 15 minutes or more under?"
				/>
				{showPossibleEstimate && (
					<div className={styles.optionalSection}>
						<div className={styles.fieldGroup}>
							<Textarea
								label="Provide details as to why"
								autoComplete="off"
								maxLength={200}
								required
								minRows={2}
								name="possibleEstimateReason"
								key={props.form.key("possibleEstimateReason")}
								{...props.form.getInputProps("possibleEstimateReason")}
							/>
							<EstimateInput
								required
								label="Revised estimate based on reason above"
								name="possibleEstimate"
								key={props.form.key("possibleEstimate")}
								{...props.form.getInputProps("possibleEstimate")}
							/>
						</div>
					</div>
				)}
			</div>

			<div className={styles.fieldGroup}>
				<p className={styles.fieldGroupLabel}>Optional</p>
				{showSpecialReqs ? (
					<div className={styles.optionalSection}>
						<div className={styles.optionalTextInputs}>
							<Textarea
								label="Special Requirements to run your game"
								autoComplete="off"
								maxLength={300}
								minRows={2}
								className={styles.input}
								name="specialRequirements"
								key={props.form.key("specialRequirements")}
								{...props.form.getInputProps("specialRequirements")}
							/>
							<Button
								variant="outline"
								onClick={removeSpecialReqs}
								color="red"
								className={styles.button}
							>
								Remove
							</Button>
						</div>
					</div>
				) : (
					<div>
						<Button variant="light" onClick={() => setShowSpecialReqs(true)}>
							Add special requirements
						</Button>
						<Input.Description>Mods, downpatches, software, controllers (PC games), etc.</Input.Description>
					</div>
				)}

				{typeof props.form.values.donationIncentives !== "undefined" && (
					<Input.Label>Donation Incentives</Input.Label>
				)}
				{props.form.values.donationIncentives?.map((_, i) => (
					<div className={styles.optionalSection} key={i}>
						<DonationIncentiveInput
							form={props.form}
							index={i}
							onRemove={() => handleDonationIncentiveCancel(i)}
						/>
					</div>
				))}
				<Button
					variant="light"
					className={styles.addButton}
					onClick={handleNewDonationIncentive}
					disabled={
						typeof props.form.values.donationIncentives !== "undefined" &&
						!props.form.values.donationIncentives.at(-1)?.title
					}
				>
					Add {typeof props.form.values.donationIncentives !== "undefined" ? "another" : "a"} donation
					incentive
				</Button>
			</div>
		</div>
	);
}
