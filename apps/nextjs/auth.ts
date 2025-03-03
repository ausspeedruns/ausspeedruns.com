import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";

import type { JWT } from "next-auth/jwt";
import { redirect } from "next/navigation";

const KeystoneURL = process.env.KEYSTONE_URL!;

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
				const response = await fetch(KeystoneURL, {
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
			session.user.id = token.sub ?? "";
			session.user.username = token.username;
			return session;
		},
	},
});

// Sign Up Error

type SignUpErrorType = "email" | "username" | "password" | "dob";

export class SignUpError extends Error {
	readonly type: SignUpErrorType;

	constructor(message: string, type: SignUpErrorType) {
		super(message);
		this.name = "SignUpError";
		this.type = type;
	}
}

export async function signUp(formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const username = formData.get("username") as string;
	const dob = new Date(formData.get("dob") as string);

	console.log(email, password, username, dob);
	
	// Validation
	if (password.length < 8) {
		throw new SignUpError("Password Too Short", "password");
	}

	// Create user
	const response = await fetch(KeystoneURL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			query: `
				mutation ($username: String!, $email: String!, $password: String!, $dob: DateTime!) {
					createUser(data: { username: $username, email: $email, password: $password, dateOfBirth: $dob }) {
						__typename
						id
					}
				}
			`,
			variables: {
				email,
				password,
				username,
				dob: dob,
			},
		}),
	});

	console.log(response);

	const responseJson = await response.json();

	console.log(responseJson);

	if (responseJson.error) {
		return { error: responseJson.error.message };
	}

	const data = responseJson.data?.createUser;

	if (data?.__typename === "User") {
		await signIn("credentials", { email, password });
	}

	return null;
}
