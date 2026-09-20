import type { Metadata, Viewport } from "next";
import { Geist_Mono, Outfit, Syne } from "next/font/google";
import { AppearanceTags } from "@/components/appearance-tags";
import { ThemeScript } from "@/components/theme-script";
import { getSite } from "@/lib/content";
import { defaultSite } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: `${defaultSite.name} — ${defaultSite.role}`,
    template: `%s — ${defaultSite.name}`,
  },
  description: defaultSite.headline,
  metadataBase: new URL("https://prabindangol.vercel.app"),
  openGraph: {
    title: `${defaultSite.name} — ${defaultSite.role}`,
    description: defaultSite.headline,
    type: "website",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const site = await getSite();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${syne.variable} ${geistMono.variable} h-full antialiased`}
      data-radius={site.appearance.radius}
    >
      <head>
        <ThemeScript />
        <AppearanceTags appearance={site.appearance} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
