export function speedColor(mbps: number | null): string {
	if (mbps === null) return "#ffffff";
	if (mbps >= 100) return "#4ade80"; // green-400
	if (mbps >= 25) return "#facc15"; // yellow-400
	return "#f87171"; // red-400
}

export function latencyColor(ms: number | null): string {
	if (ms === null) return "#ffffff";
	if (ms < 20) return "#4ade80";
	if (ms < 80) return "#facc15";
	return "#f87171";
}
