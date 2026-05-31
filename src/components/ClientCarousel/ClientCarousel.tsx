"use client";

import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface ClientCarouselProps {
	children: React.ReactNode;
}

export function ClientCarousel(props: ClientCarouselProps) {
	if (!Array.isArray(props.children) || props.children.length === 1) {
		return props.children;
	}

	return <Carousel showThumbs={false} children={props.children} />;
}
