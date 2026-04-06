import styles from "./GameSubmitPage.module.css";

interface GameSubmitPageProps {
	title: string;
	children: React.ReactNode;
	childrenJustify?: string;
}

export const GameSubmitPage = (props: GameSubmitPageProps) => {
	return (
		<div className={styles.submissionPage}>
			<div className={styles.formElements} style={{ justifyContent: props.childrenJustify }}>
				{props.children}
			</div>
		</div>
	);
};
