type SessionContext = {
	session?: {
		data: {
			name: string;
			role: {
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

type ItemContext = { item: any; } & SessionContext;

export const isSignedIn = ({ session }: SessionContext) => {
	return !!session;
};

export const operationsAdmin = ({ session }: SessionContext ) => session?.data.role?.some(role => role.admin);

export const filterPosts = ({ session }: SessionContext ) => {
	// if the user is an Admin, they can access all the records
	if (session?.data.role?.some(role => role.canManageContent)) return true;
	// otherwise, filter for published posts
	// return { published: { equals: true } };
	return false;
}

export const permissions = {
	canManageUsers: ({ session }: SessionContext) => {
		return !!session?.data.role?.some(role => role.canManageUsers);
	},
	canManageContent: ({ session }: SessionContext) => {
		return !!session?.data.role?.some(role => role.canManageContent);
	},
}

export const rules = {
	canUseAdminUI: ({ session }: SessionContext) => {
		return !!session?.data.role?.some(role => role.canManageContent);
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
