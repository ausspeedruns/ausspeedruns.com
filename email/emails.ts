import nodemailer from 'nodemailer';
import { generateVerification } from './verification';
import { generateForgottenPassword } from './forgot-password';

const transport = nodemailer.createTransport({
	pool: true,
	host: 'smtp.office365.com',
	port: 587,
	// secure: true,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS
	}
});

export async function sendEmailVerification(email: string, verificationCode: string) {
	const html = await generateVerification(verificationCode);
	// Text is meant to not have indenting since then the tabs are in the text too lol
	let message = {
		from: 'noreply@ausspeedruns.com',
		to: email,
		subject: 'AusSpeedruns email verification',
		text: `AusSpeedruns email verification

Link to confirm email: https://ausspeedruns.com/user/verification/${verificationCode}

If you did not sign up for AusSpeedruns then you can ignore this email.
----------
AusSpeedruns
ausspeedruns.com`,
		html: html
	};

	transport.sendMail(message, (err, _info) => {
		if (err) {
			console.log('Error occurred. ' + err.message);
			console.log(`Email verification failed. User: ${email} | Code: ${verificationCode}`);
		}
	});
}

export async function sendForgottenPassword(email: string, resetCode: string) {
	const html = await generateForgottenPassword(email, resetCode);
	// Text is meant to not have indenting since then the tabs are in the text too lol
	let message = {
		from: 'noreply@ausspeedruns.com',
		to: email,
		subject: 'AusSpeedruns forgotten password',
		text: `AusSpeedruns forgotten password

Link to reset password: https://ausspeedruns.com/user/password-reset/${resetCode}?email=${encodeURI(email)}

If you did not sign up for AusSpeedruns then you can ignore this email.
----------
AusSpeedruns
ausspeedruns.com`,
		html: html
	};

	transport.sendMail(message, (err, _info) => {
		if (err) {
			console.log('Error occurred. ' + err.message);
			console.log(`Password reset failed. User: ${email} | Code: ${resetCode}`);
		}
	});
}
