"use client";

import { useState } from "react";
import Topbar from "../components/Topbar";

export default function RequestsPage() {
  const mockData = [
    { id: "CR-001", title: "Aggiornamento modulo fatturazione", status: "In Attesa", createdAt: "2024-01-10" },
    { id: "CR-002", title: "Fix bug reportistica", status: "In Lavorazione", createdAt: "2024-01-12" },
    { id: "CR-003", title: "Nuova dashboard KPI", status: "Completata", createdAt: "2024-01-15" },
  ];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = mockData.filter((cr) => {
    const matchesSearch =
      cr.id.toLowerCase().includes(search.toLowerCase()) ||
      cr.title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "" || cr.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="-m-6 flex flex-col min-h-screen">
      <Topbar title="Change Request" />

      <div className="flex-1 p-6 space-y-6 bg-slate-100">

        {/* FILTRI */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Ricerca */}
            <div>
              <label className="text-xs font-medium text-slate-600">Cerca</label>
              <input
                type="text"
                placeholder="ID o titolo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stato */}
            <div>
              <label className="text-xs font-medium text-slate-600">Stato</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
              >
                <option value="">Tutti</option>
                <option value="In Attesa">In Attesa</option>
                <option value="In Lavorazione">In Lavorazione</option>
                <option value="Completata">Completata</option>
              </select>
            </div>

            {/* Pulsante nuova CR */}
            <div className="flex items-end">
              <a
                href="/requests/new"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-lg font-semibold"
              >
                Nuova Change Request
              </a>
            </div>
          </div>
        </div>

        {/* TABELLA */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 text-xs font-semibold text-slate-500 uppercase">ID</th>
                <th className="py-3 text-xs font-semibold text-slate-500 uppercase">Titolo</th>
                <th className="py-3 text-xs font-semibold text-slate-500 uppercase">Stato</th>
                <th className="py-3 text-xs font-semibold text-slate-500 uppercase">Data</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500">
                    Nessuna Change Request trovata
                  </td>
                </tr>
              )}

              {filtered.map((cr) => (
                <tr key={cr.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-medium text-slate-900">{cr.id}</td>
                  <td className="py-3 text-slate-700">{cr.title}</td>
                  <td className="py-3">
                    <span
                      className={
                        "px-2 py-1 text-xs rounded-full " +
                        (cr.status === "Completata"
                          ? "bg-emerald-100 text-emerald-700"
                          : cr.status === "In Lavorazione"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700")
                      }
                    >
                      {cr.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">{cr.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
