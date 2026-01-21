import styles from '../../styles/Event.incentives.module.scss';
import { BaseIncentiveData } from './IncentiveType';
import { FormatLocalTime } from './localTime.client';

export interface GoalProps extends BaseIncentiveData {
	type: 'goal';
	goal: number;
	current: number;
}

export function Goal(props: GoalProps) {
	const time = new Date(props.run.scheduledTime);
	const progress = Math.min(props.current / props.goal, 1);

	return (
		<div className={styles.goal} style={{ color: props.active ? undefined : '#b7b7b7' }}>
			<div className={styles.gameinfo}>
				<span className={styles.game}>{props.run.game}</span>
				{' – '}
				<span className={styles.category}>{props.run.category}</span>
				{' – '}
				<span className={styles.category}>{<FormatLocalTime date={time} />}</span>
			</div>
			<span className={styles.title}>{props.title}</span>
			<span className={styles.notes}>{props.notes}</span>
			<span className={styles.current}>
				${props?.current?.toLocaleString() ?? 'Error'} / ${props?.goal?.toLocaleString() ?? 'Error'}
			</span>
			<div className={styles.progress}>
				<div className={styles.bar} style={{ width: `${progress * 100}%` }} />
			</div>
		</div>
	);
};
