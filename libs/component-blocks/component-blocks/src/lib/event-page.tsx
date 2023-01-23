import styled from "@emotion/styled";
import {
	NotEditable,
	component,
	fields,
	InferRenderersForComponentBlocks,
} from "@keystone-6/fields-document/component-blocks";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
	faArrowRight,
	faTicket,
	faCalendar,
	faPerson,
	faShirt,
	IconName,
	fas,
} from "@fortawesome/free-solid-svg-icons";

library.add(fas);

interface HeaderProps {
	image: string;
	position: string;
	cover: boolean;
	repeat: string;
}

const Button = styled.a`
	display: block;
`;

const HeaderContainer = styled.div<HeaderProps>`
	background-image: url("${(props) => props.image}");
	background-position: ${(props) => props.position};
	background-size: ${(props) => (props.cover ? "cover" : "contain")};
	background-repeat: ${(props) => props.repeat};
	box-shadow: inset 0 0 20px 0px black;
	background-color: #024759;
	width: 100%;
	min-height: 25rem;

	display: flex;
	justify-content: center;
	flex-direction: column;
	align-items: center;
	gap: 16px;
`;

const HeaderLogo = styled.div`
	width: 700px;
	height: auto;
`;

const ButtonContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
`;

const ImageParagraphContainer = styled.div`
	width: 100%;
	display: flex;
	height: 30rem;
`;

const ImageContainer = styled.div`
	position: relative;
	width: 50%;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
`;

const ParagraphContainer = styled.div`
	width: 50%;
	text-align: center;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	h2 {
		font-size: 1.2rem;
	}

	p {
		font-size: 1rem;
		width: 80%;
	}
`;

const InfoTableContainer = styled.div`
	box-shadow: inset 0 0 20px 0px black;
	background-color: $color-off-white;
	height: 30rem;
	width: 100%;

	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;

	font-size: 1.3rem;

	h3 {
		font-size: 1.8rem;
	}

	.information {
	}
`;

const InformationTable = styled.table`
	td:nth-of-type(odd) {
		font-weight: bold;
	}

	td:nth-of-type(even) {
		text-align: right;
	}
`;

const SoloImage = styled.img`
	width: 100%;
	object-fit: cover;
`;

const EventLogo = styled.img`
	max-width: 50%;
	max-height: 5rem;
	object-fit: contain;
`;

const AmountRaisedValue = styled.span`
	font-weight: bold;
	font-size: 2rem;
`;

const AmountRaisedImage = styled.img`
	max-height: 100%;
	max-width: 30%;
	object-fit: contain;
`;

// naming the export componentBlocks is important because the Admin UI
// expects to find the components like on the componentBlocks export
export const EventPageComponentBlocks = {
	header: component({
		preview(props) {
			const openInNewTabProps = {
				target: "_blank",
				rel: "noopener noreferrer",
			};
			return (
				<HeaderContainer
					contentEditable={false}
					image={props.fields.backgroundImage.value}
					position={
						props.fields.backgroundSettings.fields.position.value
					}
					cover={props.fields.backgroundSettings.fields.cover.value}
					repeat={
						props.fields.backgroundSettings.fields.repeat.value
					}>
					{/* <link
						rel="stylesheet"
						href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/solid.min.css"
						integrity="sha512-6mc0R607di/biCutMUtU9K7NtNewiGQzrvWX4bWTeqmljZdJrwYvKJtnhgR+Ryvj+NRJ8+NnnCM/biGqMe/iRA=="
						crossOrigin="anonymous"
						referrerPolicy="no-referrer"
					/> */}
					<HeaderLogo>
						{/* <Image src={props.fields.event?.value?.data?.logo ?? ''} alt="AusSpeedruns At PAX 2022 Logo" /> */}
					</HeaderLogo>
					<ButtonContainer>
						{props.fields.donateLink.value && (
							<Button
								href={props.fields.donateLink.value}
								target="_blank"
								rel="noopener noreferrer">
								Donate
							</Button>
						)}

						{props.fields.event.value?.data
							?.acceptingSubmissions && (
							<Button href="/submit-game">
								Submissions are open!
							</Button>
						)}

						{props.fields.event.value?.data?.acceptingBackups &&
							!props.fields.event.value?.data
								?.acceptingSubmissions && (
								<Button href="/submit-game">
									Backup submissions are open!
								</Button>
							)}

						{props.fields.ticketLink.value && (
							<Button href={props.fields.ticketLink.value}>
								Purchase tickets
							</Button>
						)}

						{props.fields.event.value?.data?.scheduleReleased && (
							<Button href="/schedule">Schedule</Button>
						)}

						{props.fields.event.value?.data
							?.acceptingVolunteers && (
							<Button href="/volunteers">Be a volunteer!</Button>
						)}

						{props.fields.event.value?.data?.acceptingShirts && (
							<Button href="/store">
								Buy the ASM2023 Shirt! (Limited Time)
							</Button>
						)}

						{/* <Button actionText="Donation Challenges" link="/ASM2022/challenges" iconRight={faArrowRight} /> */}

						<Button
							href={props.fields.charityLink.value}
							target="_blank"
							rel="noopener noreferrer">
							Learn more about Game on Cancer
						</Button>

						{props.fields.buttons.elements.map((button, i) => {
							return (
								<Button
									key={i}
									href={button.fields.link.value}
									{...(button.fields.openInNewTab.value
										? openInNewTabProps
										: undefined)}>
									{button.fields.text.value}
								</Button>
							);
						})}
					</ButtonContainer>
				</HeaderContainer>
			);
		},
		label: "Header",
		schema: {
			event: fields.relationship({
				label: "Event",
				listKey: "Event",
				selection:
					"id acceptingSubmissions acceptingTickets scheduleReleased acceptingVolunteers acceptingBackups acceptingShirts logo { height width url } shortname",
			}),
			backgroundImage: fields.url({ label: "Background Image URL " }),
			backgroundSettings: fields.object({
				position: fields.text({
					label: "Background Position",
					defaultValue: "center",
				}),
				cover: fields.checkbox({
					label: "Background Cover?",
					defaultValue: true,
				}),
				repeat: fields.text({
					label: "Background Repeat",
					defaultValue: "no-repeat",
				}),
			}),
			eventLogoBackup: fields.url({ label: "Event Logo Backup" }),
			donateLink: fields.url({ label: "Donate URL" }),
			charityLink: fields.url({ label: "Charity URL" }),
			ticketLink: fields.text({ label: "Ticket Link" }),
			buttons: fields.array(
				fields.object({
					text: fields.text({ label: "Text" }),
					link: fields.text({ label: "Link" }),
					icon: fields.text({ label: "FA Icon" }),
					openInNewTab: fields.checkbox({
						label: "Open in new tab? ",
					}),
				}),
			),
		},
	}),
	imageParagraph: component({
		preview(props) {
			return (
				<ImageParagraphContainer
					contentEditable={false}
					style={{
						color: props.fields.textDark.value ? "#000" : "#fff",
						background: props.fields.colour.value,
						flexDirection: props.fields.swapSides.value
							? "row-reverse"
							: "row",
					}}>
					<ImageContainer>
						<img
							src={props.fields.imageUrl.value}
							alt={props.fields.imageAlt.value}
						/>
					</ImageContainer>
					<ParagraphContainer>
						<p>{props.fields.content.value}</p>
					</ParagraphContainer>
				</ImageParagraphContainer>
			);
		},
		label: "Image + Paragraph",
		schema: {
			content: fields.text({ label: "Text", defaultValue: "" }),
			imageUrl: fields.url({ label: "Image URL" }),
			imageAlt: fields.text({ label: "Image Alt Text" }),
			colour: fields.text({ label: "Text", defaultValue: "#CC7722" }),
			textDark: fields.checkbox({ label: "Text Dark" }),
			swapSides: fields.checkbox({ label: "Swap Sides" }),
		},
	}),
	infoTable: component({
		preview(props) {
			return (
				<InfoTableContainer>
					<h3>Information</h3>
					<InformationTable>
						<tbody>
							{props.fields.info.elements.map((info) => {
								return (
									<tr key={info.fields.info.value}>
										<td>{info.fields.label.value}</td>
										<td>{info.fields.info.value}</td>
									</tr>
								);
							})}
						</tbody>
					</InformationTable>
				</InfoTableContainer>
			);
		},
		label: "Information Table",
		schema: {
			info: fields.array(
				fields.object({
					label: fields.text({ label: "Label" }),
					info: fields.text({ label: "Info" }),
				}),
			),
		},
	}),
	fullWidthImage: component({
		preview(props) {
			return (
				<SoloImage
					src={props.fields.url.value}
					style={{ height: props.fields.height.value }}
				/>
			);
		},
		label: "Full Width Image",
		schema: {
			url: fields.url({ label: "Image URL" }),
			height: fields.text({ label: "Height", defaultValue: "30rem" }),
		},
	}),
};

export type EventPageRenderers = InferRenderersForComponentBlocks<typeof EventPageComponentBlocks>;
