import "./globals.css";
import Topbar from "./components/Topbar";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-slate-100 text-slate-900">
        <Topbar />
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
