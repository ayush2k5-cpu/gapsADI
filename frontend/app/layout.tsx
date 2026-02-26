import type { Metadata } from "next";
import { Inter, Bebas_Neue, Courier_Prime } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-screenplay",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scriptoria - AI Film Pre-Production",
  description: "Generative AI–powered film pre-production system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${bebasNeue.variable} ${courierPrime.variable} antialiased bg-bg-base text-text-primary`}
      >
        {children}
      </body>
    </html>
  );
}
