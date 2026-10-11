import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { api } from "@/lib/api";

// Админка вызывает после изменений в каталоге — сбрасывает закэшированные данные вузов и колледжей
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Роль проверяет бэкенд по токену Supabase
  const me = await api<{ role: string }>("/me", { token }).catch(() => null);
  if (!me) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (me.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  revalidateTag("institutions", { expire: 0 });
  return Response.json({ revalidated: true });
}
