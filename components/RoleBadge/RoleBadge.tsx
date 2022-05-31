import React from 'react';
import styles from './RoleBadge.module.scss';

interface Props {
	className?: string;
	// style?: React.CSSProperties;
	role: {
		name: string;
		colour: string;
		event?: {
			shortname: string;
		};
		textColour: string;
	};
}

export const RoleBadge: React.FC<Props> = (props: Props) => {
	return (
		<div className={styles.roleBody} style={{ backgroundColor: props.role.colour, color: props.role.textColour }}>
			<span>{props.role.name}</span>
		</div>
	);
};
