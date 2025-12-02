import { cn } from "@/utilities/ui";
import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	ref?: React.Ref<HTMLDivElement>;
}

function Card({ className, ref, ...props }: CardProps) {
	return (
		<div
			className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
			ref={ref}
			{...props}
		/>
	);
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	ref?: React.Ref<HTMLDivElement>;
}

function CardHeader({ className, ref, ...props }: CardHeaderProps) {
	return <div className={cn("flex flex-col space-y-1.5 p-6", className)} ref={ref} {...props} />;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
	ref?: React.Ref<HTMLHeadingElement>;
}

function CardTitle({ className, ref, ...props }: CardTitleProps) {
	return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} ref={ref} {...props} />;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
	ref?: React.Ref<HTMLParagraphElement>;
}

function CardDescription({ className, ref, ...props }: CardDescriptionProps) {
	return <p className={cn("text-sm text-muted-foreground", className)} ref={ref} {...props} />;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
	ref?: React.Ref<HTMLDivElement>;
}

function CardContent({ className, ref, ...props }: CardContentProps) {
	return <div className={cn("p-6 pt-0", className)} ref={ref} {...props} />;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
	ref?: React.Ref<HTMLDivElement>;
}

function CardFooter({ className, ref, ...props }: CardFooterProps) {
	return <div className={cn("flex items-center p-6 pt-0", className)} ref={ref} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
