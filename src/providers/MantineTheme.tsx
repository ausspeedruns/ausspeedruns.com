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

export const theme = createTheme({
	colors: {
		ausSpeedrunsOrange,
	},
	primaryColor: "ausSpeedrunsOrange",
	defaultRadius: "xs",
	fontFamily: "Poppins, sans-serif",
});
