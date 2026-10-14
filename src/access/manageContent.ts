import type { Access } from "payload";

import { isContentManager } from "./helpers.ts";

export const manageContent: Access = ({ req }) => isContentManager(req);
