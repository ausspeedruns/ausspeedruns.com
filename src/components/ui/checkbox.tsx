"use client";

import { cn } from "@/utilities/ui";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React from "react";

interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
	ref?: React.Ref<HTMLButtonElement>;
}

function Checkbox({ className, ref, ...props }: CheckboxProps) {
	return (
		<CheckboxPrimitive.Root
			className={cn(
				"peer h-4 w-4 shrink-0 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
				className,
			)}
			ref={ref}
			{...props}
		>
			<CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
				<Check className="h-4 w-4" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
