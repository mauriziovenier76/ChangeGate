import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import AppShell from "./components/AppShell";
import { UserProvider } from "@/lib/user-context";

export const metadata: Metadata = {
  title: "ChangeGate",
  description: "Change Management Portal",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="it">
      <body>
        <UserProvider>
          <AppShell>{children}</AppShell>
        </UserProvider>
      </body>
    </html>
  );
}
