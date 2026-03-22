import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
  Svg,
  Circle,
  Ellipse,
  Path,
  Rect,
  Line as SvgLine,
  G,
  Defs,
  ClipPath,
} from "@react-pdf/renderer";
import type { ToastRecord, JudgeVerdict } from "./types";

const pink = "#D4537E";
const black = "#111111";

// Fix #3: Tier color map
const TIER_COLORS: Record<string, string> = {
  legendary: "#EFC820",
  golden: "#D4A017",
  respectable: "#D4537E",
  questionable: "#888780",
  concerning: "#B4B2A9",
  criminal: "#111111",
};

function getTierColor(tier: string): string {
  return TIER_COLORS[tier.toLowerCase()] ?? black;
}

// Fix #4: Short display names for table headers
const SHORT_NAMES: Record<string, string> = {
  "Jean-Pierre": "Jean-Pierre",
  "Nana": "Nana",
  "Chad": "Chad",
  "Marco": "Marco",
  "Professor Crumb": "Prof. Crumb",
  "Auntie Mei": "A. Mei",
  "The Algorithm": "Algorithm",
  "Detective Rye": "Det. Rye",
};

function getShortName(fullName: string): string {
  return SHORT_NAMES[fullName] ?? fullName;
}

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontSize: 10,
    letterSpacing: 3,
    textAlign: "center",
    color: black,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  rule: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#CCCCCC",
    marginVertical: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    color: black,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  certNumber: {
    fontSize: 9,
    textAlign: "center",
    color: "#888888",
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  toastImage: {
    width: 200,
    height: 200,
    objectFit: "cover",
    borderWidth: 1,
    borderColor: black,
  },
  score: {
    fontSize: 48,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    color: black,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 9,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#888888",
    marginBottom: 6,
  },
  verdictRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  judgeName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: black,
  },
  verdictText: {
    fontSize: 8,
    color: "#444444",
    lineHeight: 1.4,
  },
  metricsTable: {
    marginTop: 12,
    marginBottom: 60,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#CCCCCC",
    paddingBottom: 3,
    marginBottom: 3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 1.5,
  },
  metricLabel: {
    fontSize: 7,
    color: "#666666",
    width: "40%",
  },
  metricValue: {
    fontSize: 7,
    color: black,
    width: "20%",
    textAlign: "center",
  },
  metricHeader: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#888888",
    width: "20%",
    textAlign: "center",
  },
  date: {
    fontSize: 9,
    textAlign: "center",
    color: "#888888",
    marginTop: 12,
  },
  footer: {
    fontSize: 7,
    textAlign: "center",
    color: "#AAAAAA",
    marginTop: 8,
  },
  // Fix #1: Stamp using native Views/Text instead of SVG
  stampContainer: {
    position: "absolute",
    bottom: 48,
    right: 48,
    transform: "rotate(-2.5deg)",
  },
  stampOuter: {
    width: 80,
    height: 115,
    maxWidth: 80,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: black,
    borderRadius: 2,
    padding: 3,
  },
  stampInner: {
    flex: 1,
    borderWidth: 1,
    borderColor: black,
    borderRadius: 2,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stampRule: {
    height: 1,
    backgroundColor: black,
    width: "100%",
    marginVertical: 3,
  },
  stampTextTop: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: black,
    letterSpacing: 3,
    textAlign: "center",
  },
  stampScore: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: black,
    textAlign: "center",
  },
  stampTextBottom: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: pink,
    letterSpacing: 2,
    textAlign: "center",
  },
});

const METRIC_LABELS: Record<string, string> = {
  browning_uniformity: "Browning Uniformity",
  crust_integrity: "Crust Integrity",
  crumb_crust_ratio: "Crumb/Crust Ratio",
  char_analysis: "Char Analysis",
  surface_texture: "Surface Texture",
  presentation: "Presentation",
};

function getVerdictsForCertificate(toast: ToastRecord): JudgeVerdict[] {
  if (toast.verdicts && Array.isArray(toast.verdicts) && toast.verdicts.length > 0) {
    return toast.verdicts;
  }
  // Fallback to flat columns
  const verdicts: JudgeVerdict[] = [];
  const judges = [
    { id: "jp", name: "Jean-Pierre", prefix: "jp" },
    { id: "nana", name: "Nana", prefix: "nana" },
    { id: "chad", name: "Chad", prefix: "chad" },
  ] as const;
  for (const j of judges) {
    const verdict = toast[`${j.prefix}_verdict` as keyof ToastRecord] as string | null;
    const tqi = toast[`${j.prefix}_tqi` as keyof ToastRecord] as number | null;
    const tier = toast[`${j.prefix}_tier` as keyof ToastRecord] as string | null;
    const metrics = toast[`${j.prefix}_metrics` as keyof ToastRecord] as ToastRecord["jp_metrics"];
    if (verdict && tqi !== null && tier && metrics) {
      verdicts.push({ judge_id: j.id, judge_name: j.name, verdict, tqi, tier, metrics });
    }
  }
  return verdicts;
}

// Fix #2: Sentence extraction that doesn't split on periods inside parentheses
function getFirstSentence(text: string): string {
  // Walk character by character, tracking parenthesis depth
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (depth === 0 && (ch === "." || ch === "!" || ch === "?")) {
      return text.slice(0, i + 1);
    }
  }
  // No sentence-ending punctuation found outside parens
  return text.slice(0, 120);
}

// Simplified judge avatar silhouettes for PDF (24×24pt)
function renderJudgeAvatar(judgeId: string): React.ReactElement {
  const bg = "#F5F5F5";
  const ol = black;
  const ac = pink;
  const clipId = `clip-${judgeId}`;

  function wrap(children: React.ReactElement[]): React.ReactElement {
    return React.createElement(
      Svg,
      { width: 24, height: 24, viewBox: "-30 -30 60 60" },
      React.createElement(
        Defs,
        null,
        React.createElement(ClipPath, { id: clipId }, React.createElement(Circle, { cx: 0, cy: 0, r: 30 }))
      ),
      React.createElement(
        G,
        { clipPath: `url(#${clipId})` },
        React.createElement(Circle, { cx: 0, cy: 0, r: 30, fill: bg }),
        ...children
      )
    );
  }

  switch (judgeId) {
    case "jp":
      return wrap([
        // Shoulders
        React.createElement(Path, { key: "sh", d: "M-30 18 Q-30 10 -16 8 L16 8 Q30 10 30 18 L30 34 L-30 34Z", fill: ol }),
        // Neck
        React.createElement(Rect, { key: "nk", x: -7, y: 2, width: 14, height: 10, rx: 3, fill: ol }),
        // Head
        React.createElement(Ellipse, { key: "hd", cx: 0, cy: -4, rx: 14, ry: 13, fill: ol }),
        // Toque body
        React.createElement(Path, { key: "tq", d: "M-14 -8 L-13 -36 Q-12 -42 0 -44 Q12 -42 13 -36 L14 -8Z", fill: ol }),
        // Toque puff
        React.createElement(Ellipse, { key: "pf", cx: 0, cy: -44, rx: 10, ry: 5, fill: ol }),
        // Band (accent)
        React.createElement(Rect, { key: "bd", x: -14, y: -10, width: 28, height: 5, rx: 1, fill: ac }),
      ]);

    case "nana":
      return wrap([
        // Shoulders
        React.createElement(Path, { key: "sh", d: "M-30 16 Q-30 8 -18 6 L18 6 Q30 8 30 16 L30 34 L-30 34Z", fill: ol }),
        // Neck
        React.createElement(Rect, { key: "nk", x: -6, y: 0, width: 12, height: 10, rx: 3, fill: ol }),
        // Head
        React.createElement(Ellipse, { key: "hd", cx: 0, cy: -6, rx: 16, ry: 14, fill: ol }),
        // Hair volume
        React.createElement(Ellipse, { key: "hr", cx: 0, cy: -10, rx: 18, ry: 13, fill: ol }),
        // Bun
        React.createElement(Circle, { key: "bn", cx: 0, cy: -26, r: 8, fill: ol }),
        // Hair pin (accent)
        React.createElement(SvgLine, { key: "hp", x1: 5, y1: -30, x2: 8, y2: -22, stroke: ac, strokeWidth: 2 }),
        React.createElement(Circle, { key: "hpc", cx: 5, cy: -30, r: 2, fill: ac }),
        // Glasses — simplified circles (accent)
        React.createElement(Circle, { key: "gl", cx: -9, cy: -4, r: 5, fill: "none", stroke: ac, strokeWidth: 3 }),
        React.createElement(Circle, { key: "gr", cx: 9, cy: -4, r: 5, fill: "none", stroke: ac, strokeWidth: 3 }),
        // Bridge
        React.createElement(SvgLine, { key: "br", x1: -4, y1: -5, x2: 4, y2: -5, stroke: ac, strokeWidth: 2.5 }),
      ]);

    case "chad":
      return wrap([
        // Wide shoulders
        React.createElement(Path, { key: "sh", d: "M-32 12 Q-30 4 -20 2 L20 2 Q30 4 32 12 L32 34 L-32 34Z", fill: ol }),
        // Thick neck
        React.createElement(Rect, { key: "nk", x: -9, y: -4, width: 18, height: 10, rx: 4, fill: ol }),
        // Head — square jaw
        React.createElement(Path, { key: "hd", d: "M-13 -6 Q-14 -16 0 -18 Q14 -16 13 -6 Q12 2 0 4 Q-12 2 -13 -6Z", fill: ol }),
        // Cap crown (backwards)
        React.createElement(Path, { key: "cp", d: "M-14 -14 Q-14 -26 0 -28 Q14 -26 14 -14Z", fill: ol }),
        // Cap button
        React.createElement(Circle, { key: "bt", cx: 0, cy: -28, r: 2, fill: ol, opacity: 0.7 }),
        // Backwards brim (accent)
        React.createElement(Path, { key: "bm", d: "M-14 -16 L-26 -14 L-26 -11 L-14 -12Z", fill: ac }),
      ]);

    case "marco":
      return wrap([
        // Shoulders/chef coat
        React.createElement(Path, { key: "sh", d: "M-30 16 Q-30 8 -16 6 L16 6 Q30 8 30 16 L30 34 L-30 34Z", fill: ol }),
        // Open collar V (accent)
        React.createElement(Path, { key: "cl", d: "M-8 6 L0 20 L8 6", fill: "none", stroke: ac, strokeWidth: 2 }),
        // Kitchen towel (accent)
        React.createElement(Path, { key: "tw", d: "M14 8 L22 4 L24 14 L16 16Z", fill: ac }),
        // Neck
        React.createElement(Rect, { key: "nk", x: -8, y: 0, width: 16, height: 10, rx: 3, fill: ol }),
        // Head
        React.createElement(Ellipse, { key: "hd", cx: 0, cy: -6, rx: 15, ry: 14, fill: ol }),
        // Short hair
        React.createElement(Path, { key: "hr", d: "M-15 -10 Q-15 -22 0 -24 Q15 -22 15 -10", fill: ol }),
      ]);

    case "crumb":
      return wrap([
        // Shoulders/robe
        React.createElement(Path, { key: "sh", d: "M-30 16 Q-30 8 -16 6 L16 6 Q30 8 30 16 L30 34 L-30 34Z", fill: ol }),
        // Neck
        React.createElement(Rect, { key: "nk", x: -6, y: 0, width: 12, height: 10, rx: 3, fill: ol }),
        // Head
        React.createElement(Ellipse, { key: "hd", cx: 0, cy: -6, rx: 14, ry: 13, fill: ol }),
        // Mortarboard base
        React.createElement(Path, { key: "mb", d: "M-20 -18 L20 -18 L18 -14 L-18 -14Z", fill: ol }),
        // Mortarboard top
        React.createElement(Rect, { key: "mt", x: -20, y: -22, width: 40, height: 4, rx: 1, fill: ol }),
        // Tassel (accent)
        React.createElement(SvgLine, { key: "ts", x1: 16, y1: -22, x2: 22, y2: -12, stroke: ac, strokeWidth: 2 }),
        React.createElement(Circle, { key: "tc", cx: 16, cy: -22, r: 2.5, fill: ac }),
      ]);

    case "mei":
      return wrap([
        // Shoulders/blouse
        React.createElement(Path, { key: "sh", d: "M-30 16 Q-30 8 -16 6 L16 6 Q30 8 30 16 L30 34 L-30 34Z", fill: ol }),
        // Neck
        React.createElement(Rect, { key: "nk", x: -6, y: 0, width: 12, height: 8, rx: 3, fill: ol }),
        // Head
        React.createElement(Ellipse, { key: "hd", cx: 0, cy: -6, rx: 15, ry: 14, fill: ol }),
        // Hair
        React.createElement(Ellipse, { key: "hr", cx: 0, cy: -12, rx: 16, ry: 11, fill: ol }),
        // Bun
        React.createElement(Circle, { key: "bn", cx: 0, cy: -26, r: 7, fill: ol }),
        // Hair pin (accent)
        React.createElement(SvgLine, { key: "hp", x1: 6, y1: -29, x2: 10, y2: -22, stroke: ac, strokeWidth: 2 }),
        React.createElement(Circle, { key: "hpc", cx: 6, cy: -29, r: 3, fill: ac }),
      ]);

    case "algo":
      return wrap([
        // Shoulders/hoodie
        React.createElement(Path, { key: "sh", d: "M-30 14 Q-30 6 -16 4 L16 4 Q30 6 30 14 L30 34 L-30 34Z", fill: ol }),
        // Hoodie neckline
        React.createElement(Path, { key: "hn", d: "M-12 4 Q-14 -2 -10 -4 L10 -4 Q14 -2 12 4", fill: ol }),
        // Neck
        React.createElement(Rect, { key: "nk", x: -7, y: -2, width: 14, height: 10, rx: 3, fill: ol }),
        // Headphones band (accent)
        React.createElement(Path, { key: "hb", d: "M-14 2 Q-16 -2 -14 -6 L14 -6 Q16 -2 14 2", fill: "none", stroke: ac, strokeWidth: 3 }),
        // Headphone pads (accent)
        React.createElement(Ellipse, { key: "pl", cx: -14, cy: 2, rx: 3, ry: 4, fill: ac }),
        React.createElement(Ellipse, { key: "pr", cx: 14, cy: 2, rx: 3, ry: 4, fill: ac }),
        // Head
        React.createElement(Ellipse, { key: "hd", cx: 0, cy: -8, rx: 14, ry: 13, fill: ol }),
        // Hood
        React.createElement(Path, { key: "ho", d: "M-16 -6 Q-16 -24 0 -26 Q16 -24 16 -6", fill: ol }),
      ]);

    case "rye":
      return wrap([
        // Shoulders/trench coat
        React.createElement(Path, { key: "sh", d: "M-30 14 Q-30 6 -16 4 L16 4 Q30 6 30 14 L30 34 L-30 34Z", fill: ol }),
        // Popped collar
        React.createElement(Path, { key: "c1", d: "M-12 4 L-14 -4 L-8 -2", fill: ol }),
        React.createElement(Path, { key: "c2", d: "M12 4 L14 -4 L8 -2", fill: ol }),
        // Neck
        React.createElement(Rect, { key: "nk", x: -6, y: -2, width: 12, height: 10, rx: 3, fill: ol }),
        // Head
        React.createElement(Ellipse, { key: "hd", cx: 0, cy: -8, rx: 14, ry: 13, fill: ol }),
        // Fedora crown
        React.createElement(Path, { key: "fc", d: "M-14 -14 Q-14 -28 0 -30 Q14 -28 14 -14Z", fill: ol }),
        // Fedora brim
        React.createElement(Path, { key: "fb", d: "M-24 -14 Q-24 -18 -14 -16 L14 -16 Q24 -18 24 -14 Q24 -12 14 -13 L-14 -13 Q-24 -12 -24 -14Z", fill: ol }),
        // Hat band (accent)
        React.createElement(Rect, { key: "hb", x: -14, y: -17, width: 28, height: 3, rx: 1, fill: ac }),
      ]);

    default:
      // Fallback: plain circle
      return React.createElement(
        Svg,
        { width: 24, height: 24, viewBox: "-30 -30 60 60" },
        React.createElement(Circle, { cx: 0, cy: 0, r: 30, fill: bg }),
        React.createElement(Circle, { cx: 0, cy: -4, r: 14, fill: ol })
      );
  }
}

function CertificateDocument({
  toast,
  imageBase64,
}: {
  toast: ToastRecord;
  imageBase64: string;
}) {
  const verdicts = getVerdictsForCertificate(toast);
  const certNumber = `TS-${toast.id.slice(0, 8).toUpperCase()}`;
  const evalDate = new Date(toast.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const metricKeys = Object.keys(METRIC_LABELS);

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "LETTER", style: styles.page },
      // Header
      React.createElement(Text, { style: styles.header }, "BUREAU OF TOAST EVALUATION"),
      React.createElement(View, { style: styles.rule }),
      React.createElement(Text, { style: styles.title }, "OFFICIAL CERTIFICATE OF EVALUATION"),
      React.createElement(Text, { style: styles.certNumber }, `Certificate No. ${certNumber}`),

      // Toast photo
      React.createElement(
        View,
        { style: styles.imageContainer },
        React.createElement(Image, {
          style: styles.toastImage,
          src: `data:image/jpeg;base64,${imageBase64}`,
        })
      ),

      // Score + tier (Fix #3: use tier color)
      React.createElement(Text, { style: styles.score }, toast.official_tqi.toFixed(2)),
      React.createElement(
        Text,
        {
          style: {
            fontSize: 12,
            letterSpacing: 2,
            textAlign: "center",
            color: getTierColor(toast.official_tier),
            textTransform: "uppercase",
            marginBottom: 16,
          },
        },
        toast.official_tier
      ),

      // Verdict summaries
      React.createElement(Text, { style: styles.sectionTitle }, "JUDGE VERDICTS"),
      ...verdicts.map((v) =>
        React.createElement(
          View,
          { key: v.judge_id, style: styles.verdictRow },
          renderJudgeAvatar(v.judge_id),
          React.createElement(
            View,
            { style: { flex: 1, marginLeft: 6 } },
            React.createElement(Text, { style: styles.judgeName }, `${v.judge_name} (${v.tqi.toFixed(2)})`),
            React.createElement(Text, { style: styles.verdictText }, getFirstSentence(v.verdict))
          )
        )
      ),

      // Metrics table (Fix #4: use short names for headers)
      React.createElement(
        View,
        { style: styles.metricsTable },
        React.createElement(Text, { style: styles.sectionTitle }, "SUB-METRICS"),
        React.createElement(
          View,
          { style: styles.tableHeader },
          React.createElement(Text, { style: { ...styles.metricLabel, fontFamily: "Helvetica-Bold" } }, "Metric"),
          ...verdicts.map((v) =>
            React.createElement(Text, { key: v.judge_id, style: styles.metricHeader }, getShortName(v.judge_name))
          )
        ),
        ...metricKeys.map((key) =>
          React.createElement(
            View,
            { key, style: styles.tableRow },
            React.createElement(Text, { style: styles.metricLabel }, METRIC_LABELS[key]),
            ...verdicts.map((v) =>
              React.createElement(
                Text,
                { key: `${v.judge_id}-${key}`, style: styles.metricValue },
                ((v.metrics as unknown as Record<string, number>)[key] ?? 0).toFixed(1)
              )
            )
          )
        )
      ),

      // Fix #1: Stamp using native View/Text components
      React.createElement(
        View,
        { style: styles.stampContainer },
        React.createElement(
          View,
          { style: styles.stampOuter },
          React.createElement(
            View,
            { style: styles.stampInner },
            React.createElement(Text, { style: styles.stampTextTop }, "TOAST"),
            React.createElement(View, { style: styles.stampRule }),
            React.createElement(Text, { style: styles.stampScore }, toast.official_tqi.toFixed(2)),
            React.createElement(View, { style: styles.stampRule }),
            React.createElement(Text, { style: styles.stampTextBottom }, "SCORE")
          )
        )
      ),

      // Date + footer
      React.createElement(Text, { style: styles.date }, `Evaluated on ${evalDate}`),
      React.createElement(
        Text,
        { style: styles.footer },
        "This certificate is issued by the Bureau of Toast Evaluation and is definitely real. toastscore.com"
      )
    )
  );
}

export async function generateCertificatePdf(
  toast: ToastRecord,
  imageBase64: string
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = React.createElement(CertificateDocument, { toast, imageBase64 }) as any;
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
