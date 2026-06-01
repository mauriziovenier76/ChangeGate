export default function Topbar({ title }: { title: string }) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-3">
        <button className="text-sm text-slate-600 border border-slate-200 rounded-md px-3 py-1.5 hover:bg-slate-50">
          Help
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-300" />
      </div>
    </header>
  );
}
