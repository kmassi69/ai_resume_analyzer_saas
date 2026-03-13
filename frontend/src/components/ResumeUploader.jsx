import { useState, useRef } from 'react';

export default function ResumeUploader({ onUpload, loading }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const validateFile = (file) => {
    const types = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!types.includes(file.type)) {
      setError('Only PDF and DOCX files are allowed');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB');
      return false;
    }
    setError('');
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && validateFile(file)) onUpload(file);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) onUpload(file);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div className="space-y-2">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openPicker}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'}
          ${loading ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          onChange={handleChange}
          className="hidden"
        />
        <div className="text-slate-500">
          <p className="text-lg font-medium text-slate-700">
            {loading ? 'Analyzing...' : 'Drop your resume here or click to upload'}
          </p>
          <p className="text-sm mt-1">PDF or DOCX, max 5MB</p>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
