import { DocumentRendererProps } from "@keystone-6/document-renderer";

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
	},
};
