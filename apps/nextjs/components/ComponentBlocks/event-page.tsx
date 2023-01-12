import React from 'react';
import {
	component,
	fields,
	InferRenderersForComponentBlocks,
} from '@keystone-6/fields-document/component-blocks';

import Image from 'next/image';
import Button from '../Button/Button';
import { faArrowRight, faTicket, faCalendar, faPerson, faShirt } from '@fortawesome/free-solid-svg-icons';
import { Theme } from '../../styles/colors';
import styles from './event-page.module.scss';

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
			eventLogoBackup: fields.url({ label: 'eventLogoBackup' }),
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
				<div className={styles.logo}>
					<Image
						src={props.event.data.logo?.src ?? props.eventLogoBackup}
						alt={`${props.event.data.shortname} Logo`}
						style={{ objectFit: 'contain' }}
						fill
					/>
				</div>
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
