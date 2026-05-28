import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "ChangeGate",
  description: "Gestione Change Request",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-gray-900 text-white">
        <nav className="w-full bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-bold">
            <Link href="/">ChangeGate</Link>
          </div>

          <div className="flex gap-6 text-gray-300">
            <Link href="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/requests" className="hover:text-white transition">
              Change Request
            </Link>
            <Link href="/settings" className="hover:text-white transition">
              Impostazioni
            </Link>
          </div>

          <div>
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
            >
              Login
            </Link>
          </div>
        </nav>

        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
