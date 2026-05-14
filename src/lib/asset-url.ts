export function assetUrl(path: string) {
  if (!path || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_STORAGE_BUCKET || "uploads";
  if (!supabaseUrl) return path;

  const cleanPath = path.replace(/^\/+/, "");
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

export const bravuraLogo = "/bravura-logo.svg";
export const bravuraOgImage = "/bravura-og.svg";
export const avontzLogo = "/avontz-logo-dark.svg";
