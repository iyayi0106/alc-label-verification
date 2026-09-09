"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  FIELD_KEYS,
  FIELD_LABELS,
  SAMPLE_DECLARED_FIELDS,
  type FieldCheck,
  type FieldKey,
  type LabelFields,
  type VerificationResult,
} from "@/lib/label-fields";

type VerifyResponse = {
  extracted?: LabelFields;
  result?: VerificationResult;
  error?: string;
};

const emptyFields = (): LabelFields => ({
  brandName: "",
  classType: "",
  alcoholContent: "",
  netContents: "",
  governmentWarning: "",
});

function statusStyles(status: FieldCheck["status"]) {
  switch (status) {
    case "match":
      return {
        label: "Match",
        className: "bg-[var(--match-bg)] text-[var(--match)]",
      };
    case "mismatch":
      return {
        label: "Mismatch",
        className: "bg-[var(--mismatch-bg)] text-[var(--mismatch)]",
      };
    default:
      return {
        label: "Needs review",
        className: "bg-[var(--review-bg)] text-[var(--review)]",
      };
  }
}

export default function HomePage() {
  const [fields, setFields] = useState<LabelFields>(SAMPLE_DECLARED_FIELDS);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [extracted, setExtracted] = useState<LabelFields | null>(null);

  const canSubmit = useMemo(() => Boolean(file) && !loading, [file, loading]);

  function updateField(key: FieldKey, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function onFileChange(next: File | null) {
    setFile(next);
    setResult(null);
    setExtracted(null);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
  }

  async function loadSampleImage() {
    setError(null);
    try {
      const response = await fetch("/samples/old-tom-bourbon.png");
      if (!response.ok) {
        throw new Error("Could not load the sample label image.");
      }
      const blob = await response.blob();
      const sample = new File([blob], "old-tom-bourbon.png", {
        type: blob.type || "image/png",
      });
      onFileChange(sample);
      setFields(SAMPLE_DECLARED_FIELDS);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load sample image.",
      );
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("Choose a label image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setExtracted(null);

    const body = new FormData();
    body.append("labelImage", file);
    for (const key of FIELD_KEYS) {
      body.append(key, fields[key]);
    }

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        body,
      });
      const data = (await response.json()) as VerifyResponse;
      if (!response.ok) {
        throw new Error(data.error ?? "Verification failed.");
      }
      if (!data.result) {
        throw new Error("Verification returned no result.");
      }
      setResult(data.result);
      setExtracted(data.extracted ?? emptyFields());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-5 py-10 sm:px-8">
      <header className="space-y-3 border-b border-[var(--line)] pb-6">
        <p className="brand text-sm font-semibold tracking-[0.08em] text-[var(--accent)] uppercase">
          Label Check
        </p>
        <h1 className="max-w-3xl text-4xl leading-tight font-semibold text-[var(--ink)] sm:text-5xl">
          Check a label against the application
        </h1>
        <p className="max-w-2xl text-lg text-[var(--ink)]/80">
          Upload the label image, confirm the application fields, and get a
          clear match / mismatch / needs-review result in a few seconds.
        </p>
      </header>

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Label image</h2>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Choose image</span>
            <input
              type="file"
              accept="image/*"
              className="block w-full rounded-md border border-[var(--line)] bg-white px-3 py-3 text-base"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            type="button"
            onClick={loadSampleImage}
            className="rounded-md border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--paper)]"
          >
            Use sample Old Tom label
          </button>
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Selected label preview"
              className="max-h-80 w-full rounded-md border border-[var(--line)] object-contain bg-white"
            />
          ) : (
            <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-[var(--line)] bg-white/50 text-[var(--ink)]/60">
              No image selected yet
            </div>
          )}
          <p className="text-sm text-[var(--ink)]/70">
            Tip: try{" "}
            <code className="rounded bg-white px-1 py-0.5 text-sm">
              public/samples/old-tom-bourbon.png
            </code>{" "}
            with the prefilled fields below.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-2xl font-semibold">2. Application fields</h2>
            <button
              type="button"
              className="text-sm font-semibold text-[var(--accent)] underline-offset-2 hover:underline"
              onClick={() => setFields(SAMPLE_DECLARED_FIELDS)}
            >
              Reset sample values
            </button>
          </div>

          {FIELD_KEYS.map((key) => (
            <label key={key} className="block space-y-1.5">
              <span className="text-sm font-semibold">{FIELD_LABELS[key]}</span>
              {key === "governmentWarning" ? (
                <textarea
                  value={fields[key]}
                  onChange={(e) => updateField(key, e.target.value)}
                  rows={5}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-base leading-relaxed"
                />
              ) : (
                <input
                  value={fields[key]}
                  onChange={(e) => updateField(key, e.target.value)}
                  className="w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-base"
                />
              )}
            </label>
          ))}
        </section>

        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-md bg-[var(--accent)] px-6 py-3 text-lg font-semibold text-white transition enabled:hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Checking label…" : "Verify label"}
          </button>
          {loading ? (
            <p className="mt-3 text-[var(--ink)]/70">
              Reading the label and comparing fields. This usually takes a few
              seconds.
            </p>
          ) : null}
        </div>
      </form>

      {error ? (
        <div
          role="alert"
          className="rounded-md border border-[var(--mismatch)] bg-[var(--danger-bg)] px-4 py-3 text-[var(--mismatch)]"
        >
          {error}
        </div>
      ) : null}

      {result && extracted ? (
        <section className="space-y-4 border-t border-[var(--line)] pt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-semibold">3. Verification result</h2>
            <p className="text-sm text-[var(--ink)]/75">
              {result.summary.matchCount} match · {result.summary.mismatchCount}{" "}
              mismatch · {result.summary.needsReviewCount} needs review
            </p>
          </div>

          <div className="overflow-x-auto rounded-md border border-[var(--line)] bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--line)] bg-[var(--paper)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Field</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Declared</th>
                  <th className="px-4 py-3 font-semibold">Extracted</th>
                </tr>
              </thead>
              <tbody>
                {result.checks.map((check) => {
                  const styles = statusStyles(check.status);
                  return (
                    <tr
                      key={check.field}
                      className="border-b border-[var(--line)] align-top last:border-b-0"
                    >
                      <td className="px-4 py-3 font-semibold">
                        {FIELD_LABELS[check.field]}
                        <div className="mt-1 text-xs font-normal text-[var(--ink)]/65">
                          {check.detail}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-bold tracking-wide uppercase ${styles.className}`}
                        >
                          {styles.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-pre-wrap">
                        {check.declared || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-pre-wrap">
                        {check.extracted || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <footer className="mt-auto border-t border-[var(--line)] pt-6 text-sm text-[var(--ink)]/65">
        Standalone prototype — not connected to COLA. Images are processed in
        memory for this request and are not stored.
      </footer>
    </main>
  );
}
