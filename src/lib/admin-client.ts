import type { CmsData } from "@/types";

export async function saveAdminCollection<K extends keyof CmsData>(collection: K, rows: CmsData[K]) {
  let res: Response | undefined;

  try {
    res = await fetch("/api/admin/cms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collection, rows }),
    });

    const text = await res.text();
    const payload = text ? JSON.parse(text) : null;

    if (!res.ok || payload?.success === false) {
      const message = payload?.error || `HTTP ${res.status}`;
      throw new Error(message);
    }

    if (["players", "matches", "news", "gallery", "sponsors"].includes(collection)) {
      const returnedRows = payload?.data?.[collection] || payload?.[collection] || [];
      console.info(`saveAdminCollection(${collection}) concluído`, {
        sentIds: Array.isArray(rows) ? rows.map((row) => row.id) : [],
        returnedIds: Array.isArray(returnedRows) ? returnedRows.map((row: { id: string }) => row.id) : [],
        status: res.status,
      });
    }

    return (payload?.data || payload) as CmsData;
  } catch (error) {
    console.error("Erro ao salvar coleção do admin:", {
      collection,
      rows,
      status: res?.status,
      statusText: res?.statusText,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? (error as Error & { cause?: unknown }).cause : undefined,
    });
    throw error instanceof Error ? error : new Error("Falha ao salvar dados");
  }
}

export async function uploadAdminFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const text = await res.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!res.ok || !payload?.url) {
    throw new Error(payload?.error || `Falha ao enviar arquivo (HTTP ${res.status})`);
  }

  return payload as { url: string; type: "image" | "video" };
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text) as { error?: string; url?: string; type?: "image" | "video" };
  } catch {
    return null;
  }
}
