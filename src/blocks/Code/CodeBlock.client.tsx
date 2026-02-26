"use client";
import { Highlight, themes } from "prism-react-renderer";
import { CopyButton } from "./CopyButton";

import styles from "./CodeBlock.module.css";

type Props = {
	code: string;
	language?: string;
};

export function Code({ code, language = "" }: Props) {
	if (!code) return null;

	return (
		<Highlight code={code} language={language} theme={themes.vsDark}>
			{({ getLineProps, getTokenProps, tokens }) => (
				<pre className={styles.pre}>
					{tokens.map((line, i) => (
						<div key={i} {...getLineProps({ className: styles.row, line })}>
							<span className={styles.lineNumber}>{i + 1}</span>
							<span className={styles.lineContent}>
								{line.map((token, key) => (
									<span key={key} {...getTokenProps({ token })} />
								))}
							</span>
						</div>
					))}
					<CopyButton code={code} />
				</pre>
			)}
		</Highlight>
	);
}
