# Next.js app with vision extraction and Vercel deploy

Needs a public URL and fast iteration. Will use a Next.js App Router app, OpenAI vision for Label Image field extraction, and Vercel for hosting so the deployed demo is simple to ship.

## Considered Options

- Next.js + OpenAI vision + Vercel (chosen)
- Separate Python FastAPI + React SPA
- Fully local Tesseract-only (weaker field structure, harder multi-line warning checks)

## Consequences

- Demo requires `OPENAI_API_KEY` at runtime; document clearly in README.
- Real TTB networks may block outbound ML endpoints; acceptable for this standalone prototype, noted as a production constraint.
