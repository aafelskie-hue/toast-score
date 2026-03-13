import { getSupabaseServer } from "./supabase-server";
import { ToastRecord } from "./types";

export async function getTopToastToday(): Promise<ToastRecord | null> {
  const supabase = getSupabaseServer();
  const now = new Date();
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString();

  const { data, error } = await supabase
    .from("toasts")
    .select("*")
    .gte("created_at", startOfDay)
    .order("official_tqi", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as ToastRecord;
}

function getDateFilter(period: string): string | null {
  const now = new Date();
  if (period === "today") {
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    ).toISOString();
  }
  if (period === "week") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return weekAgo.toISOString();
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
