import { Runner } from "./schedule-types";

type RunnersProps = {
	runners: Runner[];
};

export function Runners({ runners }: RunnersProps) {
	if (runners.length === 0) {
		return <span>???</span>;
	}

	const runnerLinks = runners.map((runner, i) => {
		const { username } = runner;
		return (
			<a key={username} href={`/user/${username}`} target="_blank" rel="noreferrer">
				{username}
			</a>
		);
	});

	const lastRunner = runnerLinks.pop();

	return (
		<div>
			{runnerLinks.length > 0 &&
				runnerLinks.reduce((prev, curr) => (
					<>
						{prev}, {curr}
					</>
				))}{" "}
			{runnerLinks.length > 0 && "and"} {lastRunner}
		</div>
	);
}
