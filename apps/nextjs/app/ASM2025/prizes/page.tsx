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
		name: "Urban Climb Pass",
		requirement: "$10 Minimum Donation",
		givingAway: 2,
		description: "Voucher for entry to any Urban Climb across Australia, including gear hire. Australia Only.",
	},
	{
		name: "Steam Game Bundle A",
		requirement: "$20 Minimum Donation",
		givingAway: 1,
		description: "Cult of the Lamb, Portal Fantasy, and Hazel Sky.",
	},
	{
		name: "Steam Game Bundle B",
		requirement: "$20 Minimum Donation",
		givingAway: 1,
		description: "Cult of the Lamb, Antonblast, and Jin Conception.",
	},
	{
		name: "GIGABYTE MO32U Monitor",
		requirement: "$50 Minimum Donation",
		givingAway: 2,
		description: "A new 32-inch GIGABYTE MO32U Monitor. Australia Only.",
	},
	{
		name: "Nintendo Switch 2 console",
		requirement: "$50 Minimum Donation",
		givingAway: 1,
		description: "A new Nintendo Switch 2 console.",
	}
] as const satisfies PrizeData[];

export const metadata = {
	title: "ASM2025 Prizes",
	description: "View all prizes we are giving away for ASM2025.",
};

export default function Prizes() {
	return (
		<div style={{ position: "relative" }}>
			<Circuitry style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} />
			<main className={styles.content}>
				<h2>Prizes</h2>
				<div className={styles.donate}>
					<Button actionText="Donate" link="/donate" openInNewTab iconRight={faChevronRight} />
				</div>
				<p className={styles.prizeToC}>
					<a href="https://ausspeedruns.sharepoint.com/:w:/s/Main/EQkcPq0A9HxMlDR4IYAYpDQBX2q1HnwgBF7T_A6oqlaGeg?e=q7NIAD">
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
			</main>
		</div>
	);
};

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
