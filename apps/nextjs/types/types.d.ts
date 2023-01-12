export type AusSpeedrunsEvent = {
	fullName: string,
	preferredName: string,
	shortName: string,
	dates: string,
	startDate?: string,
	total?: string,
	charity?: {
		name: string,
		logo?: string,
		url?: string
	},
	submissionFormUrl?: string,
	website?: string,
	logo?: string,
	heroImage?: string,
}

export type EventsLineUp = {
	previous: AusSpeedrunsEvent,
	current: AusSpeedrunsEvent,
	next: AusSpeedrunsEvent,
	oldEvents: {
		[key: string]: AusSpeedrunsEvent
	}
}

export type Globals = {
	events: EventsLineUp,
	donateLink: string,
	scheduleLink: string,
	incentivesLink: string,
	socialLinks: {
		[key: string]: string
	}
}