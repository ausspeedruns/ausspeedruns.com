import type { BasePayload } from "payload";

export const DEFAULT_SEGMENT_TYPES = [
	{ name: "Speech / Talk", slug: "speech", description: "Speeches, talks and announcements." },
	{ name: "News", slug: "news", description: "Satirical news segments." },
	{ name: "Opening Ceremony", slug: "opening", description: "Event opening." },
	{ name: "Closing Ceremony", slug: "closing", description: "Event closing." },
	{ name: "Charity", slug: "charity", description: "Charity spotlight segments." },
	{ name: "Segment", slug: "segment", description: "Anything else." },
] as const;

/** Creates any of the default segment types that don't exist yet. */
export async function seedSegmentTypes(payload: BasePayload) {
	const existing = await payload.find({
		collection: "segment-types",
		depth: 0,
		pagination: false,
		select: { slug: true },
	});
	const slugs = new Set(existing.docs.map((type) => type.slug));

	for (const type of DEFAULT_SEGMENT_TYPES) {
		if (slugs.has(type.slug)) continue;
		await payload.create({ collection: "segment-types", depth: 0, data: { ...type } });
	}
}
