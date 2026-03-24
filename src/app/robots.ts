import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const isProduction =
    process.env.VERCEL_ENV === "production" ||
    process.env.NEXT_PUBLIC_ENVIRONMENT === "production";

  if (!isProduction) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/for-brands", "/for-creators", "/pricing", "/talent", "/terms", "/privacy"],
        disallow: ["/admin", "/dashboard", "/api/", "/onboarding", "/get-started"],
      },
    ],
    sitemap: "https://creatorhive.ae/sitemap.xml",
  };
}
