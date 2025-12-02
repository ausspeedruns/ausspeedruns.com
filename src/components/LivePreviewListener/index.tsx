"use client";
import { getClientSideURL } from "@/utilities/getURL";
import { RefreshRouteOnSave as PayloadLivePreview } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";

export function LivePreviewListener() {
	const router = useRouter();
	return <PayloadLivePreview refresh={router.refresh} serverURL={getClientSideURL()} />;
}
