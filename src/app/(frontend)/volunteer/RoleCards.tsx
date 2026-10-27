"use client";

import type { ReactNode } from "react";
import { Checkbox } from "@mantine/core";
import type { Volunteer } from "#/payload-types";
import styles from "./page.module.css";

export type VolunteerRole = Volunteer["role"][number];

export const VOLUNTEER_ROLES: { value: VolunteerRole; name: string; description: string; contact: ReactNode }[] = [
	{
		value: "host",
		name: "Host",
		description:
			"You are the voice of the event, reading off donations and letting viewers know about the charity and any sponsors.",
		contact: <i>Kenorah</i>,
	},
	{
		value: "frontDesk",
		name: "Front Desk",
		description:
			"The first point of contact: handing out passes, taking in-person donations, answering public queries and making sure runners are ready for their runs.",
		contact: <i>JTMagicman</i>,
	},
	{
		value: "tech",
		name: "Tech",
		description:
			"Balance the stream and in-person audio, crop game feeds and cameras, and transition between runs and intermission.",
		contact: <i>nei</i>,
	},
	{
		value: "stageHand",
		name: "Stage Hand",
		description:
			"Help runners plug in their consoles during setup, and take photos of the runners, crowd and event the rest of the time.",
		contact: (
			<>
				<i>Kuiperbole</i> or <i>nei</i>
			</>
		),
	},
];

interface RoleCardsProps {
	value: VolunteerRole[];
	onChange: (roles: VolunteerRole[]) => void;
	error?: ReactNode;
}

export function RoleCards(props: RoleCardsProps) {
	return (
		<Checkbox.Group
			value={props.value}
			error={props.error}
			onChange={(value) => props.onChange(value as VolunteerRole[])}
		>
			<div className={styles.roleGrid}>
				{VOLUNTEER_ROLES.map((role) => (
					<Checkbox.Card key={role.value} value={role.value} className={styles.roleCard}>
						<Checkbox.Indicator />
						<div>
							<p className={styles.roleName}>{role.name}</p>
							<p className={styles.roleDescription}>{role.description}</p>
							<p className={styles.roleContact}>Questions? Contact {role.contact} on Discord.</p>
						</div>
					</Checkbox.Card>
				))}
			</div>
		</Checkbox.Group>
	);
}
