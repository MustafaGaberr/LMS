// ─── Survey API ────────────────────────────────────────────────────────────────

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzPt6GM7haiouXgvFDPumYpO7hj5p7VwTdzOiH6xqDJvyYDbmeoA6I06M2uebKC61g/exec';

export async function submitSurvey(
    scale1: number[],
    scale2: number[],
): Promise<void> {
    // استخدمنا FormData بدل URLSearchParams لأنها متوافقة أكتر مع Google Apps Script ومفيهاش مشاكل CORS
    const formData = new FormData();
    formData.append('action', 'survey');
    formData.append('scale1', scale1.join(','));
    formData.append('scale2', scale2.join(','));

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            // شيلنا mode: 'no-cors' عشان نقدر نقرأ الرد من السيرفر ونعرف لو فيه خطأ حقيقي
        });

        // قراءة الرد اللي راجع من جوجل سكريبت
        const result = await response.json();

        // لو السكريبت رجع success: false (زي ما إحنا كاتبين في catch في كود جوجل)
        if (!result.success) {
            console.error("Google Script Error:", result.error);
            throw new Error(result.error || 'حدث خطأ من طرف السيرفر');
        }
    } catch (error) {
        console.error("Submission failed:", error);
        throw error; // الرمي هنا هيخلي الـ catch اللي في 컴بوننت الـ Survey تشتغل وتطلع رسالة الخطأ للمستخدم
    }
}