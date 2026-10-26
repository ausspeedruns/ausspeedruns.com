import config from "#payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Anchor, Stack, Text, Title } from "@mantine/core";
import { Order } from "./order";

export default async function AccountOrdersPage() {
	const payload = await getPayload({ config });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		redirect(`/login?redirect=${encodeURIComponent(`/account/orders`)}`);
	}

	const [orders, paymentSettings] = await Promise.all([
		payload.find({
			collection: "orders",
			where: { user: { equals: user.id } },
			sort: "-createdAt",
			pagination: false,
		}),
		payload.findGlobal({ slug: "paymentSettings", depth: 0 }),
	]);

	return (
		<Stack gap="md">
			<div>
				<Title order={1}>Orders</Title>
				<Text size="sm" c="dimmed" mt={4}>
					Merch orders are handled through the <Anchor href="/merch">merch store</Anchor>.
				</Text>
			</div>
			{orders.docs.length === 0 ? (
				<Text c="dimmed">You haven&apos;t placed any orders yet.</Text>
			) : (
				orders.docs.map((order) => (
					<Order key={order.id} order={order} bankTransfer={paymentSettings.bankTransfer} />
				))
			)}
		</Stack>
	);
}
