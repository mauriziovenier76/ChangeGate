import "./globals.css";
import Topbar from "./components/Topbar";

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="bg-slate-100 text-slate-900">
        <Topbar />

        <main className="p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
