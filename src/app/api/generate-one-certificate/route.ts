/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import os from "os";
import puppeteer from "puppeteer";

// Define a temporary directory for PDFs (writable on Vercel)
const tmpCertDir = path.join(os.tmpdir(), "certificates");

/**
 * POST /api/generate-certificates
 * Generates PDF certificates for each member and saves them under /tmp/certificates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(body);

    // On the first certificate, clear out prior files
    if (body.index === 0) {
      await fs.rm(tmpCertDir, { recursive: true, force: true });
    }
    // Ensure our temp output directory exists
    await fs.mkdir(tmpCertDir, { recursive: true });

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/certificate";

    const nameSlug = body.member.name.toLowerCase().replace(/\s+/g, "-");
    const url = `${baseUrl}/${body.index}`;
    await page.goto(url, { waitUntil: "networkidle0" });

    // Write PDF into /tmp/certificates
    const pdfPath = path.join(tmpCertDir, `${nameSlug}.pdf`);
    await page.pdf({
      path: pdfPath,
      width: "1200px",
      height: "848px",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      pageRanges: "1",
    });

    console.log(`Generated (tmp): ${pdfPath}`);

    await browser.close();

    // TODO: from here you can upload `pdfPath` to S3 / Cloudinary / etc.
    return NextResponse.json({ success: true, path: pdfPath });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
