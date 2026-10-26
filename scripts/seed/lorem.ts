const WORDS = [
	"lorem",
	"ipsum",
	"dolor",
	"sit",
	"amet",
	"consectetur",
	"adipiscing",
	"elit",
	"sed",
	"do",
	"eiusmod",
	"tempor",
	"incididunt",
	"ut",
	"labore",
	"et",
	"dolore",
	"magna",
	"aliqua",
	"enim",
	"ad",
	"minim",
	"veniam",
	"quis",
	"nostrud",
	"exercitation",
	"ullamco",
	"laboris",
	"nisi",
	"aliquip",
	"ex",
	"ea",
	"commodo",
	"consequat",
	"duis",
	"aute",
	"irure",
	"in",
	"reprehenderit",
	"voluptate",
	"velit",
	"esse",
	"cillum",
	"fugiat",
	"nulla",
	"pariatur",
	"excepteur",
	"sint",
	"occaecat",
	"cupidatat",
	"non",
	"proident",
	"sunt",
	"culpa",
	"qui",
	"officia",
	"deserunt",
	"mollit",
	"anim",
	"id",
	"est",
	"laborum",
	"curabitur",
	"pretium",
	"tincidunt",
	"lacus",
	"nunc",
	"pulvinar",
	"sapien",
	"ligula",
	"vestibulum",
	"viverra",
	"maecenas",
	"accumsan",
	"felis",
	"porttitor",
	"vivamus",
	"fermentum",
	"nibh",
	"mauris",
	"aenean",
	"faucibus",
	"suspendisse",
	"potenti",
	"integer",
	"vulputate",
	"morbi",
	"tristique",
	"senectus",
	"netus",
	"fames",
	"turpis",
	"egestas",
	"praesent",
	"sagittis",
	"massa",
	"phasellus",
	"volutpat",
	"blandit",
	"aliquam",
];

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Deterministic lorem ipsum generator. The same seed always yields the same
 * sequence, so re-running the seed produces identical content.
 */
export function createLorem(seed: number) {
	let state = (seed * 2654435761) >>> 0 || 1;

	const next = () => {
		// xorshift32
		state ^= state << 13;
		state ^= state >>> 17;
		state ^= state << 5;
		state >>>= 0;
		return state;
	};

	const int = (min: number, max: number) => min + (next() % (max - min + 1));

	const words = (count: number) => Array.from({ length: count }, () => WORDS[next() % WORDS.length]).join(" ");

	const title = (count = 3) => words(count).split(" ").map(capitalise).join(" ");

	/** Capitalised words without trailing punctuation, for the start of a sentence that continues in another node. */
	const phrase = (count: number) => capitalise(words(count));

	const sentence = (count = int(8, 16)) => `${phrase(count)}.`;

	const paragraph = (sentences = int(3, 5)) => Array.from({ length: sentences }, () => sentence()).join(" ");

	const items = (count: number, wordsPerItem = int(3, 7)) =>
		Array.from({ length: count }, () => capitalise(words(wordsPerItem)));

	const question = (count = int(5, 9)) => `${capitalise(words(count))}?`;

	return { int, words, phrase, title, sentence, paragraph, items, question };
}

/** The classic opening line, for places where the first thing a reader sees should be recognisably placeholder text. */
export const LOREM_OPENING = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
