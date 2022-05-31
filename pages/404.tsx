import Link from 'next/link';

const responses = [
	'Seems like you clipped out of bounds.',
	'Sorry! The princess is in another castle.'
]

export default function Custom404() {
	return (
		<main style={{ height: '100%', width: '100%' }}>
			<div
				style={{ display: 'flex', flexFlow: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
			>
				<h1>Error 404 - Page not found</h1>
				<h2>{responses[~~(Math.random() * responses.length)]}</h2>
				<Link href="/">
					<a>Go back home</a>
				</Link>
			</div>
		</main>
	);
}
