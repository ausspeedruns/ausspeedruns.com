import bcrypt from "bcryptjs";
import type { CollectionBeforeChangeHook, CollectionBeforeOperationHook } from "payload";

/**
 * Keystone 6 stored bcrypt hashes, which Payload's PBKDF2 strategy can't verify. Migrated users keep their
 * bcrypt hash in `legacyPasswordHash` and a random Payload password; on their first successful login we
 * check the bcrypt hash, save the entered password as a real Payload password, and drop the legacy hash.
 */
export const upgradeLegacyPassword: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
	if (operation === "login") {
		const email = typeof args.data?.email === "string" ? args.data.email.toLowerCase().trim() : null;
		const password = args.data?.password;
		if (!email || typeof password !== "string" || !password) return args;

		const user = await req.payload.db.findOne<{
			id: string;
			legacyPasswordHash?: string | null;
			lockUntil?: string | null;
		}>({
			collection: "users",
			where: { email: { equals: email } },
			req,
		});
		if (!user?.legacyPasswordHash) return args;
		// Don't let a locked account act as a password oracle; Payload will reject the login anyway
		if (user.lockUntil && new Date(user.lockUntil).getTime() > Date.now()) return args;

		if (await bcrypt.compare(password, user.legacyPasswordHash)) {
			try {
				await req.payload.update({
					collection: "users",
					id: user.id,
					data: { password, legacyPasswordHash: null },
					overrideAccess: true,
					depth: 0,
					req,
				});
			} catch (error) {
				// Fall through to Payload's normal login, which will reject the (still random) password
				req.payload.logger.error({ err: error, msg: `Failed to upgrade legacy password for user ${user.id}` });
			}
		}
		return args;
	}

	// Password resets write the new hash directly (skipping beforeChange), so clear the legacy hash here
	if (operation === "resetPassword") {
		const token = args.data?.token;
		if (typeof token !== "string" || !token) return args;

		const user = await req.payload.db.findOne<{ id: string; legacyPasswordHash?: string | null }>({
			collection: "users",
			where: { resetPasswordToken: { equals: token } },
			req,
		});
		if (user?.legacyPasswordHash) {
			await req.payload.db.updateOne({
				collection: "users",
				id: user.id,
				data: { legacyPasswordHash: null },
				req,
			});
		}
	}

	return args;
};

/** Once a user sets a new password their old Keystone password must stop working. */
export const clearLegacyPasswordOnChange: CollectionBeforeChangeHook = ({ data, operation }) => {
	if (operation === "update" && typeof data?.password === "string" && data.password) {
		data.legacyPasswordHash = null;
	}
	return data;
};
