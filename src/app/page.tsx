"use client";

import { useState } from "react";
import { GAUGE_START_DEG, GAUGE_SWEEP_DEG, MAX_GAUGE_MBPS } from "@/constants/gauge";
import { PHASE_LABELS, TESTING_PHASES } from "@/constants/phases";
import { DOWNLOAD_TEST_SIZES_MB, UPLOAD_SIZE_BYTES } from "@/constants/speedTest";
import { useCountUp } from "@/hooks/useCountUp";
import { Phase, type StatBoxProps } from "@/types/speedTest";
import { latencyColor, speedColor } from "@/utils/color";
import { formatSpeed } from "@/utils/format";
import { arcPath } from "@/utils/gauge";

export default function Home() {
	const [phase, setPhase] = useState<Phase>(Phase.Idle);
	const [speed, setSpeed] = useState<number | null>(null);
	const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
	const [latency, setLatency] = useState<number | null>(null);
	const [progress, setProgress] = useState(0);

	const displayedSpeed = useCountUp(speed);
	const isCompleted = phase === Phase.Completed;
	const isTesting = phase !== Phase.Idle && phase !== Phase.Completed;

	const arcColor = isCompleted ? speedColor(speed) : "#ffffff";
	const fillSweep = Math.min(displayedSpeed / MAX_GAUGE_MBPS, 1) * GAUGE_SWEEP_DEG;

	const gaugeLabel =
		displayedSpeed >= 1000 ? `${(displayedSpeed / 1000).toFixed(1)}` : String(displayedSpeed);
	const gaugeUnit = displayedSpeed >= 1000 ? "Gbps" : "Mbps";

	const run = async () => {
		setPhase(Phase.Latency);
		setSpeed(null);
		setUploadSpeed(null);
		setLatency(null);
		setProgress(0);

		try {
			const t0 = performance.now();
			await fetch("/api/ping");
			setLatency(Math.round(performance.now() - t0));
			setProgress(10);

			setPhase(Phase.Download);
			let runningMax = 0;
			await Promise.all(
				DOWNLOAD_TEST_SIZES_MB.map(async (size) => {
					const start = performance.now();
					const res = await fetch(`/api/download?size=${size}`);
					const blob = await res.blob();
					const duration = (performance.now() - start) / 1000;
					const mbps = (blob.size * 8) / (1024 * 1024) / duration;
					runningMax = Math.max(runningMax, mbps);
					setSpeed(Math.round(runningMax));
				})
			);
			setProgress(60);

			setPhase(Phase.Upload);
			const uploadData = new Uint8Array(UPLOAD_SIZE_BYTES);
			const uploadStart = performance.now();
			await fetch("/api/upload", { method: "POST", body: uploadData });
			const uploadMbps =
				(uploadData.length * 8) / (1024 * 1024) / ((performance.now() - uploadStart) / 1000);
			setUploadSpeed(Math.round(uploadMbps));
			setProgress(100);
		} catch (err) {
			console.error("Speed test failed:", err);
		} finally {
			setPhase(Phase.Completed);
		}
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center px-4 gap-8">
			<div className="text-center">
				<h1 className="text-4xl md:text-5xl font-bold tracking-wider">
					Da
					<span
						className="text-2xl md:text-3xl"
						style={{
							color: "#facc15",
							textShadow: "0 0 10px rgba(250,204,21,0.9), 0 0 24px rgba(250,204,21,0.5)",
						}}
					>
						⚡
					</span>
					h
				</h1>
				<p className="text-gray-400 mt-1 text-sm">Check your internet speed instantly</p>
			</div>

			<svg viewBox="0 0 200 200" className="w-64 h-64">
				<title>Speed gauge</title>
				<path
					d={arcPath(100, 100, 75, GAUGE_START_DEG, GAUGE_SWEEP_DEG)}
					fill="none"
					stroke="#1f2937"
					strokeWidth={14}
					strokeLinecap="round"
				/>
				{fillSweep > 0 && (
					<path
						d={arcPath(100, 100, 75, GAUGE_START_DEG, fillSweep)}
						fill="none"
						stroke={arcColor}
						strokeWidth={14}
						strokeLinecap="round"
					/>
				)}
				<text
					x="100"
					y={phase === Phase.Idle ? "105" : "95"}
					textAnchor="middle"
					dominantBaseline="middle"
					fill={isCompleted ? arcColor : "#ffffff"}
					fontSize={displayedSpeed >= 1000 ? "28" : "40"}
					fontWeight="700"
					fontFamily="var(--font-outfit), sans-serif"
				>
					{phase === Phase.Idle ? "—" : gaugeLabel}
				</text>
				{phase !== Phase.Idle && (
					<text
						x="100"
						y="125"
						textAnchor="middle"
						fill="#6b7280"
						fontSize="13"
						fontFamily="var(--font-outfit), sans-serif"
					>
						{isCompleted ? gaugeUnit : "..."}
					</text>
				)}
			</svg>

			{isTesting && (
				<div className="flex flex-col items-center gap-3 -mt-4">
					<p className="text-gray-400 text-sm">{PHASE_LABELS[phase]}</p>

					<div className="flex items-center gap-2">
						{TESTING_PHASES.map((p, i) => {
							const done = TESTING_PHASES.indexOf(p) < TESTING_PHASES.indexOf(phase as (typeof TESTING_PHASES)[number]);
							const active = p === phase;
							return (
								<div key={p} className="flex items-center gap-2">
									<div
										className={`w-2 h-2 rounded-full transition-all duration-300 ${
											active ? "bg-white scale-125" : done ? "bg-green-400" : "bg-gray-700"
										}`}
									/>
									<span
										className={`text-xs transition-colors duration-300 ${
											active ? "text-white" : done ? "text-green-400" : "text-gray-600"
										}`}
									>
										{p.charAt(0).toUpperCase() + p.slice(1)}
									</span>
									{i < 2 && <div className="w-4 h-px bg-gray-700" />}
								</div>
							);
						})}
					</div>

					<div className="w-64 bg-gray-800 rounded-full h-1 overflow-hidden">
						<div
							className="h-1 bg-white rounded-full transition-all duration-500 ease-out"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>
			)}

			{isCompleted && (
				<div className="grid grid-cols-3 gap-8 text-center -mt-4">
					<StatBox icon="↓" label="Download" value={formatSpeed(speed)} color={speedColor(speed)} />
					<StatBox
						icon="↑"
						label="Upload"
						value={formatSpeed(uploadSpeed)}
						color={speedColor(uploadSpeed)}
					/>
					<StatBox
						icon="◎"
						label="Latency"
						value={latency !== null ? `${latency} ms` : "—"}
						color={latencyColor(latency)}
					/>
				</div>
			)}

			<button
				type="button"
				onClick={run}
				disabled={isTesting}
				className="cursor-pointer bg-white text-black px-10 py-3 rounded-full font-medium hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white"
			>
				{phase === Phase.Idle ? "Start Test" : isCompleted ? "Test Again" : "Testing..."}
			</button>

			<footer className="absolute bottom-4 text-xs text-gray-600">
				⚡ Dash | Internet Speed Tester
			</footer>
		</div>
	);
}

function StatBox({ icon, label, value, color }: StatBoxProps) {
	return (
		<div className="flex flex-col items-center gap-1">
			<span className="text-gray-500 text-xs">
				{icon} {label}
			</span>
			<span className="text-lg font-semibold" style={{ color }}>
				{value}
			</span>
		</div>
	);
}
