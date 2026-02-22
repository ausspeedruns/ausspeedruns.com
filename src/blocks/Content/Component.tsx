import { cn } from "#/utilities/ui";
import RichText from "#/components/RichText";

import type { ContentBlock as ContentBlockProps } from "#/payload-types";

import styles from "./content.module.css";
import { CMSLink } from "../../components/Link";

const colsSpanClasses = {
	full: "12",
	half: "6",
	oneThird: "4",
	twoThirds: "8",
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
		<div className={cn("my-16", contentStyleExists(style) ? contentStyle[style] : "container")}>
			<div className={cn("grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16", style ? "container" : undefined)}>
				{columns &&
					columns.length > 0 &&
					columns.map((col, index) => {
						const { enableLink, link, richText, size } = col;

						return (
							<div
								className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
									"md:col-span-2": size !== "full",
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
