import Link from 'next/link';

const responses: JSX.Element[] = [
	<h2 key={0}>Seems like you clipped out of bounds.</h2>,
	<h2 key={1}>Seems you have become QPU mis-aligned.</h2>,
	<h2 key={2}>You are at the same place that the ASM2015 videos are - lost.</h2>,
];

export default function Custom404() {
	return (
		<main style={{ height: '100%', width: '100%' }}>
			<div
				style={{
					display: 'flex',
					flexFlow: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					gap: '1rem',
				}}
			>
				<h1>Error 404 - Page not found</h1>
				{responses[~~(Math.random() * responses.length)]}
				<Link href="/">
					<a>Go back home</a>
				</Link>
			</div>
		</main>
	);
}
