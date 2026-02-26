import { cn } from "#/utilities/ui";
import * as React from "react";
import styles from "./card.module.css";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
	ref?: React.Ref<HTMLDivElement>;
}

function Card({ className, ref, ...props }: CardProps) {
	return <div className={cn(styles.card, className)} ref={ref} {...props} />;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
	ref?: React.Ref<HTMLDivElement>;
}

function CardHeader({ className, ref, ...props }: CardHeaderProps) {
	return <div className={cn(styles.cardHeader, className)} ref={ref} {...props} />;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
	ref?: React.Ref<HTMLHeadingElement>;
}

function CardTitle({ className, ref, ...props }: CardTitleProps) {
	return <h3 className={cn(styles.cardTitle, className)} ref={ref} {...props} />;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
	ref?: React.Ref<HTMLParagraphElement>;
}

function CardDescription({ className, ref, ...props }: CardDescriptionProps) {
	return <p className={cn(styles.cardDescription, className)} ref={ref} {...props} />;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
	ref?: React.Ref<HTMLDivElement>;
}

function CardContent({ className, ref, ...props }: CardContentProps) {
	return <div className={cn(styles.cardContent, className)} ref={ref} {...props} />;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
	ref?: React.Ref<HTMLDivElement>;
}

function CardFooter({ className, ref, ...props }: CardFooterProps) {
	return <div className={cn(styles.cardFooter, className)} ref={ref} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
