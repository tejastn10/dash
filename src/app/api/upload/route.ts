import { type NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
	try {
		// Read the uploaded data
		const buffer = await request.arrayBuffer();
		const size = buffer.byteLength;

		// Simulate some processing time
		await new Promise((resolve) => setTimeout(resolve, 10));

		return NextResponse.json({
			received: size,
			timestamp: Date.now(),
		});
	} catch {
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
};
