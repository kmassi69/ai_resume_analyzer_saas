import { useState, useEffect } from 'react';
import HistoryTable from '../components/HistoryTable';
import { getResumeHistory } from '../services/api';

export default function History() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getResumeHistory();
        setRows(data.success ? data.data ?? [] : []);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">Resume History</h1>
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          Loading...
        </div>
      ) : (
        <HistoryTable rows={rows} />
      )}
    </div>
  );
}
