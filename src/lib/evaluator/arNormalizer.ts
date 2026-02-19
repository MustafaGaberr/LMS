// Arabic text normalization, tokenization, and stopword removal

const DIACRITICS = /[\u064B-\u065F\u0670]/g;
const TATWEEL = /\u0640/g;
const PUNCTUATION = /[^\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF\w\s]/g;

const STOPWORDS = new Set([
    'في', 'من', 'على', 'إلى', 'الى', 'هو', 'هي', 'هم', 'هن', 'أن', 'ان',
    'كان', 'كانت', 'مع', 'عن', 'ما', 'لا', 'لأن', 'لان', 'هذا', 'هذه',
    'ذلك', 'التي', 'الذي', 'كل', 'أو', 'او', 'و', 'أي', 'قد', 'حيث',
    'لذلك', 'وهو', 'وهي', 'أحد', 'كما', 'أيضا', 'أيضًا', 'ثم', 'بعد',
    'قبل', 'عند', 'عندما', 'بين', 'غير', 'حتى', 'اذا', 'إذا', 'لكن',
    'ولكن', 'بل', 'لقد', 'منذ', 'خلال', 'ليس', 'فقط', 'ان', 'التي',
    'يعد', 'تعد', 'دون', 'عبر', 'نحو', 'الا', 'إلا', 'بما', 'يكون',
    'هناك', 'بشكل', 'بصورة', 'بطريقة', 'جميع', 'كافة', 'بعض', 'أي',
]);

/** Normalize Arabic string: remove diacritics, tatweel, unify hamza, alef maqsura, ta marbuta */
export function normalize(text: string): string {
    return text
        .replace(DIACRITICS, '')
        .replace(TATWEEL, '')
        .replace(/[أإآ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(PUNCTUATION, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

/** Tokenize normalized text, filter stopwords and short tokens */
export function tokenize(text: string, minLen = 3): string[] {
    return normalize(text)
        .split(/\s+/)
        .filter((t) => t.length >= minLen && !STOPWORDS.has(t));
}
