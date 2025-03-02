"use client";

import styles from "../GameSubmission.module.scss";
import { Button, Checkbox, FormControl, FormControlLabel, FormHelperText, InputLabel, TextField } from "@mui/material";
import { GameSubmitPage } from "../components/GameSubmitPage";
import DonationIncentiveInput from "../DonationIncentive";
import EstimateInput from "../EstimateInput";
import useFormInput from "../../../../hooks/useFormInput";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { DonationIncentive, SubmissionPageRef } from "../submissionTypes";

type GameInfoProps = {
	show: boolean;
	onComplete: (isComplete: boolean) => void;
};

export const RunInfo = forwardRef<SubmissionPageRef, GameInfoProps>((props, ref) => {
	const category = useFormInput("d");
	const video = useFormInput("d");
	const specialReqs = useFormInput("");
	const [donationIncentives, setDonationIncentives] = useState<DonationIncentive[] | undefined>(undefined);
	const [estimate, setEstimate] = useState("01:00:00");
	const [possibleEstimate, setLowerEstimate] = useState("");
	const possibleEstimateReason = useFormInput("");

	const [showPossibleEstimate, setShowPossibleEstimate] = useState(false);
	const [showSpecialReqs, setShowSpecialReqs] = useState(false);

	useImperativeHandle(ref, () => ({
		reset: () => {
			category.reset();
			video.reset();
			specialReqs.reset();
			possibleEstimateReason.reset();
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
				category.elementProps.value &&
					estimate !== "00:00:00" &&
					(!showPossibleEstimate ||
						(possibleEstimate !== "00:00:00" && possibleEstimateReason.elementProps.value)) &&
					video.elementProps.value &&
					(typeof donationIncentives === "undefined" || donationIncentives.at(-1)?.title),
			),
		);
	}, [
		category.elementProps.value,
		estimate,
		possibleEstimate,
		possibleEstimateReason.elementProps.value,
		video.elementProps.value,
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

			<TextField
				{...category.elementProps}
				label="Category"
				autoComplete="category"
				helperText="Do not use uncommon acronyms."
				slotProps={{ htmlInput: { maxLength: 100 } }}
				required
				name="category"
			/>

			<EstimateInput required value={estimate} onTimeChange={handleEstimateChange} name="estimate" />
			<FormControlLabel
				control={
					<Checkbox
						onChange={(e) => setShowPossibleEstimate(e.target.checked)}
						checked={showPossibleEstimate}
					/>
				}
				label="Possible to go 15 minutes or more under?"
			/>
			{showPossibleEstimate && (
				<>
					<TextField
						{...possibleEstimateReason.elementProps}
						label="Provide details as to why"
						autoComplete="off"
						slotProps={{ htmlInput: { maxLength: 200 } }}
						required
						multiline
						rows={2}
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
			<TextField
				{...video.elementProps}
				label="Video of your own run"
				autoComplete="off"
				slotProps={{ htmlInput: { maxLength: 100 } }}
				required
				name="video"
			/>
			{showSpecialReqs ? (
				<div className={styles.optionalTextInputs}>
					<TextField
						{...specialReqs.elementProps}
						label="Special Requirements to run your game"
						autoComplete="off"
						slotProps={{ htmlInput: { maxLength: 300 } }}
						multiline
						rows={2}
						className={styles.input}
						name="specialReqs"
					/>
					<Button
						variant="outlined"
						disabled={Boolean(specialReqs.elementProps.value)}
						onClick={() => setShowSpecialReqs(false)}
						color="error"
						className={styles.button}>
						Cancel
					</Button>
				</div>
			) : (
				<FormControl>
					<Button variant="contained" onClick={() => setShowSpecialReqs(true)} className={styles.button}>
						The speedrun needs special requirements
					</Button>
					<FormHelperText>
						This involves any: mods, downpatches, software, controllers (if a PC game) and any other
						requirements. Layout requirements should be discussed with Clubwho.
					</FormHelperText>
				</FormControl>
			)}

			{typeof donationIncentives !== "undefined" && <InputLabel>Donation Incentives</InputLabel>}
			{donationIncentives?.map((donationIncentive, i) => {
				return (
					<div className={styles.optionalTextInputs} key={i}>
						<DonationIncentiveInput
							value={donationIncentive}
							onDonationChange={handleDonationIncentiveChange}
							index={i}
						/>
						<Button
							variant="outlined"
							disabled={Boolean(donationIncentive.title)}
							onClick={() => handleDonationIncentiveCancel(i)}
							color="error">
							Cancel
						</Button>
					</div>
				);
			})}
			<Button
				variant="contained"
				onClick={handleNewDonationIncentive}
				disabled={typeof donationIncentives !== "undefined" && !donationIncentives.at(-1)?.title}>
				Add {typeof donationIncentives !== "undefined" ? "another" : "a"} donation incentive
			</Button>
		</GameSubmitPage>
	);
});
