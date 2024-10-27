
import styles from '../../styles/PressKit.module.scss';
import { Metadata } from 'next';

const metadata: Metadata = {
	title: "Press Kit",
	description: "Press Kit for AusSpeedruns",
}

const PressKit = () => {
	return (
		<div className={styles.app}>
			<main className={styles.content}>
				<h2>Press Kit</h2>
				<p>
					<a target="_blank" rel="noreferrer" href="/AusSpeedruns_Logos.zip" className={styles.ausspeedrunsLogo}>
						AusSpeedruns Logos
					</a>
				</p>
				<div>
					<div className={`${styles.colourBox} ${styles.orange}`} />
					<p>Orange: #CC7722</p>
				</div>
				<div>
					<div className={`${styles.colourBox} ${styles.blue}`} />
					<p>Blue: #437C90</p>
				</div>
			</main>
		</div>
	);
};

export default PressKit;
