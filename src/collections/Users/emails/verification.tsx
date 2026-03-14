import { Body, Container, Head, Html, Img, Link, Preview, Section, Text } from "@react-email/components";

const styles = {
	body: {
		backgroundColor: "#EEF1F4",
		margin: 0,
		padding: "24px 12px",
		fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
	},
	container: {
		width: "100%",
		maxWidth: "600px",
		margin: "0 auto",
	},
	card: {
		backgroundColor: "#FFFFFF",
		border: "1px solid #D8DFE6",
		overflow: "hidden",
	},
	content: {
		padding: "24px",
	},
	eyebrow: {
		margin: "0 0 8px",
		fontSize: "12px",
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		color: "#5A6978",
	},
	heading: {
		fontSize: "24px",
		fontWeight: "700",
		lineHeight: "30px",
		margin: "0 0 14px",
		color: "#132235",
	},
	text: {
		margin: "0 0 14px",
		color: "#243447",
		fontSize: "16px",
		lineHeight: "24px",
	},
	buttonWrap: {
		margin: "18px 0 16px",
	},
	button: {
		display: "inline-block",
		padding: "11px 18px",
		backgroundColor: "#1B2C3F",
		color: "#FFFFFF",
		fontSize: "15px",
		fontWeight: "600",
		lineHeight: "20px",
		textDecoration: "none",
	},
	muted: {
		margin: "0 0 12px",
		color: "#5A6978",
		fontSize: "14px",
		lineHeight: "22px",
	},
	footer: {
		margin: "14px 0 0",
		paddingTop: "12px",
		borderTop: "1px solid #E6EBF1",
	},
	link: {
		color: "#243447",
		textDecoration: "underline",
	},
} as const;

interface VerificationEmailProps {
	token: string;
}

export function VerificationEmail({ token: code }: VerificationEmailProps) {
	const verifyUrl = `https://ausspeedruns.com/user/verification/${code}`;

	return (
		<Html>
			<Head />
			<Preview>AusSpeedruns account verification code</Preview>
			<Body style={styles.body}>
				<Container style={styles.container}>
					<Section style={styles.card}>
						<Img
							alt="AusSpeedruns Logo"
							src="https://ausspeedruns.com/EmailHeader.png"
							width="600"
							style={{ display: "block", width: "100%", height: "auto" }}
						/>
					</Section>
					<Section style={{ ...styles.card, ...styles.content }}>
						<Text style={styles.eyebrow}>Account Setup</Text>
						<Text style={styles.heading}>AusSpeedruns email verification</Text>
						<Text style={styles.text}>Confirm your email address to finish setting up your account.</Text>
						<Section style={styles.buttonWrap}>
							<Link href={verifyUrl} style={styles.button}>
								Verify email
							</Link>
						</Section>
						<Text style={styles.text}>
							If you did not sign up for AusSpeedruns, you can safely ignore this email.
						</Text>
						<Section style={styles.footer}>
							<Text style={styles.muted}>
								If the button does not work, use this link:{" "}
								<Link href={verifyUrl} style={styles.link}>
									{verifyUrl}
								</Link>
							</Text>
							<Text style={styles.muted}>
								<Link href="https://ausspeedruns.com/" style={styles.link}>
									ausspeedruns.com
								</Link>
							</Text>
						</Section>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}
