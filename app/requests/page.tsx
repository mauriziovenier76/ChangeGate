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
            {mockData.map((cr) => (
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
