export default function FornitoriPage() {
  const fornitori = [
    { id: 1, nome: "Tech Solutions Srl", pm: 3, specialisti: 8 },
    { id: 2, nome: "Innova Consulting", pm: 2, specialisti: 5 },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Fornitori</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6">
        <a
          href="/config/fornitori/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Nuovo Fornitore
        </a>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 text-xs font-semibold text-slate-500 uppercase">Nome</th>
              <th className="py-2 text-xs font-semibold text-slate-500 uppercase">PM</th>
              <th className="py-2 text-xs font-semibold text-slate-500 uppercase">Specialisti</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {fornitori.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="py-2">{f.nome}</td>
                <td className="py-2">{f.pm}</td>
                <td className="py-2">{f.specialisti}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
