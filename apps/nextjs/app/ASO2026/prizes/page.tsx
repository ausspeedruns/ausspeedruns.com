import styles from "./prizes.module.scss";

import Button from "apps/nextjs/components/Button/Button";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { Circuitry } from "apps/nextjs/components/ASM25/circuitry";

interface PrizeData {
	name: string;
	requirement: string;
	description?: string;
	givingAway: string | number;
}

const prizes = [
	{
		name: "Steam Bundle - Potico Games",
		requirement: "$10 Minimum donation",
		givingAway: 8,
		description:
			"Zebulon: A Lost Cat and PicoMix by NuSan.",
	},
	{
		name: "Steam Bundle – Supergiant Games",
		requirement: "$30 Minimum donation",
		givingAway: 3,
		description: "Hades, Hades II, and Transistor.",
	},
	{
		name: "Steam Variety Bundle",
		requirement: "$30 Minimum donation",
		givingAway: 1,
		description: "RuneQuest: Warlords, Hades, and PicoMix by NuSan.",
	},
	{
		name: "Steam Ultimate Bundle",
		requirement: "$50 Minimum donation",
		givingAway: 1,
		description: "RuneQuest: Warlords, Hades, Hades II, Transistor, Zebulon: A Lost Cat, and PicoMix by NuSan.",
	},
] as const satisfies PrizeData[];

export const metadata = {
	title: "ASM2025 Prizes",
	description: "View all prizes we are giving away for ASM2025.",
};

export default function Prizes() {
	return (
		<div className={styles.content}>
			<h2>Prizes</h2>
			<div className={styles.donate}>
				<Button actionText="Donate" link="/donate" openInNewTab iconRight={faChevronRight} />
			</div>
			<p className={styles.prizeToC}>
				<a href="https://ausspeedruns.sharepoint.com/:w:/s/Main/IQBL1J-gU0OQQYi5X2FASWpJAcgFS293D_5Hh9UcTQwzOfQ?e=zuhBZP">
					Prizes Terms and Conditions
				</a>
			</p>
			<section className={styles.prizes}>
				{prizes.map((prize, index) => (
					<Prize
						key={index}
						name={prize.name}
						requirement={prize.requirement + ` (${prize.givingAway} to be given away)`}
						description={prize.description}
					/>
				))}
			</section>
		</div>
	);
}

interface PrizeProps {
	name: string;
	requirement: string;
	description?: string;
}

const Prize = (props: PrizeProps) => {
	return (
		<div className={styles.prize}>
			<h2>{props.name}</h2>
			<p className={styles.requirement}>{props.requirement}</p>
			<p>{props.description}</p>
		</div>
	);
};
