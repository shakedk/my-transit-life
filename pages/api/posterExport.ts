import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import { server } from "../../config";

type ExportFormat = "png" | "pdf";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { routeID, posterPath, format = "png" } = req.query;

  if (!routeID || Array.isArray(routeID) || !posterPath || Array.isArray(posterPath)) {
    return res.status(400).json({ error: "Missing routeID or posterPath" });
  }

  const exportFormat = (format as ExportFormat) === "pdf" ? "pdf" : "png";

  const url = `${server}/posters/${encodeURIComponent(
    posterPath
  )}?routeID=${encodeURIComponent(routeID)}&printMode=true`;

  let browser;
  try {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 4960,
      height: 7016,
      deviceScaleFactor: 2,
    });

    await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });

    if (exportFormat === "pdf") {
      const pdfBuffer = await page.pdf({
        printBackground: true,
        width: "496mm",
        height: "701mm",
        margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="poster-${routeID}.pdf"`
      );
      return res.status(200).send(pdfBuffer);
    }

    const pngBuffer = await page.screenshot({
      type: "png",
      fullPage: true,
    });
    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="poster-${routeID}.png"`
    );
    return res.status(200).send(pngBuffer);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Poster export failed", e);
    return res.status(500).json({ error: "Failed to export poster" });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

