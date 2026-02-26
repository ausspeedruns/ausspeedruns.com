import type { Page } from "#/payload-types";

import { CMSLink } from "#/components/Link/CMSLink";
import { Media } from "#/components/Media/Media";
import RichText from "#/components/RichText/RichText";

import styles from "./MediumImpactHero.module.css";

export function MediumImpactHero({ links, media, richText }: Page["hero"]) {
	return (
		<div>
			<div className={`container ${styles.heroContent}`}>
				{richText && <RichText className={styles.richText} data={richText} enableGutter={false} />}

				{Array.isArray(links) && links.length > 0 && (
					<ul className={styles.links}>
						{links.map(({ link }, i) => {
							return (
								<li key={i}>
									<CMSLink {...link} />
								</li>
							);
						})}
					</ul>
				)}
			</div>
			<div className="container">
				{media && typeof media === "object" && (
					<div>
						<Media className={styles.media} priority resource={media} />
						{media?.caption && (
							<div className={styles.caption}>
								<RichText data={media.caption} enableGutter={false} />
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
