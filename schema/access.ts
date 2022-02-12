export type SessionContext = {
	session?: {
		data: {
			name: string;
			roles: {
				admin: boolean;
				canReadTech: boolean;
				canReadRunnerInfo: boolean;
				canReadRunnerMgmt: boolean;
				canManageContent: boolean;
				canManageUsers: boolean;
			}[];
		};
		itemId: string;
		listKey: string;
	};
};

export type ItemContext = { item: any; } & SessionContext;

export const isSignedIn = ({ session }: SessionContext) => {
	return !!session;
};

export const operations = {
	admin: ({ session }: SessionContext ) => session?.data.roles?.some(role => role.admin),
	runnerMgmt: ({ session }: SessionContext ) => session?.data.roles?.some(role => role.canReadRunnerMgmt),
}

export const permissions = {
	canManageUsers: ({ session }: SessionContext) => {
		return !!session?.data.roles?.some(role => role.canManageUsers);
	},
	canManageContent: ({ session }: SessionContext) => {
		return !!session?.data.roles?.some(role => role.canManageContent);
	},
}

export const rules = {
	canUseAdminUI: ({ session }: SessionContext) => {
		return !!session?.data.roles?.some(role => role.canManageContent);
	},
	// canReadContentList: ({ session }: SessionContext) => {
	// 	if (permissions.canManageContent({ session })) return true;
	// 	return { status: { equals: 'published' } };
	// },
	canManageUser: ({ session, item }: ItemContext) => {
		if (permissions.canManageUsers({ session })) return true;
		if (session?.itemId === item.id) return true;
		return false;
	},
	canManageUserList: ({ session }: SessionContext) => {
		if (permissions.canManageUsers({ session })) return true;
		if (!isSignedIn({ session })) return false;
		return { where: { id: { equals: session!.itemId } } };
	},
};
