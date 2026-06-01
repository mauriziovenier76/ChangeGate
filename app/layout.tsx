import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "ChangeGate",
  description: "Gestione Change Request",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-slate-100 text-slate-900">
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex-1 flex flex-col">
            {/* Topbar per tutte le pagine interne, la pagina login la gestiremo a parte */}
            <div className="sticky top-0 z-20">
              {/* Il titolo lo metteremo nelle singole pagine */}
            </div>

            <main className="p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
