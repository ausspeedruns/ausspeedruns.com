import type { CallToActionBlock as CTABlockProps } from "#/payload-types";

import RichText from "#/components/RichText";
import { CMSLink } from "#/components/Link";

import styles from "./Component.module.css";

export function CallToActionBlock({ links, richText }: CTABlockProps) {
	return (
		<div className={styles.container}>
			<div className={styles.card}>
				<div className={styles.content}>
					{richText && <RichText className={styles.richText} data={richText} enableGutter={false} />}
				</div>
				<div className={styles.links}>
					{(links || []).map(({ link }, i) => {
						return <CMSLink key={i} size="lg" {...link} />;
					})}
				</div>
			</div>
		</div>
	);
}
