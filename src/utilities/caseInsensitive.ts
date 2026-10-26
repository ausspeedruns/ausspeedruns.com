import type { CollectionSlug, Payload, PayloadRequest, Where } from "payload";

export interface CaseInsensitiveLookup {
	payload: Payload;
	collection: CollectionSlug;
	/** Top-level text field to match on, e.g. `slug`, `shortName` or `username`. */
	field: string;
	value: string;
	where?: Where;
	draft?: boolean;
	overrideAccess?: boolean;
	req?: PayloadRequest;
	limit?: number;
}

export interface CaseInsensitiveMatch {
	id: number | string;
	value: string;
}

/** Docs whose `field` equals `value` ignoring case, exact-case match first, then oldest first. */
export async function findCaseInsensitiveMatches({
	payload,
	collection,
	field,
	value,
	where,
	draft,
	overrideAccess,
	req,
	limit = 50,
}: CaseInsensitiveLookup): Promise<CaseInsensitiveMatch[]> {
	if (!value) return [];

	// On Postgres `like` is an ILIKE substring match, so narrow it down to exact case-insensitive matches below
	const likeWhere: Where = { [field]: { like: value } };
	const result = await payload.find({
		collection,
		where: where ? { and: [likeWhere, where] } : likeWhere,
		select: { [field]: true } as never,
		sort: "createdAt",
		depth: 0,
		limit,
		draft,
		overrideAccess,
		req,
	});

	const lowerValue = value.toLowerCase();
	const docs = result.docs as unknown as Array<Record<string, unknown> & { id: number | string }>;
	return docs
		.map((doc) => ({ id: doc.id, value: doc[field] }))
		.filter((doc): doc is CaseInsensitiveMatch => typeof doc.value === "string" && doc.value.toLowerCase() === lowerValue)
		.sort((a, b) => Number(b.value === value) - Number(a.value === value));
}

/** The stored casing of `value` (e.g. "ASM2026" for "asm2026"), or null if nothing matches. */
export async function findCanonicalCase(lookup: CaseInsensitiveLookup): Promise<string | null> {
	const [match] = await findCaseInsensitiveMatches({ ...lookup, limit: lookup.limit ?? 10 });
	return match?.value ?? null;
}
