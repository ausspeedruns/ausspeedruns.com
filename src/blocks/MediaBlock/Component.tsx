import type { StaticImageData } from "next/image";

import { cn } from "#/utilities/ui";
import RichText from "#/components/RichText";

import type { MediaBlock as MediaBlockProps } from "#/payload-types";

import { Media } from "../../components/Media";
import styles from "./Component.module.css";

type Props = MediaBlockProps & {
	breakout?: boolean;
	captionClassName?: string;
	className?: string;
	enableGutter?: boolean;
	imgClassName?: string;
	staticImage?: StaticImageData;
	disableInnerContainer?: boolean;
};

export function MediaBlock(props: Props) {
	const {
		captionClassName,
		className,
		enableGutter = true,
		imgClassName,
		media,
		staticImage,
		disableInnerContainer,
	} = props;

	let caption;
	if (media && typeof media === "object") caption = media.caption;

	return (
		<div
			className={cn(
				"",
				{
					container: enableGutter,
				},
				className,
			)}
		>
			{(media || staticImage) && (
				<Media imgClassName={cn(styles.image, imgClassName)} resource={media} src={staticImage} />
			)}
			{caption && (
				<div
					className={cn(
						styles.caption,
						{
							container: !disableInnerContainer,
						},
						captionClassName,
					)}
				>
					<RichText data={caption} enableGutter={false} />
				</div>
			)}
		</div>
	);
}
