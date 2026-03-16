// utilities for handling movie poster images
const modules = import.meta.glob("../assets/*.{jpg,png}", { eager: true, query: "?url", import: "default" });
const assetModules = import.meta.glob("./public/asset/*.{jpg,png}", { eager: true, query: "?url", import: "default" });

export const posterList: string[] = [
  ...Object.values(modules),
  ...Object.values(assetModules)
] as string[];

export function posterByIndex(idx: number): string {
  // Use globbed URLs first, fallback to raw paths only if missing
  const rawFallbacks = ['/assets/hero-banner.jpg', '/assets/movie1.jpg', '/assets/movie2.jpg', '/assets/movie3.jpg', '/assets/movie4.jpg', '/assets/movie5.jpg', '/assets/movie6.jpg', '/assets/movie7.jpg'];
  if (idx < posterList.length) return posterList[idx];
  return rawFallbacks[idx] || posterList[0];
}

export const posterMap: Record<string, string> = Object.fromEntries(
  Object.entries({...modules, ...assetModules}).map(([key, url]) => [key.split("/").pop() || key, url as string])
);

