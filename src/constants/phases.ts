import { Phase } from "@/types/speedTest";

export const PHASE_LABELS: Record<Phase, string> = {
	[Phase.Idle]: "",
	[Phase.Latency]: "Measuring latency...",
	[Phase.Download]: "Testing download...",
	[Phase.Upload]: "Testing upload...",
	[Phase.Completed]: "",
};

export const TESTING_PHASES = [Phase.Latency, Phase.Download, Phase.Upload] as const;
