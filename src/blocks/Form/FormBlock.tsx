"use client";
import type { FormFieldBlock, Form as FormType } from "@payloadcms/plugin-form-builder/types";

import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import RichText from "#/components/RichText/RichText";
import { Button } from "@mantine/core";
import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import { fields } from "./fields";
import { getClientSideURL } from "#/utilities/getURL";

import styles from "./FormBlock.module.css";

export type FormBlockType = {
	blockName?: string;
	blockType?: "formBlock";
	enableIntro: boolean;
	form: FormType;
	introContent?: DefaultTypedEditorState;
};

interface FormBlockProps extends FormBlockType {
	id?: string;
}

export function FormBlock(props: FormBlockProps) {
	const {
		enableIntro,
		form: formFromProps,
		form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
		introContent,
	} = props;

	const formMethods = useForm({
		defaultValues: formFromProps.fields,
	});
	const {
		control,
		formState: { errors },
		handleSubmit,
		register,
	} = formMethods;

	const [isLoading, setIsLoading] = useState(false);
	const [hasSubmitted, setHasSubmitted] = useState<boolean>();
	const [error, setError] = useState<{ message: string; status?: string } | undefined>();
	const router = useRouter();

	const onSubmit = useCallback(
		(data: FormFieldBlock[]) => {
			let loadingTimerID: ReturnType<typeof setTimeout>;
			const submitForm = async () => {
				setError(undefined);

				const dataToSend = Object.entries(data).map(([name, value]) => ({
					field: name,
					value,
				}));

				// delay loading indicator by 1s
				loadingTimerID = setTimeout(() => {
					setIsLoading(true);
				}, 1000);

				try {
					const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
						body: JSON.stringify({
							form: formID,
							submissionData: dataToSend,
						}),
						headers: {
							"Content-Type": "application/json",
						},
						method: "POST",
					});

					const res = await req.json();

					clearTimeout(loadingTimerID);

					if (req.status >= 400) {
						setIsLoading(false);

						setError({
							message: res.errors?.[0]?.message || "Internal Server Error",
							status: res.status,
						});

						return;
					}

					setIsLoading(false);
					setHasSubmitted(true);

					if (confirmationType === "redirect" && redirect) {
						const { url } = redirect;

						const redirectUrl = url;

						if (redirectUrl) router.push(redirectUrl);
					}
				} catch (err) {
					console.warn(err);
					setIsLoading(false);
					setError({
						message: "Something went wrong.",
					});
				}
			};

			void submitForm();
		},
		[router, formID, redirect, confirmationType],
	);

	return (
		<div className={`container ${styles.container}`}>
			{enableIntro && introContent && !hasSubmitted && (
				<RichText className={styles.intro} data={introContent} enableGutter={false} />
			)}
			<div className={styles.formContainer}>
				<FormProvider {...formMethods}>
					{!isLoading && hasSubmitted && confirmationType === "message" && (
						<RichText data={confirmationMessage} />
					)}
					{isLoading && !hasSubmitted && <p>Loading, please wait...</p>}
					{error && <div>{`${error.status || "500"}: ${error.message || ""}`}</div>}
					{!hasSubmitted && (
						<form id={formID} onSubmit={handleSubmit(onSubmit)}>
							<div className={styles.fields}>
								{formFromProps &&
									formFromProps.fields &&
									formFromProps.fields?.map((field, index) => {
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields];
										if (Field) {
											return (
												<div className={styles.field} key={index}>
													<Field
														form={formFromProps}
														{...field}
														{...formMethods}
														control={control}
														errors={errors}
														register={register}
													/>
												</div>
											);
										}
										return null;
									})}
							</div>

							<Button form={formID} type="submit">
								{submitButtonLabel}
							</Button>
						</form>
					)}
				</FormProvider>
			</div>
		</div>
	);
}
