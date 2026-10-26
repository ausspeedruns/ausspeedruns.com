"use client";

import { Anchor, Group, Input, Pill, Select, Stack, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";

import { fillLink, useSchedule } from "../context.tsx";

interface RunnerPickerProps {
	runnerIds: string[];
	onChange: (runnerIds: string[]) => void;
}

/** Selected runners as removable pills plus a username search box. */
export function RunnerPicker({ runnerIds, onChange }: RunnerPickerProps) {
	const { api, users, rememberUsers, links } = useSchedule();
	const [search, setSearch] = useState("");
	const [debounced] = useDebouncedValue(search, 250);
	const [results, setResults] = useState<{ value: string; label: string }[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (debounced.trim().length < 2) {
			setResults([]);
			return;
		}
		let cancelled = false;
		setLoading(true);
		api.searchUsers(debounced)
			.then((found) => {
				if (cancelled) return;
				rememberUsers(found);
				setResults(found.map((user) => ({ value: user.id, label: user.username })));
			})
			.catch(() => !cancelled && setResults([]))
			.finally(() => !cancelled && setLoading(false));
		return () => {
			cancelled = true;
		};
	}, [api, debounced, rememberUsers]);

	return (
		<Stack gap={6}>
			<Input.Label>Runners (with accounts)</Input.Label>
			<Group gap={6}>
				{runnerIds.length === 0 && (
					<Text size="sm" c="dimmed">
						No runners
					</Text>
				)}
				{runnerIds.map((id) => {
					const href = fillLink(links.user, { id });
					const name = users.get(id) ?? id;
					return (
						<Pill
							key={id}
							size="md"
							withRemoveButton
							onRemove={() => onChange(runnerIds.filter((runnerId) => runnerId !== id))}
							removeButtonProps={{ "aria-label": `Remove ${name}` }}
						>
							{href ? (
								<Anchor href={href} target="_blank" rel="noopener noreferrer" size="sm" inherit>
									{name}
								</Anchor>
							) : (
								name
							)}
						</Pill>
					);
				})}
			</Group>
			<Select
				placeholder="Search username to add…"
				searchable
				clearable={false}
				value={null}
				searchValue={search}
				onSearchChange={setSearch}
				data={results.filter((result) => !runnerIds.includes(result.value))}
				filter={({ options }) => options}
				nothingFoundMessage={
					search.trim().length < 2 ? "Type at least 2 characters" : loading ? "Searching…" : "No users found"
				}
				onChange={(value) => {
					if (!value) return;
					onChange([...runnerIds, value]);
					setSearch("");
				}}
			/>
		</Stack>
	);
}
