import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, XCircle, Loader } from 'lucide-react';
import { getLesson } from '../data/sampleCourse';
import { useAppStore } from '../store/useAppStore';
import { getOrCreateDeviceId } from '../services/storage';
import { Button } from '../components/Button';
import './Activity.css';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;

const Activity: React.FC = () => {
    const { unitId = '', lessonId = '' } = useParams<{ unitId: string; lessonId: string }>();
    const navigate = useNavigate();

    const activeUserId = useAppStore((s) => s.activeUserId);
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
            const deviceId = await getOrCreateDeviceId();
            const timestamp = new Date().toISOString();

            if (!APPS_SCRIPT_URL) {
                // Simulate upload if no endpoint configured
                await new Promise((res) => setTimeout(res, 1200));
            } else {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('unitId', unitId);
                formData.append('lessonId', lessonId);
                formData.append('activeUserId', activeUserId ?? '');
                formData.append('deviceId', deviceId);
                formData.append('timestamp', timestamp);

                const res = await fetch(APPS_SCRIPT_URL, {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    throw new Error(`Upload failed: ${res.status}`);
                }
            }

            // Mark done and update progress
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
                                <FileText size={32} className="activity-dropzone__file-icon" />
                                <p className="activity-dropzone__filename">{file.name}</p>
                                <p className="activity-dropzone__size">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                                <p className="activity-dropzone__change">اضغط لتغيير الملف</p>
                            </>
                        ) : (
                            <>
                                <Upload size={32} className="activity-dropzone__icon" />
                                <p className="activity-dropzone__label">
                                    اضغط لاختيار ملف PDF أو DOCX
                                </p>
                                <p className="activity-dropzone__formats">
                                    PDF · DOC · DOCX
                                </p>
                            </>
                        )}
                    </button>

                    <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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

                    {/* No APPS_SCRIPT notice */}
                    {!APPS_SCRIPT_URL && (
                        <p className="activity-sim-note">
                            {/* ملاحظة: لم يُضبط VITE_APPS_SCRIPT_URL — سيُحاكى الرفع محليًا. */}
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default Activity;
