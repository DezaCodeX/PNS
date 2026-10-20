import type { Metadata } from "next";

const siteName = "Hotel PNS Nakshatra";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
};

export function createPageMetadata({ title, description, path }: PageMetadataInput): Metadata {
  const sharingTitle = path === "/" ? title : `${title} | ${siteName}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName,
      title: sharingTitle,
      description,
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: sharingTitle,
      description,
    },
  };
}
