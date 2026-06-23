import type { BannerBlock as BannerBlockProps } from "#/payload-types";

import { cn } from "#/utilities/ui";
import RichText from "#/components/RichText/RichText";
import styles from "./BannerBlock.module.css";

type Props = {
	className?: string;
} & BannerBlockProps;

export function BannerBlock({ className, content, style }: Props) {
	return (
		<div className={cn(styles.wrapper, className)}>
			<div
				className={cn(styles.banner, {
					[styles.info]: style === "info",
					[styles.error]: style === "error",
					[styles.success]: style === "success",
					[styles.warning]: style === "warning",
				})}
			>
				<RichText data={content} enableGutter={false} enableProse={false} />
			</div>
		</div>
	);
}
