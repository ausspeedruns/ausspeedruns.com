import Link from 'next/link';
import React, { useState } from 'react';
import { useAuth } from '../components/auth';

import Button from '../components/Button/Button';
import Navbar from '../components/Navbar/Navbar';

export const SignInPage: React.FC = () => {
	const auth = useAuth();
	const [email, setEmail] = useState('ewan.lyon@ausspeedruns.com');
	const [password, setPassword] = useState('password');
	const [error, setError] = useState('');

	// const router = useRouter();

	const signIn = async () => {
		if (!auth.ready) {
			setError('Auth is not ready, try again in a moment.');
			return;
		}
		if (!email.length || !password.length) {
			setError('Please enter a username and password.');
			return;
		}
		setError('');
		const result = await auth.signIn({ email, password });
		if (result.success) {
			// FIXME: there's a cache issue with Urql where it's not reloading the
			// current user properly if we do a client-side redirect here.
			// router.push('/');
			top.location.href = '/';
			result.success
		} else if (result.success === false) {	// This is silly ofc but TypeScript wasn't detecting that it was false
			setEmail('');
			setPassword('');
			setError(result.message);
		}
	};

	return (
		<div className="App">
			<Navbar />
			<h1>Sign In</h1>
			<h2>{error}</h2>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					signIn();
				}}
			>
				<div style={{margin: '4px 0'}}>
					<div style={{display: 'inline-block', width: '9rem'}}>Email address</div>
					<input
						type="text"
						value={email}
						onChange={(event) => {
							setEmail(event.target.value);
						}}
					/>
				</div>
				<div style={{margin: '4px 0'}}>
					<div style={{display: 'inline-block', width: '9rem'}}>Password</div>
					<input
						type="password"
						value={password}
						onChange={(event) => {
							setPassword(event.target.value);
						}}
					/>
				</div>
				<button type="submit">Sign In</button>
			</form>
			<hr className="my-4" />
			<div>
				<Link href="/signup">Want to join instead?</Link>
			</div>
		</div>
	);
};

export default SignInPage;
