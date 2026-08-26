/*
 * Created by : febry.is-a.dev
 * GitHub     : vandebry10-star
 * Date       : 16-07-2026
 * * Do not remove the creator's watermark, please respect the creator.
 */

import axios from "axios";
import FormData from "form-data";

/**
 * Remove Background API (Yunusek)
 * @param {Object} options
 * @param {string|Buffer} options.image - Image URL, base64, or Buffer (required)
 * @param {string} [options.mode="removebg"] - Mode: "removebg" or "upscale"
 * @param {string} [options.scale="2"] - Scale for upscale mode
 * @param {boolean} [options.highRes=false] - High resolution mode for removebg
 */
async function removebg(options = {}) {
  const {
    image,
    mode = "removebg",
    scale = "2",
    highRes = false,
  } = options;

  if (!image) throw new Error('Parameter "image" is required');

  const baseURL = "https://api.yunusek.org";
  const client = axios.create({
    baseURL,
    headers: {
      "User-Agent": "okhttp/4.9.2",
      "Accept-Encoding": "gzip",
    },
  });

  async function resolveImage(input) {
    if (Buffer.isBuffer(input)) return input;
    if (typeof input === "string") {
      if (input.startsWith("http")) {
        const res = await axios.get(input, { responseType: "arraybuffer" });
        return Buffer.from(res.data);
      }
      if (input.includes("base64,")) return Buffer.from(input.split(",")[1], "base64");
      return Buffer.from(input, "base64");
    }
    throw new Error("Invalid image format");
  }

  async function request(endpoint, fields = {}, imageBuffer) {
    const form = new FormData();
    form.append("image", imageBuffer, {
      filename: "image.png",
      contentType: "image/png",
    });
    for (const [key, value] of Object.entries(fields)) {
      form.append(key, String(value));
    }
    const res = await client.post(endpoint, form, {
      headers: form.getHeaders(),
      responseType: "arraybuffer",
    });
    return {
      buffer: Buffer.from(res.data),
      contentType: res.headers["content-type"] || "image/png",
    };
  }

  const activeMode = (mode || "removebg").toLowerCase();
  const buf = await resolveImage(image);

  if (activeMode === "removebg") {
    return await request("/api/remove-background", {
      high_res: highRes ? "true" : "false",
    }, buf);
  }

  if (activeMode === "upscale") {
    return await request("/api/upscale", {
      scale: String(scale),
    }, buf);
  }

  throw new Error('Invalid mode (use "removebg" or "upscale")');
}

// NOTE: default export HARUS berupa handler (req, res) agar endpoint
// /api/removebg tetap berfungsi sebagai serverless function.
// Fungsi scraper "removebg" tetap dipakai persis seperti yang diberikan,
// hanya dipanggil dari dalam handler ini.
export default async function handler(req, res) {
  const params = req.method === "GET" ? req.query : req.body;
  const { mode = "removebg", image } = params;

  if (!image) {
    return res.status(400).json({ error: 'Parameter "image" is required (URL/Base64)' });
  }

  try {
    const result = await removebg({ ...params, mode });
    if (result.buffer) {
      res.setHeader("Content-Type", result.contentType);
      return res.status(200).send(result.buffer);
    }
    return res.status(400).json({ error: "Failed to process image." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
