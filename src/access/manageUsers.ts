import type { Access } from "payload";

import { isUserManager } from "./helpers.ts";

export const manageUsers: Access = ({ req }) => isUserManager(req);
