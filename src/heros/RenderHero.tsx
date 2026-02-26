import type { Page } from "#/payload-types";

import { HighImpactHero } from "#/heros/HighImpact/HighImpactHero";
import { LowImpactHero } from "#/heros/LowImpact/LowImpactHero";
import { MediumImpactHero } from "#/heros/MediumImpact/MediumImpactHero";

const heroes = {
	highImpact: HighImpactHero,
	lowImpact: LowImpactHero,
	mediumImpact: MediumImpactHero,
};

export function RenderHero(props: Page["hero"]) {
	const { type } = props || {};

	if (!type || type === "none") return null;

	const HeroToRender = heroes[type];

	if (!HeroToRender) return null;

	return <HeroToRender {...props} />;
}
