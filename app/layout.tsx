import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "./components/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FoodDelivery - Delicious Food Delivered to Your Door",
  description: "Order from the best restaurants in your area. Fast delivery, great prices, and amazing food.",
  keywords: "food delivery, restaurants, takeout, delivery service, food ordering",
  authors: [{ name: "FoodDelivery Team" }],
  openGraph: {
    title: "FoodDelivery - Delicious Food Delivered to Your Door",
    description: "Order from the best restaurants in your area. Fast delivery, great prices, and amazing food.",
    type: "website",
    locale: "en_US",
    siteName: "FoodDelivery",
  },
  twitter: {
    card: "summary_large_image",
    title: "FoodDelivery - Delicious Food Delivered to Your Door",
    description: "Order from the best restaurants in your area. Fast delivery, great prices, and amazing food.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
