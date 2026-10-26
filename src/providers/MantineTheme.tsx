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
  '#ebf8fc',
  '#dfebf0',
  '#bed5dd',
  '#9bbecb',
  '#7eabbb',
  '#6a9fb2',
  '#5f99ae',
  '#4d8599',
  '#437c90',
  '#2c677a'
];

export const theme = createTheme({
	colors: {
		ausSpeedrunsOrange,
		ausSpeedrunsBlue,
	},
	primaryColor: "ausSpeedrunsOrange",
	defaultRadius: "xs",
	radius: {
		xs: "0",
	},
	fontFamily: "Poppins, sans-serif",
	components: {
		Card: {
			styles: {
				root: {
					backgroundColor: "var(--card-background)"
				}
			}
		}
	},
});
