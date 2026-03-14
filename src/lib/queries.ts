import { getSupabaseServer } from "./supabase-server";
import { ToastRecord } from "./types";

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
