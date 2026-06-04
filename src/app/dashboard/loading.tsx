export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-[270px] shrink-0 border-r border-slate-200/80 bg-white/80 p-5 md:block">
          <div className="h-10 w-36 animate-pulse rounded-2xl bg-slate-200" />
          <div className="mt-10 space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="h-16 border-b border-slate-200/80 bg-white/80" />
          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6">
            <div className="mb-5 h-12 w-12 animate-pulse rounded-2xl bg-sky-100" />
            <div className="h-8 w-44 animate-pulse rounded-xl bg-slate-200" />
            <div className="mt-4 h-28 w-full max-w-2xl animate-pulse rounded-[28px] bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]" />
          </div>
        </main>
      </div>
    </div>
  );
}
