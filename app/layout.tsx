import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { UserProvider } from "@/lib/user-context";
import Topbar from "./component/Topbar";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChangeGate",
  description: "Change Request Management Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={dmSans.className} style={{ margin: 0, padding: 0, backgroundColor: "var(--surface-bg, #f8fafc)", minHeight: "100vh" }}>
        <UserProvider>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Topbar />
            <main style={{ flex: 1, padding: "32px 32px", maxWidth: 1400, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
              {children}
            </main>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
