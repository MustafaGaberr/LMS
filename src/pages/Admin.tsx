import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  FolderOpen,
  Search,
  Calendar,
  Loader,
  RefreshCw,
} from 'lucide-react';
import {
  fetchFilesFromDrive,
  deleteFileFromDrive,
  type DriveFile,
} from '../utils/fileUpload';
import './Admin.css';

/** Format a timestamp into a human-readable Arabic date string. */
function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Human-friendly label for a MIME type. */
function mimeLabel(type: string): string {
  if (type.startsWith('image/')) return 'صورة';
  if (type.includes('pdf')) return 'PDF';
  if (type.includes('word') || type.includes('document')) return 'Word';
  return 'ملف';
}

/** Icon for a MIME type. */
function MimeIcon({ type }: { type: string }) {
  if (type.startsWith('image/'))
    return <ImageIcon size={20} className="admin-file-card__type-icon admin-file-card__type-icon--image" />;
  return <FileText size={20} className="admin-file-card__type-icon admin-file-card__type-icon--doc" />;
}

const Admin: React.FC = () => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch files from Google Drive on mount
  const loadFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const driveFiles = await fetchFilesFromDrive();
      setFiles(driveFiles);
    } catch (err) {
      console.error(err);
      setError('فشل في تحميل الملفات. تأكد من صحة رابط الـ API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // Filtered files
  const filteredFiles = useMemo(() => {
    let result = [...files];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q),
      );
    }

    return result;
  }, [files, searchQuery]);

  const handleDelete = async (fileId: string) => {
    setDeletingId(fileId);
    try {
      await deleteFileFromDrive(fileId);
      // Remove from local state immediately
      setFiles((prev) => prev.filter((f) => f.fileId !== fileId));
    } catch (err) {
      console.error(err);
      alert('فشل في حذف الملف');
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpen = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header__title-row">
          <div className="admin-header__icon-wrap">
            <FolderOpen size={24} />
          </div>
          <div>
            <h1 className="admin-header__title">لوحة إدارة الملفات</h1>
            <p className="admin-header__subtitle">
              {loading ? 'جارٍ التحميل…' : `${files.length} ملف في Google Drive`}
            </p>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="admin-toolbar">
        {/* Search */}
        <div className="admin-search">
          <Search size={16} className="admin-search__icon" />
          <input
            id="admin-search-input"
            type="text"
            className="admin-search__input"
            placeholder="بحث بالاسم…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Refresh */}
        <button
          className="admin-refresh-btn"
          onClick={loadFiles}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>تحديث</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="admin-loading">
          <Loader size={32} className="spin" />
          <p>جارٍ تحميل الملفات من Google Drive…</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="admin-error">
          <p>{error}</p>
          <button className="admin-error__retry" onClick={loadFiles}>
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Files */}
      {!loading && !error && (
        <>
          {filteredFiles.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty__icon-wrap">
                <FolderOpen size={48} />
              </div>
              <h2 className="admin-empty__title">
                {files.length === 0 ? 'لا توجد ملفات بعد' : 'لا توجد نتائج'}
              </h2>
              <p className="admin-empty__text">
                {files.length === 0
                  ? 'سيتم عرض الملفات المرفوعة هنا تلقائيًا.'
                  : 'جرّب تغيير معايير البحث.'}
              </p>
            </div>
          ) : (
            <ul className="admin-file-list">
              {filteredFiles.map((file) => (
                <li key={file.fileId} className="admin-file-card">
                  {/* Type badge */}
                  <div className="admin-file-card__badge">
                    <MimeIcon type={file.type} />
                    <span className="admin-file-card__type-label">{mimeLabel(file.type)}</span>
                  </div>

                  {/* Info */}
                  <div className="admin-file-card__body">
                    <p className="admin-file-card__name" title={file.name}>
                      {file.name}
                    </p>

                    <div className="admin-file-card__meta">
                      <span className="admin-file-card__meta-item">
                        <Calendar size={12} />
                        {formatDate(file.uploadedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="admin-file-card__actions">
                    <button
                      className="admin-file-card__action admin-file-card__action--open"
                      onClick={() => handleOpen(file.url)}
                      title="فتح الملف"
                    >
                      <ExternalLink size={16} />
                      <span>فتح</span>
                    </button>
                    <button
                      className="admin-file-card__action admin-file-card__action--delete"
                      onClick={() => handleDelete(file.fileId)}
                      disabled={deletingId === file.fileId}
                      title="حذف من Drive"
                    >
                      {deletingId === file.fileId ? <Loader size={16} className="spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;
