import * as React from "react";

interface WidthProps {
	children: React.ReactNode;
	className?: string;
	width?: number | string;
}

export function Width({ children, className, width }: WidthProps) {
	return (
		<div className={className} style={{ maxWidth: width ? `${width}%` : undefined }}>
			{children}
		</div>
	);
}
