import type { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
	const searchParams = request.nextUrl.searchParams;
	const sizeParam = searchParams.get("size");
	const sizeMB = parseInt(sizeParam || "1", 10);

	// Generate random data of specified size
	const sizeBytes = sizeMB * 1024 * 1024;
	const buffer = new ArrayBuffer(sizeBytes);
	const view = new Uint8Array(buffer);

	// Fill with random data to prevent compression
	for (let i = 0; i < sizeBytes; i++) {
		view[i] = Math.floor(Math.random() * 256);
	}

	return new Response(buffer, {
		headers: {
			"Content-Type": "application/octet-stream",
			"Content-Length": sizeBytes.toString(),
			"Cache-Control": "no-cache, no-store, must-revalidate",
			Pragma: "no-cache",
			Expires: "0",
		},
	});
};
