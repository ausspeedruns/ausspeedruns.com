import RichText from "#/components/RichText";

import { Width } from "../Width";
import { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

interface MessageProps {
	message: DefaultTypedEditorState;
}

export function Message({ message }: MessageProps) {
	return (
		<Width className="my-12" width="100">
			{message && <RichText data={message} />}
		</Width>
	);
}
