import { createLorem } from "../lorem.ts";
import { headingNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import { buildPlaceholder } from "./placeholder.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

export function buildKitchenSinkFormSections({ formId }: KitchenSinkSectionContext): KitchenSinkLayoutBlock[] {
	if (!formId) return [buildPlaceholder("Form Block", "forms", "formBlock")];

	const lorem = createLorem(2301);

	return [
		{
			blockName: "Form Block: With Intro Content",
			demo: "The seeded form, which uses every field type (message, text, email, number, country, state, select, textarea and checkbox), with intro content above it.",
			blockType: "formBlock",
			form: formId,
			enableIntro: true,
			introContent: richText(headingNode(lorem.title(3), "h3"), paragraphNode([textNode(lorem.paragraph(2))])),
		},
		{
			blockName: "Form Block: No Intro",
			demo: "The same form with intro content turned off.",
			blockType: "formBlock",
			form: formId,
			enableIntro: false,
		},
	];
}
