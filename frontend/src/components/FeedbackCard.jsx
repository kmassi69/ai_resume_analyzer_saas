export default function FeedbackCard({ issues = [], suggestions = [], feedback = [] }) {
  const sections = [
    { title: 'Strengths', items: feedback, icon: '✅', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Issues', items: issues, icon: '⚠️', color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Suggestions', items: suggestions, icon: '💡', color: 'text-primary-600', bg: 'bg-primary-50' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">AI Feedback</h3>
      </div>
      <div className="p-6 space-y-6">
        {sections.map(({ title, items, icon, color, bg }) => (
          <div key={title}>
            <h4 className={`text-sm font-medium ${color} mb-2 flex items-center gap-2`}>
              <span>{icon}</span>
              {title}
            </h4>
            <ul className="space-y-2">
              {items && items.length > 0 ? (
                items.map((item, i) => (
                  <li key={i} className={`text-sm text-slate-700 pl-6 py-1 rounded ${bg}`}>
                    {item}
                  </li>
                ))
              ) : (
                <li className="text-sm text-slate-400 italic pl-6">None</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
