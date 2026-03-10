import React from "react";
import "../pages/main.css";
import type { ReactNode } from "react";
import Providers from "./providers";

export const metadata = {
  title: "My Transit Life - Design Transit Posters from Real Route Data",
  description:
    "Create beautiful, high-quality transit posters from real network and route data. Choose from cities worldwide, customize your design, and create unique posters.",
  openGraph: {
    title: "My Transit Life - Design Transit Posters",
    description:
      "Create beautiful transit posters from real route data. Browse routes from NYC, London, Berlin, Paris, Tel Aviv, and more.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

