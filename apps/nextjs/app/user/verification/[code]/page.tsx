import { gql } from "urql";

import styles from "../../../../styles/User.Verification.code.module.scss";
import { getRegisteredClient } from "@libs/urql";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";

const VERIFICATION_QUERY = gql`
	query Verify($code: String) {
		accountVerification(where: { code: $code }) {
			__typename
		}
	}
`;

const DELETE_VERIFICATION_MUTATION = gql`
	mutation ($code: String) {
		deleteVerification(where: { code: $code }) {
			__typename
		}
	}
`;

export default async function Verification({ params }: { params: Promise<{ code: string }> }) {
	const verificationCode = (await params).code;
	const client = getRegisteredClient();
	const session = await auth();

	const data = await client.query(VERIFICATION_QUERY, { code: verificationCode }).toPromise();

	let verificationResults: any = null;
	if (data.data?.accountVerification) {
		verificationResults = await client
			.mutation(DELETE_VERIFICATION_MUTATION, { code: verificationCode })
			.toPromise();

		redirect(session ? "/" : "/signin");
	}

	return (
		<div className={styles.content}>
			<h2>Email verification</h2>
			{(data.error || !verificationResults?.data?.verification) && (
				<span>Expired/Incorrect verification code</span>
			)}
		</div>
	);
}
