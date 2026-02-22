import type { ButtonProps } from "#/components/ui/button";

import { buttonVariants } from "#/components/ui/button";
import { cn } from "#/utilities/ui";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import * as React from "react";

interface PaginationProps extends React.ComponentProps<"nav"> {}

function Pagination({ className, ...props }: PaginationProps) {
	return (
		<nav
			aria-label="pagination"
			className={cn("mx-auto flex w-full justify-center", className)}
			role="navigation"
			{...props}
		/>
	);
}

interface PaginationContentProps extends React.HTMLAttributes<HTMLUListElement> {
	ref?: React.Ref<HTMLUListElement>;
}

function PaginationContent({ className, ref, ...props }: PaginationContentProps) {
	return <ul className={cn("flex flex-row items-center gap-1", className)} ref={ref} {...props} />;
}

interface PaginationItemProps extends React.HTMLAttributes<HTMLLIElement> {
	ref?: React.Ref<HTMLLIElement>;
}

function PaginationItem({ className, ref, ...props }: PaginationItemProps) {
	return <li className={cn("", className)} ref={ref} {...props} />;
}

interface PaginationLinkProps extends Pick<ButtonProps, "size">, React.ComponentProps<"button"> {
	isActive?: boolean;
}

function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
	return (
		<button
			aria-current={isActive ? "page" : undefined}
			className={cn(
				buttonVariants({
					size,
					variant: isActive ? "outline" : "ghost",
				}),
				className,
			)}
			{...props}
		/>
	);
}

interface PaginationPreviousProps extends React.ComponentProps<typeof PaginationLink> {}

function PaginationPrevious({ className, ...props }: PaginationPreviousProps) {
	return (
		<PaginationLink
			aria-label="Go to previous page"
			className={cn("gap-1 pl-2.5", className)}
			size="default"
			{...props}
		>
			<ChevronLeft className="h-4 w-4" />
			<span>Previous</span>
		</PaginationLink>
	);
}

interface PaginationNextProps extends React.ComponentProps<typeof PaginationLink> {}

function PaginationNext({ className, ...props }: PaginationNextProps) {
	return (
		<PaginationLink
			aria-label="Go to next page"
			className={cn("gap-1 pr-2.5", className)}
			size="default"
			{...props}
		>
			<span>Next</span>
			<ChevronRight className="h-4 w-4" />
		</PaginationLink>
	);
}

interface PaginationEllipsisProps extends React.ComponentProps<"span"> {}

function PaginationEllipsis({ className, ...props }: PaginationEllipsisProps) {
	return (
		<span aria-hidden className={cn("flex h-9 w-9 items-center justify-center", className)} {...props}>
			<MoreHorizontal className="h-4 w-4" />
			<span className="sr-only">More pages</span>
		</span>
	);
}

export {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
};
