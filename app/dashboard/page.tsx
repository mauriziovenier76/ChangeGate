import Topbar from "../components/Topbar";

export default function DashboardPage() {
  return (
    <div className="-m-6 flex flex-col min-h-screen">
      <Topbar title="Dashboard" />

      <div className="flex-1 p-6 space-y-6 bg-slate-100">
        {/* Riepilogo in alto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="text-xs font-medium text-slate-500 uppercase">
              Change Request aperte
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">12</div>
            <div className="mt-1 text-xs text-emerald-600">+3 rispetto alla scorsa settimana</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="text-xs font-medium text-slate-500 uppercase">
              In approvazione
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">5</div>
            <div className="mt-1 text-xs text-amber-600">2 in ritardo</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="text-xs font-medium text-slate-500 uppercase">
              Completate questo mese
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">18</div>
            <div className="mt-1 text-xs text-slate-500">Obiettivo: 25</div>
          </div>
        </div>

        {/* Sezione principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Change Request recenti
              </h2>
              <button className="text-xs text-blue-600 hover:underline">
                Vedi tutte
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    CR-001 · Aggiornamento modulo fatturazione
                  </div>
                  <div className="text-xs text-slate-500">
                    Cliente: ACME · Creato il 10/01/2024
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                  In approvazione
                </span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    CR-002 · Fix bug reportistica
                  </div>
                  <div className="text-xs text-slate-500">
                    Cliente: BetaCorp · Creato il 12/01/2024
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  In lavorazione
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Prossime scadenze
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-700">CR-005 · Rollout produzione</span>
                <span className="text-xs text-rose-600">Oggi</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-700">CR-006 · Test UAT</span>
                <span className="text-xs text-amber-600">Domani</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
