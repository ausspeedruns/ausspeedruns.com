import RichText from "#/components/RichText";

import { Width } from "../Width";
import { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import styles from "./index.module.css";

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
