export function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
	const rad = ((deg - 90) * Math.PI) / 180;
	return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function arcPath(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number) {
	if (sweepDeg <= 0) return "";
	const clampedSweep = Math.min(sweepDeg, 359.99);
	const s = polarToCartesian(cx, cy, r, startDeg);
	const e = polarToCartesian(cx, cy, r, startDeg + clampedSweep);
	return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${clampedSweep > 180 ? 1 : 0} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}
