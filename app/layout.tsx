import "../pages/main.css";
import type { ReactNode } from "react";
import Providers from "./providers";

export const metadata = {
  title: "My Transit Life",
  description: "Create beautiful transit posters from real route data.",
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

