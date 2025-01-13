import styles from "./GameSubmitPage.module.scss";

interface GameSubmitPageProps {
	title: string;
	children: React.ReactNode;
	show?: boolean;
	childrenJustify?: string;
}

export const GameSubmitPage = (props: GameSubmitPageProps) => {
	return props.show ? (
		<div className={styles.submissionPage}>
			<h3>{props.title}</h3>
			<div className={styles.formElements} style={{justifyContent: props.childrenJustify}}>
				{props.children}
			</div>
		</div>
	) : (
		<></>
	);
};
