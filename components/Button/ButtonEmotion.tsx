import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HTMLAttributeAnchorTarget } from 'react';
import styled from '@emotion/styled';
import { Colours, Theme } from '../../styles/colors';

export type ButtonProps = {
	actionText: string;
	link?: string;
	iconLeft?: IconProp;
	iconRight?: IconProp;
	colorScheme?:
		| 'primary'
		| 'secondary'
		| 'secondary lightHover'
		| 'secondary inverted'
		| 'primary lightHover'
		| 'orange';
	target?: HTMLAttributeAnchorTarget;
	rel?: string;
	type?: string;
};

const ButtonLink = styled.a`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 12px 32px;
	border: 2px solid ${Colours.white};
	border-radius: 0.375rem;
	margin-right: 15px;

	color: ${Colours.white};
	font-weight: bold;
	text-decoration: none;

	&:visited {
		color: ${Colours.white};
	}

	&:hover,
	&:focus {
		border-color: ${Theme.accent};
		color: ${Theme.accent};
		text-decoration: underline;
		cursor: pointer;
	}

	&.primary {
		border-color: ${Theme.primary};
		background-color: ${Theme.primary};
		color: ${Theme.lightText};

		&:hover,
		&:focus {
			background-color: transparent;
			color: ${Theme.primary};

			&.lightHover {
				border-color: ${Colours.white};
				color: ${Colours.white};
			}
		}

		&.inverted {
			background-color: transparent;
			color: ${Colours.white};

			&:hover,
			&:focus {
				border-color: ${Colours.white};
				color: ${Colours.white};
			}
		}
	}

	&.secondary {
		border-color: ${Theme.secondary};
		background-color: ${Theme.secondary};
		color: ${Theme.lightText};

		&:hover,
		&:focus {
			background-color: transparent;
			color: ${Theme.secondary};

			&.lightHover {
				border-color: ${Colours.white};
				color: ${Colours.white};
			}
		}

		&.inverted {
			background-color: transparent;
			color: ${Colours.white};
			border-color: ${Colours.white};

			&:hover,
			&:focus {
				border-color: ${Theme.primary};
				background-color: ${Theme.primary};
			}
		}
	}

	&.orange {
		border-color: ${Theme.primary};
		background-color: ${Theme.primary};
		color: ${Theme.lightText};

		&:hover,
		&:focus {
			background-color: transparent;
			border-color: ${Colours.white};
			color: ${Theme.lightText};
		}

		&.inverted {
			background-color: transparent;
			color: ${Colours.white};
			border-color: ${Colours.white};

			&:hover,
			&:focus {
				border-color: ${Theme.primary};
				background-color: ${Theme.primary};
			}
		}
	}

	svg + span {
		margin: -2px 16px 0;
	}

	span + svg {
		margin: 2px 0 0 16px;
	}
`;

const Button = ({
	actionText,
	link,
	iconLeft,
	iconRight,
	rel,
	colorScheme = 'primary',
	target = '_self',
	type,
}: ButtonProps) => {
	return (
		<ButtonLink className={colorScheme} href={link} target={target} rel={rel} type={type}>
			{iconLeft && <FontAwesomeIcon icon={iconLeft} />}
			<span>{actionText}</span>
			{iconRight && <FontAwesomeIcon icon={iconRight} />}
		</ButtonLink>
	);
};

export default Button;
