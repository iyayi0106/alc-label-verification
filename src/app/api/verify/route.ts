import { NextResponse } from "next/server";
import { compareFields } from "@/lib/compare-fields";
import { extractFieldsFromImage } from "@/lib/extract-fields";
import {
  FIELD_KEYS,
  type FieldKey,
  type LabelFields,
} from "@/lib/label-fields";

export const runtime = "nodejs";
export const maxDuration = 30;

function readDeclaredFields(formData: FormData): LabelFields {
  const fields = {} as LabelFields;
  for (const key of FIELD_KEYS) {
    const value = formData.get(key);
    fields[key as FieldKey] = typeof value === "string" ? value : "";
  }
  return fields;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("labelImage");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Please upload a label image." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Label upload must be an image file." },
        { status: 400 },
      );
    }

    const declared = readDeclaredFields(formData);
    const buffer = Buffer.from(await file.arrayBuffer());
    const imageBase64 = buffer.toString("base64");

    const extracted = await extractFieldsFromImage({
      imageBase64,
      mimeType: file.type || "image/jpeg",
    });

    const result = compareFields(declared, extracted);

    return NextResponse.json({
      extracted,
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Verification failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
