import { EventPageComponentBlocks } from "../../../../../libs/component-blocks/component-blocks/src/index";
import { library } from "@fortawesome/fontawesome-svg-core";
import {fas} from "@fortawesome/free-solid-svg-icons";

library.add(fas);

interface HeaderProps {
	image: string;
	position: string;
	cover: boolean;
	repeat: string;
}

// naming the export componentBlocks is important because the Admin UI
// expects to find the components like on the componentBlocks export
export const componentBlocks = EventPageComponentBlocks;
