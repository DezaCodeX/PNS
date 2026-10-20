import heroTitleGraphic from "../Untitled-1.webp";

export default function Head() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap"
      />
      <link
        rel="preload"
        href="/moglandemo/Moglan_DEMO.ttf"
        as="font"
        type="font/ttf"
        crossOrigin="anonymous"
      />
      <link rel="preload" href={heroTitleGraphic.src} as="image" fetchPriority="high" />
    </>
  );
}
