import type { WordDefinitionBlock as WordDefinitionBlockProps } from "@/payload-types";

import styles from "./WordDefinition.module.css";
import RichText from "@/components/RichText";

export function WordDefinitionBlock({ word, pronunciation, definition }: WordDefinitionBlockProps) {
	return (
		<div className={styles.container}>
			<h2>{word}</h2>
			<p className={styles.pronounciation}>{pronunciation}</p>
			{definition && <RichText className={styles.content} data={definition} enableGutter={false} />}
		</div>
	);
}
