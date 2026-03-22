import { useEffect, useRef, useState } from "react";

export function useCountUp(target: number | null, duration = 700) {
	const [displayed, setDisplayed] = useState(0);
	const fromRef = useRef(0);
	const animRef = useRef(0);

	useEffect(() => {
		if (target === null) {
			cancelAnimationFrame(animRef.current);
			setDisplayed(0);
			fromRef.current = 0;
			return;
		}

		const from = fromRef.current;
		const start = performance.now();
		cancelAnimationFrame(animRef.current);

		const tick = (now: number) => {
			const t = Math.min((now - start) / duration, 1);
			const eased = 1 - (1 - t) ** 3;
			const next = Math.round(from + (target - from) * eased);
			fromRef.current = next;
			setDisplayed(next);
			if (t < 1) animRef.current = requestAnimationFrame(tick);
		};

		animRef.current = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(animRef.current);
	}, [target, duration]);

	return displayed;
}
