"use client";

import type { PayloadAdminBarProps } from "@payloadcms/admin-bar";

import { cn } from "#/utilities/ui";
import { useSelectedLayoutSegments } from "next/navigation";
import { PayloadAdminBar } from "@payloadcms/admin-bar";
import { useRouter } from "next/navigation";

import styles from "./AdminBar.module.css";

import { getClientSideURL } from "#/utilities/getURL";
import { useSessionStore } from "#stores/useSessionStore.ts";

const baseClass = "admin-bar";

const collectionLabels = {
	pages: {
		plural: "Pages",
		singular: "Page",
	},
	posts: {
		plural: "Posts",
		singular: "Post",
	},
	projects: {
		plural: "Projects",
		singular: "Project",
	},
};

function Title() {
	return <span>Dashboard</span>;
}

export function AdminBar(props: { adminBarProps?: PayloadAdminBarProps }) {
	const { adminBarProps } = props || {};
	const segments = useSelectedLayoutSegments();
	// Only staff (anyone allowed into the admin panel) get the bar; the session is loaded by the header
	const canAccessAdmin = useSessionStore((state) => state.canAccessAdmin);
	const collection = (
		collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : "pages"
	) as keyof typeof collectionLabels;
	const router = useRouter();

	if (!canAccessAdmin) return null;

	return (
		<div className={cn(baseClass, styles.adminBar)}>
			<div className={styles.container}>
				<PayloadAdminBar
					{...adminBarProps}
					className={styles.payloadAdminBar}
					classNames={{
						controls: styles.controls,
						logo: styles.logo,
						user: styles.user,
					}}
					cmsURL={getClientSideURL()}
					collectionSlug={collection}
					collectionLabels={{
						plural: collectionLabels[collection]?.plural || "Pages",
						singular: collectionLabels[collection]?.singular || "Page",
					}}
					logo={<Title />}
					onPreviewExit={() => {
						fetch("/next/exit-preview").then(() => {
							router.push("/");
							router.refresh();
						});
					}}
					style={{
						backgroundColor: "transparent",
						padding: 0,
						position: "relative",
						zIndex: "unset",
					}}
				/>
			</div>
		</div>
	);
}
