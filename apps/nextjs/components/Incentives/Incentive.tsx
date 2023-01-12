import { Goal, GoalProps } from './IncentiveGoal';
import { War, WarProps } from './IncentiveWar';

interface IncentiveProps {
	incentive: WarProps | GoalProps;
}

export const Incentive = (props: IncentiveProps) => {
	switch (props.incentive.type) {
		case 'goal':
			return <Goal key={props.incentive.title} {...props.incentive} />;
		case 'war':
			return <War key={props.incentive.title} {...props.incentive} />;
		default:
			return <></>;
	}
};
