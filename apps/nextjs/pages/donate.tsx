import React from "react";
import Head from "next/head";
import { gql, useQuery } from "urql";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import styles from "../styles/Donate.module.scss";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import DiscordEmbed from "../components/DiscordEmbed";
import Button from "../components/Button/Button";
import { Incentive } from "../components/Incentives/Incentive";

const QUERY_INCENTIVES = gql`
	query {
		event(where: { shortname: "ASM2023" }) {
			donationIncentives(take: 2, where: { active: { equals: true } }) {
				title
				type
				run {
					id
					game
					category
					scheduledTime
				}
				data
				notes
			}
		}
	}
`;

interface QUERY_INCENTIVES_RESULTS {
	event: {
		donationIncentives: {
			title: string;
			type: string;
			run: {
				id: string;
				game: string;
				category: string;
				scheduleTime: string;
			};
			data: object;
			notes: string;
		}[];
	};
}

const DonatePage = () => {
	const [incentivesQuery] = useQuery<QUERY_INCENTIVES_RESULTS>({
		query: QUERY_INCENTIVES,
	});

	console.log(incentivesQuery);

	const incentivesParsed =
		incentivesQuery.data?.event.donationIncentives.map((incentive) => ({
			title: incentive.title,
			run: incentive.run,
			active: true,
			notes: incentive.notes,
			type: incentive.type,
			...incentive.data,
		})) ?? [];

	return (
		<div className={styles.app}>
			<Head>
				<title>Donate - AusSpeedruns</title>
				<DiscordEmbed title="Donate - AusSpeedruns" description="Donate to ASM2024!" pageUrl="/donate" />
			</Head>
			<main className={styles.content}>
				<h2 className={styles.title}>Donate</h2>
				<section className={styles.incentives}>
					<h2>
						Be sure to mention which donation incentive you want your money to go towards in the donation
						message!
					</h2>
					{incentivesQuery.data && incentivesQuery.data.event.donationIncentives.length > 1 && (
						<>
							<h2>
								{incentivesQuery.data.event.donationIncentives.length > 1
									? `Here are ${incentivesQuery.data.event.donationIncentives.length} active incentives`
									: "Here is the last active incentive"}
							</h2>
							<div className={styles.data}>
								<div className={styles.divider} />
								{incentivesParsed.map((incentive) => (
									<Incentive incentive={incentive as any} />
								))}
								<div className={styles.divider} />
							</div>
							<div className={styles.link}>
								<Button
									actionText="Check out more incentives!"
									link="/ASM2023/incentives"
									colorScheme="secondary inverted"
								/>
							</div>
						</>
					)}
				</section>
				<div className={styles.donate}>
					<Button
						actionText="Donate"
						link="https://donate.tiltify.com/@ausspeedruns/australian-speedrun-marathon-2023"
						openInNewTab
						iconRight={faChevronRight}
					/>
				</div>
			</main>
		</div>
	);
};

export default DonatePage;
