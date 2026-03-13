import { Link } from 'react-router-dom';

export default function HistoryTable({ rows = [] }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { dateStyle: 'medium' });
  };

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        No resumes analyzed yet. Upload your first resume to get started.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-6 py-3 font-medium text-slate-600">Resume</th>
              <th className="text-left px-6 py-3 font-medium text-slate-600">ATS Score</th>
              <th className="text-left px-6 py-3 font-medium text-slate-600">Date</th>
              <th className="text-right px-6 py-3 font-medium text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4 text-slate-800 font-medium">{row.fileName}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                    {row.atsScore ?? '—'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{formatDate(row.uploadedAt || row.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <Link
                    to={`/analysis/${row.id}`}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
