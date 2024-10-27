import Link from 'next/link';

export default function Custom404() {
	const responses = [
		<h2>Seems like you clipped out of bounds.</h2>,
		<h2>Seems you have become QPU mis-aligned.</h2>,
		<h2>You are at the same place that the ASM2015 videos are - lost.</h2>,
	];

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
					Go back home
				</Link>
			</div>
		</main>
    );
}
