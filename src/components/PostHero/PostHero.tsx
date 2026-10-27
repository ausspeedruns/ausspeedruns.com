import Image from "next/image";
import type { Post } from "#/payload-types";
import { getMediaUrl } from "#/utilities/getMediaUrl";

import styles from "./PostHero.module.css";

export function PostHero({ post }: { post: Post }) {
	const image = typeof post.heroImage === "object" ? post.heroImage : null;

	return (
		<header className={styles.hero}>
			<div className={styles.content}>
				<p className={styles.kicker}>News</p>
				<h1 className={styles.title}>{post.title}</h1>
			</div>
			{image?.url && (
				<div className={styles.imageWrapper}>
					<Image
						alt={image.alt || post.title}
						className={styles.image}
						fill
						priority
						sizes="(max-width: 768px) 100vw, 50vw"
						src={getMediaUrl(image.url)}
					/>
				</div>
			)}
		</header>
	);
}
