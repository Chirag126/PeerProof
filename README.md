# PeerProof

**AI-assisted research paper claim & citation verification, with integrity fingerprints.**

Academic prototype — School of Science and Mathematics, DES Pune University (2026–27, Sem V).
Team: Chirag Pardeshi, Saee Nimbalkar, Sharvari Chinchkar · Guide: Smita Patil.

## What it does

1. **Input** – paste a paper or upload `.txt`, `.md`, `.pdf` or `.docx`.
2. **Text processing** – detects sections, sentences and the reference list.
3. **Claim identification** – scores sentences using finding verbs, effect words, numbers and citations.
4. **Citation mapping** – links `[1]`, `[2–4]`, `(Author, 2020)` and `Author (2020)` to references.
5. **Source review** – compares each claim with the cited source text (term overlap, numbers, hedging, negation).
6. **Classification** – Supported / Partially Supported / Unverified / Requires Review, each with a rationale and uncertainty.
7. **Report** – exportable JSON report with SHA-256 fingerprints of the paper and the report.
8. **Integrity check** – recompute fingerprints later to detect any change to the paper or the report.

Everything runs in the browser — no server, nothing uploaded. Results are **indicative and require human review**.

## Run the demo

No build step. Either:

- open `index.html` directly in Chrome/Edge, or
- serve the folder: `python3 -m http.server 8080` → <http://localhost:8080>, or
- enable **GitHub Pages** (Settings → Pages → branch `main`, folder `/`).

Click **Try sample paper → Run verification** to see every category. The sample paper and its references are synthetic, written only for the demo.

PDF and DOCX import load `pdf.js` / `mammoth.js` from a CDN, so they need internet; `.txt`/pasted text works offline.

## Suggested demo script

1. Dashboard → **Try sample paper** → **Run verification**.
2. Open the report: walk through a Supported claim, the 40% vs 25% numeric mismatch, the overstated "all learners" claim, and the broken citation `[9]`.
3. **Integrity** tab → **Verify this report** → **Use sample paper text** → run: all green.
4. Change one word in the pasted text and run again: mismatch detected.

## Structure

```
index.html        app shell + sidebar
css/styles.css    light-green / white theme
js/engine.js      verification engine (also runs in Node)
js/sample.js      synthetic sample paper + source abstracts
js/app.js         pages: dashboard, new verification, reports, integrity, methodology, about
```

Quick engine test: `node -e 'const E=require("./js/engine.js");console.log(E.analyze(require("./js/sample.js")).stats)'`
