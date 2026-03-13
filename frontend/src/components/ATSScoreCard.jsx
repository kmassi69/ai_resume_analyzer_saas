export default function ATSScoreCard({ score = 0, label = 'ATS Score' }) {
  const percent = Math.min(100, Math.max(0, score));
  const color = percent >= 70 ? 'bg-emerald-500' : percent >= 50 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500 mb-2">{label}</p>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-slate-800">{score}</span>
        <span className="text-lg text-slate-500 mb-1">/ 100</span>
      </div>
      <div className="mt-4 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
