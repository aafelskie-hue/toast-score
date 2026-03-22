import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
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
    marginBottom: 12,
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
    width: 90,
    height: 123,
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
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: black,
    letterSpacing: 3,
    textAlign: "center",
  },
  stampScore: {
    fontSize: 16,
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
          React.createElement(Text, { style: styles.judgeName }, `${v.judge_name} (${v.tqi.toFixed(2)})`),
          React.createElement(Text, { style: styles.verdictText }, getFirstSentence(v.verdict))
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
