"use client";

import {
	ActionIcon,
	Alert,
	Badge,
	Box,
	Button,
	Checkbox,
	Group,
	Paper,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
	Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { differenceInCalendarDays, format } from "date-fns";
import { LogOut, Maximize, Minimize, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import type { PickupItem, PickupLookup, PickupOrder, PickupSaveRequest } from "#/utilities/ticketPickup/types.ts";
import styles from "./TicketPickup.module.css";

interface TicketPickupAppProps {
	/** URL the pickup endpoints are mounted under, e.g. `/api/orders/pickup`. */
	apiUrl: string;
	exitHref: string;
}

/** Ticket IDs are 9 (legacy `T-`) or 10 (`ORD-`) characters after the prefix. */
const MIN_CODE_LENGTH = 9;
const AUTO_SEARCH_DELAY_MS = 400;
/** Tickets are often bought months ahead, so only flag orders likely to be from a previous event. */
const OLD_ORDER_DAYS = 300;

const itemKey = (item: Pick<PickupItem, "orderId" | "itemId">) => `${item.orderId}:${item.itemId}`;
const isPaid = (order: Pick<PickupOrder, "status">) => order.status === "completed" || order.status === "collected";
const codeLength = (reference: string) =>
	reference
		.toUpperCase()
		.replace(/\s+/g, "")
		.replace(/^(T-|ORD-)/, "").length;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
	const response = await fetch(url, {
		credentials: "include",
		...init,
		headers: { "Content-Type": "application/json", ...init?.headers },
	});
	const body = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
	if (!response.ok || !body) throw new Error(body?.error ?? `Request failed (${response.status})`);
	return body;
}

function useFullscreen() {
	const [isFullscreen, setIsFullscreen] = useState(false);

	useEffect(() => {
		const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
		document.addEventListener("fullscreenchange", onChange);
		return () => document.removeEventListener("fullscreenchange", onChange);
	}, []);

	const toggle = useCallback(() => {
		if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
		else document.documentElement.requestFullscreen?.().catch(() => {});
	}, []);

	return { isFullscreen, toggle };
}

function StatusBanner({ order, justSaved }: { order: PickupOrder; justSaved: boolean }) {
	const tickets = order.items.filter((item) => item.productType === "ticket");
	const ticketsCollected =
		tickets.length > 0 && tickets.every((ticket) => ticket.collectedQuantity >= ticket.quantity);

	let tone = "good";
	let message = "PAID — ready to pick up";
	if (order.status === "cancelled") {
		tone = "bad";
		message = "CANCELLED — do not hand out. Ask a staff member.";
	} else if (order.status === "pending") {
		tone = "bad";
		message = `NOT PAID${order.purchaseType === "bankTransfer" ? " (bank transfer)" : ""} — ask a staff member.`;
	} else if (ticketsCollected && justSaved) {
		message = "PICKED UP ✓ — ready for the next person";
	} else if (ticketsCollected) {
		tone = "warn";
		message = "ALREADY PICKED UP — check with the attendee.";
	}

	return (
		<Box className={styles.banner} data-tone={tone}>
			{message}
		</Box>
	);
}

function OrderStatusBadge({ order }: { order: PickupOrder }) {
	if (order.status === "pending") return <Badge color="red">Not paid</Badge>;
	if (order.status === "cancelled") return <Badge color="red">Cancelled</Badge>;
	if (order.status === "collected") return <Badge color="gray">Collected</Badge>;
	return <Badge color="green">Paid</Badge>;
}

interface OrderSectionProps {
	order: PickupOrder;
	draft: Record<string, number>;
	onChange: (item: PickupItem, count: number) => void;
}

function OrderSection({ order, draft, onChange }: OrderSectionProps) {
	const created = new Date(order.createdAt);
	const isOld = !order.isSearched && differenceInCalendarDays(new Date(), created) > OLD_ORDER_DAYS;
	const paid = isPaid(order);

	return (
		<Stack gap="xs" className={styles.order} data-searched={order.isSearched}>
			<Group justify="space-between" wrap="nowrap">
				<Group gap="xs">
					<Text fw={700} ff="monospace">
						{order.reference}
					</Text>
					{order.isSearched && (
						<Badge variant="outline" color="blue">
							Searched
						</Badge>
					)}
					<OrderStatusBadge order={order} />
				</Group>
				<Group gap="xs" wrap="nowrap">
					{isOld && <Badge color="yellow">Old order — check it&apos;s not from a past event</Badge>}
					<Text size="sm" c={isOld ? "yellow" : "dimmed"} fw={isOld ? 700 : undefined}>
						{format(created, "EEE d MMM yyyy, h:mm a")}
					</Text>
				</Group>
			</Group>

			{order.items.flatMap((item) => {
				const collected = draft[itemKey(item)] ?? 0;
				const label = (
					<Box>
						<Text size="xl" fw={700}>
							{item.variantLabel || item.productName}
						</Text>
						{item.variantLabel && (
							<Text size="sm" c="dimmed">
								{item.productName}
							</Text>
						)}
					</Box>
				);

				// Tickets are handed over all at once; merch gets one checkbox per unit so a missing size can be skipped
				if (item.productType === "ticket") {
					return (
						<Group key={itemKey(item)} className={styles.itemRow} justify="space-between" wrap="nowrap">
							{label}
							<Checkbox
								size="xl"
								label={item.quantity > 1 ? `${item.quantity} tickets taken` : "Ticket taken"}
								disabled={!paid}
								checked={collected >= item.quantity}
								onChange={(event) => onChange(item, event.currentTarget.checked ? item.quantity : 0)}
							/>
						</Group>
					);
				}

				return Array.from({ length: item.quantity }, (_, unit) => (
					<Group
						key={`${itemKey(item)}:${unit}`}
						className={styles.itemRow}
						justify="space-between"
						wrap="nowrap"
					>
						{label}
						<Checkbox
							size="xl"
							label="Taken"
							disabled={!paid}
							checked={unit < collected}
							onChange={(event) => onChange(item, event.currentTarget.checked ? unit + 1 : unit)}
						/>
					</Group>
				));
			})}
		</Stack>
	);
}

export function TicketPickupApp({ apiUrl, exitHref }: TicketPickupAppProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const requestIdRef = useRef(0);
	const lastSearchedRef = useRef("");
	const [reference, setReference] = useState("");
	const [lookup, setLookup] = useState<PickupLookup | null>(null);
	const [draft, setDraft] = useState<Record<string, number>>({});
	const [notes, setNotes] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [justSaved, setJustSaved] = useState(false);
	const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

	const focusInput = useCallback(() => {
		requestAnimationFrame(() => {
			inputRef.current?.focus();
			inputRef.current?.select();
		});
	}, []);

	useEffect(focusInput, [focusInput]);

	const load = useCallback((result: PickupLookup, saved = false) => {
		setLookup(result);
		setJustSaved(saved);
		setNotes(result.order.notes);
		setDraft(
			Object.fromEntries(
				result.orders.flatMap((order) => order.items).map((item) => [itemKey(item), item.collectedQuantity]),
			),
		);
	}, []);

	const allItems = useMemo(() => lookup?.orders.flatMap((order) => order.items) ?? [], [lookup]);
	const changes = allItems.filter((item) => (draft[itemKey(item)] ?? 0) !== item.collectedQuantity);
	const notesChanged = Boolean(lookup) && notes !== lookup?.order.notes;
	const isDirty = changes.length > 0 || notesChanged;

	const clear = useCallback(() => {
		requestIdRef.current++;
		lastSearchedRef.current = "";
		setReference("");
		setLookup(null);
		setDraft({});
		setNotes("");
		setError(null);
		setLoading(false);
		focusInput();
	}, [focusInput]);

	const runSearch = useCallback(
		async (value: string) => {
			const trimmed = value.trim();
			if (!trimmed) return;

			const requestId = ++requestIdRef.current;
			lastSearchedRef.current = trimmed;
			setLoading(true);
			setError(null);
			try {
				const result = await request<PickupLookup>(`${apiUrl}?reference=${encodeURIComponent(trimmed)}`);
				if (requestId === requestIdRef.current) load(result);
			} catch (err) {
				if (requestId !== requestIdRef.current) return;
				setLookup(null);
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				if (requestId === requestIdRef.current) setLoading(false);
			}
		},
		[apiUrl, load],
	);

	// Search automatically once a full ticket ID has been typed, unless that would throw away unsaved ticks
	useEffect(() => {
		const trimmed = reference.trim();
		if (isDirty || codeLength(trimmed) < MIN_CODE_LENGTH || trimmed === lastSearchedRef.current) return;
		const timer = setTimeout(() => void runSearch(trimmed), AUTO_SEARCH_DELAY_MS);
		return () => clearTimeout(timer);
	}, [reference, isDirty, runSearch]);

	function submit(event: FormEvent) {
		event.preventDefault();
		if (!reference.trim()) return focusInput();
		if (isDirty && !window.confirm("You have unsaved changes for the current ticket. Discard them?")) return;
		void runSearch(reference);
	}

	async function save() {
		if (!lookup) return;
		setSaving(true);
		try {
			const body: PickupSaveRequest = {
				reference: lookup.order.reference,
				updates: changes.map((item) => ({
					orderId: item.orderId,
					itemId: item.itemId,
					collectedQuantity: draft[itemKey(item)] ?? 0,
				})),
				notes: notesChanged ? notes : undefined,
				shownOrderIds: lookup.orders.map((order) => order.id),
			};
			load(await request<PickupLookup>(apiUrl, { method: "POST", body: JSON.stringify(body) }), true);
			notifications.show({ color: "green", title: "Saved", message: `${lookup.user.username} updated.` });
			focusInput();
		} catch (err) {
			notifications.show({
				color: "red",
				title: "Couldn't save",
				message: err instanceof Error ? err.message : String(err),
			});
		} finally {
			setSaving(false);
		}
	}

	function setCollected(item: PickupItem, count: number) {
		setDraft((current) => ({ ...current, [itemKey(item)]: Math.min(Math.max(count, 0), item.quantity) }));
	}

	function tickEverything() {
		setDraft((current) => {
			const next = { ...current };
			for (const order of lookup?.orders ?? []) {
				if (!isPaid(order)) continue;
				for (const item of order.items) next[itemKey(item)] = item.quantity;
			}
			return next;
		});
	}

	const searchedTickets = lookup?.order.items.filter((item) => item.productType === "ticket") ?? [];
	const ticketCount = searchedTickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
	const ticketLabels = [...new Set(searchedTickets.map((ticket) => ticket.variantLabel).filter(Boolean))];

	return (
		<Box className={styles.screen}>
			<Group className={styles.topBar} justify="space-between" wrap="nowrap">
				<Title order={2} className={styles.heading}>
					Ticket Pickup{lookup?.event ? ` — ${lookup.event.shortName}` : ""}
				</Title>
				<Group gap="xs" wrap="nowrap">
					<Tooltip label={isFullscreen ? "Exit full screen" : "Full screen"}>
						<ActionIcon
							variant="subtle"
							size="lg"
							onClick={toggleFullscreen}
							aria-label="Toggle full screen"
						>
							{isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
						</ActionIcon>
					</Tooltip>
					<Tooltip label="Leave pickup desk">
						<ActionIcon
							component="a"
							href={exitHref}
							variant="subtle"
							color="gray"
							size="lg"
							aria-label="Leave pickup desk"
							onClick={(event) => {
								if (!window.confirm("Leave the ticket pickup desk?")) event.preventDefault();
							}}
						>
							<LogOut size={18} />
						</ActionIcon>
					</Tooltip>
				</Group>
			</Group>

			<Stack className={styles.content} gap="lg">
				<form onSubmit={submit}>
					<Stack gap="xs">
						<Group gap="sm" wrap="nowrap" align="stretch">
							<TextInput
								style={{ flex: 1 }}
								ref={inputRef}
								value={reference}
								onChange={(event) => setReference(event.currentTarget.value.toUpperCase())}
								onKeyDown={(event) => {
									if (event.key === "Escape") clear();
								}}
								placeholder="T-XXXXXXXXX or ORD-XXXXXXXXXX"
								aria-label="Ticket ID"
								autoComplete="off"
								autoCorrect="off"
								spellCheck={false}
								size="xl"
								styles={{
									input: {
										height: 96,
										fontSize: 56,
										fontFamily: "var(--mantine-font-family-monospace)",
										textAlign: "center",
										letterSpacing: "0.08em",
									},
								}}
								rightSectionWidth={56}
								rightSection={
									reference ? (
										<ActionIcon
											variant="subtle"
											color="gray"
											size="xl"
											onClick={clear}
											aria-label="Clear"
										>
											<X size={28} />
										</ActionIcon>
									) : null
								}
							/>
							<Button
								type="submit"
								color="green"
								style={{ width: 96, height: 96, padding: 0, flexShrink: 0 }}
								loading={loading}
								aria-label="Search"
								title="Search"
							>
								<Search size={36} />
							</Button>
						</Group>
						<Text size="sm" c={isDirty ? "yellow" : "dimmed"} ta="center">
							{isDirty
								? "Unsaved ticks below — save them first, or press Enter to search anyway."
								: "Type the ticket ID; it searches automatically (or press Enter / Search). The prefix (T- / ORD-) is optional. Esc clears."}
						</Text>
					</Stack>
				</form>

				{error && (
					<Alert color="red" variant="filled" className={styles.error}>
						<Text size="xl" fw={700}>
							{error}
						</Text>
					</Alert>
				)}

				{lookup && (
					<Paper withBorder radius="lg" className={styles.card}>
						<StatusBanner order={lookup.order} justSaved={justSaved} />
						<Stack gap="lg" p="xl">
							<Stack gap={0} align="center">
								<Text className={styles.name} fz={64} fw={800} lh={1.1} ta="center">
									{lookup.user.username}
								</Text>
								{lookup.user.name && (
									<Text size="xl" c="dimmed">
										{lookup.user.name}
									</Text>
								)}
								{lookup.event && (
									<Text size="sm" c="dimmed" mt={4}>
										{lookup.event.name}
									</Text>
								)}
							</Stack>

							{searchedTickets.length > 0 ? (
								<Stack gap={0} align="center">
									<Text size="xl">Number of tickets</Text>
									<Text fz={120} fw={800} lh={1}>
										{ticketCount}
									</Text>
									{ticketLabels.length > 0 && <Text size="xl">{ticketLabels.join(", ")}</Text>}
								</Stack>
							) : (
								<Alert color="yellow" variant="light">
									The searched order doesn't contain a ticket.
								</Alert>
							)}

							<Stack gap="md">
								<Text fw={700} size="lg">
									{lookup.orders.length > 1
										? `Orders to pick up (${lookup.orders.length})`
										: "Order to pick up"}
								</Text>
								{lookup.orders.map((order) => (
									<OrderSection key={order.id} order={order} draft={draft} onChange={setCollected} />
								))}
							</Stack>

							<Textarea
								label={`Notes (${lookup.order.reference})`}
								value={notes}
								onChange={(event) => setNotes(event.currentTarget.value)}
								autosize
								minRows={2}
							/>

							<Group justify="space-between">
								<Button variant="default" size="lg" onClick={tickEverything}>
									Tick everything
								</Button>
								<Button size="xl" onClick={save} loading={saving} disabled={!isDirty}>
									Mark as taken
								</Button>
							</Group>
						</Stack>
					</Paper>
				)}
			</Stack>
		</Box>
	);
}
