import type { Page } from "#/payload-types";

import RichText from "#/components/RichText";

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
		<div className="container mt-16">
			<div className="max-w-[48rem]">
				{children || (richText && <RichText data={richText} enableGutter={false} />)}
			</div>
		</div>
	);
}
