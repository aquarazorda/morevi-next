import { inter } from "~/components/ui/fonts";
import "~/styles/globals.css";

export const metadata = {
  title: "Morevi",
  description: "Record shop based in Tbilisi, Georgia",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} dark`}>{children}</body>
    </html>
  );
}
