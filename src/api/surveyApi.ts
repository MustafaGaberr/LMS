// ─── Survey API ────────────────────────────────────────────────────────────────
// Submits survey responses to Google Sheets via the same Apps Script endpoint.

// Uses the same URL as fileUpload.ts
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

    const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: params,
        redirect: 'follow', // Apps Script responds with 302 redirects
    });

    if (!response.ok) {
        throw new Error(`Survey submission failed: ${response.status}`);
    }

    // Apps Script may return JSON with success flag
    try {
        const data = await response.json();
        if (data && data.success === false) {
            throw new Error(data.error || 'Submission was not successful');
        }
    } catch (e) {
        // If response isn't JSON (e.g. plain "OK"), that's fine — treat as success
        if (e instanceof SyntaxError) return;
        throw e;
    }
}
