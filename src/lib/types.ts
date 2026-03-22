export type { JudgeId } from "./judges";

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

/** @deprecated Use JudgeId instead */
export type JudgeName = "jp" | "nana" | "chad";

export interface JudgeResult {
  verdict: string;
  tqi: number;
  tier: string;
  sub_metrics: SubMetrics;
}

export interface JudgeVerdict {
  judge_id: string;
  judge_name: string;
  verdict: string;
  tqi: number;
  tier: string;
  metrics: SubMetrics;
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
  verdicts: JudgeVerdict[] | null;
}

export interface BottomShelfToast extends ToastRecord {
  lowest_tqi: number;
  harshest_judge: JudgeName;
}

export interface AppealRecord {
  id: string;
  toast_id: string;
  stripe_session_id: string | null;
  verdicts: JudgeVerdict[];
  official_tqi: number;
  official_tier: string;
  created_at: string;
}

export interface CertificateRecord {
  id: string;
  toast_id: string;
  stripe_session_id: string;
  storage_path: string;
  created_at: string;
}

export type Tier =
  | "Legendary"
  | "Golden"
  | "Respectable"
  | "Questionable"
  | "Concerning"
  | "Criminal";
