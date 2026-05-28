"use client";

import { useState } from "react";

export default function RequestsPage() {
  const mockData = [
    {
      id: "CR-001",
      title: "Aggiornamento modulo fatturazione",
      status: "In Attesa",
      createdAt: "2024-01-10",
    },
    {
      id: "CR-002",
      title: "Fix bug reportistica",
      status: "In Lavorazione",
      createdAt: "2024-01-12",
    },
    {
      id: "CR-003",
      title: "Nuova dashboard KPI",
      status: "Completata",
      createdAt: "2024-01-15",
    },
  ];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const filteredData = mockData.filter((cr) => {
    const matchesSearch =
      cr.id.toLowerCase().includes(search.toLowerCase()) ||
      cr.title.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "" || cr.status === statusFilter;

    const matchesDate =
      dateFilter === "" || cr.createdAt >= dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Change Request</h1>

        <a
          href="/requests/new"
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
        >
          Nuova Change Request
        </a>
      </div>

      {/* FILTRI */}
      <div className="bg-gray-800 p-6 rounded-xl shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Ricerca */}
          <div>
            <label className="text-gray-300 text-sm">Cerca</label>
            <input
              type="text"
              placeholder="ID o titolo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Stato */}
          <div>
            <label className="text-gray-300 text-sm">Stato</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-700 text-white"
            >
              <option value="">Tutti</option>
              <option value="In Attesa">In Attesa</option>
              <option value="In Lavorazione">In Lavorazione</option>
              <option value="Completata">Completata</option>
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="text-gray-300 text-sm">Da data</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-gray-700 text-white"
            />
          </div>
        </div>
      </div>

      {/* TABELLA */}
      <div className="bg-gray-800 p-6 rounded-xl shadow">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3">ID</th>
              <th className="py-3">Titolo</th>
              <th className="py-3">Stato</th>
              <th className="py-3">Creata il</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">
                  Nessuna Change Request trovata
                </td>
              </tr>
            )}

            {filteredData.map((cr) => (
              <tr key={cr.id} className="border-b border-gray-700">
                <td className="py-3">{cr.id}</td>
                <td className="py-3">{cr.title}</td>
                <td className="py-3">{cr.status}</td>
                <td className="py-3">{cr.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
