import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const Card = ({ title, children, right }) => (
  <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 shadow-sm">
    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {right}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export function ATSHistoryChart({ rows }) {
  const data = (rows || [])
    .slice()
    .reverse()
    .map((r) => ({
      date: formatDateShort(r.uploadedAt || r.createdAt),
      ats: r.atsScore ?? 0,
    }));

  return (
    <Card title="ATS score over time" right={<span className="text-xs text-slate-500">Last {data.length} uploads</span>}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="atsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }}
              labelStyle={{ color: '#0f172a' }}
            />
            <Area type="monotone" dataKey="ats" stroke="#2563eb" fill="url(#atsFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function ATSBreakdownMini({ latest }) {
  const rows = [
    { name: 'Keywords', value: latest?.keywordScore ?? 0 },
    { name: 'Format', value: latest?.formatScore ?? 0 },
    { name: 'Experience', value: latest?.experienceScore ?? 0 },
    { name: 'Skills', value: latest?.skillsScore ?? 0 },
    { name: 'Education', value: latest?.educationScore ?? 0 },
  ];

  return (
    <Card title="Latest breakdown">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: '#e2e8f0' }} />
            <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

