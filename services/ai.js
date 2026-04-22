import OpenAI from "openai";

function stripCommand(text) {
  return text
    .replace(/^修正して\s*/, "")
    .replace(/^誤字修正\s*/, "")
    .replace(/^要約して\s*/, "")
    .replace(/^要約\s*/, "")
    .replace(/^リスト化して\s*/, "")
    .replace(/^リスト化\s*/, "")
    .replace(/^予定整理して\s*/, "")
    .replace(/^予定整理\s*/, "")
    .replace(/^敬語にして\s*/, "")
    .replace(/^丁寧にして\s*/, "")
    .replace(/^自然にして\s*/, "")
    .trim();
}

function buildPrompt(mode, text) {
  const body = stripCommand(text);

  if (mode === "correct") {
    return `
次の日本語の誤字脱字や不自然な表現を直してください。
説明は不要です。JSONで返してください。

本文:
${body}

返答形式:
{"title":"誤字修正","output":"..."}
`.trim();
  }

  if (mode === "summary") {
    return `
次の文章を短く自然に要約してください。
説明は不要です。JSONで返してください。

本文:
${body}

返答形式:
{"title":"要約","output":"..."}
`.trim();
  }

  if (mode === "polite") {
    return `
次の文章を自然で丁寧な敬語に直してください。
硬すぎず、LINEで使いやすい文体にしてください。
説明は不要です。JSONで返してください。

本文:
${body}

返答形式:
{"title":"敬語変換","output":"..."}
`.trim();
  }

  if (mode === "natural") {
    return `
次の文章を、意味を変えずに自然で読みやすい日本語に整えてください。
説明は不要です。JSONで返してください。

本文:
${body}

返答形式:
{"title":"自然な表現","output":"..."}
`.trim();
  }

  if (mode === "list") {
    return `
次の文章を見やすいリストに整理してください。
持ち物、買い物、やることのような短い項目に分けてください。
JSONで返してください。

本文:
${body}

返答形式:
{"title":"リスト整理","items":[{"label":"..."}]}
`.trim();
  }

  if (mode === "schedule") {
    return `
次の文章から予定を抽出して、時間と内容に分けて整理してください。
時間が不明なら「未指定」にしてください。
JSONで返してください。

本文:
${body}

返答形式:
{"title":"予定整理","items":[{"time":"...","task":"..."}]}
`.trim();
  }

  return `
次の文章を整えてください。JSONで返してください。

本文:
${body}

返答形式:
{"title":"結果","output":"..."}
`.trim();
}

export async function askAI({ mode, text }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({ apiKey });
  const prompt = buildPrompt(mode, text);

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "あなたはLINE用の日本語テキスト整理アシスタントです。必ず有効なJSONのみを返してください。説明文や前置きは禁止です。",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}