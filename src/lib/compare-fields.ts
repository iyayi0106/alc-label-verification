import {
  FIELD_KEYS,
  GOVERNMENT_WARNING_LEAD_IN,
  type FieldCheck,
  type FieldCheckStatus,
  type FieldKey,
  type LabelFields,
  type VerificationResult,
} from "./label-fields";

function collapseWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/** Brand: case- and punctuation-insensitive, spaces collapsed. */
function normalizeBrand(value: string): string {
  return collapseWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "");
}

/** General fields: case-insensitive, whitespace collapsed, light punctuation fold. */
function normalizeGeneral(value: string): string {
  return collapseWhitespace(value)
    .toLowerCase()
    .replace(/[./(),]/g, "")
    .replace(/\s+/g, "");
}

function isBlank(value: string | null | undefined): boolean {
  return value == null || value.trim() === "";
}

function checkBrand(declared: string, extracted: string): FieldCheckStatus {
  return normalizeBrand(declared) === normalizeBrand(extracted)
    ? "match"
    : "mismatch";
}

function checkGeneral(declared: string, extracted: string): FieldCheckStatus {
  return normalizeGeneral(declared) === normalizeGeneral(extracted)
    ? "match"
    : "mismatch";
}

function checkGovernmentWarning(
  declared: string,
  extracted: string,
): FieldCheckStatus {
  const declaredNorm = collapseWhitespace(declared);
  const extractedNorm = collapseWhitespace(extracted);

  if (!extractedNorm.startsWith(GOVERNMENT_WARNING_LEAD_IN)) {
    return "mismatch";
  }

  return declaredNorm === extractedNorm ? "match" : "mismatch";
}

function detailFor(
  field: FieldKey,
  status: FieldCheckStatus,
): string {
  if (status === "needs_review") {
    return "Could not read this field from the label image.";
  }
  if (status === "match") {
    return field === "brandName"
      ? "Brand names match (case and punctuation ignored)."
      : field === "governmentWarning"
        ? "Government warning matches exactly, including lead-in capitalization."
        : "Values match after light normalization.";
  }
  if (field === "governmentWarning") {
    return "Government warning must match exactly, with an all-caps GOVERNMENT WARNING: lead-in.";
  }
  if (field === "brandName") {
    return "Brand names differ beyond case and punctuation.";
  }
  return "Declared and extracted values do not match.";
}

function compareOne(
  field: FieldKey,
  declared: string,
  extracted: string | null,
): FieldCheck {
  if (isBlank(extracted)) {
    return {
      field,
      declared,
      extracted: extracted?.trim() ? extracted : null,
      status: "needs_review",
      detail: detailFor(field, "needs_review"),
    };
  }

  const extractedText = extracted as string;
  let status: FieldCheckStatus;
  if (field === "brandName") {
    status = checkBrand(declared, extractedText);
  } else if (field === "governmentWarning") {
    status = checkGovernmentWarning(declared, extractedText);
  } else {
    status = checkGeneral(declared, extractedText);
  }

  return {
    field,
    declared,
    extracted: extractedText,
    status,
    detail: detailFor(field, status),
  };
}

export function compareFields(
  declared: LabelFields,
  extracted: LabelFields,
): VerificationResult {
  const checks = FIELD_KEYS.map((key) =>
    compareOne(key, declared[key] ?? "", extracted[key] ?? ""),
  );

  return {
    checks,
    summary: {
      matchCount: checks.filter((c) => c.status === "match").length,
      mismatchCount: checks.filter((c) => c.status === "mismatch").length,
      needsReviewCount: checks.filter((c) => c.status === "needs_review")
        .length,
    },
  };
}
