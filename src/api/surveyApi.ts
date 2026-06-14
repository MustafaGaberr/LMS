// ─── Survey API ────────────────────────────────────────────────────────────────
// Submits survey responses to Google Sheets via Google Apps Script.
//
// Each scale is submitted independently to its own sheet, identified by scaleType.
// Google Apps Script reads POST data via e.parameter which ONLY
// works with URL-encoded form data (URLSearchParams).

// POST-scales (after all units) — sheet النهاية
const POST_SCALES_URL = 'https://script.google.com/macros/s/AKfycbwCTmnwhJ0Y6zD1_ojim63JDIeuQadj22a_oSEgAXVkOsZNrc5XszAkz-TihjJS-2Zy/exec';

// PRE-scales (before units) — sheet البداية
const PRE_SCALES_URL = 'https://script.google.com/macros/s/AKfycbxhr-Z2Ro2ID7qGWOVt6ryyq24z0myjgkbsP8vI9RDmjJUIG54y-p18vIZ9-ExAUGZZ/exec';

/**
 * Generic helper to POST survey data to a given Apps Script endpoint.
 */
async function postSurveyData(
    url: string,
    scaleType: 'cognitive' | 'efficacy',
    answers: number[],
    phase: 'pre' | 'post',
): Promise<void> {
    const params = new URLSearchParams();
    params.append('action', 'survey');
    params.append('scaleType', scaleType);
    params.append('phase', phase);
    params.append('answers', answers.join(','));
    params.append('submittedAt', new Date().toISOString());

    const response = await fetch(url, {
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

/**
 * Submit a POST-scales (end of course) response to Google Sheets.
 * @param scaleType - Which sheet to write to: 'cognitive' or 'efficacy'
 * @param answers   - Ordered array of Likert values (1-5)
 */
export async function submitSurvey(
    scaleType: 'cognitive' | 'efficacy',
    answers: number[],
): Promise<void> {
    return postSurveyData(POST_SCALES_URL, scaleType, answers, 'post');
}

/**
 * Submit a PRE-scales (before units) response to Google Sheets.
 * @param scaleType - Which sheet to write to: 'cognitive' or 'efficacy'
 * @param answers   - Ordered array of Likert values (1-5)
 */
export async function submitPreSurvey(
    scaleType: 'cognitive' | 'efficacy',
    answers: number[],
): Promise<void> {
    return postSurveyData(PRE_SCALES_URL, scaleType, answers, 'pre');
}