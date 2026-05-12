export function getValidImageSrc(value?: string | null): string | null {
  if (!value) return null;
  const src = value.trim();
  if (!src || src === "null" || src === "undefined") return null;
  if (
    src.startsWith("/") ||
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:image/")
  ) {
    return src;
  }
  return null;
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
