import { HeaderClient } from "./Header.client";
import { getCachedGlobal } from "#/utilities/getGlobals";
import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "#payload-config";

import type { Header } from "#/payload-types";

export async function Header() {
	const headerData: Header = await getCachedGlobal("header", 1)();

	console.log(headerData); 

	const payload = await getPayload({ config });
	const userHeaders = await headers();
	const auth = await payload.auth({ headers: userHeaders });

	return <HeaderClient data={headerData} auth={auth} />;
}
