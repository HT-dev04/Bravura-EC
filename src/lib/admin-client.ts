import type { CmsData } from "@/types";

const TEMPORARY_SAVE_ERROR_CODES = ["DATABASE_TEMPORARILY_UNAVAILABLE", "EAI_AGAIN", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "P2028"];

type AdminResponse = Partial<CmsData> & {
  data?: CmsData;
  success?: boolean;
  error?: string;
  message?: string;
};

function isTemporarySaveError(status: number, payload: AdminResponse | null, error?: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  const code = payload?.error || "";

  return status === 503 || TEMPORARY_SAVE_ERROR_CODES.some((item) => code.includes(item) || message.includes(item));
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function saveAdminCollection<K extends keyof CmsData>(collection: K, rows: CmsData[K]) {
  const delays = [500, 1200];
  let lastStatus = 0;
  let lastStatusText = "";
  let lastPayload: AdminResponse | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    let res: Response;

    try {
      res = await fetch("/api/admin/cms", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection, rows }),
      });
    } catch (error) {
      lastError = error;
      if (attempt < delays.length && isTemporarySaveError(0, null, error)) {
        await wait(delays[attempt]);
        continue;
      }

      throw error instanceof Error ? error : new Error("Erro de conexão ao salvar coleção do admin");
    }

    lastStatus = res.status;
    lastStatusText = res.statusText;

    let payload: AdminResponse | null = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }

    lastPayload = payload;

    if ((!res.ok || payload?.success === false) && attempt < delays.length && isTemporarySaveError(res.status, payload)) {
      await wait(delays[attempt]);
      continue;
    }

    if (!res.ok || payload?.success === false) {
      const message = payload?.message || payload?.error || res.statusText || `Erro ao salvar coleção ${collection}`;

      console.error("Erro ao salvar coleção do admin:", {
        collection,
        status: res.status,
        statusText: res.statusText,
        message,
        response: payload,
      });

      throw new Error(message);
    }

    if (process.env.NODE_ENV === "development" && ["players", "matches", "news", "gallery", "sponsors"].includes(collection)) {
      const returnedRows = payload?.data?.[collection] || payload?.[collection] || [];
      console.info(`saveAdminCollection(${collection}) concluído`, {
        sentIds: Array.isArray(rows) ? rows.map((row) => row.id) : [],
        returnedIds: Array.isArray(returnedRows) ? returnedRows.map((row: { id: string }) => row.id) : [],
        status: res.status,
      });
    }

    return (payload?.data || payload) as CmsData;
  }

  const message =
    lastPayload?.message ||
    lastPayload?.error ||
    lastStatusText ||
    (lastError instanceof Error ? lastError.message : "Erro ao salvar coleção do admin");
  console.error("Erro ao salvar coleção do admin:", {
    collection,
    status: lastStatus,
    statusText: lastStatusText,
    message,
    response: lastPayload,
  });
  throw new Error(message);
}

export async function uploadAdminFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", credentials: "same-origin", body: form });
  let payload: AdminUploadResponse | null = null;

  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok || !payload?.url) {
    const message = payload?.message || payload?.error || res.statusText || `Falha ao enviar arquivo (HTTP ${res.status})`;
    console.error("Erro ao enviar arquivo do admin:", {
      status: res.status,
      statusText: res.statusText,
      message,
      response: payload,
    });
    throw new Error(message);
  }

  return payload as AdminUploadSuccessResponse;
}

type AdminUploadSuccessResponse = {
  success?: boolean;
  url: string;
  path?: string;
  type?: "image" | "video";
};

type AdminUploadResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  url?: string;
  path?: string;
  type?: "image" | "video";
};
