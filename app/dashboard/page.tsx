export default function DashboardPage() {
  return (
    <div className="text-white">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <p className="text-gray-300">
        Benvenuto nella dashboard di ChangeGate. Qui vedrai un riepilogo delle Change Request,
        attività recenti e notifiche.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Change Request Aperte</h2>
          <p className="text-gray-400">0</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">In Attesa di Approvazione</h2>
          <p className="text-gray-400">0</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Completate</h2>
          <p className="text-gray-400">0</p>
        </div>
      </div>
    </div>
  );
}
