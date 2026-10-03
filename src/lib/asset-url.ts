export function assetUrl(path: string) {
  if (!path || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;

  // Caminhos com "/" na frente são arquivos de public/ ou uploads já servidos em /media/.
  if (path.startsWith("/")) return path;

  // Chave crua do bucket de uploads (ex.: "admin/<uuid>.jpg").
  return `/media/${path}`;
}

export const bravuraLogo = "/bravura-logo.svg";
export const bravuraOgImage = "/bravura-og.svg";
export const avontzLogo = "/avontz-logo-dark.svg";
