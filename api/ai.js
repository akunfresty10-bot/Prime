/*
 * Created by : febry.is-a.dev
 * GitHub     : vandebry10-star
 * Date       : 16-08-2026
 * * Do not remove the creator's watermark, please respect the creator.
 */

import axios from "axios";

function SpoofHead() {
  const ip = () => Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join(".");
  const randomIp = ip();
  return {
    "x-forwarded-for": randomIp,
    "x-real-ip": randomIp,
    "client-ip": randomIp
  };
}

class DocsBotAI {
  constructor() {
    this.base = "https://docsbot.ai";
    this.api = axios.create({
      baseURL: this.base,
      headers: {
        accept: "*/*",
        "accept-language": "id-ID",
        "content-type": "application/json",
        origin: this.base,
        referer: this.base,
        "sec-ch-ua": '"Chromium";v="127", "Not)A;Brand";v="99"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36",
        ...SpoofHead()
      }
    });
    this.modes = ["text", "chat", "youtube", "yt"];
    this.tones = ["Neutral Expert", "Academic Researcher", "Friendly Guide", "Persuasive Pitch", "Support Hero", "Technical Mentor"];
    this.lengths = ["Quick Snapshot", "Balanced Breakdown", "Deep Dive"];
    this.formats = ["Guided Paragraphs", "Bullet Answers", "Step-by-Step Playbook"];
    this.ytTypes = ["summary", "transcript", "chapters"];
  }

  validate(value, list, def) {
    return list?.includes?.(value) ? value : def || list?.[0];
  }

  extractYtId(url) {
    if (!url) throw new Error("YouTube URL is required");
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/, /^([a-zA-Z0-9_-]{11})$/];
    for (const p of patterns) {
      const m = url?.match?.(p);
      if (m?.[1]) return m[1];
    }
    return url;
  }

  async generate({
    mode,
    prompt,
    url,
    context,
    tone,
    answerLength,
    formatPreference,
    type,
    ...rest
  }) {
    try {
      const inputMode = (mode || "").toLowerCase();
      const m = this.validate(inputMode, this.modes, "");

      if (m === "text" || m === "chat") {
        const input = prompt || rest?.input;
        if (!input) {
          return {
            error: true,
            message: "Validation failed",
            missing: ["prompt/input"]
          };
        }

        const payload = {
          type: "answer-generator",
          input: input,
          context: context || rest?.context || "",
          tone: this.validate(tone, this.tones),
          answerLength: this.validate(answerLength, this.lengths),
          formatPreference: this.validate(formatPreference, this.formats)
        };

        const { data } = await this.api.post("/api/tools/text-prompter", payload);
        return {
          error: false,
          status: true,
          mode: "text",
          data: data
        };
      }

      if (m === "youtube" || m === "yt") {
        const ytUrl = url || prompt || rest?.videoUrl || rest?.url;
        if (!ytUrl) {
          return {
            error: true,
            message: "Validation failed",
            missing: ["url/videoUrl"]
          };
        }

        const ytId = this.extractYtId(ytUrl);
        const ytType = this.validate(type || rest?.type, this.ytTypes);

        const { data } = await this.api.post("/api/tools/youtube-prompter", {
          videoUrl: ytUrl,
          type: ytType
        });

        return {
          error: false,
          status: true,
          mode: "youtube",
          type: ytType,
          videoId: ytId,
          data: data
        };
      }

      return {
        error: true,
        message: "Invalid mode",
        available_modes: ["text", "youtube"]
      };
    } catch (e) {
      return {
        error: true,
        message: e?.response?.data?.error || e.message,
        details: e?.response?.data || null
      };
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const params = req.method === "GET" ? req.query : req.body;
  const api = new DocsBotAI();
  try {
    const data = await api.generate(params);
    const status = data.error ? 400 : 200;
    return res.status(status).json(data);
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: {
        text: "Server Error",
        details: error.message || "Unknown error"
      }
    });
  }
}
