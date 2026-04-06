// ─── Survey API ────────────────────────────────────────────────────────────────
// Submits survey responses to Google Sheets via Google Apps Script.
// Each answer is sent as an individual field (q1, q2, ...) with Arabic labels.

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw2UjFbh0x8lIwAdLQF7OLLKFbRFlUu72pgJb4IX4X2B3SLlpxe8CfqUYvngo9gmu0U/exec';

/** Map Likert number → Arabic label */
const LIKERT_MAP: Record<number, string> = {
    5: 'موافق بشدة',
    4: 'موافق',
    3: 'محايد',
    2: 'غير موافق',
    1: 'غير موافق بشدة',
};

function toLikertLabel(value: number): string {
    return LIKERT_MAP[value] ?? String(value);
}

/**
 * Submit both psychological scale answers to Google Sheets.
 * Each answer is sent as a separate field (s1q1, s1q2, ..., s2q1, s2q2, ...)
 * with Arabic Likert labels for instant readability.
 */
export async function submitSurvey(
    scale1: number[],
    scale2: number[],
): Promise<void> {
    const params = new URLSearchParams();
    params.append('action', 'survey');

    // Scale 1 answers — each as separate field with Arabic label
    scale1.forEach((val, i) => {
        params.append(`s1q${i + 1}`, toLikertLabel(val));
    });
    params.append('s1count', String(scale1.length));

    // Scale 2 answers — each as separate field with Arabic label
    scale2.forEach((val, i) => {
        params.append(`s2q${i + 1}`, toLikertLabel(val));
    });
    params.append('s2count', String(scale2.length));

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