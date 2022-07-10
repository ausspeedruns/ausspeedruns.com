import { format } from 'date-fns';
import { Goal as GoalData } from '../../schema/incentives';
import styles from '../../styles/Event.incentives.module.scss';
import { BaseIncentiveData } from './IncentiveType';

export interface GoalProps extends BaseIncentiveData, GoalData {
	type: 'goal';
}
export const Goal: React.FC<GoalProps> = (props) => {
	const time = new Date(props.run.scheduledTime);
	const progress = props.current / props.goal;

	return (
		<div className={styles.goal} style={{ color: props.active ? undefined : '#b7b7b7' }}>
			<div className={styles.gameinfo}>
				<span className={styles.game}>{props.run.game}</span>
				{' - '}
				<span className={styles.category}>{props.run.category}</span>
				{' - '}
				<span className={styles.category}>{format(time, "E d h:mm a")}</span>
			</div>
			<span className={styles.title}>{props.title}</span>
			<span className={styles.category}>{props.notes}</span>
			<span className={styles.current}>
				${props?.current?.toLocaleString() ?? 'Error'} / ${props?.goal?.toLocaleString() ?? 'Error'}
			</span>
			<div className={styles.progress}>
				<div className={styles.bar} style={{ width: `${progress * 100}%` }} />
			</div>
		</div>
	);
};
