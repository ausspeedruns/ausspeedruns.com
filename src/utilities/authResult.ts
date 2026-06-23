import type { getPayload } from "payload";

export type AuthResult = Awaited<ReturnType<Awaited<ReturnType<typeof getPayload>>["auth"]>>;
