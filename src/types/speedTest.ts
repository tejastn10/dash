export enum Phase {
	Idle = "idle",
	Latency = "latency",
	Download = "download",
	Upload = "upload",
	Completed = "completed",
}

export type StatBoxProps = {
	icon: string;
	label: string;
	value: string;
	color: string;
};
