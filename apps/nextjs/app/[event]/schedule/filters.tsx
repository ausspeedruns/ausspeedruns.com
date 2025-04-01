import { useState } from "react";
import {
	Accordion,
	AccordionSummary,
	TextField,
	AccordionDetails,
	ToggleButtonGroup,
	ToggleButton,
	styled,
	Chip,
} from "@mui/material";
import styles from "./Schedule.event.module.scss";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import type { Run, Settings } from "./schedule-types";

const WrappableChip = styled(Chip)(({ theme }) => ({
	padding: theme.spacing(1),
	height: "100%",
	display: "flex",
	flexDirection: "row",
	"& .MuiChip-label": { overflowWrap: "break-word", whiteSpace: "normal", textOverflow: "clip" },
}));

type FiltersProps = {
	runs: Run[];
	currentSettings: Settings;
	setSettings: React.Dispatch<React.SetStateAction<Settings>>;
};

export const Filters = (props: FiltersProps) => {
	function handleFilterChange(_event: React.MouseEvent<HTMLElement>, newFilter: string[]) {
		const mutableFilter: Settings["filter"] = {
			race: false,
			coop: false,
			donationIncentive: false,
			search: props.currentSettings.filter.search,
			console: props.currentSettings.filter.console,
		};

		newFilter.forEach((filter) => {
			switch (filter) {
				case "race":
					mutableFilter.race = true;
					break;
				case "coop":
					mutableFilter.coop = true;
					break;
				case "donationIncentive":
					mutableFilter.donationIncentive = true;
					break;
				default:
					break;
			}
		});

		props.setSettings({ ...props.currentSettings, filter: mutableFilter });
	}

	function handleSearchChange(event: { target: { value: any } }) {
		props.setSettings({
			...props.currentSettings,
			filter: { ...props.currentSettings.filter, search: event.target.value },
		});
	}

	function handleConsoleChange(console: string) {
		const index = props.currentSettings.filter.console.findIndex((consoleEl) => consoleEl === console);
		if (index === -1) {
			props.setSettings({
				...props.currentSettings,
				filter: {
					...props.currentSettings.filter,
					console: [...props.currentSettings.filter.console, console],
				},
			});
		} else {
			let mutableConsole = [...props.currentSettings.filter.console];
			mutableConsole.splice(index, 1);
			props.setSettings({
				...props.currentSettings,
				filter: { ...props.currentSettings.filter, console: mutableConsole },
			});
		}
	}

	const consoleFilterElements = [...new Set(props.runs.map((run) => run.platform))].sort().map((console) => {
		if (console === "?") return;
		return (
			<WrappableChip
				key={console}
				color={props.currentSettings.filter.console.includes(console.toLowerCase()) ? "primary" : "default"}
				label={console}
				aria-label={console}
				onClick={() => handleConsoleChange(console.toLowerCase())}
				clickable
			/>
		);
	});

	return (
		<Accordion className={styles.info}>
			<AccordionSummary expandIcon={<ExpandMoreIcon />}>Filters</AccordionSummary>
			<TextField
				label="Search Game, Runner, Category"
				value={props.currentSettings.filter.search}
				onChange={handleSearchChange}
				fullWidth
			/>
			<AccordionDetails>
				<div className={styles.runType}>
					<span>Run Type</span>
					<ToggleButtonGroup
						color="primary"
						value={Object.keys(props.currentSettings.filter).filter(
							(key) => props.currentSettings.filter[key as keyof Settings["filter"]],
						)}
						onChange={handleFilterChange}
						aria-label="Run type filter">
						<ToggleButton value="race" aria-label="Race">
							Race
						</ToggleButton>
						<ToggleButton value="coop" aria-label="Co-op">
							Co-op
						</ToggleButton>
						<ToggleButton value="donationIncentive" aria-label="Donation Incentive">
							Has Donation Incentives
						</ToggleButton>
					</ToggleButtonGroup>
				</div>
				<div className={styles.consoleFilters}>
					<span>Console</span>
					<div className={styles.consoleList}>{consoleFilterElements}</div>
				</div>
			</AccordionDetails>
		</Accordion>
	);
};
