import { cn } from "#/utilities/ui";
import RichText from "#/components/RichText";

import type { ContentBlock as ContentBlockProps } from "#/payload-types";

import styles from "./content.module.css";
import { CMSLink } from "../../components/Link";

const colsSpanClasses = {
	full: styles.lgColSpan12,
	half: styles.lgColSpan6,
	oneThird: styles.lgColSpan4,
	twoThirds: styles.lgColSpan8,
};

const contentStyle = {
	blue: styles.blue,
	orange: styles.orange,
};

function contentStyleExists(style: string | undefined | null): style is keyof typeof contentStyle {
	if (!style) return false;

	return Object.hasOwnProperty.call(contentStyle, style);
}

export function ContentBlock(props: ContentBlockProps) {
	const { columns, style } = props;

	return (
		<div className={cn(styles.wrapper, contentStyleExists(style) ? contentStyle[style] : "container")}>
			<div className={cn(styles.grid, style ? "container" : undefined)}>
				{columns &&
					columns.length > 0 &&
					columns.map((col, index) => {
						const { enableLink, link, richText, size } = col;

						return (
							<div
								className={cn(styles.colSpan4, colsSpanClasses[size!], {
									[styles.mdColSpan2]: size !== "full",
								})}
								key={index}
							>
								{richText && <RichText data={richText} enableGutter={false} />}

								{enableLink && <CMSLink {...link} />}
							</div>
						);
					})}
			</div>
		</div>
	);
}
