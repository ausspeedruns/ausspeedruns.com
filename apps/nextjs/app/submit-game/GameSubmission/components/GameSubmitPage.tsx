import styles from "./GameSubmitPage.module.scss";

interface GameSubmitPageProps {
	title: string;
	children: React.ReactNode;
	show?: boolean;
	childrenJustify?: string;
}

export const GameSubmitPage = (props: GameSubmitPageProps) => {
	return (
		<div className={styles.submissionPage} style={{ display: props.show ? "block" : "none" }}>
			<h3>{props.title}</h3>
			<div className={styles.formElements} style={{ justifyContent: props.childrenJustify }}>
				{props.children}
			</div>
		</div>
	);
};
