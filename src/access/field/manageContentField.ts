import type { FieldAccess } from "payload";

import { isContentManager } from "#access/helpers.ts";

/**
 * Field-level access: allows if the user can manage content.
 */
export const manageContentField: FieldAccess = ({ req }) => isContentManager(req);
