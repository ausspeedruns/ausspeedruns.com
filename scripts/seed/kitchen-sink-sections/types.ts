export type KitchenSinkId = number | string;

export type KitchenSinkMediaItem = {
	id: KitchenSinkId;
};

export type KitchenSinkPost = {
	id: KitchenSinkId;
};

export type KitchenSinkLayoutBlock = Record<string, any>;

export type KitchenSinkSectionContext = {
	now: Date;
	mediaItems: KitchenSinkMediaItem[];
	img: (index: number) => KitchenSinkId | undefined;
	/** Soonest event that hasn't started yet, falling back to any event. */
	upcomingEventId?: KitchenSinkId;
	/** Most recent event that has started, falling back to any event. */
	pastEventId?: KitchenSinkId;
	/** Runs from the past event that have a YouTube VOD. */
	vodRunIds: KitchenSinkId[];
	productIds: KitchenSinkId[];
	categoryIds: KitchenSinkId[];
	formId?: KitchenSinkId;
	posts: KitchenSinkPost[];
};
