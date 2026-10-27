import { APIError, type CollectionBeforeOperationHook } from "payload";

/**
 * Password reset emails can only be requested through the bot-checked /forgot-password page (which uses the
 * Local API), so bots can't use the REST endpoint to spam people's inboxes. The admin panel's forgot password
 * page redirects there too (see redirects.js).
 */
export const requireBotCheckedForgotPassword: CollectionBeforeOperationHook = ({ args, operation, req }) => {
	if (operation === "forgotPassword" && req.payloadAPI !== "local") {
		throw new APIError("Please request a password reset from the website's forgot password page.", 403);
	}
	return args;
};
