// ─── File Upload Utilities ─────────────────────────────────────────────────────
// Handles base64 conversion, Apps Script upload, and localStorage persistence.

// ⬇️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE ⬇️
const APPS_SCRIPT_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbxmA7vnwhYeVQWQY4R2J5_aDo65cCZ0APoaR_wK-N9X0Gaqz_dkjXjboT_-VZPhPtB_/exec';
// ⬆️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE ⬆️

/** Shape of a stored uploaded-file record. */
export interface UploadedFile {
  id: string;
  fileId: string;       // Google Drive file ID (for deletion)
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
  fileId: string;
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

  // Apps Script reads e.parameter — must send as URL-encoded form data
  const params = new URLSearchParams();
  params.append('file', base64);
  params.append('name', file.name);
  params.append('type', file.type);

  const response = await fetch(APPS_SCRIPT_UPLOAD_URL, {
    method: 'POST',
    body: params,
    redirect: 'follow',        // Apps Script responds with 302 redirects
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
    fileId: data.fileId,
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

// ─── localStorage helpers (used by upload flow) ────────────────────────────────

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

// ─── Google Drive API helpers (used by Admin page) ─────────────────────────────

/** Shape of a file record returned from the Drive listing API. */
export interface DriveFile {
  fileId: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: number;
}

/** Fetch all files from the Google Drive folder via Apps Script GET. */
export async function fetchFilesFromDrive(): Promise<DriveFile[]> {
  const response = await fetch(APPS_SCRIPT_UPLOAD_URL, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch files: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch files');
  }

  return data.files as DriveFile[];
}

/** Delete a file from Google Drive via the Apps Script endpoint. */
export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const params = new URLSearchParams();
  params.append('action', 'delete');
  params.append('fileId', fileId);

  const response = await fetch(APPS_SCRIPT_UPLOAD_URL, {
    method: 'POST',
    body: params,
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`);
  }
}

