"use client";

import anime from "animejs";
import { type RefObject, useEffect, useRef, useState } from "react";

const AMOUNT_RAISED = 220_000;

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

function padZerosLocaleString(num: number, zeros: number): string {
	const numString = num.toString();
	const paddedString = "0".repeat(zeros - numString.length) + numString;
	return paddedString.slice(0, -3).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "," + paddedString.slice(-3);
}

export function AnimatedTotal() {
	const amountRef = useRef<HTMLSpanElement>(null);
	const amountVisible = useOnScreen(amountRef);
	const [amountAnimated, setAmountAnimated] = useState(false);

	useEffect(() => {
		if (!amountAnimated && amountVisible) {
			setAmountAnimated(true);
			anime({
				targets: amountRef.current,
				innerText: [0, AMOUNT_RAISED],
				easing: "easeOutQuart",
				round: true,
				delay: 100,
				duration: 3000,
				update: function (a) {
					if (a.animations.length > 0 && amountRef.current) {
						const value = a.animations[0].currentValue;
						const formattedNumber = padZerosLocaleString(parseInt(value), 6);
						amountRef.current.innerText = formattedNumber;
					}
				},
			});
		}
	}, [amountVisible, amountAnimated]);

	return <span ref={amountRef}>{AMOUNT_RAISED.toLocaleString()}</span>;
}
