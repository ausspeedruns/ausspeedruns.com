"use client";

// Replaces the root layout when it fails, so it can't rely on the site's providers or global styles
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
	return (
		<html lang="en">
			<body
				style={{
					margin: 0,
					minHeight: "100vh",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: "1rem",
					padding: "1rem",
					fontFamily: "system-ui, sans-serif",
					textAlign: "center",
					colorScheme: "light dark",
				}}
			>
				<title>Something went wrong | AusSpeedruns</title>
				<h1 style={{ margin: 0 }}>Something went wrong</h1>
				<p style={{ margin: 0 }}>
					AusSpeedruns hit an unexpected error. Please try again, and contact us if it keeps happening.
				</p>
				<div style={{ display: "flex", gap: "0.75rem" }}>
					<button onClick={() => retry()} type="button">
						Try again
					</button>
					<a href="/">Go home</a>
				</div>
			</body>
		</html>
	);
}
