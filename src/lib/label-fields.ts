export const FIELD_KEYS = [
  "brandName",
  "classType",
  "alcoholContent",
  "netContents",
  "governmentWarning",
] as const;

export type FieldKey = (typeof FIELD_KEYS)[number];

export type FieldCheckStatus = "match" | "mismatch" | "needs_review";

export type LabelFields = Record<FieldKey, string>;

export type FieldCheck = {
  field: FieldKey;
  declared: string;
  extracted: string | null;
  status: FieldCheckStatus;
  detail: string;
};

export type VerificationResult = {
  checks: FieldCheck[];
  summary: {
    matchCount: number;
    mismatchCount: number;
    needsReviewCount: number;
  };
};

export const FIELD_LABELS: Record<FieldKey, string> = {
  brandName: "Brand name",
  classType: "Class / type",
  alcoholContent: "Alcohol content",
  netContents: "Net contents",
  governmentWarning: "Government warning",
};

export const SAMPLE_DECLARED_FIELDS: LabelFields = {
  brandName: "OLD TOM DISTILLERY",
  classType: "Kentucky Straight Bourbon Whiskey",
  alcoholContent: "45% Alc./Vol. (90 Proof)",
  netContents: "750 mL",
  governmentWarning:
    "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.",
};

/** Canonical lead-in required on US alcohol labels. */
export const GOVERNMENT_WARNING_LEAD_IN = "GOVERNMENT WARNING:";
