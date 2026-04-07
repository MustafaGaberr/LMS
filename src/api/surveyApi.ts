// ─── Survey API ────────────────────────────────────────────────────────────────
// Submits survey responses to Google Sheets via Google Apps Script.
//
// Each scale is submitted independently to its own sheet, identified by scaleType.
// Google Apps Script reads POST data via e.parameter which ONLY
// works with URL-encoded form data (URLSearchParams).

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwCTmnwhJ0Y6zD1_ojim63JDIeuQadj22a_oSEgAXVkOsZNrc5XszAkz-TihjJS-2Zy/exec';

/**
 * Submit a single psychological scale's answers to Google Sheets.
 * @param scaleType - Which sheet to write to: 'cognitive' or 'efficacy'
 * @param answers   - Ordered array of Likert values (1-5)
 */
export async function submitSurvey(
    scaleType: 'cognitive' | 'efficacy',
    answers: number[],
): Promise<void> {
    const params = new URLSearchParams();
    params.append('action', 'survey');
    params.append('scaleType', scaleType);
    params.append('answers', answers.join(','));
    params.append('submittedAt', new Date().toISOString());

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
        throw new Error(data.error || 'فشل في حفظ المقياس');
    }
}