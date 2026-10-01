/* eslint-disable @next/next/no-css-tags */
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import { PublicBaseProvider } from "@/components/PublicBase";
import { withBase } from "@/lib/camp-path";
import { getRequestBasePath } from "@/lib/request-base";

const siteDescription =
  "Clevio Innovator Camp adalah program pendidikan teknologi yang membantu anak usia 6–18 tahun menjadi creator, problem solver, dan innovator melalui pengalaman membuat karya digital untuk memberikan manfaat bagi orang lain.";

export async function generateMetadata(): Promise<Metadata> {
  const base = await getRequestBasePath();
  const icon = withBase(base, "/favicon-clevio.png");
  return {
    title: "Clevio Innovator Camp",
    description: siteDescription,
    openGraph: {
      title: "Clevio Innovator Camp",
      description: siteDescription,
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: "Clevio Innovator Camp",
      description: siteDescription,
    },
    icons: {
      icon: [{ url: icon, type: "image/png" }],
      shortcut: icon,
    },
  };
}

const themeStylesheets = [
  "/assets/css/bootstrap.min.css",
  "/assets/css/all.min.css",
  "/assets/css/animate.css",
  "/assets/css/icomoon.css",
  "/assets/css/magnific-popup.css",
  "/assets/css/meanmenu.css",
  "/assets/css/swiper-bundle.min.css",
  "/assets/css/nice-select.css",
  "/assets/css/main.css",
];

const themeScripts = [
  "/assets/js/jquery-3.7.1.min.js",
  "/assets/js/viewport.jquery.js",
  "/assets/js/bootstrap.bundle.min.js",
  "/assets/js/jquery.nice-select.min.js",
  "/assets/js/jquery.waypoints.js",
  "/assets/js/jquery.counterup.min.js",
  "/assets/js/swiper-bundle.min.js",
  "/assets/js/jquery.meanmenu.min.js",
  "/assets/js/jquery.magnific-popup.min.js",
  "/assets/js/wow.min.js",
  "/assets/js/main.js",
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const base = await getRequestBasePath();
  const asset = (path: string) => withBase(base, path);

  return (
    <html lang="id" data-scroll-behavior="smooth">
      <head>
        {themeStylesheets.map((href) => (
          <link key={href} rel="stylesheet" href={asset(href)} />
        ))}
      </head>
      <body>
        <PublicBaseProvider base={base}>{children}</PublicBaseProvider>
        {themeScripts.map((src, index) => (
          <Script key={src} src={asset(src)} strategy={index === 0 ? "beforeInteractive" : "afterInteractive"} />
        ))}
      </body>
    </html>
  );
}
