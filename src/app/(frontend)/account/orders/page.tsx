import config from "#payload-config";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Alert, Anchor, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { ReceiptText } from "lucide-react";
import { Order } from "./order";
import { WarningDiamond } from "pixelarticons/react";

export default async function AccountOrdersPage() {
	const payload = await getPayload({ config });
	const requestHeaders = await headers();
	const { user } = await payload.auth({ headers: requestHeaders });

	if (!user) {
		redirect(`/login?redirect=${encodeURIComponent(`/account/orders`)}`);
	}

	const orders = await payload.find({
		collection: "orders",
		where: {
			and: [
				{
					user: {
						equals: user.id,
					},
				},
			],
		},
		sort: "-createdAt",
	});

	return (
		<Stack gap="md">
			<Title order={1}>My Orders</Title>
			<Alert color="yellow" icon={<WarningDiamond />} variant="light">
				<Text size="sm">This is not orders done through our <Anchor href="/merch">Merch store</Anchor>.</Text>
			</Alert>
			{orders.docs.length === 0 ? (
				<Alert
					color="gray"
					icon={
						<ThemeIcon color="gray" radius="xl" size="sm" variant="light">
							<ReceiptText size={14} />
						</ThemeIcon>
					}
					variant="light"
				>
					<Text size="sm">You have not placed any orders yet.</Text>
				</Alert>
			) : (
				orders.docs.map((order) => <Order key={order.id} order={order} />)
			)}
		</Stack>
	);
}
