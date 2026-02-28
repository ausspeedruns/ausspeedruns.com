import React from "react";
import type { FAQBlock as FAQBlockProps } from "#/payload-types";
import RichText from "#/components/RichText/RichText";
import styles from "./FAQBlock.module.css";

export function FAQBlock(props: FAQBlockProps) {
	const { title, faqs } = props;

	return (
		<div className={styles.container}>
			{title && <h2 className={styles.title}>{title}</h2>}
			<div className={styles.list}>
				{faqs?.map((faq: any, i: number) => (
					<details key={faq.id || i} className={styles.item}>
						<summary className={styles.summary}>{faq.question}</summary>
						<div className={styles.answer}>
							<RichText data={faq.answer} enableGutter={false} />
						</div>
					</details>
				))}
			</div>
		</div>
	);
}
