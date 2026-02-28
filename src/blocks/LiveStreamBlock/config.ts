import type { Block } from "payload";

export const LiveStreamBlockConfig: Block = {
slug: "liveStreamBlock",
interfaceName: "LiveStreamBlock",
fields: [
{ name: "title", type: "text", label: "Title" },
{ name: "twitchChannel", type: "text", label: "Twitch Channel", required: true }
]
};
