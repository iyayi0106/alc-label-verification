# Exact Government Warning; tolerant Brand Name

Government Warning Field Checks require exact statement text and an all-caps `GOVERNMENT WARNING:` lead-in, matching how agents reject title-case variants. Brand Name Field Checks normalize case and punctuation so cosmetic differences (e.g. `STONE'S THROW` vs `Stone's Throw`) are matches, not mismatches.

## Consequences

- Warning mismatches are high-signal for agents; brand matches reduce false alarms on routine casing noise.
- Other Declared Fields (class/type, alcohol content, net contents) use normalized string comparison with light whitespace/punctuation folding.
