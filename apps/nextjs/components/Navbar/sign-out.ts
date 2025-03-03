"use server";

import { signOut } from "../../auth";
import { cookies } from "next/headers";

export async function signUserOut() {
	const cookie = cookies();
	cookie.delete("keystonejs-session");

	await signOut();
}
