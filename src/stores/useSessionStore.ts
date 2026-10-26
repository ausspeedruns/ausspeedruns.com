import { create } from "zustand";

/** Response shape of `GET /next/me` */
export interface SessionInfo {
	user: { username: string } | null;
	canAccessAdmin: boolean;
}

interface SessionStore extends SessionInfo {
	/** False until the first session check finishes, so the header doesn't flash "Log in" for logged-in users. */
	loaded: boolean;
	/** Fetches the current session. Called once by the header, and again after logging in. */
	refresh: () => Promise<void>;
}

/**
 * The logged-in user is loaded on the client (instead of reading cookies in the root layout)
 * so that public pages can be statically rendered and cached.
 */
export const useSessionStore = create<SessionStore>()((set) => ({
	user: null,
	canAccessAdmin: false,
	loaded: false,
	refresh: async () => {
		try {
			const response = await fetch("/next/me", { credentials: "include", cache: "no-store" });
			if (response.ok) {
				const session = (await response.json()) as SessionInfo;
				set({ user: session.user, canAccessAdmin: session.canAccessAdmin });
			}
		} catch {
			// Network errors leave the header in its logged-out state
		} finally {
			set({ loaded: true });
		}
	},
}));
