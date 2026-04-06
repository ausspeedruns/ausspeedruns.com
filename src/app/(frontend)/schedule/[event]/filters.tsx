import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { Accordion, Chip, TextInput } from "@mantine/core";
import styles from "./filters.module.css";

import type { Run, Settings } from "./schedule-types";

type FiltersProps = {
	runs: Run[];
	currentSettings: Settings;
	setSettings: Dispatch<SetStateAction<Settings>>;
};

export const Filters = (props: FiltersProps) => {
	function handleFilterChange(newFilter: string[]) {
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

	function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
		props.setSettings({
			...props.currentSettings,
			filter: { ...props.currentSettings.filter, search: event.target.value },
		});
	}

	function handleConsoleFilterChange(consoles: string[]) {
		props.setSettings({
			...props.currentSettings,
			filter: { ...props.currentSettings.filter, console: consoles },
		});
	}

	const consoleFilters = [...new Set(props.runs.map((run) => run.platform))]
		.filter((platform) => platform !== "?")
		.sort()
		.map((platform) => ({ label: platform, value: platform.toLowerCase() }));

	const selectedRunTypes = [
		props.currentSettings.filter.race ? "race" : null,
		props.currentSettings.filter.coop ? "coop" : null,
		props.currentSettings.filter.donationIncentive ? "donationIncentive" : null,
	].filter((value): value is string => value !== null);

	return (
		<Accordion className={styles.info}>
			<Accordion.Item value="filters">
				<Accordion.Control>Filters</Accordion.Control>
				<Accordion.Panel>
					<TextInput
						label="Search Game, Runner, Category"
						value={props.currentSettings.filter.search}
						onChange={handleSearchChange}
					/>
					<div className={styles.runType}>
						<span>Run Type</span>
						<Chip.Group multiple value={selectedRunTypes} onChange={handleFilterChange}>
							<Chip value="race">Race</Chip>
							<Chip value="coop">Co-op</Chip>
							<Chip value="donationIncentive">Has Donation Incentives</Chip>
						</Chip.Group>
					</div>
					<div className={styles.consoleFilters}>
						<span>Console</span>
						<Chip.Group
							multiple
							value={props.currentSettings.filter.console}
							onChange={handleConsoleFilterChange}
						>
							<div className={styles.consoleList}>
								{consoleFilters.map((consoleFilter) => (
									<Chip
										key={consoleFilter.value}
										value={consoleFilter.value}
										aria-label={consoleFilter.label}
										styles={{
											label: {
												overflowWrap: "break-word",
												whiteSpace: "normal",
												textOverflow: "clip",
											},
										}}
									>
										{consoleFilter.label}
									</Chip>
								))}
							</div>
						</Chip.Group>
					</div>
				</Accordion.Panel>
			</Accordion.Item>
		</Accordion>
	);
};
