import { Box } from '@mui/material';
import Image from 'next/image';
import styles from './ShirtOrder.module.scss';

import ShirtBlue from '../../styles/img/ShirtBlue.png';
import ShirtPurple from '../../styles/img/ShirtPurple.png';

interface ASMShirtProps {
	shirtData: {
		shirtID: string;
		size: string;
		colour: 'blue' | 'purple';
		paid: boolean;
	};
}

const ASMShirt: React.FC<ASMShirtProps> = (props: ASMShirtProps) => {
	const { shirtID, size, colour, paid } = props.shirtData;
	return (
		<Box className={styles.generatedShirts} sx={{ boxShadow: 8 }}>
			<div className={styles.image}>
				<Image src={colour === 'blue' ? ShirtBlue : ShirtPurple} layout="responsive" objectFit="contain" alt="Shirt" />
			</div>
			<div className={styles.basicInfo}>
				<span className={styles.label}>{shirtID}</span>
				<div className={styles.informationGrid}>
					<span>Size</span>
					<span>{sizeToName(size)}</span>
					<span>Colour</span>
					<span>{colour.charAt(0).toUpperCase() + colour.slice(1)}</span>
					<span>Status</span>
					<span>{paid ? 'Paid' : 'Unpaid'}</span>
				</div>
			</div>
			{!paid && (
				<div className={styles.unpaid}>
					<p>
						You <b>MUST</b> send the Shirt ID as the &quot;reference&quot;. Failure to do so will result in your shirt
						marked as not being paid and will not be ordered. The shirt will take up to 7 days to update.
					</p>
					<div className={styles.informationGrid}>
						<span>BSB</span>
						<span>085-005</span>
						<span>Account #</span>
						<span>30-192-8208</span>
						<span>Amount</span>
						<span>$30 AUD</span>
					</div>
				</div>
			)}
		</Box>
	);
};

function sizeToName(size: string) {
	switch (size) {
		case 'xs':
			return 'Extra Small';
		case 's':
			return 'Small';
		case 'm':
			return 'Medium';
		case 'l':
			return 'Large';
		case 'xl':
			return 'Extra Large';
		case 'xl2':
			return '2 Extra Large';
		case 'xl3':
			return '3 Extra Large';
		default:
			return size;
	}
}

export default ASMShirt;
