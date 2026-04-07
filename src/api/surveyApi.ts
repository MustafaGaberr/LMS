// ─── Survey API ────────────────────────────────────────────────────────────────
// Submits survey responses to Google Sheets via Google Apps Script.
//
// KEY INSIGHT: Google Apps Script reads POST data via e.parameter which ONLY
// works with URL-encoded form data (URLSearchParams). FormData sends multipart
// which Apps Script cannot parse via e.parameter — it arrives as undefined.
//
// This matches the working pattern used in fileUpload.ts.

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwCTmnwhJ0Y6zD1_ojim63JDIeuQadj22a_oSEgAXVkOsZNrc5XszAkz-TihjJS-2Zy/exec';

/**
 * Submit both psychological scale answers to Google Sheets.
 */
export async function submitSurvey(
    scale1: number[],
    scale2: number[],
): Promise<void> {
    // ✅ URLSearchParams — same encoding as working file upload
    // Apps Script reads e.parameter which requires application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('action', 'survey');
    params.append('scale1', scale1.join(','));
    params.append('scale2', scale2.join(','));
    params.append('submittedAt', new Date().toISOString());

    // ✅ redirect: 'follow' — same as working file upload
    // Apps Script returns 302 → googleusercontent.com → 200 JSON
    const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: params,
        redirect: 'follow',
    });

    if (!response.ok) {
        throw new Error(`فشل الإرسال: ${response.status}`);
    }

    const data = await response.json();
    if (data && !data.success) {
        throw new Error(data.error || 'فشل في حفظ الاستبيان');
    }
}