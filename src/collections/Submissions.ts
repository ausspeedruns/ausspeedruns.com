import type { CollectionBeforeDeleteHook, CollectionBeforeValidateHook, CollectionConfig } from "payload";

import type { Submission } from "#/payload-types";
import { authenticated } from "#access/authenticated.ts";
import { manageContentField } from "#access/field/manageContentField.ts";
import { isContentManager, relationId } from "#access/helpers.ts";
import { ownDocOrManageContent } from "#access/ownDocOrManageContent.ts";
import { validateEstimate, validateUrl } from "#fields/validators.ts";
import { forbidden, loadEventSettings } from "#hooks/eventGating.ts";

/**
 * Non-staff users may only create/edit their own submissions, only while the event is accepting
 * submissions (or backups), and only while the submission is still pending review.
 * Requests without a user (trusted server code / scripts) are not gated.
 */
const enforceSubmissionRules: CollectionBeforeValidateHook<Submission> = async ({
	data,
	req,
	operation,
	originalDoc,
}) => {
	if (!data || !req.user || req.user.collection !== "users") return data;
	if (await isContentManager(req)) return data;

	if (operation === "create") {
		data.runner = req.user.id;
		data.status = "pending";

		const settings = await loadEventSettings(req, data.event);
		if (!settings) forbidden("An event must be selected.");

		if (!settings.isAcceptingSubmissions) {
			if (!settings.isAcceptingBackups) forbidden("This event is not accepting submissions.");
			data.canBackup = true;
		}

		return data;
	}

	if (operation === "update" && originalDoc) {
		if (originalDoc.status !== "pending") {
			forbidden("This submission has already been reviewed and can no longer be edited.");
		}

		const settings = await loadEventSettings(req, originalDoc.event);
		if (!settings?.isAcceptingSubmissions && !settings?.isAcceptingBackups) {
			forbidden("This event is no longer accepting submission changes.");
		}

		// Ownership, event and review status are immutable for runners
		data.runner = relationId(originalDoc.runner) ?? undefined;
		data.event = relationId(originalDoc.event) ?? undefined;
		data.status = originalDoc.status;
	}

	return data;
};

const preventReviewedDeletion: CollectionBeforeDeleteHook = async ({ req, id }) => {
	if (!req.user || (await isContentManager(req))) return;

	const submission = await req.payload.findByID({
		collection: "submissions",
		id,
		depth: 0,
		overrideAccess: true,
		req,
	});

	if (submission.status !== "pending") {
		forbidden("This submission has already been reviewed. Please contact the event staff to withdraw it.");
	}
};

export const Submissions: CollectionConfig<"submissions"> = {
	slug: "submissions",
	admin: {
		useAsTitle: "game",
		defaultColumns: ["game", "category", "runner", "event", "status", "createdAt"],
		listSearchableFields: ["game", "category", "platform"],
		group: "Event Management",
	},
	access: {
		create: authenticated,
		delete: ownDocOrManageContent("runner"),
		read: ownDocOrManageContent("runner"),
		update: ownDocOrManageContent("runner"),
	},
	hooks: {
		beforeValidate: [enforceSubmissionRules],
		beforeDelete: [preventReviewedDeletion],
	},
	fields: [
		{
			name: "runner",
			type: "relationship",
			relationTo: "users",
			required: true,
			index: true,
		},
		{
			name: "event",
			type: "relationship",
			relationTo: "events",
			required: true,
			index: true,
		},
		{
			name: "status",
			type: "select",
			required: true,
			index: true,
			options: [
				{ label: "Pending", value: "pending" },
				{ label: "Accepted", value: "accepted" },
				{ label: "Rejected", value: "rejected" },
				{ label: "Backup", value: "backup" },
			],
			defaultValue: "pending",
			access: {
				create: manageContentField,
				update: manageContentField,
			},
			admin: {
				position: "sidebar",
			},
		},
		{
			name: "runs",
			type: "join",
			collection: "runs",
			on: "submission",
			admin: {
				description: "Scheduled run(s) created from this submission.",
			},
		},
		{
			name: "game",
			type: "text",
			required: true,
		},
		{
			name: "ageRating",
			type: "select",
			options: [
				{ label: "G, PG or M", value: "m_or_lower" },
				{ label: "MA15+", value: "ma15" },
				{ label: "R18+", value: "r18" },
			],
		},
		{
			name: "category",
			type: "text",
			required: true,
		},
		{
			type: "row",
			fields: [
				{
					name: "platform",
					type: "text",
					required: true,
				},
				{
					name: "techPlatform",
					type: "text",
					admin: {
						description: "The platform the game will actually run on, if different (e.g. emulator, PC).",
					},
				},
			],
		},
		{
			type: "row",
			fields: [
				{
					name: "estimate",
					type: "text",
					required: true,
					validate: validateEstimate,
					admin: { placeholder: "HH:MM:SS" },
				},
				{
					name: "possibleEstimate",
					type: "text",
					validate: validateEstimate,
					admin: { placeholder: "HH:MM:SS", description: "A lower estimate the runner could do." },
				},
			],
		},
		{
			name: "possibleEstimateReason",
			type: "text",
		},
		{
			name: "specialRequirements",
			type: "textarea",
		},
		{
			name: "donationIncentives",
			type: "json",
			validate: (value: unknown) =>
				value === null || value === undefined || Array.isArray(value) || "Donation incentives must be a list.",
		},
		{
			name: "raceType",
			type: "select",
			options: [
				{ label: "No Race", value: "noRace" },
				{ label: "Possible Solo", value: "solo" },
				{ label: "Only Race/Coop", value: "only" },
			],
			defaultValue: "noRace",
		},
		{
			name: "racer",
			type: "text",
			admin: {
				condition: (_, siblingData) => siblingData?.raceType && siblingData.raceType !== "noRace",
			},
		},
		{
			name: "isCoop",
			type: "checkbox",
		},
		{
			name: "video",
			type: "text",
			validate: validateUrl,
		},
		{
			name: "availability",
			type: "json",
		},
		{
			name: "canBackup",
			type: "checkbox",
		},
		// TODO: Remove this field after migration is complete
		{
			name: "legacyKeystoneId",
			type: "text",
			unique: true,
			admin: { readOnly: true, position: "sidebar" },
		},
	],
};
