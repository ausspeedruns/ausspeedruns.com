import { cn } from "#/utilities/ui";
import RichText from "#/components/RichText/RichText";
import { Media } from "#/components/Media/Media";

import type { ContentBlock as ContentBlockProps } from "#/payload-types";

import styles from "./content.module.css";
import { CMSLink } from "#/components/Link/CMSLink";

const colsSpanClasses = {
	full: styles.lgColSpan12,
	half: styles.lgColSpan6,
	oneThird: styles.lgColSpan4,
	twoThirds: styles.lgColSpan8,
};

// Maps the "background" select value to a CSS module class.
// "custom" is handled separately via inline style.
const bgClasses: Record<string, string | undefined> = {
	card: styles.bgCard,
	muted: styles.bgMuted,
	primary: styles.bgPrimary,
	secondary: styles.bgSecondary,
	blue: styles.bgBlue,
	orange: styles.bgOrange,
};

const textClasses: Record<string, string | undefined> = {
	light: styles.textLight,
	dark: styles.textDark,
};

const paddingClasses: Record<string, string | undefined> = {
	none: styles.paddingNone,
	small: styles.paddingSmall,
	default: undefined, // default padding is on .wrapper already
	large: styles.paddingLarge,
};

const overlayClasses: Record<string, string | undefined> = {
	none: undefined,
	dark25: styles.overlayDark25,
	dark50: styles.overlayDark50,
	dark75: styles.overlayDark75,
	light25: styles.overlayLight25,
	light50: styles.overlayLight50,
};

export function ContentBlock(props: ContentBlockProps) {
	const { columns, settings } = props;

	const bg = settings?.background ?? "none";
	const hasBackground = bg !== "none";
	const isCustomBg = bg === "custom";
	const bgImage = settings?.backgroundImage;
	const hasBgImage = Boolean(bgImage && typeof bgImage === "object");
	const hasVisualBackground = hasBackground || hasBgImage;
	const fullBleed = hasVisualBackground && settings?.fullBleed;

	const wrapperStyle: React.CSSProperties | undefined =
		isCustomBg && settings?.customBackgroundColor ? { backgroundColor: settings.customBackgroundColor } : undefined;

	return (
		<div
			className={cn(
				styles.wrapper,
				hasVisualBackground && !fullBleed && "container",
				hasBackground && bgClasses[bg],
				hasVisualBackground && styles.hasBackground,
				hasBgImage && styles.hasBgImage,
				textClasses[settings?.textColor ?? "auto"],
				paddingClasses[settings?.padding ?? "default"],
			)}
			style={wrapperStyle}
		>
			{hasBgImage && typeof bgImage === "object" && (
				<>
					<Media fill imgClassName={styles.bgImage} resource={bgImage} htmlElement={null} />
					{settings?.backgroundImageOverlay !== "none" && (
						<div
							className={cn(styles.overlay, overlayClasses[settings?.backgroundImageOverlay ?? "dark50"])}
							aria-hidden="true"
						/>
					)}
				</>
			)}
			<div className={cn(styles.grid, fullBleed ? "container" : !hasVisualBackground ? "container" : undefined)}>
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
