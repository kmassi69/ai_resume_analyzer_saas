import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ATSScoreCard from '../components/ATSScoreCard';
import FeedbackCard from '../components/FeedbackCard';
import ScoreBreakdown from '../components/ScoreBreakdown';
import { getResumeById } from '../services/api';

export default function Analysis() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data: res } = await getResumeById(id);
        if (res.success) setData(res.data);
        else setError('Analysis not found');
      } catch {
        setError('Failed to load analysis');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error || 'Not found'}</p>
        <Link to="/dashboard" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Resume Analysis</h1>
        <Link to="/dashboard" className="text-primary-600 hover:underline text-sm">
          ← Dashboard
        </Link>
      </div>
      <p className="text-slate-600">{data.fileName}</p>
      <ATSScoreCard score={data.atsScore} label="ATS Score" />
      <ScoreBreakdown
        keywordScore={data.keywordScore}
        formatScore={data.formatScore}
        experienceScore={data.experienceScore}
        skillsScore={data.skillsScore}
        educationScore={data.educationScore}
      />
      <FeedbackCard
        issues={data.issues}
        suggestions={data.suggestions}
        feedback={data.feedback}
      />
    </div>
  );
}
