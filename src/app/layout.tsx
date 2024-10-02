import { GeistMono } from "geist/font/mono";
import { type Viewport } from "next";
import "~/styles/globals.css";

export const metadata = {
  title: "Morevi",
  description: "Record shop based in Tbilisi, Georgia",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistMono.variable}>
      <body className="dark flex h-[100dvh] flex-col bg-[#0A0A0A] text-gray-200 md:flex-row">
        {children}
      </body>
    </html>
  );
}
