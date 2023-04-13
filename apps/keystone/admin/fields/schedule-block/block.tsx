import { FieldLabel, TextInput, Select } from "@keystone-ui/fields";
import { AlertDialog } from "@keystone-ui/modals";
import { Box, Stack } from "@keystone-ui/core";
import { Button } from "@keystone-ui/button";
import { LoadingDots } from "@keystone-ui/loading";
import { ChromePicker } from "react-color";
import DeleteIcon from "@mui/icons-material/Delete";

import type { Block as BlockData } from "./block-schema";
import { useState } from "react";
import { FieldGroup } from "../fieldGroup";

type BlockProps = {
	value: BlockData;
	onChange?: (id: number, changedBlock: BlockData) => void;
	onDelete?: (id: number) => void;
	disabled?: boolean;
	id?: number;
	runs: { label: string; value: string }[];
	runsLoading?: boolean;
};

export function Block(props: BlockProps) {
	const [isColourOpen, setIsColourOpen] = useState(false);
	const [modalData, setModalData] = useState<{ title: string; property: keyof BlockData }>({
		title: "Set Colour",
		property: "colour",
	});
	const [colourState, setColourState] = useState("#000000");

	function updateValueProperty(data: string, property: keyof BlockData) {
		props.onChange?.(props.id ?? -1, { ...props.value, [property]: data });
	}

	return (
		<FieldGroup label={props.value.name ? props.value.name : "No name"} description={null}>
			<Box padding="medium" rounding="medium" style={{ borderWidth: "1px" }}>
				<Stack gap="medium">
					<Stack across width="full">
						<FieldLabel as="legend">Name*</FieldLabel>
						<TextInput
							width="full"
							type="text"
							onChange={(event) => {
								updateValueProperty(event.target.value, "name");
							}}
							disabled={props.disabled}
							value={props.value.name || ""}
						/>
					</Stack>
					<Stack across>
						<FieldLabel as="legend">Colour*</FieldLabel>
						<Button
							isDisabled={props.disabled}
							onClick={() => {
								setIsColourOpen(true);
								setModalData({ title: "Set Colour", property: "colour" });
								setColourState(props.value.colour);
							}}>
							<div
								style={{
									background: props.value.colour,
									height: 22,
									width: 22,
									display: "inline-block",
									marginRight: 8,
									marginBottom: -4,
								}}
							/>
							{props.value.colour}
						</Button>
					</Stack>
					<Stack across>
						<FieldLabel as="legend">Text Colour*</FieldLabel>
						<Button
							isDisabled={props.disabled}
							onClick={() => {
								setIsColourOpen(true);
								setModalData({ title: "Set Text Colour", property: "textColour" });
								setColourState(props.value.textColour);
							}}>
							<div
								style={{
									background: props.value.textColour,
									height: 22,
									width: 22,
									display: "inline-block",
									marginRight: 8,
									marginBottom: -4,
								}}
							/>
							{props.value.textColour}
						</Button>
					</Stack>
					<Stack across>
						<FieldLabel as="legend">Start Run*</FieldLabel>
						{props.runsLoading ? (
							<LoadingDots tone="passive" label="Runs are still loading" />
						) : (
							<Select
								width="full"
								isDisabled={props.disabled}
								options={props.runs}
								onChange={(option) => {
									updateValueProperty(option?.value ?? "", "startRunId");
								}}
								value={props.runs.find((run) => run.value === props.value.startRunId) ?? null}
							/>
						)}
					</Stack>
					<Stack across>
						<FieldLabel as="legend">End Run</FieldLabel>
						{props.runsLoading ? (
							<LoadingDots tone="passive" label="Runs are still loading" />
						) : (
							<Select
								width="full"
								isDisabled={props.disabled}
								options={props.runs}
								onChange={(option) => {
									updateValueProperty(option?.value ?? "", "endRunId");
								}}
								value={props.runs.find((run) => run.value === props.value.endRunId) ?? null}
							/>
						)}
					</Stack>
					<Button
						isDisabled={props.disabled}
						tone="negative"
						weight="bold"
						onClick={() => props.onDelete?.(props.id ?? -1)}>
						<DeleteIcon style={{ marginBottom: -7 }} /> Remove
					</Button>
				</Stack>
				<AlertDialog
					isOpen={isColourOpen}
					title={modalData.title}
					actions={{
						cancel: {
							action: () => setIsColourOpen(false),
							label: "Cancel",
						},
						confirm: {
							action: () => {
								setIsColourOpen(false);
								updateValueProperty(colourState, modalData.property);
							},
							label: "Confirm",
						},
					}}>
					<ChromePicker
						color={colourState}
						onChange={(e) => {
							setColourState(e.hex);
						}}
					/>
				</AlertDialog>
			</Box>
		</FieldGroup>
	);
}
