# Label Check — Alcohol Label Verification

Standalone prototype for TTB-style compliance review: upload a **Label Image**, enter **Declared Fields** from the application, and get a **Verification Result** (match / mismatch / needs review) in a few seconds.

Not connected to COLA. Images are processed in-memory for the request and not stored.

## Quick start

```bash
npm install
cp .env.example .env.local
# set OPENAI_API_KEY in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo path

1. Upload [`public/samples/old-tom-bourbon.png`](public/samples/old-tom-bourbon.png)
2. Keep the prefilled sample Declared Fields (or click **Reset sample values**)
3. Click **Verify label**

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js app |
| `npm test` | Comparison unit tests |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Production build |

## Approach

1. **Extraction** — OpenAI vision (`gpt-4o` by default) reads structured fields from the Label Image.
2. **Comparison** — a pure TypeScript module applies matching policy (see `docs/adr/0002-matching-policy.md`):
   - **Government Warning**: exact text, all-caps `GOVERNMENT WARNING:` lead-in
   - **Brand Name**: case- and punctuation-tolerant
   - **Other fields**: light whitespace/punctuation normalization
3. **UI** — single-screen flow aimed at non-technical Compliance Agents: upload, fields, one primary button, clear result table.

Primary test seam: `compareFields()` in `src/lib/compare-fields.ts`.

## Assumptions

- MVP is **single label** verification (batch is stretch / out of scope).
- Cloud vision APIs are acceptable for this take-home demo.
- Compliance agents keep final judgment; the tool surfaces Field Checks, it does not auto-approve applications.
- Standard US health warning wording is used for the sample.

## Trade-offs and limits

- **Network / FedRAMP**: production TTB networks may block outbound ML endpoints; this prototype assumes outbound OpenAI access.
- **API cost / key**: verification requires `OPENAI_API_KEY`. Without it the UI loads but verify returns an error.
- **Photo quality**: extreme glare/angles may yield `needs review`; not a dedicated vision pipeline.
- **No COLA integration**, no persistence, no auth.
- **Batch upload** not implemented.

## Domain language

See [`CONTEXT.md`](CONTEXT.md) and ADRs under [`docs/adr/`](docs/adr/).

## Deploy (Vercel)

To keep a durable production URL and enable extraction:

```bash
./scripts/claim-and-configure-deploy.sh
# or manually:
npx vercel login
npx vercel --prod
npx vercel env add OPENAI_API_KEY production
```