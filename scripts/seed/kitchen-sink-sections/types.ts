export type KitchenSinkId = number | string;

export type KitchenSinkMediaItem = {
	id: KitchenSinkId;
};

export type KitchenSinkPost = {
	id: KitchenSinkId;
};

export type KitchenSinkLayoutBlock = Record<string, any>;
export type KitchenSinkHeroData = Record<string, any>;

export type KitchenSinkSectionContext = {
	mediaItems: KitchenSinkMediaItem[];
	img: (index: number) => KitchenSinkId | undefined;
	eventId?: KitchenSinkId;
	formId?: KitchenSinkId;
	posts: KitchenSinkPost[];
};
