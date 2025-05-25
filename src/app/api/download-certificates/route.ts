/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import path from "path";
import archiver from "archiver";

export async function GET(request: NextRequest) {
  try {
    const certificatesDir = path.join(process.cwd(), "public", "certificates");
    // Create a zip archive in memory
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Set response headers
    const headers = new Headers();
    headers.set("Content-Type", "application/zip");
    headers.set(
      "Content-Disposition",
      'attachment; filename="certificates.zip"'
    );

    const stream = new ReadableStream({
      start(controller) {
        archive.on("data", (chunk) => controller.enqueue(chunk));
        archive.on("end", () => controller.close());
        archive.on("error", (err) => controller.error(err));

        // Append entire folder
        archive.directory(certificatesDir, false);
        archive.finalize();
      },
    });

    return new NextResponse(stream, { headers });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
