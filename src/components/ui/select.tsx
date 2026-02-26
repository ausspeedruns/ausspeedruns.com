"use client";

import { cn } from "#/utilities/ui";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import styles from "./select.module.css";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

interface SelectTriggerProps extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
	ref?: React.Ref<HTMLButtonElement>;
}

function SelectTrigger({ children, className, ref, ...props }: SelectTriggerProps) {
	return (
		<SelectPrimitive.Trigger className={cn(styles.trigger, className)} ref={ref} {...props}>
			{children}
			<SelectPrimitive.Icon asChild>
				<ChevronDown className={styles.icon} />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

interface SelectScrollUpButtonProps extends React.ComponentProps<typeof SelectPrimitive.ScrollUpButton> {
	ref?: React.Ref<HTMLDivElement>;
}

function SelectScrollUpButton({ className, ref, ...props }: SelectScrollUpButtonProps) {
	return (
		<SelectPrimitive.ScrollUpButton className={cn(styles.scrollButton, className)} ref={ref} {...props}>
			<ChevronUp className={styles.icon} />
		</SelectPrimitive.ScrollUpButton>
	);
}

interface SelectScrollDownButtonProps extends React.ComponentProps<typeof SelectPrimitive.ScrollDownButton> {
	ref?: React.Ref<HTMLDivElement>;
}

function SelectScrollDownButton({ className, ref, ...props }: SelectScrollDownButtonProps) {
	return (
		<SelectPrimitive.ScrollDownButton className={cn(styles.scrollButton, className)} ref={ref} {...props}>
			<ChevronDown className={styles.icon} />
		</SelectPrimitive.ScrollDownButton>
	);
}

interface SelectContentProps extends React.ComponentProps<typeof SelectPrimitive.Content> {
	ref?: React.Ref<HTMLDivElement>;
}

function SelectContent({ children, className, position = "popper", ref, ...props }: SelectContentProps) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Content
				className={cn(styles.content, position === "popper" && styles.contentPopper, className)}
				position={position}
				ref={ref}
				{...props}
			>
				<SelectScrollUpButton />
				<SelectPrimitive.Viewport
					className={cn(styles.viewport, position === "popper" && styles.viewportPopper)}
				>
					{children}
				</SelectPrimitive.Viewport>
				<SelectScrollDownButton />
			</SelectPrimitive.Content>
		</SelectPrimitive.Portal>
	);
}

interface SelectLabelProps extends React.ComponentProps<typeof SelectPrimitive.Label> {
	ref?: React.Ref<HTMLDivElement>;
}

function SelectLabel({ className, ref, ...props }: SelectLabelProps) {
	return <SelectPrimitive.Label className={cn(styles.label, className)} ref={ref} {...props} />;
}

interface SelectItemProps extends React.ComponentProps<typeof SelectPrimitive.Item> {
	ref?: React.Ref<HTMLDivElement>;
	value: string;
}

function SelectItem({ children, className, ref, ...props }: SelectItemProps) {
	return (
		<SelectPrimitive.Item className={cn(styles.item, className)} ref={ref} {...props}>
			<span className={styles.itemIndicatorWrapper}>
				<SelectPrimitive.ItemIndicator>
					<Check className={styles.itemIndicatorIcon} />
				</SelectPrimitive.ItemIndicator>
			</span>

			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

interface SelectSeparatorProps extends React.ComponentProps<typeof SelectPrimitive.Separator> {
	ref?: React.Ref<HTMLDivElement>;
}

function SelectSeparator({ className, ref, ...props }: SelectSeparatorProps) {
	return <SelectPrimitive.Separator className={cn(styles.separator, className)} ref={ref} {...props} />;
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
