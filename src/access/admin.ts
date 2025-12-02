import type { Access } from "payload";

export const admin: Access = ({ req: { user } }) => {
	if (user) {
		return true;
	}

	return {
		_status: {
			equals: "published",
		},
	};
};
