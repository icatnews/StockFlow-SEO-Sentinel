import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // SEO Analysis Endpoint
  app.post("/api/analyze", async (req, res) => {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const startTime = Date.now();
      const response = await axios.get(url, {
        headers: {
          "User-Agent": "StockFlow-SEO-Sentinel/1.0",
        },
        timeout: 10000,
      });

      const html = response.data;
      const $ = cheerio.load(html);
      const loadTime = Date.now() - startTime;

      // Metadata Audit
      const title = $("title").text();
      const description = $('meta[name="description"]').attr("content") || "";

      // Heading Hierarchy
      const h1s = $("h1").map((i, el) => $(el).text()).get();
      const h2s = $("h2").map((i, el) => $(el).text()).get();
      const h3s = $("h3").map((i, el) => $(el).text()).get();
      
      const allHeadings: { tag: string, text: string }[] = [];
      $("h1, h2, h3").each((i, el) => {
        allHeadings.push({
          tag: el.tagName.toLowerCase(),
          text: $(el).text().trim()
        });
      });

      // Image Audit
      const images = $("img").map((i, el) => ({
        src: $(el).attr("src"),
        alt: $(el).attr("alt"),
      })).get();
      const imagesMissingAlt = images.filter(img => !img.alt || img.alt.trim() === "");

      // Link Validator (Initial collection)
      const links = $("a").map((i, el) => ({
        href: $(el).attr("href"),
        text: $(el).text().trim(),
      })).get().filter(link => link.href && link.href.startsWith("http"));

      // Check a subset of links to avoid timeout/heavy load
      const linksToCheck = links.slice(0, 10);
      const linkResults = await Promise.all(
        linksToCheck.map(async (link) => {
          try {
            const res = await axios.head(link.href, { timeout: 3000 });
            return { ...link, status: res.status, ok: true };
          } catch (err: any) {
            return { ...link, status: err.response?.status || "Error", ok: false };
          }
        })
      );

      res.json({
        url,
        status: response.status,
        loadTime,
        metadata: {
          title,
          description,
          titleLength: title.length,
          descriptionLength: description.length,
        },
        headings: {
          h1: h1s,
          h2: h2s,
          h3: h3s,
          all: allHeadings,
        },
        images: {
          total: images.length,
          missingAlt: imagesMissingAlt.length,
          details: imagesMissingAlt,
        },
        links: {
          total: links.length,
          checked: linkResults,
          broken: linkResults.filter(l => !l.ok),
        }
      });
    } catch (error: any) {
      console.error("Analysis error:", error.message);
      res.status(500).json({ error: error.message || "Failed to analyze URL" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
