import type { FieldAccess } from "payload";

import { isUserManager } from "#access/helpers.ts";

/**
 * Field-level access: allows if the user can manage users.
 */
export const manageUsersField: FieldAccess = ({ req }) => isUserManager(req);
