import anime from "animejs";
import { RefObject, useEffect, useRef, useState } from "react";
import { useAuth } from "../auth";
import Button from "../Button/Button";

import styles from "./asmm-live.module.scss";

function useOnScreen(ref: RefObject<HTMLElement>) {
	const [isIntersecting, setIntersecting] = useState(false);

	let observer: IntersectionObserver | null = null;

	useEffect(() => {
		if (ref.current) {
			observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting));
			observer.observe(ref.current);
		}
		return () => observer?.disconnect();
	}, []);

	return isIntersecting;
}

const ASMMLive = () => {
	const [pledgeAmount, setPledgeAmount] = useState(-1);
	const [walkAmount, setWalkAmount] = useState(0);
	const amountRef = useRef<HTMLSpanElement>(null);
	const amountVisible = useOnScreen(amountRef);
	const [amountAnimated, setAmountAnimated] = useState(false);
	const auth = useAuth();

	const username = auth.ready ? auth.sessionData?.username : undefined;

	useEffect(() => {
		if (auth.ready) {
			fetch(`/api/asmm/total`).then((res) => {
				res.json().then((data) => {
					setWalkAmount(data.KmCount ?? 0);
				});
			});

			fetch(`/api/asmm/pledge?username=${username}`, { method: "GET" }).then((res) => {
				res.json().then((data) => {
					setPledgeAmount(data.pledge);
				});
			});
		}
	}, [auth]);

	useEffect(() => {
		if (!amountAnimated && amountVisible) {
			setAmountAnimated(true);
			anime({
				targets: amountRef.current,
				innerText: [0, walkAmount],
				easing: "easeOutQuart",
				round: true,
				delay: 100,
				duration: 3000,
				update: function (a) {
					if (a.animations.length > 0 && amountRef.current) {
						const value = a.animations[0].currentValue;
						amountRef.current.innerText = value;
					}
				},
			});
		}
	}, [amountVisible, amountAnimated]);

	const amountToPay = Math.round((pledgeAmount * (walkAmount / 10) + Number.EPSILON) * 100) / 100;

	const hasPledged = pledgeAmount > 10;

	return (
		<div className={styles.asmmLive}>
			<span className={styles.miniTagline}>Australian Speedrun Marathon Marathon</span>
			<span className={styles.mainAmount}>
				The AusSpeedruns community has walked{" "}
				<span ref={amountRef} className={styles.total}>
					{walkAmount}
				</span>{" "}
				KM.
			</span>
			{hasPledged ? (
				<span className={styles.pledge}>
					You are pledging ${pledgeAmount} per 10km which totals to{" "}
					<span className={styles.pledgeTotal}>${amountToPay}</span>
				</span>
			) : (
				<span className={styles.learnMore}>
					<Button colorScheme="secondary inverted" link="/asmm" actionText="Pledge and learn more" />
				</span>
			)}
		</div>
	);
};

export default ASMMLive;
