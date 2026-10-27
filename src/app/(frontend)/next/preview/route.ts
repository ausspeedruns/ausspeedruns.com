import type { CollectionSlug, PayloadRequest } from "payload";
import { createLocalReq, getPayload } from "payload";

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

import configPromise from "#payload-config";
import { isContentManager } from "#access/helpers.ts";
import { toSafeRelativePath } from "#utilities/safeRedirect.ts";

export async function GET(req: NextRequest): Promise<Response> {
	const payload = await getPayload({ config: configPromise });

	const { searchParams } = new URL(req.url);

	const path = searchParams.get("path");
	const collection = searchParams.get("collection") as CollectionSlug;
	const slug = searchParams.get("slug");
	const previewSecret = searchParams.get("previewSecret");

	if (previewSecret !== process.env.PREVIEW_SECRET) {
		return new Response("You are not allowed to preview this page", { status: 403 });
	}

	if (!path || !collection || !slug) {
		return new Response("Insufficient search params", { status: 404 });
	}

	const safePath = toSafeRelativePath(path);
	if (!safePath) {
		return new Response("This endpoint can only be used for relative previews", { status: 400 });
	}

	let user: PayloadRequest["user"] = null;

	try {
		({ user } = await payload.auth({
			req: req as unknown as PayloadRequest,
			headers: req.headers,
		}));
	} catch (error) {
		payload.logger.error({ err: error }, "Error verifying token for live preview");
		return new Response("You are not allowed to preview this page", { status: 403 });
	}

	const draft = await draftMode();

	// Draft mode exposes unpublished pages and posts, so only content managers may enable it
	const canPreview = user ? await isContentManager(await createLocalReq({ user }, payload)) : false;
	if (!canPreview) {
		draft.disable();
		return new Response("You are not allowed to preview this page", { status: 403 });
	}

	draft.enable();

	redirect(safePath);
}
