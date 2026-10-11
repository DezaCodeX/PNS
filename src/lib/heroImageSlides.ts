export type HeroImageSlide = {
  src: string;
  alt: string;
};

export function heroImageSlides(
  assets: Record<string, string>,
  descriptions: Record<string, string>,
): HeroImageSlide[] {
  return Object.entries(assets)
    .filter(
      ([path]) =>
        path.endsWith(".webp") || !Object.hasOwn(assets, path.replace(/\.[^.]+$/, ".webp")),
    )
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
    .map(([path, src]) => {
      const filename =
        path
          .split("/")
          .pop()
          ?.replace(/\.[^.]+$/, "") ?? "";
      return {
        src,
        alt: descriptions[filename] ?? filename.replace(/[-_]+/g, " "),
      };
    });
}
