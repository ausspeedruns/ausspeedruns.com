import clsx from "clsx";
import styles from "./Logo.module.css";

import LogoSVG from "./Ausspeedruns_Logo.svg";

interface Props {
	className?: string;
}

export function Logo(props: Props) {
	const { className } = props;

	return <LogoSVG className={clsx(styles.logo, className)} />;
}
