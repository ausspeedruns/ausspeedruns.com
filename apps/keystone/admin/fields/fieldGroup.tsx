import { Stack, useTheme, Text } from "@keystone-ui/core";
import { ReactNode, useContext, useId } from "react";
import { FieldDescription } from "@keystone-ui/fields";
import { ButtonContext } from "@keystone-ui/button";

export function FieldGroup(props: { label: string; description: string | null; children: ReactNode }) {
	const descriptionId = useId();
	const labelId = useId();
	const theme = useTheme();
	const buttonSize = 24;
	const { useButtonStyles, useButtonTokens, defaults } = useContext(ButtonContext);
	const buttonStyles = useButtonStyles({ tokens: useButtonTokens(defaults) });
	const divider = (
		<div
			style={{
				height: "100%",
				width: 2,
				backgroundColor: theme.colors.border,
			}}
		/>
	);
	return (
		<div
			role="group"
			aria-labelledby={labelId}
			aria-describedby={props.description === null ? undefined : descriptionId}>
			<details open>
				<summary style={{
					listStyle: "none",
					outline: 0,
					// "::-webkit-details-marker": { display: "none" }
				}}>
					<Stack across gap="medium">
						<div // this is a div rather than a button because the interactive element here is the <summary> above
							style={{
								...buttonStyles,
								// "summary:focus &": buttonStyles[":focus"],
								padding: 0,
								height: buttonSize,
								width: buttonSize,
								// "details[open] &": {
								// 	transform: "rotate(90deg)",
								// },
							}}>
							{downChevron}
						</div>
						{divider}
						<Text id={labelId} size="large" weight="bold" style={{ position: "relative" }}>
							{props.label}
						</Text>
					</Stack>
				</summary>
				<Stack across gap="medium">
					<div style={{ width: buttonSize }} />
					{divider}
					<div>
						{props.description !== null && (
							<FieldDescription id={descriptionId}>{props.description}</FieldDescription>
						)}
						<Stack marginTop="xlarge" gap="xlarge">
							{props.children}
						</Stack>
					</div>
				</Stack>
			</details>
		</div>
	);
}

const downChevron = (
	<svg width="16" height="16" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
		<path d="M5 3L8.75 6L5 9L5 3Z" fill="currentColor" />
	</svg>
);
