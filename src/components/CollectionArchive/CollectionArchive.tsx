import { cn } from "#/utilities/ui";

import { Card, type CardPostData } from "#/components/Card/Card";
import styles from "./CollectionArchive.module.css";

export type Props = {
	posts: CardPostData[];
};

export function CollectionArchive(props: Props) {
	const { posts } = props;

	return (
		<div className={cn(styles.container)}>
			<div>
				<div className={styles.grid}>
					{posts?.map((result, index) => {
						if (typeof result === "object" && result !== null) {
							return (
								<div className={styles.gridItem} key={index}>
									<Card className={styles.card} doc={result} relationTo="posts" showCategories />
								</div>
							);
						}

						return null;
					})}
				</div>
			</div>
		</div>
	);
}
