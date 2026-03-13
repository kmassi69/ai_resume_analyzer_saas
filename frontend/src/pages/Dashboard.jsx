import { useState, useEffect } from 'react';
import ResumeUploader from '../components/ResumeUploader';
import ATSScoreCard from '../components/ATSScoreCard';
import FeedbackCard from '../components/FeedbackCard';
import HistoryTable from '../components/HistoryTable';
import { uploadResume, getResumeHistory } from '../services/api';
import { ATSHistoryChart, ATSBreakdownMini } from '../components/ATSCharts';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const { data } = await getResumeHistory();
      if (data.success && data.data?.length) {
        setHistory(data.data);
        setLatest(data.data[0]);
      } else {
        setHistory([]);
        setLatest(null);
      }
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpload = async (file) => {
    setLoading(true);
    try {
      const { data } = await uploadResume(file);
      if (data.success) {
        setLatest(data.data);
        setHistory((prev) => [
          {
            id: data.data.resumeId,
            fileName: data.data.fileName,
            atsScore: data.data.atsScore,
            uploadedAt: data.data.uploadedAt,
          },
          ...prev,
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-primary-50/60 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">Upload a resume to get an ATS score and actionable improvements.</p>
          </div>
          <div className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{history.length}</span> total analyses
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ATSScoreCard score={latest?.atsScore ?? 0} label="Latest ATS Score" />
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-2">Total Resumes Analyzed</p>
          <p className="text-4xl font-bold text-slate-900">{history.length}</p>
          <p className="text-xs text-slate-500 mt-2">Tracked per account</p>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500 mb-2">Latest Issue</p>
          <p className="text-slate-900 font-medium line-clamp-2">
            {latest?.issues?.[0] ?? 'Upload a resume to see feedback'}
          </p>
          <p className="text-xs text-slate-500 mt-2">AI feedback (if enabled)</p>
        </div>
      </div>

      {/* Upload */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Upload resume</h2>
          <span className="text-sm text-slate-500">PDF or DOCX • Max 5MB</span>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 p-4 shadow-sm">
          <ResumeUploader onUpload={handleUpload} loading={loading} />
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ATSHistoryChart rows={history} />
        <ATSBreakdownMini latest={latest} />
      </section>

      {/* Feedback */}
      {latest && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Latest feedback</h2>
          <FeedbackCard issues={latest.issues} suggestions={latest.suggestions} feedback={latest.feedback} />
        </section>
      )}

      {/* History table */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Resume history</h2>
        {historyLoading ? (
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
            Loading...
          </div>
        ) : (
          <HistoryTable rows={history} />
        )}
      </section>
    </div>
  );
}
