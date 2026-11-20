import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export function FileUpload({ onFile, label = 'Drop file here or click to browse', hint = 'PDF, JPG, PNG – max 10MB' }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((accepted, rejected) => {
    setError('');
    if (rejected?.length) {
      setError('File rejected. Check size (<10MB) or type (PDF/JPG/PNG).');
      return;
    }
    if (accepted?.length) {
      setFile(accepted[0]);
      onFile && onFile(accepted[0]);
    }
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024,
    accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] },
    multiple: false,
  });

  return (
    <div>
      <div {...getRootProps()} className={`dropzone${isDragActive ? ' active' : ''}`}>
        <input {...getInputProps()} />
        <div className="dropzone-icon">📁</div>
        <div className="dropzone-text">{isDragActive ? 'Drop it here!' : label}</div>
        <div className="dropzone-hint">{hint}</div>
      </div>
      {error && <p className="form-error mt-2">{error}</p>}
      {file && (
        <div className="file-preview">
          <span className="file-preview-icon">{file.type === 'application/pdf' ? '📄' : '🖼️'}</span>
          <span className="file-preview-name">{file.name}</span>
          <span className="file-preview-size">{(file.size / 1024).toFixed(1)} KB</span>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); setFile(null); onFile && onFile(null); }}>✕</button>
        </div>
      )}
    </div>
  );
}

export function UploadProgress({ progress }) {
  return (
    <div className="upload-progress">
      <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
