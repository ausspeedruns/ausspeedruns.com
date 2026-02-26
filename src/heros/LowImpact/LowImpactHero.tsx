import type { Page } from "#/payload-types";

import RichText from "#/components/RichText/RichText";

import styles from "./LowImpactHero.module.css";

type LowImpactHeroType =
	| {
			children?: React.ReactNode;
			richText?: never;
	  }
	| (Omit<Page["hero"], "richText"> & {
			children?: never;
			richText?: Page["hero"]["richText"];
	  });

export function LowImpactHero({ children, richText }: LowImpactHeroType) {
	return (
		<div className={styles.container}>
			<div className={styles.content}>
				{children || (richText && <RichText data={richText} enableGutter={false} />)}
			</div>
		</div>
	);
}
