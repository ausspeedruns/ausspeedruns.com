import React from 'react';
import { NotEditable, component, fields } from '@keystone-6/fields-document/component-blocks';

import styled from '@emotion/styled';
import Image from 'next/image';
import Button from '../Button/ButtonEmotion';
import { faArrowRight, faTicket, faCalendar, faPerson, faShirt } from '@fortawesome/free-solid-svg-icons';
import { Theme, Media } from '../../styles/colors';

interface HeaderProps {
	image: string;
	position: string;
	cover: boolean;
	repeat: string;
}

const HeaderContainer = styled.div<HeaderProps>`
	background-image: url('${(props) => props.image}');
	background-position: ${(props) => props.position};
	background-size: ${(props) => (props.cover ? 'cover' : 'contain')};
	background-repeat: ${(props) => props.repeat};
	box-shadow: inset 0 0 20px 0px black;
	background-color: #024759;
	width: 100%;
	min-height: 25rem;

	@media (min-width: ${Media.sm}) {
		// height: 20rem;
		padding: 2rem 0;
		background-size: cover;
	}

	display: flex;
	justify-content: center;
	flex-direction: column;
	align-items: center;
	gap: 16px;
`;

const HeaderLogo = styled.div`
	width: 700px;
	height: auto;

	@media (min-width: ${Media.sm}) {
		width: 80%;
	}
`;

const ButtonContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;

	@media (max-width: ${Media.sm}) {
		grid-template-columns: 80%;
		justify-content: center;
	}
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

		@media (min-width: ${Media.lg}) {
			font-size: 2rem;
		}
	}

	p {
		font-size: 1rem;
		width: 80%;

		@media (min-width: ${Media.lg}) {
			font-size: 1.4rem;
			width: 70%;
		}
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

	@media (max-width: ${Media.sm}) {
		font-size: 1rem;
	}

	h3 {
		font-size: 1.8rem;
	}

	.information {
	}
`;

const InformationTable = styled.table`
	@media (min-width: ${Media.sm}) {
		padding: 0 20px;
	}

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

// naming the export componentBlocks is important because the Admin UI
// expects to find the components like on the componentBlocks export
export const componentBlocks = {
	header: component({
		preview(props) {
			return (
				<HeaderContainer
					contentEditable={false}
					image={props.fields.backgroundImage.value}
					position={props.fields.backgroundSettings.fields.position.value}
					cover={props.fields.backgroundSettings.fields.cover.value}
					repeat={props.fields.backgroundSettings.fields.repeat.value}
				>
					<HeaderLogo>
						{/* <Image src={props.fields.event?.value?.data?.logo ?? ''} alt="AusSpeedruns At PAX 2022 Logo" /> */}
					</HeaderLogo>
					<ButtonContainer>
						{props.fields.donateLink.value && (
							<Button
								actionText="Donate"
								link={props.fields.donateLink.value}
								target="_blank"
								rel="noopener noreferrer"
							/>
						)}

						{props.fields.event.value?.data?.acceptingSubmissions && (
							<Button actionText="Submissions are open!" link="/submit-game" iconRight={faArrowRight} />
						)}

						{props.fields.event.value?.data?.acceptingBackups &&
							!props.fields.event.value?.data?.acceptingSubmissions && (
								<Button actionText="Backup submissions are open!" link="/submit-game" iconRight={faArrowRight} />
							)}

						{props.fields.ticketLink.value && (
							<Button actionText="Purchase tickets" link={props.fields.ticketLink.value} iconRight={faTicket} />
						)}

						{props.fields.event.value?.data?.scheduleReleased && (
							<Button actionText="Schedule" link="/schedule" iconRight={faCalendar} />
						)}

						{props.fields.event.value?.data?.acceptingVolunteers && (
							<Button actionText="Be a volunteer!" link="/volunteers" iconRight={faPerson} />
						)}

						{props.fields.event.value?.data?.acceptingShirts && (
							<Button actionText="Buy the ASM2022 Shirt! (Limited Time)" link="/store" iconRight={faShirt} />
						)}

						{/* <Button actionText="Donation Challenges" link="/ASM2022/challenges" iconRight={faArrowRight} /> */}

						<Button
							actionText="Learn more about Game on Cancer"
							link={props.fields.charityLink.value}
							iconRight={faArrowRight}
							target="_blank"
							rel="noopener noreferrer"
						/>
					</ButtonContainer>
				</HeaderContainer>
			);
		},
		label: 'Header',
		schema: {
			event: fields.relationship({
				label: 'Event',
				listKey: 'Event',
				selection:
					'id acceptingSubmissions acceptingTickets scheduleReleased acceptingVolunteers acceptingBackups acceptingShirts logo { url width height	}',
			}),
			backgroundImage: fields.url({ label: 'Background Image URL ' }),
			backgroundSettings: fields.object({
				position: fields.text({ label: 'Background Position', defaultValue: 'center' }),
				cover: fields.checkbox({ label: 'Background Cover?', defaultValue: true }),
				repeat: fields.text({ label: 'Background Repeat', defaultValue: 'no-repeat' }),
			}),
			donateLink: fields.url({ label: 'Donate URL' }),
			charityLink: fields.url({ label: 'Charity URL' }),
			ticketLink: fields.text({ label: 'Ticket Link' }),
		},
	}),
	imageParagraph: component({
		preview(props) {
			return (
				<ImageParagraphContainer
					contentEditable={false}
					style={{
						color: props.fields.textDark.value ? Theme.darkText : Theme.lightText,
						background: props.fields.colour.value,
						flexDirection: props.fields.swapSides.value ? 'row-reverse' : 'row',
					}}
				>
					<ImageContainer>
						<Image src={props.fields.imageUrl.value} alt={props.fields.imageAlt.value} />
					</ImageContainer>
					<ParagraphContainer>
						<p>{props.fields.content.value}</p>
					</ParagraphContainer>
				</ImageParagraphContainer>
			);
		},
		label: 'Image + Paragraph',
		schema: {
			content: fields.text({ label: 'Text', defaultValue: '' }),
			imageUrl: fields.url({ label: 'Image URL' }),
			imageAlt: fields.text({ label: 'Image Alt Text' }),
			colour: fields.text({ label: 'Text', defaultValue: '#CC7722' }),
			textDark: fields.checkbox({ label: 'Text Dark' }),
			swapSides: fields.checkbox({ label: 'Swap Sides' }),
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
		label: 'Information Table',
		schema: {
			info: fields.array(
				fields.object({
					label: fields.text({ label: 'Label' }),
					info: fields.text({ label: 'Info' }),
				})
			),
		},
	}),
	fullWidthImage: component({
		preview(props) {
			return <SoloImage src={props.fields.url.value} style={{ height: props.fields.height.value }} />;
		},
		label: 'Full Width Image',
		schema: {
			url: fields.url({ label: 'Image URL' }),
			height: fields.text({ label: 'Height', defaultValue: '30rem' }),
		},
	}),
};
