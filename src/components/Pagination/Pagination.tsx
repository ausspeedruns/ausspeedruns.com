"use client";
import { Pagination as MantinePagination } from "@mantine/core";
import { cn } from "#/utilities/ui";
import { useRouter } from "next/navigation";
import styles from "./Pagination.module.css";

interface PaginationProps {
	className?: string;
	page: number;
	totalPages: number;
}

export function Pagination(props: PaginationProps) {
	const router = useRouter();
	const { className, page, totalPages } = props;

	return (
		<div className={cn(styles.pagination, className)}>
			<MantinePagination
				total={totalPages}
				value={page}
				onChange={(newPage) => {
					router.push(`/posts/page/${newPage}`);
				}}
			/>
		</div>
	);
}
