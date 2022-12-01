import React from 'react';
import {
	NotEditable,
	component,
	fields,
	InferRenderersForComponentBlocks,
} from '@keystone-6/fields-document/component-blocks';

import styled from '@emotion/styled';
import Image from 'next/image';
import Button from '../Button/Button';
import { faArrowRight, faTicket, faCalendar, faPerson, faShirt } from '@fortawesome/free-solid-svg-icons';
import { Theme, Media } from '../../styles/colors';
import styles from './event-page.module.scss';

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

const componentBlocks = {
	header: component({
		preview() {
			return <></>;
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
		preview() {
			return <></>;
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
		preview() {
			return <></>;
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
		preview() {
			return <></>;
		},
		label: 'Full Width Image',
		schema: {
			url: fields.url({ label: 'Image URL' }),
			height: fields.text({ label: 'Height', defaultValue: '30rem' }),
		},
	}),
};

export const EventComponentRenderers: InferRenderersForComponentBlocks<typeof componentBlocks> = {
	header: (props) => {
		return (
			<div
				className={styles.header}
				contentEditable={false}
				style={{
					backgroundImage: `url("${props.backgroundImage}")`,
					backgroundPosition: props.backgroundSettings.position,
					backgroundSize: props.backgroundSettings.cover ? 'cover' : 'contain',
					backgroundRepeat: props.backgroundSettings.repeat,
				}}
			>
				{props.event.data.logo && (
					<div className={styles.logo}>
						<Image src={props.event.data.logo} alt={`${props.event.data.shortname} Logo`} />
					</div>
				)}
				<div className={styles.buttons}>
					{props.donateLink && (
						<Button actionText="Donate" link={props.donateLink} target="_blank" rel="noopener noreferrer" />
					)}

					{props.event?.data?.acceptingSubmissions && (
						<Button actionText="Submissions are open!" link="/submit-game" iconRight={faArrowRight} />
					)}

					{props.event?.data?.acceptingBackups && !props.event?.data?.acceptingSubmissions && (
						<Button actionText="Backup submissions are open!" link="/submit-game" iconRight={faArrowRight} />
					)}

					{props.ticketLink && <Button actionText="Purchase tickets" link={props.ticketLink} iconRight={faTicket} />}

					{props.event?.data?.scheduleReleased && (
						<Button actionText="Schedule" link="/schedule" iconRight={faCalendar} />
					)}

					{props.event?.data?.acceptingVolunteers && (
						<Button actionText="Be a volunteer!" link="/volunteers" iconRight={faPerson} />
					)}
				</div>
			</div>
		);
	},
	imageParagraph: (props) => {
		return (
			<div
				className={styles.imageParagraph}
				contentEditable={false}
				style={{
					color: props.textDark ? Theme.darkText : Theme.lightText,
					background: props.colour,
					flexDirection: props.swapSides ? 'row-reverse' : 'row',
				}}
			>
				<div className={styles.image}>
					<Image src={props.imageUrl} alt={props.imageAlt} fill style={{ objectFit: 'cover' }} />
				</div>
				<div className={styles.content} style={{ background: `${props.colour}d9` }}>
					<p>{props.content}</p>
				</div>
			</div>
		);
	},
	infoTable: (props) => {
		return (
			<section className={styles.informationSection}>
				<h3>Information</h3>
				<table className={styles.information}>
					<tbody>
						{props.info.map((info) => {
							return (
								<tr key={info.info}>
									<td>{info.label}</td>
									<td>{info.info}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</section>
		);
	},
	fullWidthImage: (props) => {
		return (
			<Image
				className={styles.footerImage}
				src={props.url}
				style={{ height: props.height, objectFit: 'cover' }}
				fill
				alt=""
			/>
		);
	},
};
