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
	const [showPossibleEstimate, setShowPossibleEstimate] = useState(false);
	const [showSpecialReqs, setShowSpecialReqs] = useState(false);

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

	console.log(props.form.values.donationIncentives);

	return (
		<>
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

			<EstimateInput
				required
				name="estimate"
				key={props.form.key("estimate")}
				{...props.form.getInputProps("estimate")}
			/>
			<Checkbox
				onChange={(e) => setShowPossibleEstimate(e.currentTarget.checked)}
				checked={showPossibleEstimate}
				label="Possible to go 15 minutes or more under?"
			/>
			{showPossibleEstimate && (
				<>
					<Textarea
						// {...possibleEstimateReason.elementProps}
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
					<br />
				</>
			)}
			<TextInput
				// {...video.elementProps}
				label="Video of your own run"
				autoComplete="off"
				maxLength={100}
				required
				name="video"
				key={props.form.key("video")}
				{...props.form.getInputProps("video")}
			/>
			{showSpecialReqs ? (
				<div className={styles.optionalTextInputs}>
					<Textarea
						// {...specialReqs.elementProps}
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
						// disabled={Boolean(specialReqs.elementProps.value)}
						onClick={() => setShowSpecialReqs(false)}
						color="red"
						className={styles.button}
					>
						Cancel
					</Button>
				</div>
			) : (
				<div>
					<Button variant="filled" onClick={() => setShowSpecialReqs(true)} className={styles.button}>
						The speedrun needs special requirements
					</Button>
					<Input.Description>
						This involves any: mods, downpatches, software, controllers (if a PC game) and any other
						requirements. Layout requirements should be discussed with Clubwho.
					</Input.Description>
				</div>
			)}

			{typeof props.form.values.donationIncentives !== "undefined" && (
				<Input.Label>Donation Incentives</Input.Label>
			)}
			{props.form.values.donationIncentives?.map((donationIncentive, i) => {
				return (
					<div className={styles.optionalTextInputs} key={i}>
						<DonationIncentiveInput form={props.form} index={i} />
						<Button
							variant="outline"
							disabled={Boolean(donationIncentive.title)}
							onClick={() => handleDonationIncentiveCancel(i)}
							color="red"
						>
							Cancel
						</Button>
					</div>
				);
			})}
			<Button
				variant="filled"
				onClick={handleNewDonationIncentive}
				disabled={
					typeof props.form.values.donationIncentives !== "undefined" &&
					!props.form.values.donationIncentives.at(-1)?.title
				}
			>
				Add {typeof props.form.values.donationIncentives !== "undefined" ? "another" : "a"} donation incentive
			</Button>
		</>
	);
}
