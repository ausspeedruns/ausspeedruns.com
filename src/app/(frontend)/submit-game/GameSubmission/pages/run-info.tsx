"use client";

import styles from "../GameSubmission.module.css";
import { Button, Checkbox, Input, TextInput, Textarea } from "@mantine/core";
import { GameSubmitPage } from "../components/GameSubmitPage";
import DonationIncentiveInput from "../DonationIncentive";
import EstimateInput from "../EstimateInput";
// import useFormInput from "../../../../hooks/useFormInput";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { DonationIncentive, SubmissionPageRef } from "../submissionTypes";

type GameInfoProps = {
	show: boolean;
	onComplete: (isComplete: boolean) => void;
};

export const RunInfo = forwardRef<SubmissionPageRef, GameInfoProps>((props, ref) => {
	// const category = useFormInput("");
	// const video = useFormInput("");
	// const specialReqs = useFormInput("");
	const [donationIncentives, setDonationIncentives] = useState<DonationIncentive[] | undefined>(undefined);
	const [estimate, setEstimate] = useState("01:00:00");
	const [possibleEstimate, setLowerEstimate] = useState("");
	// const possibleEstimateReason = useFormInput("");

	const [showPossibleEstimate, setShowPossibleEstimate] = useState(false);
	const [showSpecialReqs, setShowSpecialReqs] = useState(false);

	useImperativeHandle(ref, () => ({
		reset: () => {
			// category.reset();
			// video.reset();
			// specialReqs.reset();
			// possibleEstimateReason.reset();
			setEstimate("");
			setLowerEstimate("");
			setShowPossibleEstimate(false);
			setShowSpecialReqs(false);
			setDonationIncentives(undefined);
		},
	}));

	useEffect(() => {
		props.onComplete(
			Boolean(
				// category.elementProps.value &&
				estimate !== "00:00:00" &&
				(!showPossibleEstimate ||
					(possibleEstimate !== "00:00:00" && /* possibleEstimateReason.elementProps.value */ true)) &&
				// video.elementProps.value &&
				(typeof donationIncentives === "undefined" || donationIncentives.at(-1)?.title),
			),
		);
	}, [
		// category.elementProps.value,
		estimate,
		possibleEstimate,
		// possibleEstimateReason.elementProps.value,
		// video.elementProps.value,
		donationIncentives,
	]);

	function handleEstimateChange(time: string) {
		setEstimate(time);
	}

	function handlePossibleEstimateChange(time: string) {
		setLowerEstimate(time);
	}

	function handleNewDonationIncentive() {
		if (typeof donationIncentives === "undefined") {
			setDonationIncentives([{ title: "" }]);
		} else {
			setDonationIncentives((prev) => [...(prev as DonationIncentive[]), { title: "" }]);
		}
	}

	function handleDonationIncentiveCancel(index: number) {
		if (donationIncentives?.length === 1) {
			setDonationIncentives(undefined);
		} else {
			setDonationIncentives(donationIncentives?.filter((_, i) => i !== index));
		}
	}

	function handleDonationIncentiveChange(updatedIncentive: DonationIncentive, updateIndex: number) {
		setDonationIncentives(
			donationIncentives?.map((incentive, i) => {
				if (i === updateIndex) {
					return updatedIncentive;
				} else {
					return incentive;
				}
			}),
		);
	}

	return (
		<GameSubmitPage title="Speedrun Information" show={props.show}>
			<input type="hidden" name="donationIncentives" value={JSON.stringify(donationIncentives)} />

			<TextInput
				// {...category.elementProps}
				label="Category"
				autoComplete="category"
				description="Do not use uncommon acronyms."
				maxLength={100}
				required
				name="category"
			/>

			<EstimateInput required value={estimate} onTimeChange={handleEstimateChange} name="estimate" />
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
					/>
					<EstimateInput
						value={possibleEstimate}
						required
						label="Revised estimate based on reason above"
						onTimeChange={handlePossibleEstimateChange}
						name="possibleEstimate"
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
						name="specialReqs"
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

			{typeof donationIncentives !== "undefined" && <Input.Label>Donation Incentives</Input.Label>}
			{donationIncentives?.map((donationIncentive, i) => {
				return (
					<div className={styles.optionalTextInputs} key={i}>
						<DonationIncentiveInput
							value={donationIncentive}
							onDonationChange={handleDonationIncentiveChange}
							index={i}
						/>
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
				disabled={typeof donationIncentives !== "undefined" && !donationIncentives.at(-1)?.title}
			>
				Add {typeof donationIncentives !== "undefined" ? "another" : "a"} donation incentive
			</Button>
		</GameSubmitPage>
	);
});
