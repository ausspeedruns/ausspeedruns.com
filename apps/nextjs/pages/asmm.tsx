import Head from "next/head";
import { gql, useQuery } from "urql";
import {
	Button,
	ThemeProvider,
	TextField,
	InputAdornment,
	FormControl,
	InputLabel,
	OutlinedInput,
} from "@mui/material";
import { Cancel, CheckCircle } from "@mui/icons-material";
import OGImage from "../styles/img/ogImages/ASMM.png";

// import Footer from '../components/Footer/Footer';
import styles from "../styles/SignIn.module.scss";
import { theme } from "../components/mui-theme";
import DiscordEmbed from "../components/DiscordEmbed";
import { useAuth } from "../components/auth";
import { useEffect, useState } from "react";

// Check if user has a ticket to ASM2023
const QUERY_ELIGIBLE = gql`
	query ASMMEligibility($username: String!, $event: String!) {
		user(where: { username: $username }) {
			id
			username
			tickets(where: { event: { shortname: { equals: $event } } }) {
				ticketID
				paid
			}
		}
	}
`;

type QUERY_ELIGIBLE_RESULTS = {
	user?: {
		id: string;
		username: string;
		tickets: {
			ticketID: string;
			paid: boolean;
		}[];
	};
};

type PledgeFormValues = {
	pledge: string;
};

const EVENT = "ASM2023";

export default function ASMM() {
	const auth = useAuth();
	const [pledgeAmount, setPledgeAmount] = useState(-1);
	const [signedUp, setSignedUp] = useState(false);
	const [signedUpResponse, setSignedUpResponse] = useState("");
	const [pledgeResponse, setPledgeResponse] = useState("");
	const [eligibleData] = useQuery<QUERY_ELIGIBLE_RESULTS>({
		query: QUERY_ELIGIBLE,
		variables: { event: EVENT, username: auth.ready ? auth.sessionData?.username : "" },
		pause: !auth.ready,
	});

	const eligible = eligibleData.data?.user?.tickets.some((ticket) => ticket.paid);

	const username = auth.ready ? auth.sessionData?.username : undefined;

	useEffect(() => {
		if (auth.ready) {
			// fetch(`/api/asmm/pledge?username=${username}`).then(res => {
			// 	console.log(res);
			// })

			fetch(`/api/asmm/total`).then((res) => {
				console.log(res);
				res.text().then(console.log);
			});

			fetch(`/api/asmm/sign-up?username=${username}`, { method: "GET" }).then((res) => {
				res.json().then((data) => {
					console.log(data);
					setSignedUp(data.Barcode != "NULL");
				});
			});

			fetch(`/api/asmm/pledge?username=${username}`, { method: "GET" }).then((res) => {
				res.json().then((data) => {
					console.log(data);
					setPledgeAmount(data.pledge);
				});
			});
		}
	}, [auth]);

	const signUp = async () => {
		if (auth.ready && typeof auth.sessionData?.username === "string") {
			const res = await fetch("/api/asmm/sign-up", {
				method: "POST",
				body: JSON.stringify({ username: username, ticketID: eligibleData.data?.user?.tickets[0].ticketID }),
			});
			setSignedUpResponse("Signed up!");
		}
	};

	const makePledge = async () => {
		try {
			const res = await fetch("/api/asmm/pledge", {
				method: "POST",
				body: JSON.stringify({ pledge: pledgeAmount, username: username }),
			});

			if (res.ok) {
				setPledgeResponse("Pledge made!");
			}
		} catch (error) {
			console.error("Failed submitting pledge!", error);
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<Head>
				<title>ASMM - AusSpeedruns</title>
				<DiscordEmbed
					title="Australian Speedruns Marathon Marathon - AusSpeedruns"
					description="Sign up to participate in the Australian Speedruns Marathon Marathon!"
					pageUrl="/asmm"
					imageSrc={OGImage.src}
				/>
			</Head>
			<div className={styles.background} />
			<div className={`${styles.content} ${styles.form}`} style={{ padding: "5rem" }}>
				<h1 style={{ marginBottom: "3rem" }}>Australian Speedruns Marathon Marathon Sign Up</h1>
				<p>
					The Australian Speedruns Marathon Marathon (ASMM) is a walkathon we will be conducting during the
					Australian Speedrun Marathon 2023. At the end of each day we will tally the steps taken by each
					participant. Participants are asked to pledge an amount per 10km walked by the community.
				</p>
				<p>Those not attending ASM2023 can also make a pledge.</p>
				<p>
					We will be conducting scheduled walks in Adelaide during ASM2023 if you want to meet members of the
					community but these are of course completely optional. Details will be posted in the #asmm channel
					on our{" "}
					<a
						className={styles.links}
						href="http://http://discord.ausspeedruns.com/"
						target="_blank"
						rel="noopener noreferrer">
						Discord
					</a>
					.
				</p>

				<p style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
					{eligible ? <CheckCircle /> : <Cancel />} Have a paid ticket to ASM2023
				</p>
				<Button fullWidth variant="contained" disabled={!eligible || signedUp} onClick={signUp}>
					{signedUp ? "Signed Up" : "Sign Up for ASMM"}
				</Button>
				{signedUpResponse && <p style={{ textAlign: "center" }}>{signedUpResponse}</p>}
				<div style={{ height: 1, background: "#437c90", width: "80%", margin: 16 }} />
				<p style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 0 }}>
					{username ? <CheckCircle /> : <Cancel />} Logged in
				</p>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
						<OutlinedInput
							defaultValue={1}
							startAdornment={<InputAdornment position="start">$</InputAdornment>}
							endAdornment={<InputAdornment position="end">per 10km</InputAdornment>}
							type="number"
							value={pledgeAmount}
							onChange={(e) => setPledgeAmount(parseFloat(e.target.value))}
						/>
						<Button
							// fullWidth
							type="submit"
							variant="contained"
							disabled={!auth.ready || !Boolean(auth.sessionData?.username)}
							onClick={makePledge}>
							Make a pledge
						</Button>
						{pledgeResponse && <p style={{ textAlign: "center" }}>{pledgeResponse}</p>}
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
}
