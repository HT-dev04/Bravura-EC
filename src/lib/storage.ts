import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Uploads do admin gravados em disco (volume persistente no servidor) e servidos pelo próprio site em /media/<chave>.

export const MEDIA_PREFIX = "/media/";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".heic": "image/heic",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

export function getUploadDir() {
  return path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"));
}

export function mediaUrl(key: string) {
  return `${MEDIA_PREFIX}${key.replace(/^\/+/, "")}`;
}

// Resolve a chave dentro do diretório de uploads, recusando qualquer caminho que escape dele.
function resolveKey(key: string) {
  const root = getUploadDir();
  const filePath = path.resolve(root, key);
  if (!filePath.startsWith(root + path.sep)) return null;
  return filePath;
}

export async function putObject(key: string, body: Buffer) {
  const filePath = resolveKey(key);
  if (!filePath) throw new Error(`Chave de upload inválida: ${key}`);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, body, { flag: "wx" });
}

export async function getObject(key: string) {
  const filePath = resolveKey(key);
  if (!filePath) return null;

  try {
    const body = await readFile(filePath);
    return { body, contentType: CONTENT_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream" };
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === "ENOENT" || (error as NodeJS.ErrnoException)?.code === "EISDIR") return null;
    throw error;
  }
}
