import { createTheme, type MantineColorsTuple } from "@mantine/core";

const ausSpeedrunsOrange: MantineColorsTuple = [
	"#fff4e6",
	"#fae7d4",
	"#f1cdaa",
	"#e8b27c",
	"#e19b55",
	"#dd8c3c",
	"#db842e",
	"#cc7722",
	"#ae6419",
	"#98550e",
];

const ausSpeedrunsBlue: MantineColorsTuple = [
	"#ebf8fc",
	"#dfebf0",
	"#bed5dd",
	"#9bbecb",
	"#7eabbb",
	"#6a9fb2",
	"#5f99ae",
	"#4d8599",
	"#437c90",
	"#2c677a",
];

// Navy-tinted replacement for Mantine's neutral grey dark palette so surfaces match the navy body.
// 0 text, 2 dimmed, 3 placeholder, 4 borders, 5 hover, 6 cards/inputs, 9 = body.
const dark: MantineColorsTuple = [
	"#d5dbe5",
	"#b4bdcc",
	"#8a96aa",
	"#6e7b93",
	"#334159",
	"#243149",
	"#18223a",
	"#0f172a",
	"#0a1020",
	"#03070f",
];

// Cool slate greys to match the light body; 6 (dimmed) is darkened to pass AA on the body.
const gray: MantineColorsTuple = [
	"#f6f8fa",
	"#edf1f5",
	"#e2e8ee",
	"#d3dbe4",
	"#bfc9d4",
	"#9aa6b4",
	"#5f6b7b",
	"#4a5565",
	"#323b48",
	"#1d232d",
];

export const theme = createTheme({
	colors: {
		ausSpeedrunsOrange,
		ausSpeedrunsBlue,
		dark,
		gray,
	},
	primaryColor: "ausSpeedrunsOrange",
	defaultRadius: "xs",
	radius: {
		xs: "0",
	},
	fontFamily: "Poppins, sans-serif",
});
