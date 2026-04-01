import React, { useState, useMemo } from 'react';
import {
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  FolderOpen,
  Search,
  Filter,
  Calendar,
  BookOpen,
} from 'lucide-react';
import {
  getUploadedFiles,
  deleteUploadedFile,
  type UploadedFile,
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
  const [files, setFiles] = useState<UploadedFile[]>(getUploadedFiles);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<string>('all');

  // Derive unique lesson IDs for filtering
  const lessonIds = useMemo(() => {
    const ids = [...new Set(files.map((f) => f.lessonId))];
    ids.sort();
    return ids;
  }, [files]);

  // Filtered & sorted files
  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Lesson filter
    if (selectedLesson !== 'all') {
      result = result.filter((f) => f.lessonId === selectedLesson);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.lessonId.toLowerCase().includes(q) ||
          f.type.toLowerCase().includes(q),
      );
    }

    // Newest first
    result.sort((a, b) => b.uploadedAt - a.uploadedAt);
    return result;
  }, [files, searchQuery, selectedLesson]);

  const handleDelete = (id: string) => {
    deleteUploadedFile(id);
    setFiles(getUploadedFiles());
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
              {files.length} ملف مرفوع
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
            placeholder="بحث بالاسم أو الدرس…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Lesson filter */}
        {lessonIds.length > 1 && (
          <div className="admin-filter">
            <Filter size={14} className="admin-filter__icon" />
            <select
              id="admin-lesson-filter"
              className="admin-filter__select"
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
            >
              <option value="all">كل الدروس</option>
              {lessonIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Files grid */}
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
              : 'جرّب تغيير معايير البحث أو الفلتر.'}
          </p>
        </div>
      ) : (
        <ul className="admin-file-list">
          {filteredFiles.map((file) => (
            <li key={file.id} className="admin-file-card">
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
                    <BookOpen size={12} />
                    {file.lessonId}
                  </span>
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
                  onClick={() => handleDelete(file.id)}
                  title="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Admin;
