// ─── File Upload Utilities ─────────────────────────────────────────────────────
// Handles base64 conversion, Apps Script upload, and localStorage persistence.

// ⬇️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE ⬇️
const APPS_SCRIPT_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbwU0obiTftHmBBbualeSBOlbOB3cr_dFadZiOr3c1O35p4oS5cHSqN7wmfZgUrOjwAA/exec';
// ⬆️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE ⬆️

/** Shape of a stored uploaded-file record. */
export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  lessonId: string;
  uploadedAt: number;
}

/** Response returned by the Apps Script API on success. */
interface UploadApiResponse {
  success: boolean;
  url: string;
  name: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Convert a File object to a raw base64 string (no data-URL prefix). */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:…;base64," prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/** Upload a file to Google Drive via the Apps Script endpoint. */
export async function uploadFile(
  file: File,
  lessonId: string,
): Promise<UploadedFile> {
  const base64 = await fileToBase64(file);

  const response = await fetch(APPS_SCRIPT_UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file: base64,
      name: file.name,
      type: file.type,
    }),
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const data: UploadApiResponse = await response.json();

  if (!data.success) {
    throw new Error('Upload was not successful');
  }

  const record: UploadedFile = {
    id: crypto.randomUUID(),
    name: data.name,
    url: data.url,
    type: file.type,
    lessonId,
    uploadedAt: Date.now(),
  };

  // Persist to localStorage
  saveUploadedFile(record);

  return record;
}

// ─── localStorage helpers ──────────────────────────────────────────────────────

const STORAGE_KEY = 'uploaded_files';

/** Retrieve all uploaded-file records from localStorage. */
export function getUploadedFiles(): UploadedFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UploadedFile[]) : [];
  } catch {
    return [];
  }
}

/** Append a single record to the stored array. */
export function saveUploadedFile(record: UploadedFile): void {
  const files = getUploadedFiles();
  files.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

/** Delete a single record by id. */
export function deleteUploadedFile(id: string): void {
  const files = getUploadedFiles().filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}
