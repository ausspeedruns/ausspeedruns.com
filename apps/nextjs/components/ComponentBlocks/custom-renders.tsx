import { DocumentRendererProps } from "@keystone-6/document-renderer";
import Balance from "react-wrap-balancer";

import styles from "./custom-renders.module.scss";

export const customDocumentRenderer: DocumentRendererProps["renderers"] = {
	block: {
		paragraph: ({ children, textAlign }) => {
			return (
				<p style={{ textAlign }} className={styles.paragraph}>
					{children}
				</p>
			);
		},
		heading: ({ children, textAlign, level }) => {
			let content = <Balance>{children}</Balance>;

			switch (level) {
				case 2:
					return <h2 style={{ textAlign }}>{content}</h2>;
				case 3:
					return <h3 style={{ textAlign }}>{content}</h3>;
				case 4:
					return <h4 style={{ textAlign }}>{content}</h4>;
				case 5:
					return <h5 style={{ textAlign }}>{content}</h5>;
				case 6:
					return <h6 style={{ textAlign }}>{content}</h6>;
				case 1:
				default:
					return <h1 style={{ textAlign }}>{content}</h1>;
			}
		},
	},
};
