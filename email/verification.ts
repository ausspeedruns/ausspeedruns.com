import mjml2html from 'mjml';

export function generateVerification(code: string) {
	const { html } = mjml2html(`
		<mjml>
			<mj-head>
				<mj-title>AusSpeedruns email validation</mj-title>
				<mj-preview>AusSpeedruns account verification code</mj-preview>
				<mj-style>
				  .shadow {
					box-shadow: 0 4px 4px rgb(0 0 0 / 10%);
				  }
				</mj-style>
			</mj-head>
			<mj-body background-color="#F9F9F9">
				<mj-section background-color="#FFFFFF" css-class="shadow">
					<mj-column>
						<mj-image alt="AusSpeedruns Logo" padding="0" src="https://ausspeedruns.com/EmailHeader.png" />
					</mj-column>
				</mj-section>
				<mj-section padding="16px" background-color="#FFFFFF" css-class="shadow">
					<mj-column>
						<mj-text font-weight="bold" font-size="20px">AusSpeedruns email verification</mj-text>
						<mj-text><a style="color: inherit;" href="https://ausspeedruns.com/user/verification/${code}">Verify email</a></mj-text>
						<mj-text>If you did not sign up for AusSpeedruns then you can ignore this email.</mj-text>
						<mj-text>
							<a style="color: inherit;" href="https://ausspeedruns.com/">ausspeedruns.com</a>
						</mj-text>
					</mj-column>
				</mj-section>
			</mj-body>
		</mjml>
	`);
	return html;
}
