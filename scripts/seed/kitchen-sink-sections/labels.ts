import {
	BOLD,
	CODE_FORMAT,
	ITALIC,
	headingNode,
	listNode,
	paragraphNode,
	richText,
	textNode,
} from "../richTextHelpers.ts";
import type { KitchenSinkLayoutBlock, KitchenSinkSectionContext } from "./types.ts";

/**
 * The page is made of groups, one per block type (Content is split into several).
 * Each group gets a header describing the block, and every example inside it
 * gets a label explaining which settings it demonstrates. Only the examples'
 * own content is lorem ipsum.
 */
export type KitchenSinkGroup = {
	name: string;
	blockType: string;
	description: string;
	build: (context: KitchenSinkSectionContext) => KitchenSinkLayoutBlock[];
};

/** Builders attach these to each example; they're stripped before the block is saved. */
type ExampleMeta = { demo?: string; demoNoLabel?: boolean };

export type BuiltGroup = { group: KitchenSinkGroup; examples: KitchenSinkLayoutBlock[] };

/** "Content: Card Background" → "Card Background". */
const exampleTitle = (block: KitchenSinkLayoutBlock) => {
	const name: string = block.blockName ?? block.blockType;
	const separator = name.indexOf(": ");
	return separator === -1 ? name : name.slice(separator + 2);
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function buildPageIntro(groups: BuiltGroup[]): KitchenSinkLayoutBlock {
	const exampleCount = groups.reduce((total, { examples }) => total + examples.length, 0);

	return {
		blockName: "Kitchen Sink: Introduction",
		blockType: "content",
		settings: { background: "primary", textColor: "auto", padding: "large", fullBleed: true },
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode("Kitchen Sink", "h1"),
					paragraphNode([
						textNode(
							`Every page builder block, in as many configurations as possible: ${plural(exampleCount, "example")} across ${plural(groups.length, "section")}. Each section starts with a header naming the block, and each example is labelled with the settings it demonstrates. The example content itself is `,
						),
						textNode("lorem ipsum", ITALIC),
						textNode("."),
					]),
					headingNode("Sections", "h3"),
					listNode(
						"number",
						groups.map(({ group, examples }) => [
							textNode(group.name, BOLD),
							textNode(` (${plural(examples.length, "example")})`),
						]),
					),
				),
			},
		],
	};
}

export function buildSectionHeader({ group, examples }: BuiltGroup, groupNumber: number): KitchenSinkLayoutBlock {
	return {
		blockName: `Section ${groupNumber}: ${group.name}`,
		blockType: "content",
		settings: { background: "card", textColor: "auto", padding: "default", fullBleed: true },
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode(`${groupNumber}. ${group.name}`, "h2"),
					paragraphNode([textNode(group.description)]),
					paragraphNode([
						textNode("Block type: "),
						textNode(group.blockType, CODE_FORMAT),
						textNode(` · ${plural(examples.length, "example")}:`),
					]),
					listNode(
						"number",
						examples.map((example) => exampleTitle(example)),
					),
				),
			},
		],
	};
}

export function buildExampleLabel(
	example: KitchenSinkLayoutBlock,
	groupNumber: number,
	exampleNumber: number,
): KitchenSinkLayoutBlock | undefined {
	const { demo, demoNoLabel } = example as ExampleMeta;
	if (demoNoLabel) return undefined;

	return {
		blockName: `Label ${groupNumber}.${exampleNumber}: ${exampleTitle(example)}`,
		blockType: "content",
		settings: { background: "none", textColor: "auto", padding: "small", fullBleed: false },
		columns: [
			{
				size: "full",
				richText: richText(
					headingNode(`${groupNumber}.${exampleNumber} ${exampleTitle(example)}`, "h4"),
					...(demo ? [paragraphNode([textNode(demo, ITALIC)])] : []),
				),
			},
		],
	};
}

export function stripExampleMeta(example: KitchenSinkLayoutBlock): KitchenSinkLayoutBlock {
	const { demo: _demo, demoNoLabel: _demoNoLabel, ...block } = example;
	return block;
}
