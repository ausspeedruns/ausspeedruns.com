import config from "#payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Alert, Anchor, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { ListBox } from "pixelarticons/react";
import { Order } from "./Order";

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
			overrideAccess: false,
			user,
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
				<Alert
					color="gray"
					icon={
						<ThemeIcon color="gray" radius="xl" size="sm" variant="light">
							<ListBox width={14} height={14} />
						</ThemeIcon>
					}
					variant="light"
				>
					<Text size="sm">You haven&apos;t placed any orders yet.</Text>
				</Alert>
			) : (
				orders.docs.map((order) => (
					<Order key={order.id} order={order} bankTransfer={paymentSettings.bankTransfer} />
				))
			)}
		</Stack>
	);
}
