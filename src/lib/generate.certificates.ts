// scripts/generate-certificates.ts
import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export interface Member {
  Nome: string;
  "E-mail": string;
  Cargo: string;
  Horas: number;
}

// Resolve __filename and __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = "http://localhost:3000/certificate";
const outputDir = path.join(__dirname, "../public/certificates");

/**
 * Generate PDF certificates for a list of members.
 * @param members         Array of Member objects.
 * @param templatePath?   Optional path to a PNG template file.
 * @returns               Path to the ZIP (or void if you just want the files).
 */
export async function generateCertificatesPdfs(
  members: Member[],
  templatePath?: string
): Promise<void> {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // If a template PNG was provided, read & base64-encode it once
  let templateDataUrl: string | null = null;
  if (templatePath && fs.existsSync(templatePath)) {
    const raw = fs.readFileSync(templatePath);
    const ext = path.extname(templatePath).slice(1);
    templateDataUrl = `data:image/${ext};base64,${raw.toString("base64")}`;
  }

  const browser: Browser = await puppeteer.launch();
  const page: Page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 848 });

  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    const slug = m.Nome.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");

    if (templateDataUrl) {
      // Inline‐render your own HTML + PNG background + text overlays:
      await page.setContent(`
        <!DOCTYPE html>
        <html><head>
          <style>
            body, html { margin:0; padding:0; }
            .container { position: relative; width:1200px; height:848px; }
            .container img { width:100%; height:100%; }
            .text-overlay {
              position: absolute;
              /* TODO: adjust these to match your template */
              left: 50%;
              transform: translateX(-50%);
              color: #000;
              font-family: sans-serif;
            }
            .name { top: 300px; font-size: 48px; font-weight: bold; }
            .role { top: 380px; font-size: 32px; }
            .hours { top: 450px; font-size: 28px; }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${templateDataUrl}" alt="Certificate Template" />
            <div class="text-overlay name">${m.Nome}</div>
            <div class="text-overlay role">${m.Cargo}</div>
            <div class="text-overlay hours">${m.Horas} horas</div>
          </div>
        </body></html>
      `);
    } else {
      // Fallback to your existing URL-based render
      await page.goto(`${baseUrl}/${i}`, { waitUntil: "networkidle0" });
    }

    const pdfPath = path.join(outputDir, `${slug}.pdf`);
    await page.pdf({
      path: pdfPath,
      width: "1200px",
      height: "848px",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      pageRanges: "1",
    });

    console.log(`✅ Generated: ${pdfPath}`);
  }

  await browser.close();
}

export default generateCertificatesPdfs;
