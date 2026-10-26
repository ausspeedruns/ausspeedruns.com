import { HeaderClient } from "./Header.client";
import { getCachedGlobal } from "#/utilities/getGlobals";

import type { Header } from "#/payload-types";

// The logged-in user is loaded client-side (see useSessionStore) so this layout doesn't make every page dynamic
export async function Header() {
	const headerData: Header = await getCachedGlobal("header", 1)();

	return <HeaderClient data={headerData} />;
}
