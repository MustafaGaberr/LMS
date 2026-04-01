import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, XCircle, Loader, Image as ImageIcon } from 'lucide-react';
import { getLesson } from '../data/sampleCourse';
import { useAppStore } from '../store/useAppStore';
import { uploadFile } from '../utils/fileUpload';
import { Button } from '../components/Button';
import './Activity.css';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

const ACCEPTED_TYPES =
  '.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg,image/webp';

/** Human-friendly label for a MIME type */
function mimeLabel(type: string): string {
  if (type.startsWith('image/')) return '🖼️ صورة';
  if (type.includes('pdf')) return '📄 PDF';
  if (type.includes('word') || type.includes('document')) return '📝 Word';
  return '📎 ملف';
}

const Activity: React.FC = () => {
  const { unitId = '', lessonId = '' } = useParams<{ unitId: string; lessonId: string }>();
  const navigate = useNavigate();

  const markActivityDone = useAppStore((s) => s.markActivityDone);
  const getLessonProgress = useAppStore((s) => s.getLessonProgress);

  const lesson = getLesson(unitId, lessonId);
  const progress = getLessonProgress(lessonId);

  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // If already done, show success state
  useEffect(() => {
    if (progress.activityDone) setUploadState('success');
  }, [progress.activityDone]);

  if (!lesson) {
    return (
      <div className="activity-page">
        <p className="activity-error">الدرس غير موجود.</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUploadState('idle');
    setErrorMsg('');
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploadState('uploading');
    setErrorMsg('');

    try {
      await uploadFile(file, lessonId);
      markActivityDone(lessonId);
      setUploadState('success');
    } catch (err) {
      console.error(err);
      setUploadState('error');
      setErrorMsg('حدث خطأ أثناء الرفع. يُرجى المحاولة مرة أخرى.');
    }
  };

  const handleReturn = () => {
    navigate(`/units/${unitId}/lessons`, { replace: true });
  };

  const isImage = file?.type.startsWith('image/');

  return (
    <div className="activity-page">
      {/* Instructions card */}
      <div className="activity-instructions">
        <div className="activity-instructions__icon">📝</div>
        <h2 className="activity-instructions__title">النشاط التطبيقي</h2>
        <p className="activity-instructions__text">{lesson.activityInstructions}</p>
      </div>

      {/* Upload section */}
      {uploadState === 'success' ? (
        <div className="activity-success">
          <CheckCircle size={48} className="activity-success__icon" />
          <h3>تم رفع النشاط بنجاح! 🎉</h3>
          <p>تم إتمام الدرس وفُتح الدرس التالي.</p>
          <Button variant="primary" size="lg" fullWidth onClick={handleReturn}>
            العودة للدروس
          </Button>
        </div>
      ) : (
        <>
          {/* Dropzone */}
          <button
            className={`activity-dropzone ${file ? 'activity-dropzone--has-file' : ''}`}
            onClick={() => fileRef.current?.click()}
          >
            {file ? (
              <>
                {isImage ? (
                  <ImageIcon size={32} className="activity-dropzone__file-icon" />
                ) : (
                  <FileText size={32} className="activity-dropzone__file-icon" />
                )}
                <p className="activity-dropzone__filename">{file.name}</p>
                <p className="activity-dropzone__size">
                  {(file.size / 1024).toFixed(1)} KB — {mimeLabel(file.type)}
                </p>
                <p className="activity-dropzone__change">اضغط لتغيير الملف</p>
              </>
            ) : (
              <>
                <Upload size={32} className="activity-dropzone__icon" />
                <p className="activity-dropzone__label">
                  اضغط لاختيار ملف
                </p>
                <p className="activity-dropzone__formats">
                  PDF · DOC · DOCX · PNG · JPG
                </p>
              </>
            )}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_TYPES}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Upload button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!file || uploadState === 'uploading'}
            onClick={handleUpload}
            icon={uploadState === 'uploading' ? <Loader size={18} className="spin" /> : <Upload size={18} />}
          >
            {uploadState === 'uploading' ? 'جارٍ الرفع…' : 'رفع النشاط'}
          </Button>

          {/* Error */}
          {uploadState === 'error' && (
            <div className="activity-error-msg">
              <XCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Activity;
