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

export function headingNode(text: string, tag: "h1" | "h2" | "h3" | "h4" = "h2") {
	return {
		type: "heading",
		children: [textNode(text)],
		direction: "ltr" as const,
		format: "" as const,
		indent: 0,
		tag,
		version: 1,
	};
}

export function paragraphNode(children: object[]) {
	return {
		type: "paragraph",
		children,
		direction: "ltr" as const,
		format: "" as const,
		indent: 0,
		textFormat: 0,
		version: 1,
	};
}

export function listNode(type: "bullet" | "number", items: string[]) {
	return {
		type: "list",
		children: items.map((item) => ({
			type: "listitem",
			children: [textNode(item)],
			direction: "ltr" as const,
			format: "" as const,
			indent: 0,
			value: 1,
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

export function mediaBlockNode(mediaId: number | string | undefined) {
	return {
		type: "block",
		version: 2,
		format: "" as const,
		fields: {
			id: Math.random().toString(36).slice(2, 14),
			blockName: "",
			blockType: "mediaBlock",
			media: mediaId,
		},
	};
}

export function uploadNode(mediaId: number | string | undefined) {
	return {
		type: "upload",
		version: 3,
		format: "" as const,
		id: Math.random().toString(36).slice(2, 14),
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
export const BOLD_ITALIC = BOLD | ITALIC;
