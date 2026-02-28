import type { Block } from "payload";

export const EventHeroBlockConfig: Block = {
slug: "eventHeroBlock",
interfaceName: "EventHeroBlock",
fields: [
{ name: "event", type: "relationship", relationTo: "events", required: true, label: "Event" },
{ name: "heading", type: "text", label: "Heading Override" }
]
};
