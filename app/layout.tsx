import type { Metadata } from "next";
import { Chakra_Petch, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const siteUrl = "https://yazan-o.github.io/ouroboros";
const siteTitle = "Ouroboros - the loop that watches itself";
const siteDescription =
  "A dashboard built by a maker-checker loop, visualizing the very loop that built it.";

const chakra = Chakra_Petch({
  variable: "--font-chakra",
  weight: ["300", "600"],
  subsets: ["latin"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  weight: ["400", "600"],
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${chakra.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer
          className="reveal reveal-5 mx-auto w-full max-w-5xl overflow-x-auto border-t border-border px-4 py-4 font-mono text-[0.68rem] text-muted md:px-6 md:text-xs"
          data-testid="footer"
          data-commit={
            process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? "dev"
          }
        >
          <div className="flex items-center justify-between gap-4 whitespace-nowrap">
            <span>built by its own loop</span>
            <nav aria-label="Project links" className="flex items-center gap-3">
              <a
                href="https://github.com/Yazan-O/ouroboros"
                target="_blank"
                rel="noopener"
              >
                repo
              </a>
              <a
                href="https://github.com/Yazan-O/ouroboros/blob/main/LOOP.md"
                target="_blank"
                rel="noopener"
              >
                LOOP.md
              </a>
              <a
                href="https://github.com/Yazan-O/ouroboros/blob/main/LESSONS.md"
                target="_blank"
                rel="noopener"
              >
                LESSONS.md
              </a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
