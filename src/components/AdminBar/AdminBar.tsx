"use client";

import type { PayloadAdminBarProps, PayloadMeUser } from "@payloadcms/admin-bar";

import { cn } from "#/utilities/ui";
import { useSelectedLayoutSegments } from "next/navigation";
import { PayloadAdminBar } from "@payloadcms/admin-bar";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./AdminBar.module.css";

import { getClientSideURL } from "#/utilities/getURL";

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
	const [show, setShow] = useState(false);
	const collection = (
		collectionLabels[segments?.[1] as keyof typeof collectionLabels] ? segments[1] : "pages"
	) as keyof typeof collectionLabels;
	const router = useRouter();

	const onAuthChange = React.useCallback((user: PayloadMeUser) => {
		setShow(Boolean(user?.id));
	}, []);

	return (
		<div
			className={cn(baseClass, styles.adminBar, {
				[styles.show]: show,
				[styles.hide]: !show,
			})}
		>
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
					onAuthChange={onAuthChange}
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
