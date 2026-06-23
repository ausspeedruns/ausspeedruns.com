import { CODE_FORMAT, headingNode, linkNode, paragraphNode, richText, textNode } from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types";

export function buildKitchenSinkFormSection({ formId }: KitchenSinkSectionContext): KitchenSinkLayoutBlock {
	if (formId) {
		return {
			blockName: "Form Block",
			blockType: "formBlock",
			form: formId,
			enableIntro: true,
			introContent: richText(
				headingNode("Contact Us", "h3"),
				paragraphNode([
					textNode(
						"The Form Block embeds a form created in the Forms collection. It supports an optional intro content area above the form fields.",
					),
				]),
			),
		};
	}

	return {
		blockName: "Form Block (placeholder — no forms found)",
		blockType: "content",
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode("Form Block", "h3"),
					paragraphNode([
						textNode("The "),
						textNode("formBlock", CODE_FORMAT),
						textNode(" requires a Form relationship. Create a Form in the admin dashboard ("),
						linkNode("Forms collection", "/admin/collections/forms"),
						textNode("), then add this block to display it on a page with optional intro content."),
					]),
				),
			},
		],
	};
}