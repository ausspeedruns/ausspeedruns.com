import { Anchor } from "@mantine/core";

type RunnersProps = {
	runners: string[];
	/** Names without accounts, shown without a profile link */
	others?: string[];
};

export function Runners({ runners, others = [] }: RunnersProps) {
	if (runners.length === 0 && others.length === 0) {
		return <span>???</span>;
	}

	const runnerLinks = [
		...runners.map((username) => (
			<Anchor
				key={username}
				href={`/user/${username}`}
				target="_blank"
				rel="noreferrer"
				c="inherit"
				inherit
				underline="always"
			>
				{username}
			</Anchor>
		)),
		...others.map((name) => <span key={`other-${name}`}>{name}</span>),
	];

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
