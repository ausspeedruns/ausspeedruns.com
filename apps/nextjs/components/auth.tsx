// From KeystoneJS Prisma 2021 Workshop example
// https://github.com/keystonejs/prisma-day-2021-workshop/blob/main/components/auth.tsx

import { createContext, useRef, useMemo, useEffect, useContext, ReactNode } from 'react';

import { gql, useQuery, useMutation } from 'urql';

export type SignInArgs = { email: string; password: string };
export type SignInResult = { success: true } | { success: false; message: string };

type AuthContextType =
	| {
			ready: true;
			sessionData?: {
				id: string;
				username: string;
				roles: { canReadRunnerInfo: boolean; canReadRunnerMgmt: boolean; canReadTech: boolean }[];
			};
			signIn: ({ email, password }: SignInArgs) => Promise<SignInResult>;
			signOut: () => void;
	  }
	| {
			ready: false;
	  };

const AuthContext = createContext<AuthContextType>({
	ready: false,
});

export function useAuth() {
	return useContext(AuthContext);
}

export type AuthReturnData = ReturnType<typeof useAuth>;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const wasReady = useRef(false);
	const mutationContext = useMemo(() => ({ additionalTypenames: ['User', 'Poll', 'PollAnswer'] }), []);

	const [{ fetching, data: sessionData, error: sessionError }, refetch] = useQuery({
		query: gql`
			query {
				authenticatedItem {
					... on User {
						id
						username
						roles {
							runner
							volunteer
						}
					}
				}
			}
		`,
	});

	const [, authenticate] = useMutation(gql`
		mutation ($email: String!, $password: String!) {
			authenticateUserWithPassword(email: $email, password: $password) {
				__typename
				... on UserAuthenticationWithPasswordSuccess {
					item {
						id
					}
				}
				... on UserAuthenticationWithPasswordFailure {
					message
				}
			}
		}
	`);

	const signIn = async ({ email, password }: SignInArgs): Promise<SignInResult> => {
		const result: any = await authenticate({ email, password }, mutationContext);
		const { data, error } = result;
		if (data?.authenticateUserWithPassword?.__typename === 'UserAuthenticationWithPasswordSuccess') {
			return { success: true };
		} else if (data?.authenticateUserWithPassword?.__typename === 'UserAuthenticationWithPasswordFailure') {
			return {
				success: false,
				message: data.authenticateUserWithPassword?.message,
			};
		}
		if (error) {
			return { success: false, message: error.toString() };
		} else {
			return { success: false, message: 'An unknown error occurred' };
		}
	};

	const [{}, signOutMutation] = useMutation(gql`
		mutation {
			endSession
		}
	`);

	const signOut = () => {
		signOutMutation(undefined, mutationContext);
	};

	useEffect(() => {
		if (!wasReady.current && !fetching && !sessionError) {
			wasReady.current = true;
		}
	});

	return (
		<AuthContext.Provider
			value={{
				ready: wasReady.current || !fetching,
				sessionData: sessionData?.authenticatedItem,
				signIn,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
