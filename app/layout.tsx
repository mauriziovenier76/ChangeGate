import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { UserProvider } from "@/lib/user-context";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChangeGate",
  description: "Change Request Management Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={dmSans.className}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
