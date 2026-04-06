// ─── Survey API ────────────────────────────────────────────────────────────────
// Submits survey responses to Google Sheets via the same Apps Script endpoint.

const APPS_SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbzPt6GM7haiouXgvFDPumYpO7hj5p7VwTdzOiH6xqDJvyYDbmeoA6I06M2uebKC61g/exec';

/**
 * Submit both psychological scale answers to Google Sheets.
 *
 * @param scale1 — Cognitive Holding Power answers (ordered array of Likert values)
 * @param scale2 — Self-Efficacy answers (ordered array of Likert values)
 */
export async function submitSurvey(
    scale1: number[],
    scale2: number[],
): Promise<void> {
    const params = new URLSearchParams();
    params.append('action', 'survey');
    params.append('scale1', scale1.join(','));
    params.append('scale2', scale2.join(','));
    params.append('submittedAt', new Date().toISOString());

    // Apps Script returns 302 → redirect to googleusercontent.com → 200 JSON
    // We must follow redirects and NOT check response.ok on the 302
    const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: params,
        redirect: 'follow',
    });

    // Try to parse JSON response — Apps Script may return success flag
    try {
        const text = await response.text();
        if (text) {
            const data = JSON.parse(text);
            if (data && data.success === false) {
                throw new Error(data.error || 'فشل في حفظ الاستبيان');
            }
        }
        // If we got here (with or without JSON), the request succeeded
    } catch (e) {
        // JSON parse error = response wasn't JSON, that's OK (means it went through)
        if (e instanceof SyntaxError) return;
        throw e;
    }
}
