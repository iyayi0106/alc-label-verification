import OpenAI from "openai";
import {
  FIELD_KEYS,
  type FieldKey,
  type LabelFields,
} from "./label-fields";

const EXTRACTION_PROMPT = `You extract alcohol beverage label fields from a label image for TTB compliance review.
Return ONLY valid JSON with these exact keys:
{
  "brandName": string,
  "classType": string,
  "alcoholContent": string,
  "netContents": string,
  "governmentWarning": string
}
Rules:
- Use empty string when a field is not visible or unreadable.
- For governmentWarning, copy the warning text exactly as printed, including capitalization of "GOVERNMENT WARNING:" when present.
- Do not invent values that are not on the label.`;

function emptyFields(): LabelFields {
  return {
    brandName: "",
    classType: "",
    alcoholContent: "",
    netContents: "",
    governmentWarning: "",
  };
}

function coerceFields(raw: unknown): LabelFields {
  const out = emptyFields();
  if (!raw || typeof raw !== "object") {
    return out;
  }
  const obj = raw as Record<string, unknown>;
  for (const key of FIELD_KEYS) {
    const value = obj[key];
    out[key as FieldKey] = typeof value === "string" ? value : "";
  }
  return out;
}

export async function extractFieldsFromImage(params: {
  imageBase64: string;
  mimeType: string;
  apiKey?: string;
}): Promise<LabelFields> {
  const apiKey = params.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to .env.local or your host secrets.",
    );
  }

  const client = new OpenAI({ apiKey });
  const dataUrl = `data:${params.mimeType};base64,${params.imageBase64}`;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_VISION_MODEL ?? "gpt-4o",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: EXTRACTION_PROMPT },
          {
            type: "image_url",
            image_url: { url: dataUrl, detail: "high" },
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Vision model returned an empty response.");
  }

  try {
    return coerceFields(JSON.parse(content));
  } catch {
    throw new Error("Vision model returned invalid JSON.");
  }
}
