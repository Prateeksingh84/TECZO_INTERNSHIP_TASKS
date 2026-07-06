import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Natura Essence | Eco-Friendly Skincare",
  description: "Luxury eco-conscious skincare collection with dynamic backend APIs."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
