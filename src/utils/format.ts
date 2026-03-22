export function formatSpeed(mbps: number | null): string {
	if (mbps === null) return "—";
	if (mbps >= 1000) return `${(mbps / 1000).toFixed(1)} Gbps`;
	return `${mbps} Mbps`;
}
