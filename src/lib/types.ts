export interface SubMetrics {
  browning_uniformity: number;
  crust_integrity: number;
  crumb_crust_ratio: number;
  char_analysis: number;
  surface_texture: number;
  presentation: number;
}

export interface JudgeResponse {
  verdict: string;
  sub_metrics: SubMetrics;
  tqi: number;
}

export type JudgeName = "jp" | "nana" | "chad";

export interface JudgeResult {
  verdict: string;
  tqi: number;
  tier: string;
  sub_metrics: SubMetrics;
}

export interface ToastRecord {
  id: string;
  created_at: string;
  image_url: string;
  nickname: string;
  official_tqi: number;
  official_tier: string;
  jp_verdict: string | null;
  jp_tqi: number | null;
  jp_tier: string | null;
  jp_metrics: SubMetrics | null;
  nana_verdict: string | null;
  nana_tqi: number | null;
  nana_tier: string | null;
  nana_metrics: SubMetrics | null;
  chad_verdict: string | null;
  chad_tqi: number | null;
  chad_tier: string | null;
  chad_metrics: SubMetrics | null;
  featured: boolean;
  featured_category: string | null;
}

export interface BottomShelfToast extends ToastRecord {
  lowest_tqi: number;
  harshest_judge: JudgeName;
}

export type Tier =
  | "Legendary"
  | "Golden"
  | "Respectable"
  | "Questionable"
  | "Concerning"
  | "Criminal";
