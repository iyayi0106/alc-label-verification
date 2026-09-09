import { describe, expect, it } from "vitest";
import { compareFields } from "./compare-fields";
import type { LabelFields } from "./label-fields";

const baseDeclared: LabelFields = {
  brandName: "Stone's Throw",
  classType: "Kentucky Straight Bourbon Whiskey",
  alcoholContent: "45% Alc./Vol. (90 Proof)",
  netContents: "750 mL",
  governmentWarning:
    "GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.",
};

describe("compareFields", () => {
  it("matches brand names that differ only by case and punctuation", () => {
    const result = compareFields(baseDeclared, {
      ...baseDeclared,
      brandName: "STONE'S THROW",
    });

    const brand = result.checks.find((c) => c.field === "brandName");
    expect(brand?.status).toBe("match");
  });

  it("mismatches brand names with different wording", () => {
    const result = compareFields(baseDeclared, {
      ...baseDeclared,
      brandName: "River Bend",
    });

    expect(result.checks.find((c) => c.field === "brandName")?.status).toBe(
      "mismatch",
    );
  });

  it("requires exact government warning text including all-caps lead-in", () => {
    const titleCaseLeadIn = baseDeclared.governmentWarning.replace(
      "GOVERNMENT WARNING:",
      "Government Warning:",
    );

    const result = compareFields(baseDeclared, {
      ...baseDeclared,
      governmentWarning: titleCaseLeadIn,
    });

    const warning = result.checks.find((c) => c.field === "governmentWarning");
    expect(warning?.status).toBe("mismatch");
  });

  it("matches an identical government warning", () => {
    const result = compareFields(baseDeclared, baseDeclared);
    expect(
      result.checks.find((c) => c.field === "governmentWarning")?.status,
    ).toBe("match");
  });

  it("marks missing extracted values as needs_review", () => {
    const result = compareFields(baseDeclared, {
      brandName: "Stone's Throw",
      classType: "",
      alcoholContent: "45% Alc./Vol. (90 Proof)",
      netContents: "750 mL",
      governmentWarning: baseDeclared.governmentWarning,
    });

    expect(result.checks.find((c) => c.field === "classType")?.status).toBe(
      "needs_review",
    );
    expect(result.summary.needsReviewCount).toBeGreaterThanOrEqual(1);
  });

  it("tolerates whitespace noise on class/type and net contents", () => {
    const result = compareFields(baseDeclared, {
      ...baseDeclared,
      classType: "  Kentucky   Straight Bourbon Whiskey ",
      netContents: "750mL",
    });

    expect(result.checks.find((c) => c.field === "classType")?.status).toBe(
      "match",
    );
    expect(result.checks.find((c) => c.field === "netContents")?.status).toBe(
      "match",
    );
  });

  it("summarizes counts across all field checks", () => {
    const result = compareFields(baseDeclared, {
      brandName: "STONE'S THROW",
      classType: "Wine",
      alcoholContent: "45% Alc./Vol. (90 Proof)",
      netContents: "",
      governmentWarning: baseDeclared.governmentWarning,
    });

    expect(result.summary).toEqual({
      matchCount: 3,
      mismatchCount: 1,
      needsReviewCount: 1,
    });
  });
});
