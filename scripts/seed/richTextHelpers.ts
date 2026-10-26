type Id = number | string;
type ElementFormat = "" | "left" | "center" | "right" | "justify";

const randomId = () => Math.random().toString(36).slice(2, 14);

export function textNode(text: string, format: number = 0) {
	return {
		type: "text",
		detail: 0,
		format,
		mode: "normal" as const,
		style: "",
		text,
		version: 1,
	};
}

export function linkNode(text: string, url: string, newTab = false) {
	return {
		type: "link",
		children: [textNode(text)],
		direction: "ltr" as const,
		fields: { linkType: "custom", newTab, url },
		format: "" as const,
		indent: 0,
		version: 3,
	};
}

/** Link to a page or post. The frontend resolves it to the document's slug. */
export function internalLinkNode(text: string, relationTo: "pages" | "posts", value: Id, newTab = false) {
	return {
		type: "link",
		children: [textNode(text)],
		direction: "ltr" as const,
		fields: { linkType: "internal", newTab, doc: { relationTo, value } },
		format: "" as const,
		indent: 0,
		version: 3,
	};
}

export function headingNode(
	text: string,
	tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" = "h2",
	format: ElementFormat = "",
) {
	return {
		type: "heading",
		children: [textNode(text)],
		direction: "ltr" as const,
		format,
		indent: 0,
		tag,
		version: 1,
	};
}

export function paragraphNode(
	children: object[],
	{ format = "", indent = 0 }: { format?: ElementFormat; indent?: number } = {},
) {
	return {
		type: "paragraph",
		children,
		direction: "ltr" as const,
		format,
		indent,
		textFormat: 0,
		version: 1,
	};
}

/** List items can be plain strings or arrays of inline nodes (formatted text, links). */
export function listNode(type: "bullet" | "number", items: (string | object[])[]) {
	return {
		type: "list",
		children: items.map((item, index) => ({
			type: "listitem",
			children: typeof item === "string" ? [textNode(item)] : item,
			direction: "ltr" as const,
			format: "" as const,
			indent: 0,
			value: index + 1,
			version: 1,
		})),
		direction: "ltr" as const,
		format: "" as const,
		indent: 0,
		listType: type,
		start: 1,
		tag: type === "number" ? "ol" : "ul",
		version: 1,
	};
}

export function checklistNode(items: { text: string; checked: boolean }[]) {
	return {
		type: "list",
		children: items.map((item, index) => ({
			type: "listitem",
			checked: item.checked,
			children: [textNode(item.text)],
			direction: "ltr" as const,
			format: "" as const,
			indent: 0,
			value: index + 1,
			version: 1,
		})),
		direction: "ltr" as const,
		format: "" as const,
		indent: 0,
		listType: "check",
		start: 1,
		tag: "ul",
		version: 1,
	};
}

export function quoteNode(text: string) {
	return {
		type: "quote",
		children: [textNode(text)],
		direction: "ltr" as const,
		format: "" as const,
		indent: 0,
		version: 1,
	};
}

export function horizontalRuleNode() {
	return {
		type: "horizontalrule",
		version: 1,
	};
}

export function mediaBlockNode(mediaId: Id | undefined) {
	return {
		type: "block",
		version: 2,
		format: "" as const,
		fields: {
			id: randomId(),
			blockName: "",
			blockType: "mediaBlock",
			media: mediaId,
		},
	};
}

/** Only available in editors that register the Banner block (e.g. post content). */
export function bannerBlockNode(style: "info" | "warning" | "error" | "success", content: object[]) {
	return {
		type: "block",
		version: 2,
		format: "" as const,
		fields: {
			id: randomId(),
			blockName: "",
			blockType: "banner",
			style,
			content: richText(...content),
		},
	};
}

/** Only available in editors that register the Code block (e.g. post content). */
export function codeBlockNode(language: "typescript" | "javascript" | "css", code: string) {
	return {
		type: "block",
		version: 2,
		format: "" as const,
		fields: {
			id: randomId(),
			blockName: "",
			blockType: "code",
			language,
			code,
		},
	};
}

export function uploadNode(mediaId: Id | undefined) {
	return {
		type: "upload",
		version: 3,
		format: "" as const,
		id: randomId(),
		fields: null,
		relationTo: "media",
		value: mediaId,
	};
}

export function richText(...children: object[]) {
	return {
		root: {
			type: "root",
			children,
			direction: "ltr" as const,
			format: "" as const,
			indent: 0,
			version: 1,
		},
	};
}

export const BOLD = 1;
export const ITALIC = 2;
export const STRIKETHROUGH = 4;
export const UNDERLINE = 8;
export const CODE_FORMAT = 16;
export const SUBSCRIPT = 32;
export const SUPERSCRIPT = 64;
export const BOLD_ITALIC = BOLD | ITALIC;
