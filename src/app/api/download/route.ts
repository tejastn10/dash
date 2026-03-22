import type { NextRequest } from "next/server";
import { CRYPTO_CHUNK_SIZE, MAX_DOWNLOAD_SIZE_MB, MIN_DOWNLOAD_SIZE_MB } from "@/constants/speedTest";

export const GET = async (request: NextRequest) => {
	const searchParams = request.nextUrl.searchParams;
	const sizeParam = searchParams.get("size");
	const sizeMB = Math.min(
		Math.max(parseInt(sizeParam || "1", 10), MIN_DOWNLOAD_SIZE_MB),
		MAX_DOWNLOAD_SIZE_MB
	);

	const sizeBytes = sizeMB * 1024 * 1024;
	const view = new Uint8Array(sizeBytes);

	// crypto.getRandomValues has a 64KB max per call — fill in chunks
	for (let offset = 0; offset < sizeBytes; offset += CRYPTO_CHUNK_SIZE) {
		crypto.getRandomValues(view.subarray(offset, offset + CRYPTO_CHUNK_SIZE));
	}

	return new Response(view, {
		headers: {
			"Content-Type": "application/octet-stream",
			"Content-Length": sizeBytes.toString(),
			"Cache-Control": "no-cache, no-store, must-revalidate",
			Pragma: "no-cache",
			Expires: "0",
		},
	});
};
