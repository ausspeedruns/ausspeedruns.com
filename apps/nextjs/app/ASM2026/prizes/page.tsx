import styles from "./prizes.module.scss";

import Button from "apps/nextjs/components/Button/Button";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface PrizeData {
	name: string;
	requirement: string;
	description?: string;
	givingAway: string | number;
}

const prizes = [
	{
		name: "Urban Climb Pass (AUSTRALIA ONLY)",
		requirement: "$10 Minimum donation",
		givingAway: 5,
		description: "Voucher for entry to any Urban Climb across Australia, including gear hire.",
	},
	{
		name: "Untitled Goose Game Code",
		requirement: "$10 Minimum donation",
		givingAway: 5,
		description: "Digital Steam code for Untitled Goose Game, provided by House House.",
	},
	{
		name: "Steam Game Bundle A",
		requirement: "$20 Minimum donation",
		givingAway: 1,
		description: "Digital Steam codes for Ova Magica and LumenTale: Memories of Trey.",
	},
	{
		name: "Steam Game Bundle B",
		requirement: "$20 Minimum donation",
		givingAway: 1,
		description: "Digital Steam codes for Trakonius, Chained Wheels, and Blood Gauntlet.",
	},
	{
		name: "RetroTINK-4K",
		requirement: "$50 Minimum donation",
		givingAway: 1,
		description: "A RetroTINK-4K Pro, to be shipped to the winner's address.",
	},
] as const satisfies PrizeData[];

export const metadata = {
	title: "ASM2026 Prizes",
	description: "View all prizes we are giving away for ASM2026.",
};

export default function Prizes() {
	return (
		<div className={styles.content}>
			<h2>Prizes</h2>
			<div className={styles.donate}>
				<Button actionText="Donate" link="/donate" openInNewTab iconRight={faChevronRight} />
			</div>
			<p className={styles.prizeToC}>
				<a href="https://ausspeedruns.sharepoint.com/:w:/s/Main/IQBgamII8Ab4T431N7ErS0JuAZbNEUgLF5zBthrglleXByw">
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
