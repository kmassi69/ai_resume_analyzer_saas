const scoreColor = (score) => {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 55) return 'bg-amber-500';
  return 'bg-red-500';
};

function MetricRow({ label, value }) {
  const percent = Math.min(100, Math.max(0, value ?? 0));
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{value ?? '—'}</span>
      </div>
      <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full ${scoreColor(percent)}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function ScoreBreakdown({
  keywordScore,
  formatScore,
  experienceScore,
  skillsScore,
  educationScore,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">Score Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricRow label="Keyword Score" value={keywordScore} />
        <MetricRow label="Formatting Score" value={formatScore} />
        <MetricRow label="Experience Score" value={experienceScore} />
        <MetricRow label="Skills Score" value={skillsScore} />
        <MetricRow label="Education Score" value={educationScore} />
      </div>
    </div>
  );
}

