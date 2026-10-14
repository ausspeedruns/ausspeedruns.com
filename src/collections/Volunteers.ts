import type { CollectionBeforeDeleteHook, CollectionBeforeValidateHook, CollectionConfig } from "payload";

import type { Volunteer } from "#/payload-types";
import { authenticated } from "#access/authenticated.ts";
import { manageContentField } from "#access/field/manageContentField.ts";
import { isContentManager, relationId } from "#access/helpers.ts";
import { ownDocOrManageContent } from "#access/ownDocOrManageContent.ts";
import { forbidden, loadEventSettings } from "#hooks/eventGating.ts";

const hasRole =
	(role: Volunteer["role"][number]) =>
	(data: Partial<Volunteer> | undefined): boolean =>
		Array.isArray(data?.role) && data.role.includes(role);

/**
 * Non-staff users may only apply for themselves, once per event, while the event is accepting volunteers,
 * and may only edit their application while it is still pending.
 * Requests without a user (trusted server code / scripts) are not gated.
 */
const enforceVolunteerRules: CollectionBeforeValidateHook<Volunteer> = async ({
	data,
	req,
	operation,
	originalDoc,
}) => {
	if (!data || !req.user || req.user.collection !== "users") return data;
	if (await isContentManager(req)) return data;

	if (operation === "create") {
		data.volunteer = req.user.id;
		data.status = "pending";

		const settings = await loadEventSettings(req, data.event);
		if (!settings) forbidden("An event must be selected.");
		if (!settings.isAcceptingVolunteers) forbidden("This event is not accepting volunteers.");

		const existing = await req.payload.count({
			collection: "volunteers",
			where: {
				and: [{ volunteer: { equals: req.user.id } }, { event: { equals: relationId(data.event) } }],
			},
			overrideAccess: true,
			req,
		});
		if (existing.totalDocs > 0) {
			forbidden("You have already applied to volunteer at this event. Edit your existing application instead.");
		}

		return data;
	}

	if (operation === "update" && originalDoc) {
		if (originalDoc.status && originalDoc.status !== "pending") {
			forbidden("This application has already been reviewed and can no longer be edited.");
		}

		const settings = await loadEventSettings(req, originalDoc.event);
		if (!settings?.isAcceptingVolunteers) {
			forbidden("This event is no longer accepting volunteer changes.");
		}

		data.volunteer = relationId(originalDoc.volunteer) ?? undefined;
		data.event = relationId(originalDoc.event) ?? undefined;
		data.status = originalDoc.status;
	}

	return data;
};

const preventReviewedDeletion: CollectionBeforeDeleteHook = async ({ req, id }) => {
	if (!req.user || (await isContentManager(req))) return;

	const application = await req.payload.findByID({
		collection: "volunteers",
		id,
		depth: 0,
		overrideAccess: true,
		req,
	});

	if (application.status && application.status !== "pending") {
		forbidden("This application has already been reviewed. Please contact the event staff to withdraw it.");
	}
};

export const Volunteers: CollectionConfig<"volunteers"> = {
	slug: "volunteers",
	labels: {
		singular: "Volunteer Application",
		plural: "Volunteer Applications",
	},
	admin: {
		useAsTitle: "title",
		defaultColumns: ["title", "volunteer", "event", "role", "status"],
		group: "Event Management",
	},
	access: {
		create: authenticated,
		delete: ownDocOrManageContent("volunteer"),
		read: ownDocOrManageContent("volunteer"),
		update: ownDocOrManageContent("volunteer"),
	},
	hooks: {
		beforeValidate: [enforceVolunteerRules],
		beforeDelete: [preventReviewedDeletion],
		beforeChange: [
			async ({ data, req, originalDoc }) => {
				const volunteerId = relationId(data.volunteer ?? originalDoc?.volunteer);
				const eventId = relationId(data.event ?? originalDoc?.event);

				const [user, event] = await Promise.all([
					volunteerId
						? req.payload
								.findByID({ collection: "users", id: volunteerId, depth: 0, overrideAccess: true, req, select: { username: true } })
								.catch(() => null)
						: null,
					eventId
						? req.payload
								.findByID({ collection: "events", id: eventId, depth: 0, overrideAccess: true, req, select: { shortName: true } })
								.catch(() => null)
						: null,
				]);

				data.title = [user?.username, event?.shortName].filter(Boolean).join(" — ") || "Volunteer application";
				return data;
			},
		],
	},
	fields: [
		{
			name: "title",
			type: "text",
			admin: { hidden: true },
		},
		{
			name: "volunteer",
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
			defaultValue: "pending",
			options: [
				{ label: "Pending", value: "pending" },
				{ label: "Accepted", value: "accepted" },
				{ label: "Rejected", value: "rejected" },
			],
			access: {
				create: manageContentField,
				update: manageContentField,
			},
			admin: { position: "sidebar" },
		},
		{
			name: "role",
			type: "select",
			required: true,
			hasMany: true,
			options: [
				{ label: "Front Desk / Runner Management", value: "frontDesk" },
				{ label: "Host", value: "host" },
				{ label: "Tech", value: "tech" },
				{ label: "Stage Hand", value: "stageHand" },
			],
		},
		{
			name: "availability",
			type: "array",
			fields: [
				{
					name: "time",
					type: "text",
				},
			],
		},
		{
			name: "maximumTime",
			type: "number",
			min: 0,
			admin: { description: "Maximum total hours the volunteer is willing to work across the event." },
		},
		{
			type: "collapsible",
			label: "Host",
			admin: { condition: (data) => hasRole("host")(data) },
			fields: [
				{
					name: "maxDailyHostTime",
					type: "number",
					min: 0,
					admin: { description: "Maximum hours per day." },
				},
				{
					name: "hostSpecificGame",
					type: "text",
				},
				{
					name: "hostSpecificRunner",
					type: "text",
				},
				{
					name: "hostOtherInformation",
					type: "textarea",
				},
			],
		},
		{
			type: "collapsible",
			label: "Tech",
			admin: { condition: (data) => hasRole("tech")(data) },
			fields: [
				{
					name: "techExperience",
					type: "textarea",
				},
			],
		},
	],
};
