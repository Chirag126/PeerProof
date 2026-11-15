/*
 * PeerProof verification engine
 * ------------------------------------------------------------
 * Runs entirely in the browser (and in Node for testing).
 * Pipeline (matches Section 6 of the project report):
 *   1. Input            -> normalise text
 *   2. Text processing  -> sections, sentences, reference list
 *   3. Claim detection  -> score sentences using claim cues
 *   4. Citation mapping -> [n], [n-m], (Author, Year), Author (Year)
 *   5. Source review    -> compare claim with cited-source text
 *   6. Classification   -> Supported / Partially Supported /
 *                          Unverified / Requires Review + rationale
 *   7. Report           -> structured report + SHA-256 fingerprints
 *
 * All results are INDICATIVE and require human review.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PeerProofEngine = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const ENGINE_VERSION = "PeerProof-Engine@1.0.0";

  const CATEGORIES = {
    SUPPORTED: "Supported",
    PARTIAL: "Partially Supported",
    UNVERIFIED: "Unverified",
    REVIEW: "Requires Review",
  };

  const STOPWORDS = new Set(
    ("a an the and or but if then than that this these those there their they them it its is are was were be been being " +
      "of to in on at by for with from into onto over under as about after before between during through within without " +
      "we our us you your he she his her i me my not no nor so such can could would should may might will shall do does did " +
      "has have had having also both each other more most less least very which who whom whose what when where why how " +
      "al et fig figure table e g i e vs etc study studies paper papers work research results result using used use based " +
      "shown show shows showed found find finds finding findings report reports reported prior previous recent however while compared earlier consistent appears")
      .split(/\s+/)
  );

  const HEADING_WORDS =
    /^(abstract|introduction|background|related work|literature review|method|methods|methodology|materials and methods|experimental setup|experiments?|results?|results and discussion|discussion|analysis|evaluation|conclusions?|conclusion and future (work|scope)|future work|limitations|acknowledg(e)?ments?|references|bibliography|works cited|literature cited|appendix.*)$/i;

  const REF_HEADING = /^(references|bibliography|works cited|literature cited|reference list)$/i;

  /* ---------------- 1. Input ---------------- */
  function normalize(text) {
    return String(text || "")
      .replace(/\r\n?/g, "\n")
      .replace(/­/g, "")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/ﬁ/g, "fi")
      .replace(/ﬂ/g, "fl")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  /* ---------------- 2. Text processing ---------------- */
  function stripNumbering(line) {
    return line.replace(/^\s*((\d+(\.\d+)*\.?)|([IVX]+\.))\s+/, "").replace(/[:.]$/, "").trim();
  }

  function isHeading(line) {
    const t = line.trim();
    if (!t || t.length > 70) return false;
    const bare = stripNumbering(t);
    if (HEADING_WORDS.test(bare)) return true;
    // Numbered short title-like line, e.g. "2. Experimental Design"
    if (/^\d+(\.\d+)*\.?\s+[A-Z]/.test(t) && !/[.!?]$/.test(t) && t.split(/\s+/).length <= 8) return true;
    // ALL CAPS short line
    if (/^[A-Z][A-Z0-9 &\-:]{3,}$/.test(t) && t.split(/\s+/).length <= 6) return true;
    return false;
  }

  function splitSections(text) {
    const lines = text.split("\n");
    const sections = [];
    let current = { heading: "Front matter", lines: [] };
    for (const line of lines) {
      if (isHeading(line)) {
        if (current.lines.join("").trim() || current.heading !== "Front matter") sections.push(current);
        current = { heading: stripNumbering(line.trim()), lines: [] };
      } else current.lines.push(line);
    }
    sections.push(current);
    return sections.map((s) => ({ heading: s.heading, body: s.lines.join("\n").trim() }));
  }

  const ABBREV = ["et al.", "e.g.", "i.e.", "Fig.", "fig.", "vs.", "Eq.", "eq.", "No.", "approx.", "cf.", "Dr.", "Prof.", "St.", "Vol.", "pp."];

  function splitSentences(body) {
    let t = body.replace(/-\n(?=[a-z])/g, "").replace(/\s*\n\s*/g, " ").trim();
    if (!t) return [];
    ABBREV.forEach((a, i) => {
      t = t.split(a).join(a.replace(/\./g, "\u0001" + i));
    });
    t = t.replace(/(\d)\.(\d)/g, "$1\u0002$2");
    const parts = t.split(/(?<=[.!?])\s+(?=[A-Z0-9"(\[])/);
    return parts
      .map((p) =>
        p
          .replace(/\u0001\d+/g, ".")
          .replace(/\u0002/g, ".")
          .trim()
      )
      .filter(Boolean);
  }

  /* ---------------- References ---------------- */
  function parseReferences(refText) {
    const lines = refText.split("\n").map((l) => l.trim()).filter(Boolean);
    const entries = [];
    const startRe = /^(\[(\d+)\]|(\d+)[.)])\s*/;
    const numbered = lines.some((l) => startRe.test(l));
    if (numbered) {
      for (const l of lines) {
        const m = l.match(startRe);
        if (m) entries.push({ num: parseInt(m[2] || m[3], 10), raw: l.replace(startRe, "").trim() });
        else if (entries.length) entries[entries.length - 1].raw += " " + l;
      }
    } else {
      // author-year: new entry when a line starts with "Surname, X" or "Surname X."
      for (const l of lines) {
        if (/^[A-Z][A-Za-z'\-]+,\s*[A-Z]/.test(l) || !entries.length) entries.push({ num: entries.length + 1, raw: l });
        else entries[entries.length - 1].raw += " " + l;
      }
    }
    return entries.map((e, i) => {
      const yearM = e.raw.match(/\b(19|20)\d{2}[a-z]?\b/);
      const surnameM = e.raw.match(/^([A-Z][A-Za-z'\-]+)/);
      const quoted = e.raw.match(/"([^"]{8,})"/);
      let title = quoted ? quoted[1] : "";
      if (!title) {
        const segs = e.raw.split(/\.\s+/).map((s) => s.trim());
        title = segs.slice(1).sort((a, b) => b.split(" ").length - a.split(" ").length)[0] || segs[0] || "";
      }
      return {
        id: String(e.num || i + 1),
        num: e.num || i + 1,
        raw: e.raw,
        surname: surnameM ? surnameM[1] : "",
        year: yearM ? yearM[0] : "",
        title: title.replace(/[.,]$/, ""),
      };
    });
  }

  /* ---------------- 4. Citation detection ---------------- */
  function expandNums(s) {
    const out = [];
    s.split(",").forEach((part) => {
      const r = part.trim().split(/\s*[-–]\s*/);
      if (r.length === 2) {
        const a = parseInt(r[0], 10), b = parseInt(r[1], 10);
        if (!isNaN(a) && !isNaN(b) && b >= a && b - a < 30) for (let k = a; k <= b; k++) out.push(k);
      } else if (!isNaN(parseInt(r[0], 10))) out.push(parseInt(r[0], 10));
    });
    return out;
  }

  function findCitations(sentence) {
    const cites = [];
    const numRe = /\[(\d+(?:\s*[-–,]\s*\d+)*)\]/g;
    let m;
    while ((m = numRe.exec(sentence))) expandNums(m[1]).forEach((n) => cites.push({ type: "numeric", marker: m[0], num: n }));
    const parenRe = /\(([^()]*?\b(?:19|20)\d{2}[a-z]?[^()]*)\)/g;
    while ((m = parenRe.exec(sentence))) {
      m[1].split(";").forEach((part) => {
        const a = part.match(/([A-Z][A-Za-z'\-]+)(?:\s+et al\.?|\s+(?:and|&)\s+[A-Z][A-Za-z'\-]+)?,?\s+((?:19|20)\d{2}[a-z]?)/);
        if (a) cites.push({ type: "author-year", marker: "(" + part.trim() + ")", surname: a[1], year: a[2] });
      });
    }
    const narrRe = /([A-Z][A-Za-z'\-]+)(?:\s+et al\.?|\s+(?:and|&)\s+[A-Z][A-Za-z'\-]+)?\s+\(((?:19|20)\d{2}[a-z]?)\)/g;
    while ((m = narrRe.exec(sentence))) cites.push({ type: "author-year", marker: m[0], surname: m[1], year: m[2] });
    return cites;
  }

  function stripCitations(s) {
    return s
      .replace(/\[(\d+(?:\s*[-–,]\s*\d+)*)\]/g, "")
      .replace(/\(([^()]*?\b(?:19|20)\d{2}[a-z]?[^()]*)\)/g, "")
      .replace(/\s+([.,;])/g, "$1")
      .trim();
  }

  function resolveCitation(c, refs) {
    if (c.type === "numeric") return refs.find((r) => r.num === c.num) || null;
    return (
      refs.find((r) => r.surname.toLowerCase() === c.surname.toLowerCase() && r.year === c.year) ||
      refs.find((r) => r.raw.toLowerCase().includes(c.surname.toLowerCase()) && r.raw.includes(c.year)) ||
      null
    );
  }

  /* ---------------- 3. Claim detection ---------------- */
  const CUE_FINDING = /\b(show(s|ed|n)?|demonstrat\w*|found|finds?|observ\w*|reveal\w*|indicat\w*|suggest\w*|confirm\w*|report(s|ed)?|prove[sdn]?|establish\w*|conclude[sd]?|findings?|evidence|consistent with|scored|outperformed)\b/i;
  const CUE_EFFECT = /\b(increas\w*|decreas\w*|improv\w*|reduc\w*|outperform\w*|enhanc\w*|strengthen\w*|higher|lower|better|worse|greater|significant(ly)?|effective\w*|associated|correlat\w*|leads? to|caus\w*|results? in|predict\w*|affect\w*|accura\w*|retain\w*|benefit\w*|more than|less than|fewer than|faster|slower|shorter|longer|disrupt\w*|delay\w*|worsen\w*|prevent\w*|boost\w*|harm\w*|protect\w*)\b/i;
  const CUE_QUANT = /(\d+(\.\d+)?\s*%|\bp\s*[<=>]\s*0?\.\d+|\bmean\b|\bodds ratio\b|\bn\s*=\s*\d+)/i;
  const CUE_META = /^(this (paper|study|report|work)|in this (paper|study)|we (propose|present|describe|organi[sz]e)|the (rest|remainder) of)/i;

  function scoreClaim(sentence, hasCitation, sectionName) {
    let score = 0;
    const reasons = [];
    if (CUE_FINDING.test(sentence)) { score += 2; reasons.push("finding verb"); }
    if (CUE_EFFECT.test(sentence)) { score += 2; reasons.push("effect / comparison"); }
    if (/\bsignificant(ly)?\b/i.test(sentence)) { score += 1; reasons.push("significance claim"); }
    if (CUE_QUANT.test(sentence)) { score += 1.5; reasons.push("quantitative value"); }
    else if (/\d/.test(stripCitations(sentence).replace(/\b(19|20)\d{2}\b/g, ""))) score += 0.5;
    if (hasCitation) { score += 2; reasons.push("citation"); }
    if (/^(abstract|results?|discussion|conclusions?|results and discussion)/i.test(sectionName)) score += 0.5;
    if (CUE_META.test(sentence)) score -= 2;
    if (/\?$/.test(sentence)) score -= 3;
    return { score, reasons };
  }

  /* ---------------- 5. Source comparison ---------------- */
  function stem(w) {
    let s = w.toLowerCase();
    if (s.length > 4 && s.endsWith("ies")) s = s.slice(0, -3) + "y";
    else if (s.length > 4 && s.endsWith("s") && !s.endsWith("ss")) s = s.slice(0, -1);
    return s.length > 6 ? s.slice(0, 6) : s;
  }

  function tokens(text) {
    return (text.toLowerCase().match(/[a-z][a-z\-']+/g) || [])
      .map((w) => w.replace(/'s$/, "").replace(/^-+|-+$/g, ""))
      .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  }

  function numbersIn(text) {
    return (stripCitations(text).match(/\d+(\.\d+)?/g) || []).filter((n) => !/^(19|20)\d{2}$/.test(n));
  }

  const STRONG = /\b(prove[sdn]?|always|all|never|definitively|conclusively|guarantee[sd]?|every|undeniabl\w*|regardless|universally|certainly)\b/i;
  const HEDGE = /\b(may|might|could|suggests?|preliminary|limited|small (sample|pilot)|pilot|further research|unclear|mixed|modest|in some|tentative|only)\b/i;
  const NEGATION = /\b(not significant|no significant|did not|does not|do not|failed to|no evidence|no effect|not associated|was not|were not)\b/i;

  function compareWithSource(claimText, sourceText) {
    const clean = stripCitations(claimText);
    const cTok = tokens(clean);
    const cStem = [...new Set(cTok.map(stem))];
    if (!cStem.length) return null;
    const srcSentences = splitSentences(sourceText);
    const srcStemAll = new Set(tokens(sourceText).map(stem));
    let best = { overlap: 0, sentence: srcSentences[0] || "" };
    for (const s of srcSentences) {
      const st = new Set(tokens(s).map(stem));
      const ov = cStem.filter((x) => st.has(x)).length / cStem.length;
      if (ov > best.overlap) best = { overlap: ov, sentence: s };
    }
    const coverage = cStem.filter((x) => srcStemAll.has(x)).length / cStem.length;
    const score = 0.6 * best.overlap + 0.4 * coverage;

    const missingTerms = [];
    const seen = new Set();
    for (const w of cTok) {
      const st = stem(w);
      if (!srcStemAll.has(st) && !seen.has(st)) { missingTerms.push(w); seen.add(st); }
    }
    const matchedStems = cStem.filter((x) => srcStemAll.has(x));

    const cNums = numbersIn(clean);
    const sNums = numbersIn(sourceText);
    const mismatchedNums = cNums.filter((n) => !sNums.includes(n));
    const numericMismatch = cNums.length > 0 && mismatchedNums.length > 0;

    const overclaim = STRONG.test(clean) && HEDGE.test(sourceText);
    let contradiction = NEGATION.test(best.sentence) && !NEGATION.test(clean);
    // Scope gap: a claim term absent from the best evidence appears in a negated source sentence
    // e.g. claim "... in nursing students" vs source "The study did not include students."
    let scopeGap = "";
    if (!contradiction && !NEGATION.test(clean)) {
      const bestStems = new Set(tokens(best.sentence).map(stem));
      for (const s of srcSentences) {
        if (s === best.sentence || !NEGATION.test(s)) continue;
        const hit = tokens(s).find((w) => cStem.includes(stem(w)) && !bestStems.has(stem(w)));
        if (hit) { contradiction = true; scopeGap = hit; best.sentence = best.sentence + " " + s; break; }
      }
    }

    return {
      score: Math.round(score * 100) / 100,
      bestOverlap: Math.round(best.overlap * 100) / 100,
      coverage: Math.round(coverage * 100) / 100,
      evidence: best.sentence,
      matchedStems,
      missingTerms: missingTerms.slice(0, 6),
      claimNumbers: cNums,
      sourceNumbers: numbersIn(best.sentence),
      mismatchedNums,
      numericMismatch,
      overclaim,
      contradiction,
      scopeGap,
    };
  }

  /* ---------------- 6. Classification ---------------- */
  function classify(claim, refs, sources) {
    const cites = claim.citations;
    if (!cites.length) {
      return {
        category: CATEGORIES.UNVERIFIED,
        rationale:
          "No citation is attached to this claim. If it is the authors' own finding, check it against the reported methods and data.",
        uncertainty: "High - no external evidence linked.",
        comparisons: [],
      };
    }
    const resolved = cites.map((c) => ({ cite: c, ref: resolveCitation(c, refs) }));
    const missing = resolved.filter((r) => !r.ref);
    const found = resolved.filter((r) => r.ref);
    if (!found.length) {
      return {
        category: CATEGORIES.REVIEW,
        rationale:
          "Citation " + missing.map((m) => m.cite.marker).join(", ") +
          " has no matching entry in the reference list. The source cannot be identified.",
        uncertainty: "High - broken citation.",
        comparisons: [],
      };
    }
    const comparisons = [];
    for (const r of found) {
      const src = sources[r.ref.id];
      if (src && src.trim()) comparisons.push({ refId: r.ref.id, ...compareWithSource(claim.text, src) });
    }
    if (!comparisons.length) {
      return {
        category: CATEGORIES.UNVERIFIED,
        rationale:
          "Reference " + found.map((f) => "[" + f.ref.id + "]").join(", ") +
          " was located, but no source text (abstract or excerpt) is available to compare. Attach the source text and re-run.",
        uncertainty: "High - source text not available.",
        comparisons: [],
      };
    }
    comparisons.sort((a, b) => b.score - a.score);
    const b = comparisons[0];
    const pct = Math.round(b.score * 100) + "%";
    const extra = missing.length ? " Note: " + missing.map((m) => m.cite.marker).join(", ") + " could not be matched to a reference." : "";
    let category, rationale, uncertainty;

    if (b.contradiction) {
      category = CATEGORIES.REVIEW;
      rationale = b.scopeGap
        ? "The source matches the general idea, but explicitly says it does not cover \"" + b.scopeGap + "\". The claim may extend the source beyond its scope."
        : "The closest source sentence contains a negative or non-significant finding that the claim does not mention. The source may not support the claim as stated.";
      uncertainty = "High - possible contradiction.";
    } else if (b.score >= 0.55) {
      if (b.numericMismatch) {
        category = CATEGORIES.PARTIAL;
        rationale = "The source discusses the same finding (" + pct + " term match), but the value(s) " + b.mismatchedNums.join(", ") +
          " in the claim do not appear in the source" + (b.sourceNumbers.length ? " (source reports " + b.sourceNumbers.join(", ") + ")" : "") + ".";
        uncertainty = "Medium - numeric discrepancy.";
      } else if (b.overclaim) {
        category = CATEGORIES.PARTIAL;
        rationale = "The source supports the general idea, but uses hedged or limited language while the claim is stated more strongly.";
        uncertainty = "Medium - possible overstatement.";
      } else {
        category = CATEGORIES.SUPPORTED;
        rationale = "The cited source closely matches the claim (" + pct + " term match) and no numeric or wording conflicts were detected.";
        uncertainty = "Low - still confirm with the full source.";
      }
    } else if (b.score >= 0.3) {
      category = CATEGORIES.PARTIAL;
      rationale = "The source covers part of the claim (" + pct + " term match). Terms not found in the source: " + (b.missingTerms.join(", ") || "-") + "." +
        (b.overclaim ? " The claim also uses absolute wording while the source is hedged or limited." : "");
      uncertainty = "Medium - partial overlap.";
    } else if (b.score >= 0.15) {
      category = CATEGORIES.REVIEW;
      rationale = "Only weak overlap with the source (" + pct + "). The relationship is ambiguous and needs expert judgement.";
      uncertainty = "High - ambiguous relationship.";
    } else {
      category = CATEGORIES.UNVERIFIED;
      rationale = "The available source text does not appear to discuss this claim (" + pct + " term match).";
      uncertainty = "High - no matching evidence.";
    }
    return { category, rationale: rationale + extra, uncertainty, comparisons };
  }

  /* ---------------- SHA-256 (pure JS, works on file:// too) ---------------- */
  function sha256(str) {
    const bytes = typeof TextEncoder !== "undefined" ? new TextEncoder().encode(str) : Buffer.from(str, "utf8");
    const K = new Uint32Array([
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
      0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
      0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
      0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ]);
    const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
    const l = bytes.length;
    const total = ((l + 9 + 63) >> 6) << 6;
    const m = new Uint8Array(total);
    m.set(bytes);
    m[l] = 0x80;
    const bits = l * 8;
    m[total - 4] = (bits >>> 24) & 255; m[total - 3] = (bits >>> 16) & 255; m[total - 2] = (bits >>> 8) & 255; m[total - 1] = bits & 255;
    m[total - 8] = Math.floor(bits / 2 ** 32) & 255;
    const W = new Uint32Array(64);
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let i = 0; i < total; i += 64) {
      for (let t = 0; t < 16; t++) W[t] = (m[i + 4 * t] << 24) | (m[i + 4 * t + 1] << 16) | (m[i + 4 * t + 2] << 8) | m[i + 4 * t + 3];
      for (let t = 16; t < 64; t++) {
        const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
        const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
        W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
    }
    return Array.from(H).map((x) => x.toString(16).padStart(8, "0")).join("");
  }

  function canonicalReportPayload(report) {
    return JSON.stringify({
      engine: report.engine,
      paperHash: report.paperHash,
      title: report.title,
      claims: report.claims.map((c) => ({ id: c.id, text: c.text, category: c.category, citations: c.citations.map((x) => x.marker) })),
    });
  }

  /* ---------------- 7. Full analysis ---------------- */
  function analyze(input) {
    const text = normalize(input.text);
    const sources = input.sources || {};
    const sections = splitSections(text);
    const refSection = sections.find((s) => REF_HEADING.test(s.heading));
    const refs = refSection ? parseReferences(refSection.body) : [];
    const bodySections = sections.filter((s) => s !== refSection && !/^acknowledg/i.test(s.heading));

    const claims = [];
    const citedIds = new Set();
    const brokenCitations = [];
    let sentenceCount = 0, citationCount = 0;

    bodySections.forEach((sec) => {
      splitSentences(sec.body).forEach((sent) => {
        sentenceCount++;
        const words = sent.split(/\s+/).length;
        const cites = findCitations(sent);
        citationCount += cites.length;
        cites.forEach((c) => {
          const r = resolveCitation(c, refs);
          if (r) citedIds.add(r.id);
          else if (!brokenCitations.includes(c.marker)) brokenCitations.push(c.marker);
        });
        if (words < 6 || sec.heading === "Front matter" && !cites.length) return;
        const { score, reasons } = scoreClaim(sent, cites.length > 0, sec.heading);
        if (score >= 4) {
          claims.push({
            id: "C" + String(claims.length + 1).padStart(2, "0"),
            text: sent,
            section: sec.heading,
            claimScore: score,
            importance: score >= 7 ? "High" : score >= 5.5 ? "Medium" : "Low",
            cues: reasons,
            kind: cites.length ? "Cited claim" : "Author finding",
            citations: cites,
          });
        }
      });
    });

    claims.forEach((c) => {
      const r = classify(c, refs, sources);
      Object.assign(c, r);
      c.references = c.citations.map((ct) => {
        const ref = resolveCitation(ct, refs);
        return ref ? { id: ref.id, raw: ref.raw, hasSource: !!(sources[ref.id] && sources[ref.id].trim()) } : { id: null, raw: ct.marker + " (not in reference list)", hasSource: false };
      });
    });

    const byCategory = {};
    Object.values(CATEGORIES).forEach((k) => (byCategory[k] = 0));
    claims.forEach((c) => byCategory[c.category]++);

    const uncitedRefs = refs.filter((r) => !citedIds.has(r.id)).map((r) => r.id);
    const warnings = [];
    if (!refSection) warnings.push("No reference section was detected. Add a heading such as 'References'.");
    if (brokenCitations.length) warnings.push("Citations without a matching reference entry: " + brokenCitations.join(", "));
    if (uncitedRefs.length) warnings.push("References listed but never cited in the text: " + uncitedRefs.map((x) => "[" + x + "]").join(", "));
    if (!claims.length) warnings.push("No candidate claims were detected. The text may be too short or not in a research-paper format.");

    const report = {
      engine: ENGINE_VERSION,
      id: "PP-" + new Date().getFullYear() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
      title: input.title || "Untitled paper",
      authors: input.authors || "",
      createdAt: new Date().toISOString(),
      paperHash: sha256(text),
      stats: {
        words: text.split(/\s+/).filter(Boolean).length,
        sentences: sentenceCount,
        sections: bodySections.filter((s) => s.heading !== "Front matter").map((s) => s.heading),
        references: refs.length,
        citations: citationCount,
        claims: claims.length,
        byCategory,
      },
      references: refs.map((r) => ({ ...r, cited: citedIds.has(r.id), hasSource: !!(sources[r.id] && sources[r.id].trim()) })),
      claims,
      warnings,
      disclaimer: "Indicative, AI-assisted assessment. Not proof of truth or falsity. Requires human review.",
    };
    report.reportHash = sha256(canonicalReportPayload(report));
    return report;
  }

  function verifyIntegrity(report, paperText) {
    const res = { reportIntact: null, paperMatches: null };
    if (report) res.reportIntact = sha256(canonicalReportPayload(report)) === report.reportHash;
    if (report && paperText != null) {
      res.recomputedPaperHash = sha256(normalize(paperText));
      res.paperMatches = res.recomputedPaperHash === report.paperHash;
    }
    return res;
  }

  return {
    ENGINE_VERSION, CATEGORIES, normalize, splitSections, splitSentences, parseReferences,
    findCitations, compareWithSource, analyze, stem, tokens, sha256, verifyIntegrity, canonicalReportPayload,
    previewReferences: (text) => {
      const secs = splitSections(normalize(text));
      const rs = secs.find((s) => REF_HEADING.test(s.heading));
      return rs ? parseReferences(rs.body) : [];
    },
  };
});
