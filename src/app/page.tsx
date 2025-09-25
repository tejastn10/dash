"use client";

import { useState } from "react";
import { cx } from "@/utils/tailwind";

export default function Home() {
	const [speed, setSpeed] = useState<number | null>(null);

	const [isLoading, setIsLoading] = useState(false);
	const [loadingProgress, setLoadingProgress] = useState(0);

	const [status, setStatus] = useState<"idle" | "testing" | "completed">("idle");

	const [showMoreInfo, setShowMoreInfo] = useState(false);

	const [latency, setLatency] = useState<number | null>(null);
	const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
	const [testingUpload, setTestingUpload] = useState(false);

	const startTest = async () => {
		setIsLoading(true);
		setStatus("testing");
		setSpeed(null);
		setLatency(null);
		setUploadSpeed(null);
		setLoadingProgress(0);
		setTestingUpload(false);

		try {
			// Latency
			const latencyStart = performance.now();
			await fetch("/api/ping");
			const latencyEnd = performance.now();
			setLatency(Math.round(latencyEnd - latencyStart));

			// Download speed
			const testSizes = [1, 5, 10, 25]; // MB
			let maxSpeed = 0;

			for (let i = 0; i < testSizes.length; i++) {
				const size = testSizes[i];
				const startTime = performance.now();
				const response = await fetch(`/api/download?size=${size}`);
				const data = await response.blob();
				const endTime = performance.now();

				const duration = (endTime - startTime) / 1000;
				const sizeInBits = data.size * 8;
				const speedMbps = sizeInBits / (1024 * 1024) / duration;

				maxSpeed = Math.max(maxSpeed, speedMbps);
				setSpeed(Math.round(maxSpeed));
				setLoadingProgress(((i + 1) / testSizes.length) * 50);
			}

			// Upload speed
			setTestingUpload(true);
			const uploadData = new Uint8Array(5 * 1024 * 1024); // 5MB
			const uploadStart = performance.now();
			await fetch("/api/upload", { method: "POST", body: uploadData });
			const uploadEnd = performance.now();

			const uploadDuration = (uploadEnd - uploadStart) / 1000;
			const uploadMbps = (uploadData.length * 8) / (1024 * 1024) / uploadDuration;
			setUploadSpeed(Math.round(uploadMbps));
			setLoadingProgress(100);
		} catch (error) {
			console.error("Speed test failed:", error);
		} finally {
			setIsLoading(false);
			setStatus("completed");
			setTestingUpload(false);
		}
	};

	const formatSpeed = (speed: number | null) => {
		if (speed === null) return "—";
		if (speed >= 1000) return `${(speed / 1000).toFixed(1)} Gbps`;
		return `${speed.toFixed(0)} Mbps`;
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center px-4">
			<div className="text-center max-w-2xl w-full">
				{/* Logo */}
				<div className="mb-12">
					<h1 className="text-4xl md:text-5xl font-bold tracking-wider cursor-pointer hover:scale-105 transition-transform duration-300">
						Dash
					</h1>
					<p className="text-gray-400 mt-2 text-sm">Check your internet speed instantly ⚡</p>
				</div>

				{/* Speed Display */}
				<div className="mb-8">
					{status === "idle" && (
						<div className="text-7xl md:text-8xl font-thin mb-4 text-gray-600">—</div>
					)}

					{status === "testing" && (
						<div className="text-7xl md:text-8xl fon-medium mb-4 animate-pulse">
							{speed ? speed : 0}
						</div>
					)}

					{status === "completed" && (
						<div className="text-7xl md:text-8xl font-bold mb-4 text-white-400 transition-transform duration-500 transform scale-110">
							{speed || 0}
						</div>
					)}

					<div className="text-lg md:text-xl text-gray-400">
						{isLoading ? (testingUpload ? "Testing upload..." : "Testing download...") : "Mbps"}
					</div>
				</div>

				{/* Progress Bar */}
				{isLoading && (
					<div className="mb-8 w-full max-w-md mx-auto animate-fade-in">
						<div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
							<div
								className="bg-gradient-to-r from-gray-800 via-gray-400 to-gray-100 h-2 transition-all duration-500 ease-out"
								style={{ width: `${loadingProgress}%` }}
							></div>
						</div>
					</div>
				)}

				{/* Start Button */}
				{status === "idle" && (
					<button
						type="button"
						onClick={startTest}
						className="cursor-pointer bg-white text-black px-10 py-3 rounded-full font-medium hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl"
					>
						Start Test
					</button>
				)}

				{/* More Info */}
				{status === "completed" && (
					<>
						<button
							type="button"
							onClick={() => setShowMoreInfo(!showMoreInfo)}
							className="mb-6 text-sm underline-offset-4 hover:underline cursor-pointer"
						>
							{showMoreInfo ? "Hide details" : "Show details"}
						</button>

						{showMoreInfo && (
							<div
								className={cx(
									// base layout
									"bg-gray-900 rounded-xl p-6 text-left max-w-lg mx-auto h-full space-y-4 transition-all duration-300 ease-out transform-gpu",
									// border + shadows
									"border border-gray-800 shadow-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
									// hover interactions
									"hover:shadow-lg hover:scale-105 filter grayscale",
									// extra polish
									"overflow-hidden group animate-fade-in"
								)}
							>
								<div className="grid grid-cols-2 gap-6 text-sm">
									<InfoBox label="Download" value={formatSpeed(speed)} />
									<InfoBox label="Upload" value={formatSpeed(uploadSpeed)} />
									<InfoBox label="Latency" value={latency ? `${latency} ms` : "—"} />
									<InfoBox label="Server" value="Local" />
								</div>
							</div>
						)}

						<div className="mt-8">
							<button
								type="button"
								onClick={startTest}
								className="cursor-pointer bg-white text-black px-10 py-3 rounded-full font-medium hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl"
							>
								Test Again
							</button>
						</div>
					</>
				)}
			</div>

			{/* Footer */}
			<footer className="absolute bottom-4 text-xs text-gray-600">
				<p>Made with ⚡ Dash | Internet Speed Tester</p>
			</footer>
		</div>
	);
}

function InfoBox({ label, value, color }: { label: string; value: string; color?: string }) {
	return (
		<div className="hover:bg-gray-800 p-3 rounded-lg transition-colors duration-200">
			<div className="text-gray-400 mb-1 text-xs uppercase tracking-wide">{label}</div>
			<div className={`text-lg font-medium ${color || ""}`}>{value}</div>
		</div>
	);
}
