import type { FieldAccess } from "payload";

import { isAdminUser } from "#access/helpers.ts";

/**
 * Field-level access: allows if the user is an admin.
 */
export const isAdminField: FieldAccess = ({ req }) => isAdminUser(req);
