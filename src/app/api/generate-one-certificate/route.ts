/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import puppeteer from "puppeteer";

// Define the directory where PDFs will be saved
const outputDir = path.join(process.cwd(), "public", "certificates");

// Static member list (could be moved to a separate file)

/**
 * POST /api/generate-certificates
 * Generates PDF certificates for each member and saves them under public/certificates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(body);

    if (body.index === 0) {
      await fs.rm(outputDir, { recursive: true, force: true });
    }
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/certificate";

    const nameSlug = body.member.name.toLowerCase().replace(/\s+/g, "-");
    const url = `${baseUrl}/${body.index}`;
    await page.goto(url, { waitUntil: "networkidle0" });

    const pdfPath = path.join(outputDir, `${nameSlug}.pdf`);
    await page.pdf({
      path: pdfPath,
      width: "1200px",
      height: "848px",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      pageRanges: "1",
    });

    console.log(`Generated: ${pdfPath}`);

    await browser.close();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
