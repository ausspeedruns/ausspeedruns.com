import { z } from "zod";

export const BaseIncentiveData = z.object({
	id: z.union([z.string(), z.number()]),
	type: z.string(),
	title: z.string(),
	isActive: z.boolean(),
	notes: z.string().optional(),
	run: z.object({
		game: z.string(),
		category: z.string(),
		scheduledTime: z.string(),
	}),
	data: z.record(z.string(), z.unknown()),
});

export const War = BaseIncentiveData.extend({
	type: z.literal("war"),
	data: z.object({
		options: z.array(
			z.object({
				name: z.string(),
				total: z.number(),
			}),
		),
	}),
});

export const Goal = BaseIncentiveData.extend({
	type: z.literal("goal"),
	data: z.object({
		goal: z.number(),
		current: z.number(),
	}),
});
