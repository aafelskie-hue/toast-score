import { SubMetrics, Tier } from "./types";

export const SUB_METRIC_KEYS: (keyof SubMetrics)[] = [
  "browning_uniformity",
  "crust_integrity",
  "crumb_crust_ratio",
  "char_analysis",
  "surface_texture",
  "presentation",
];

export function calculateTqi(metrics: SubMetrics): number {
  const sum = SUB_METRIC_KEYS.reduce((acc, key) => acc + metrics[key], 0);
  return Math.round((sum / 6) * 10 * 100) / 100;
}

export function deriveTier(tqi: number): Tier {
  if (tqi >= 90) return "Legendary";
  if (tqi >= 75) return "Golden";
  if (tqi >= 60) return "Respectable";
  if (tqi >= 40) return "Questionable";
  if (tqi >= 20) return "Concerning";
  return "Criminal";
}

export function validateSubMetrics(metrics: SubMetrics): boolean {
  return SUB_METRIC_KEYS.every((key) => {
    const val = metrics[key];
    return typeof val === "number" && val >= 0 && val <= 10;
  });
}
