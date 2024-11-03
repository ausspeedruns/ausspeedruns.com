import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { cacheExchange, Client, fetchExchange, gql } from "@urql/core";
import { cookies } from "next/headers";

const client = new Client({
	url: "http://localhost:8000/api/graphql",
	exchanges: [cacheExchange, fetchExchange],
});

const MUTATION_AUTHENTICATE = gql`
	mutation ($email: String!, $password: String!) {
		authenticateUserWithPassword(email: $email, password: $password) {
			__typename
			... on UserAuthenticationWithPasswordSuccess {
				item {
					id
					username
				}
			}
			... on UserAuthenticationWithPasswordFailure {
				message
			}
		}
	}
`;

import type { JWT } from "next-auth/jwt";
declare module "next-auth/jwt" {
	interface JWT {
		username: string;
	}
}

declare module "next-auth" {
	interface Session {
		user: {
			username: string;
		} & DefaultSession["user"];
	}

	interface User {
		username: string;
	}
}

export const { handlers, signIn, signOut, auth } = NextAuth({
	debug: true,
	session: {
		strategy: "jwt",
		maxAge: 60 * 60 * 24 * 30, // 30 days
	},
	providers: [
		Credentials({
			credentials: {
				email: {},
				password: {},
			},
			authorize: async (credentials) => {
				// const response = await client.mutation(MUTATION_AUTHENTICATE, {
				// 	email: credentials.email,
				// 	password: credentials.password,
				// });

				const response = await fetch("http://localhost:8000/api/graphql", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						query: `
							mutation ($email: String!, $password: String!) {
								authenticateUserWithPassword(email: $email, password: $password) {
									__typename
									... on UserAuthenticationWithPasswordSuccess {
										item {
											id
											username
										}
									}
									... on UserAuthenticationWithPasswordFailure {
										message
									}
								}
							}
						`,
						variables: {
							email: credentials.email,
							password: credentials.password,
						},
					}),
				});

				const responseJson = await response.json();

				if (responseJson.error) {
					throw new Error(responseJson.error.message);
				}

				const data = responseJson.data?.authenticateUserWithPassword;

				if (data?.__typename === "UserAuthenticationWithPasswordFailure") {
					throw new Error(data.authenticateUserWithPassword.message);
				}

				if (data?.__typename === "UserAuthenticationWithPasswordSuccess") {
					const resCookies = response.headers.getSetCookie();

					// Currently this should only ever be one cookie
					if (resCookies && resCookies.length > 0) {
						const keystoneCookie = resCookies[0];
						cookies().set({
							name: "keystonejs-session",
							value: keystoneCookie.split(";")[0].split("=")[1],
							path: "/",
							httpOnly: true,
							sameSite: "lax",
							expires: new Date(keystoneCookie.split("Expires=")[1].split(";")[0]),
							maxAge: 2592000,
						});
					}

					return {
						id: data.item.id,
						email: credentials.email as string,
						username: data.item.username,
					};
				}

				return null;
			},
		}),
	],
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token.username = user.username;
			}

			return token;
		},
		session: async ({ session, token }) => {
			session.user.username = token.username;
			return session;
		},
	},
});
