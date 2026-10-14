import type { Access } from "payload";

import { isAdminUser } from "./helpers.ts";

export const isAdmin: Access = ({ req }) => isAdminUser(req);
