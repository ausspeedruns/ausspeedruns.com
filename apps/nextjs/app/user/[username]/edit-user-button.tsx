"use client";

import { useRouter } from "next/navigation";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "@mui/material/IconButton/IconButton";

export default function EditUserButton() {
	const router = useRouter();

	return (
		<IconButton style={{ float: "right" }} onClick={() => router.push("/user/edit-user")}>
			<FontAwesomeIcon icon={faEdit} />
		</IconButton>
	);
}
