import { getSupabaseServer } from "./supabase-server";
import { ToastRecord, BottomShelfToast, JudgeName, AppealRecord, CertificateRecord } from "./types";

export async function getTopToastToday(): Promise<ToastRecord | null> {
  const supabase = getSupabaseServer();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("toasts")
    .select("*")
    .gte("created_at", since)
    .order("official_tqi", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as ToastRecord;
}

function getDateFilter(period: string): string | null {
  if (period === "today") {
    return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  }
  if (period === "week") {
    return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }
  return null; // alltime
}

export async function getLeaderboard(
  period: string,
  limit: number,
  offset: number
): Promise<{ toasts: ToastRecord[]; total: number }> {
  const supabase = getSupabaseServer();
  const dateFilter = getDateFilter(period);

  let query = supabase
    .from("toasts")
    .select("*", { count: "exact" })
    .order("official_tqi", { ascending: false })
    .range(offset, offset + limit - 1);

  if (dateFilter) {
    query = query.gte("created_at", dateFilter);
  }

  const { data, count, error } = await query;

  if (error) return { toasts: [], total: 0 };
  return { toasts: (data as ToastRecord[]) || [], total: count || 0 };
}

export async function getBottomShelfLeaderboard(
  period: string,
  limit: number,
  offset: number
): Promise<{ toasts: BottomShelfToast[]; total: number }> {
  const supabase = getSupabaseServer();
  const dateFilter = getDateFilter(period);

  // Get total count
  let countQuery = supabase.from("toasts").select("*", { count: "exact", head: true });
  if (dateFilter) countQuery = countQuery.gte("created_at", dateFilter);
  const { count } = await countQuery;

  // Get bottom shelf data via RPC
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.rpc as any)("get_bottom_shelf", {
    date_filter: dateFilter,
    row_limit: limit,
    row_offset: offset,
  });

  if (error) return { toasts: [], total: 0 };
  return { toasts: (data as BottomShelfToast[]) || [], total: count || 0 };
}

export async function getGallery(
  sort: string,
  limit: number,
  offset: number
): Promise<{ toasts: ToastRecord[]; total: number }> {
  const supabase = getSupabaseServer();

  const orderCol = sort === "tqi" ? "official_tqi" : "created_at";

  const { data, count, error } = await supabase
    .from("toasts")
    .select("*", { count: "exact" })
    .order(orderCol, { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return { toasts: [], total: 0 };
  return { toasts: (data as ToastRecord[]) || [], total: count || 0 };
}

export async function getToastById(
  id: string
): Promise<ToastRecord | null> {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from("toasts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as ToastRecord;
}

interface CurationCandidates {
  best: ToastRecord | null;
  criminal: ToastRecord | null;
  judgesPick: { toast: ToastRecord; judge: JudgeName } | null;
}

export async function getCurationCandidates(): Promise<CurationCandidates> {
  const supabase = getSupabaseServer();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const excludeIds: string[] = [];

  // Best: highest official_tqi in last 7 days, not already featured
  const { data: bestData } = await supabase
    .from("toasts")
    .select("*")
    .gte("created_at", since)
    .neq("featured", true)
    .order("official_tqi", { ascending: false })
    .limit(1)
    .single();

  const best = bestData ? (bestData as ToastRecord) : null;
  if (best) excludeIds.push(best.id);

  // Criminal: lowest official_tqi in last 7 days, excluding best
  let criminalQuery = supabase
    .from("toasts")
    .select("*")
    .gte("created_at", since)
    .neq("featured", true)
    .order("official_tqi", { ascending: true })
    .limit(1);

  for (const id of excludeIds) {
    criminalQuery = criminalQuery.neq("id", id);
  }

  const { data: criminalData } = await criminalQuery.single();
  const criminal = criminalData ? (criminalData as ToastRecord) : null;
  if (criminal) excludeIds.push(criminal.id);

  // Judge's Pick: longest single verdict among remaining toasts
  let pickQuery = supabase
    .from("toasts")
    .select("*")
    .gte("created_at", since)
    .neq("featured", true);

  for (const id of excludeIds) {
    pickQuery = pickQuery.neq("id", id);
  }

  const { data: remaining } = await pickQuery;
  let judgesPick: CurationCandidates["judgesPick"] = null;

  if (remaining && remaining.length > 0) {
    let longestLen = 0;
    for (const row of remaining as ToastRecord[]) {
      const verdicts: [JudgeName, string | null][] = [
        ["jp", row.jp_verdict],
        ["nana", row.nana_verdict],
        ["chad", row.chad_verdict],
      ];
      for (const [judge, verdict] of verdicts) {
        if (verdict && verdict.length > longestLen) {
          longestLen = verdict.length;
          judgesPick = { toast: row, judge };
        }
      }
    }
  }

  return { best, criminal, judgesPick };
}

export async function getAppealByToastId(
  toastId: string
): Promise<AppealRecord | null> {
  const supabase = getSupabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("appeals") as any)
    .select("*")
    .eq("toast_id", toastId)
    .single();

  if (error || !data) return null;
  return data as AppealRecord;
}

export async function getMemberFreeAppealThisMonth(
  customerId: string
): Promise<boolean> {
  const supabase = getSupabaseServer();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("member_appeals") as any)
    .select("id")
    .eq("customer_id", customerId)
    .eq("month_start", monthStart)
    .eq("was_free", true)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

export async function getCertificateByToastId(
  toastId: string
): Promise<CertificateRecord | null> {
  const supabase = getSupabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("certificates") as any)
    .select("*")
    .eq("toast_id", toastId)
    .single();

  if (error || !data) return null;
  return data as CertificateRecord;
}

export async function markAsFeatured(
  id: string,
  category: "best" | "criminal" | "judges_pick"
): Promise<void> {
  const supabase = getSupabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("toasts") as any)
    .update({ featured: true, featured_category: category })
    .eq("id", id);
}
