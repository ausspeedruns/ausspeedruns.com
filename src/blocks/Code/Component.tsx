import { Code } from "./Component.client";

export type CodeBlockProps = {
	code: string;
	language?: string;
	blockType: "code";
};

type Props = CodeBlockProps & {
	className?: string;
};

export function CodeBlock({ className, code, language }: Props) {
	return (
		<div className={className}>
			<Code code={code} language={language} />
		</div>
	);
}
