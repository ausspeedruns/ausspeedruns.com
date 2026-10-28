import type { Metadata } from "next";
import { getServerSideURL } from "./getURL";

const defaultOpenGraph: Metadata["openGraph"] = {
	type: "website",
	description: "Home of the AusSpeedruns events.",
	images: [
		{
			url: `${getServerSideURL()}/AusSpeedrunsOG.png`,
		},
	],
	siteName: "AusSpeedruns",
	title: "AusSpeedruns",
};

export const mergeOpenGraph = (og?: Metadata["openGraph"]): Metadata["openGraph"] => {
	return {
		...defaultOpenGraph,
		...og,
		images: og?.images ? og.images : defaultOpenGraph.images,
	};
};
