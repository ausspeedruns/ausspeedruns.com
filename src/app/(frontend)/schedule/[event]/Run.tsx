import { Badge, Box, Group, Stack, Text, Title } from "@mantine/core";
import type { Block, Run } from "./scheduleTypes";
import styles from "./Run.module.css";
import clsx from "clsx";

import ConsoleIcon from "./icons/console.svg";
import RunnerIcon from "./icons/runner.svg";
import EstimateIcon from "./icons/stopwatch.svg";
// import PaidIcon from "@mui/icons-material/Paid";
import { Runners } from "./Runners";
import { formatScheduleTime } from "./time";

interface RunItemProps {
	run: Run;
	showLocalTime: boolean;
	eventTimezone: string;
	isLive?: boolean;
	block?: Block;
	/** Rendered inside a BlockGroup, which shows the block name once */
	inBlockGroup?: boolean;
	style?: React.CSSProperties;
}

function CategoryBadge({ label, block }: { label: string; block?: Block }) {
	return (
		<Badge
			size="lg"
			radius="md"
			color={block?.colour ?? "var(--colour-accent)"}
			style={block && { border: "3px solid #fff" }}
		>
			{label}
		</Badge>
	);
}

export function RunElement(props: RunItemProps) {
	const { run } = props;

	const convertedTimezone = formatScheduleTime(run.scheduledTime, props.eventTimezone, props.showLocalTime, "h:mm a");

	const minorStyle = props.block
		? { background: `color-mix(in srgb, ${props.block.colour} 30%, transparent)` }
		: undefined;

	if (run.type === "setupBuffer") {
		return (
			<Text
				className={styles.setupBuffer}
				key={run.id}
				ta="center"
				fs="italic"
				fz="xl"
				p="xs"
				mt={4}
				style={minorStyle}
			>
				{parseInt(run.estimate.split(":")[1] ?? "0", 10)} min Setup Buffer
			</Text>
		);
	}

	if (run.type === "segment") {
		const hasPeople = run.runners.length > 0 || (run.otherRunners?.length ?? 0) > 0;
		return (
			<Box
				className={clsx(styles.segment, props.isLive && styles.liveRun)}
				key={run.id}
				id={run.id.toString()}
				px="md"
				py="xs"
				mt={4}
				fz="lg"
				style={{
					background: run.segmentType?.colour ?? undefined,
					color: run.segmentType?.textColour ?? undefined,
				}}
			>
				<Text span inherit fw={700} tt="uppercase" className={styles.noWrap}>
					{convertedTimezone}
				</Text>
				<Badge variant="outline" color="currentColor" size="lg" radius="md" className={styles.segmentType}>
					{run.segmentType?.name ?? "Segment"}
				</Badge>
				<Text span inherit fw={700} className={styles.balance}>
					{run.category || run.segmentType?.name}
				</Text>
				{hasPeople && (
					<Text span inherit fs="italic">
						<Runners runners={run.runners} others={run.otherRunners} />
					</Text>
				)}
			</Box>
		);
	}

	if (run.type === "sleep" || run.type === "other") {
		return (
			<Text
				className={styles.setupBuffer}
				key={run.id}
				ta="center"
				fs="italic"
				fz="xl"
				p="xs"
				mt={4}
				style={minorStyle}
			>
				{convertedTimezone} — {run.category || (run.type === "sleep" ? "Overnight break" : run.game)}
			</Text>
		);
	}

	let categoryExtras: React.ReactNode = null;
	if (run.race) categoryExtras = <CategoryBadge label="RACE" block={props.block} />;
	if (run.coop) categoryExtras = <CategoryBadge label="CO-OP" block={props.block} />;

	const estimateSplit = run.estimate.split(":");
	const hours = parseInt(estimateSplit[0]);
	const minutes = parseInt(estimateSplit[1]);
	const formattedHours = hours.toString();
	const formattedMinutes = minutes.toString().padStart(2, "0");
	const estimateText = `${formattedHours}:${formattedMinutes}:00`;

	const isOdd = run.displayIndex % 2 != 0;
	// Alternate shades inside a block so neighbouring runs are still distinguishable
	const blockBackground = props.block
		? props.inBlockGroup && isOdd
			? `color-mix(in srgb, ${props.block.colour} 82%, black)`
			: props.block.colour
		: undefined;

	return (
		<Stack
			className={clsx(styles.run, props.isLive && styles.liveRun)}
			key={run.id}
			align="center"
			gap={0}
			mt={4}
			fz="lg"
			style={
				{
					background: blockBackground,
					color: props.block?.textColour,
					...(props.block ? { "--colour-accent": props.block.textColour } : {}),
					...props.style,
				} as React.CSSProperties
			}
			id={run.id.toString()}
			run-odd={`${run.displayIndex % 2 != 0}`}
		>
			<Text
				span
				fz="xl"
				fw={700}
				tt="uppercase"
				p="xs"
				className={styles.time}
				style={props.block && { background: "white", color: "black" }}
			>
				{convertedTimezone}
			</Text>
			{props.block?.name && !props.inBlockGroup && (
				<Text span fz="xl" fw={700} p="xs" className={styles.blockName}>
					{props.block?.name}
				</Text>
			)}
			<Title
				order={3}
				className={styles.game}
				ff="Jersey10, sans-serif"
				fz="200%"
				fw="normal"
				lh={1}
				ta="center"
				textWrap="balance"
			>
				{run.game}
			</Title>
			<Group
				className={styles.category}
				gap="sm"
				justify="center"
				fz="xl"
				fw={700}
				p={4}
				mt={2}
				mb="xs"
				style={{ color: props.block?.textColour }}
			>
				{run.type === "medley" ? (
					<>
						<CategoryBadge label="MEDLEY" block={props.block} />
						<span>
							{run.children?.length ?? 0} {run.children?.length === 1 ? "game" : "games"}
						</span>
					</>
				) : (
					<>
						{categoryExtras}
						<span>{run.category}</span>
					</>
				)}
			</Group>
			<div className={styles.metaData} style={{ color: props.block?.textColour }}>
				<Group gap="xs" wrap="nowrap" justify="flex-end" ta="center" className={styles.balance}>
					<RunnerIcon />
					<Runners runners={run.runners} others={run.otherRunners} />
				</Group>
				<Group gap="xs" wrap="nowrap">
					<EstimateIcon />
					{estimateText}
				</Group>
				<Group gap="xs" wrap="nowrap">
					<ConsoleIcon />
					{run.platform}
				</Group>
			</div>
			{run.donationIncentives && run.donationIncentives.length > 0 && (
				<Stack
					className={styles.donationIncentives}
					align="center"
					gap={0}
					mt="md"
					p="xs"
					style={{ color: props.block?.textColour, borderColor: props.block && "white" }}
				>
					{/* <PaidIcon /> Incentives */}
					{run.donationIncentives?.map((incentive) => (
						<Text span inherit fs="italic" fw={700} key={incentive.id}>
							{incentive.title}
						</Text>
					))}
				</Stack>
			)}
			{run.type === "medley" && run.children && run.children.length > 0 && (
				<Box
					component="details"
					className={styles.medleyGames}
					w="100%"
					mt="md"
					style={{ color: props.block?.textColour }}
				>
					<Text component="summary" inherit fw={700} ta="center">
						Show games
					</Text>
					<Stack component="ol" gap={4} p={0} m={0} mt="xs">
						{run.children.map((child) => (
							<Box component="li" key={child.id} className={styles.medleyGame} px="sm" py={6}>
								<Text span fz="md" fw={700} className={styles.noWrap}>
									{child.scheduledTime
										? `~${formatScheduleTime(child.scheduledTime, props.eventTimezone, props.showLocalTime, "h:mm a")}`
										: ""}
								</Text>
								<Stack gap={0}>
									<strong>{child.game}</strong>
									<span>
										{child.race && "RACE · "}
										{child.coop && "CO-OP · "}
										{child.category}
									</span>
								</Stack>
								<Stack gap={0} fz="md" className={styles.medleyGameMeta}>
									<Runners runners={child.runners} others={child.otherRunners} />
									<span>
										{formatEstimate(child.estimate)} · {child.platform}
									</span>
									{child.donationIncentives.map((incentive) => (
										<em key={incentive.id}>{incentive.title}</em>
									))}
								</Stack>
							</Box>
						))}
					</Stack>
				</Box>
			)}
		</Stack>
	);
}

function formatEstimate(estimate: string): string {
	const [hours = "0", minutes = "0"] = estimate.split(":");
	return `${parseInt(hours, 10)}:${minutes.padStart(2, "0")}`;
}
