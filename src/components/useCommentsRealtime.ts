"use client";

import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { useEffect, useEffectEvent } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export type CommentChange = RealtimePostgresChangesPayload<{ id: string; institution_id: string }>;

/**
 * Живые обновления комментариев: Supabase Realtime (WebSocket) на таблицу comments.
 * Какие строки придут, решает RLS. Удаления Realtime не фильтрует — в них только id.
 */
export function useCommentsRealtime(onChange: (change: CommentChange) => void, { institutionId, enabled = true }: { institutionId?: string; enabled?: boolean } = {}) {
  const handle = useEffectEvent(onChange);

  useEffect(() => {
    if (!enabled) return;
    const client = supabaseBrowser();
    const table = { schema: "public", table: "comments" } as const;
    const filter = institutionId ? { filter: `institution_id=eq.${institutionId}` } : {};
    const channel = client
      .channel(`comments:${institutionId ?? "all"}:${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "INSERT", ...table, ...filter }, (change) => handle(change as CommentChange))
      .on("postgres_changes", { event: "UPDATE", ...table, ...filter }, (change) => handle(change as CommentChange))
      .on("postgres_changes", { event: "DELETE", ...table }, (change) => handle(change as CommentChange))
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [institutionId, enabled]);
}
