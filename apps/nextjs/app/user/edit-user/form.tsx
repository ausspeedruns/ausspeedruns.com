"use client";

import styles from "../../../styles/User.EditUser.module.scss";

import { useState } from "react";
import { Button, Link, MenuItem, Select, Snackbar, TextField } from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { enAU } from "date-fns/locale";
import { sub } from "date-fns";
import { resendVerificationEmail, updateProfile } from "./edit-user-action";

const DiscordRegex = /^(.{3,32}#[0-9]{4}|[a-z0-9._]{2,32})?$/;
const TwitterRegex = /^@(\w){1,15}$/;
const TwitchRegex = /^[a-zA-Z0-9][\w]{2,24}$/;

type PrefilledFormData = {
	data: {
		userId: string;
		name: string;
		email: string;
		pronouns: string;
		discord: string;
		twitter: string;
		twitch: string;
		dateOfBirth: string;
		state: string;
		verified: boolean;
		bluesky: string;
	};
};

export function EditUserForm({ data }: PrefilledFormData) {
	const [discordWarning, setDiscordWarning] = useState(false);
	const [twitterWarning, setTwitterWarning] = useState(false);
	const [twitchWarning, setTwitchWarning] = useState(false);

	// User inputs
	const [name, setName] = useState(data.name);
	const [email, setEmail] = useState(data.email);
	const [state, setState] = useState(data.state);
	const [pronouns, setPronouns] = useState(data.pronouns);
	const [discord, setDiscord] = useState(data.discord);
	const [twitter, setTwitter] = useState(data.twitter);
	const [twitch, setTwitch] = useState(data.twitch);
	const [bluesky, setBluesky] = useState(data.bluesky);
	const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
		data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
	);

	const maxDate = sub(new Date(), { years: 13 });

	const disableSave =
		!Boolean(email) ||
		(twitter !== "" && !TwitterRegex.test(twitter)) ||
		(discord !== "" && !DiscordRegex.test(discord.toLowerCase()));

	return (
		<form action={updateProfile} style={{display: "flex", flexDirection: "column"}}>
			<div className={styles.profileInformation}>
				{!data.verified && (
					<>
						<div>Email not verified!</div>
						<Button variant="contained" onClick={() => resendVerificationEmail(data.userId)}>
							Send verification
						</Button>
					</>
				)}
				<h3>Personal Information</h3>
				<div />
				<div>Name</div>
				<TextField
					value={name}
					onChange={(e) => setName(e.target.value)}
					variant={"outlined"}
					autoComplete="name"
					slotProps={{ htmlInput: { maxLength: 100 } }}
					name="name"
				/>
				<div>Email{data.verified ? " ✓" : ""}</div>
				<TextField
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					variant={"outlined"}
					autoComplete="email"
					name="email"
				/>
				<div>Pronouns</div>
				<TextField
					value={pronouns}
					onChange={(e) => setPronouns(e.target.value)}
					variant={"outlined"}
					autoComplete="pronouns"
					slotProps={{ htmlInput: { maxLength: 100 } }}
					name="pronouns"
				/>
				<div>Date of birth</div>
				<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enAU}>
					<DatePicker
						value={new Date(dateOfBirth || Date.now())}
						onChange={(newValue) => {
							if (newValue) setDateOfBirth(newValue);
						}}
						openTo={"year"}
						maxDate={maxDate}
						views={["year", "month", "day"]}
						name="dateOfBirth"
					/>
				</LocalizationProvider>
				<div>State</div>
				<Select value={state ?? "none"} onChange={(e) => setState(e.target.value)} name="state">
					<MenuItem value="none">
						<i>No state</i>
					</MenuItem>
					<MenuItem value="vic">Victoria</MenuItem>
					<MenuItem value="nsw">New South Wales</MenuItem>
					<MenuItem value="qld">Queensland</MenuItem>
					<MenuItem value="sa">South Australia</MenuItem>
					<MenuItem value="nt">Northern Territory</MenuItem>
					<MenuItem value="act">ACT</MenuItem>
					<MenuItem value="tas">Tasmania</MenuItem>
					<MenuItem value="wa">Western Australia</MenuItem>
					<MenuItem value="outer">Outside of Australia</MenuItem>
				</Select>
				<Link href="/reset-password">Reset password</Link>
				<div />
				<h3>Socials</h3>
				<div />
				<div>Discord</div>
				<TextField
					error={discordWarning}
					helperText="e.g. ausspeedruns"
					label={discordWarning ? "Error" : undefined}
					value={discord}
					variant={"outlined"}
					onChange={(e) => setDiscord(e.target.value)}
					onBlur={(e) =>
						setDiscordWarning(!DiscordRegex.test(e.target.value.toLowerCase()) && e.target.value !== "")
					}
					autoComplete="discord"
					name="discord"
				/>
				<div>Twitter</div>
				<TextField
					error={twitterWarning}
					helperText="e.g. @AusSpeedruns"
					label={twitterWarning ? "Error" : undefined}
					value={twitter}
					variant={"outlined"}
					onChange={(e) => setTwitter(e.target.value)}
					onBlur={(e) => setTwitterWarning(!TwitterRegex.test(e.target.value) && e.target.value !== "")}
					autoComplete="twitter"
					name="twitter"
				/>
				<div>Bluesky</div>
				<TextField
					value={bluesky}
					variant={"outlined"}
					onChange={(e) => setBluesky(e.target.value)}
					helperText="e.g. AusSpeedruns.bsky.app or AusSpeedruns.com"
					autoComplete="bluesky"
					name="bluesky"
				/>
				<div>Twitch</div>
				<TextField
					error={twitchWarning}
					label={twitchWarning ? "Error" : undefined}
					value={twitch}
					variant={"outlined"}
					onChange={(e) => setTwitch(e.target.value)}
					onBlur={(e) => setTwitchWarning(!TwitchRegex.test(e.target.value) && e.target.value !== "")}
					helperText="e.g. AusSpeedruns"
					autoComplete="twitch"
					name="twitch"
				/>
			</div>
			<Button variant="contained" disabled={disableSave} type="submit" style={{ flexGrow: 1 }}>
				Save
			</Button>
			{/* <Snackbar
				open={sendVerificationSnack}
				autoHideDuration={10000}
				onClose={() => setSendVerificationSnack(false)}>
				{sendVerificationSnackError ? (
					<Alert onClose={() => setSendVerificationSnack(false)} variant="filled" severity="error">
						Must wait 15 mins before sending another verification.
					</Alert>
				) : (
					<Alert onClose={() => setSendVerificationSnack(false)} variant="filled" severity="success">
						Verification email sent!
					</Alert>
				)}
			</Snackbar> */}
		</form>
	);
}
