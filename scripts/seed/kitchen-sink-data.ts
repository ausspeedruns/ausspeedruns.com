import type { BasePayload, RequiredDataFromCollectionSlug } from "payload";

import { createLorem, LOREM_OPENING } from "./lorem.ts";
import {
	BOLD,
	CODE_FORMAT,
	ITALIC,
	bannerBlockNode,
	codeBlockNode,
	headingNode,
	horizontalRuleNode,
	linkNode,
	listNode,
	mediaBlockNode,
	paragraphNode,
	quoteNode,
	richText,
	textNode,
} from "./richTextHelpers.ts";

// Runs outside Next.js, where revalidatePath/revalidateTag would throw
const context = { disableRevalidate: true };

const slugify = (text: string) =>
	text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

/**
 * The Keystone migration doesn't create posts, categories or forms, so the
 * Archive and Form blocks on the kitchen sink would have nothing to show.
 * Each helper only creates data when the collection is empty.
 */
export async function seedKitchenSinkData(payload: BasePayload) {
	const categoryIds = await ensureCategories(payload);
	await ensurePosts(payload, categoryIds);
	await ensureForm(payload);
}

async function ensureCategories(payload: BasePayload) {
	const existing = await payload.find({ collection: "categories", depth: 0, limit: 10 });
	if (existing.docs.length > 0) return existing.docs.map((doc) => doc.id);

	const lorem = createLorem(9001);
	const ids: number[] = [];
	for (let i = 0; i < 3; i++) {
		const title = lorem.title(2);
		const category = await payload.create({
			collection: "categories",
			context,
			data: { title, slug: slugify(title) },
		});
		ids.push(category.id);
	}
	return ids;
}

async function ensurePosts(payload: BasePayload, categoryIds: number[]) {
	const existing = await payload.find({ collection: "posts", depth: 0, limit: 1 });
	if (existing.docs.length > 0) return;

	const media = (await payload.find({ collection: "media", depth: 0, limit: 6, sort: "-createdAt" })).docs;
	const img = (index: number) => (media.length > 0 ? media[index % media.length].id : undefined);

	const postIds: number[] = [];
	const POST_COUNT = 7;

	for (let i = 0; i < POST_COUNT; i++) {
		const lorem = createLorem(9100 + i);
		const title = lorem.title(lorem.int(3, 6));
		// Spread posts across categories, leaving the last one uncategorised
		const categories =
			i === POST_COUNT - 1 || categoryIds.length === 0 ? [] : [categoryIds[i % categoryIds.length]];

		const post = await payload.create({
			collection: "posts",
			context,
			draft: false,
			data: {
				title,
				slug: slugify(title),
				_status: "published",
				publishedAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
				// Every third post has no hero image so the card fallback is visible
				heroImage: i % 3 === 2 ? undefined : img(i),
				categories,
				content: richText(...postContent(lorem, img(i + 1), i)),
				meta: {
					title,
					description: lorem.sentence(),
					image: img(i),
				},
			} as RequiredDataFromCollectionSlug<"posts">,
		});
		postIds.push(post.id);
	}

	for (const [index, id] of postIds.entries()) {
		await payload.update({
			collection: "posts",
			id,
			context,
			data: {
				relatedPosts: postIds.filter((otherId) => otherId !== id).slice(index % 3, (index % 3) + 2),
			},
		});
	}
}

const CODE_SAMPLES = {
	typescript: "function loremIpsum(dolor: string): string {\n\treturn `sit amet ${dolor}`;\n}\n",
	javascript: "const lorem = ['ipsum', 'dolor', 'sit'];\nconsole.log(lorem.join(' '));\n",
	css: ".lorem-ipsum {\n\tdisplay: flex;\n\tgap: 1rem;\n}\n",
};

function postContent(lorem: ReturnType<typeof createLorem>, mediaId: number | undefined, index: number): object[] {
	const bannerStyles = ["info", "warning", "error", "success"] as const;
	const languages = ["typescript", "javascript", "css"] as const;

	const nodes: object[] = [
		paragraphNode([textNode(LOREM_OPENING, BOLD), textNode(` ${lorem.paragraph()}`)]),
		headingNode(lorem.title(4), "h2"),
		paragraphNode([
			textNode(lorem.sentence()),
			textNode(` ${lorem.words(3)}`, ITALIC),
			textNode(` ${lorem.sentence()} `),
			linkNode(lorem.words(2), "https://example.com", true),
			textNode(` ${lorem.sentence()}`),
		]),
		bannerBlockNode(bannerStyles[index % bannerStyles.length], [paragraphNode([textNode(lorem.sentence())])]),
		headingNode(lorem.title(3), "h3"),
		listNode(index % 2 === 0 ? "bullet" : "number", lorem.items(4)),
		quoteNode(lorem.sentence(20)),
	];

	if (mediaId) nodes.push(mediaBlockNode(mediaId));

	nodes.push(
		paragraphNode([textNode(lorem.paragraph())]),
		headingNode(lorem.title(3), "h3"),
		paragraphNode([
			textNode(`${lorem.sentence()} `),
			textNode(lorem.words(2), CODE_FORMAT),
			textNode(` ${lorem.sentence()}`),
		]),
		codeBlockNode(languages[index % languages.length], CODE_SAMPLES[languages[index % languages.length]]),
		horizontalRuleNode(),
		headingNode(lorem.title(2), "h4"),
		paragraphNode([textNode(lorem.paragraph(2))]),
	);

	return nodes;
}

async function ensureForm(payload: BasePayload) {
	const existing = await payload.find({ collection: "forms", depth: 0, limit: 1 });
	if (existing.docs.length > 0) return;

	const lorem = createLorem(9200);

	await payload.create({
		collection: "forms",
		context,
		data: {
			title: "Kitchen Sink Form",
			submitButtonLabel: lorem.title(2),
			confirmationType: "message",
			confirmationMessage: richText(
				headingNode(lorem.title(4), "h2"),
				paragraphNode([textNode(lorem.sentence())]),
			),
			fields: [
				{
					blockType: "message",
					message: richText(paragraphNode([textNode(lorem.sentence(), ITALIC)])),
				},
				{ blockType: "text", name: "lorem-text", label: lorem.title(2), width: 50, required: true },
				{ blockType: "email", name: "lorem-email", label: lorem.title(1), width: 50, required: true },
				{ blockType: "number", name: "lorem-number", label: lorem.title(2), width: 33 },
				{ blockType: "country", name: "lorem-country", label: lorem.title(1), width: 33 },
				{ blockType: "state", name: "lorem-state", label: lorem.title(1), width: 33 },
				{
					blockType: "select",
					name: "lorem-select",
					label: lorem.title(2),
					width: 100,
					placeholder: lorem.words(3),
					options: lorem.items(4, 2).map((label) => ({ label, value: slugify(label) })),
				},
				{ blockType: "textarea", name: "lorem-textarea", label: lorem.title(2), width: 100, required: true },
				{
					blockType: "checkbox",
					name: "lorem-checkbox",
					label: lorem.sentence(8),
					width: 100,
					defaultValue: false,
				},
			],
		} as RequiredDataFromCollectionSlug<"forms">,
	});
}
