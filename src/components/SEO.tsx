"use client";
import { DefaultSeo } from "next-seo";

export function SEO() {
  return (
    <DefaultSeo
      titleTemplate="%s | Creator Hive"
      defaultTitle="Creator Hive"
      description="Smart contracts, milestone payouts, scope control, and compliance for the GCC creator economy."
      openGraph={{
        type: "website",
        siteName: "Creator Hive",
        title: "Creator Hive",
        description:
          "Smart contracts, milestone payouts, scope control, and compliance for the GCC creator economy.",
        images: [
          { url: "/brand/creator-hive-logo.png", width: 1200, height: 630, alt: "Creator Hive" },
        ],
      }}
      twitter={{ cardType: "summary_large_image" }}
    />
  );
}


