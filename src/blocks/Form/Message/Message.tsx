import RichText from "#/components/RichText/RichText";

import { Width } from "../Width/Width";
import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import styles from "./Message.module.css";

interface MessageProps {
	message: DefaultTypedEditorState;
}

export function Message({ message }: MessageProps) {
	return (
		<Width className={styles.message} width="100">
			{message && <RichText data={message} />}
		</Width>
	);
}
