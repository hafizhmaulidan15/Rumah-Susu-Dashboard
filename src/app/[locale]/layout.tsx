import "@/styles/globals.css";

import { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { Providers } from "@/services/providers";
import { openSans, outfit } from "@/styles/fonts";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      /**
       * Required by next-themes - theme attributes are injected before
       * hydration to prevent flash.
       * @see https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
       */
      suppressHydrationWarning={true}
    >
      <head>
        <Script
          id="hydration-suppress"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){
          var a=['fdprocessedid','cz-shortcut-listen'];
          function r(e){for(var i=0;i<a.length;i++)e.removeAttribute(a[i]);}
          function s(){try{document.querySelectorAll('*').forEach(r);}catch(e){}}
          s();
          (new MutationObserver(function(m){
            for(var i=0;i<m.length;i++){
              if(m[i].type==='attributes'){r(m[i].target);}
              else if(m[i].type==='childList'){
                for(var j=0;j<m[i].addedNodes.length;j++){
                  var n=m[i].addedNodes[j];
                  if(n.nodeType===1){r(n);n.querySelectorAll('*').forEach(r);}
                }
              }
            }
          })).observe(document.documentElement,{attributes:true,childList:true,subtree:true,attributeFilter:a});
          if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',s);}
        })();`,
          }}
        />
      </head>

      <body className={`${outfit.variable} ${openSans.variable}`}>
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  metadataBase: new URL("https://dashboard.rumahsusuindonesia.com"),
  title: {
    default: "Rumah Susu Indonesia",
    template: "%s | RSI",
  },
  description:
    "Inventory dashboard for Rumah Susu Indonesia - real-time stock management with Google Sheets integration",
  keywords: [
    "inventory dashboard",
    "stock management",
    "rumah susu indonesia",
    "google sheets",
    "nextjs dashboard",
    "shadcn dashboard",
    "typescript",
    "tailwind",
  ],
  authors: [{ name: "Rumah Susu Indonesia" }],
  creator: "Rumah Susu Indonesia",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://dashboard.rumahsusuindonesia.com",
    siteName: "Rumah Susu Indonesia",
    title: "Rumah Susu Indonesia | Inventory Dashboard",
    description:
      "Inventory dashboard for Rumah Susu Indonesia - real-time stock management with Google Sheets integration",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rumah Susu Indonesia Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rumah Susu Indonesia | Inventory Dashboard",
    description:
      "Inventory dashboard for Rumah Susu Indonesia - real-time stock management with Google Sheets integration",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F59E0B",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
