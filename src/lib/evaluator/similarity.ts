/** Character n-gram bag from a string */
function getNgrams(s: string, n = 3): Map<string, number> {
    const map = new Map<string, number>();
    for (let i = 0; i <= s.length - n; i++) {
        const g = s.slice(i, i + n);
        map.set(g, (map.get(g) ?? 0) + 1);
    }
    return map;
}

function dotProduct(a: Map<string, number>, b: Map<string, number>): number {
    let sum = 0;
    for (const [k, v] of a) {
        sum += v * (b.get(k) ?? 0);
    }
    return sum;
}

function magnitude(m: Map<string, number>): number {
    return Math.sqrt([...m.values()].reduce((s, v) => s + v * v, 0));
}

/** Cosine similarity of character 3-grams between two normalized strings */
export function trigramSimilarity(a: string, b: string): number {
    if (!a || !b) return 0;
    const ga = getNgrams(a);
    const gb = getNgrams(b);
    const magA = magnitude(ga);
    const magB = magnitude(gb);
    if (magA === 0 || magB === 0) return 0;
    return dotProduct(ga, gb) / (magA * magB);
}

/** Levenshtein distance (for synonym grouping) */
export function levenshtein(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    return dp[m][n];
}

/** Jaccard overlap between two token sets */
export function jaccardOverlap(setA: string[], setB: string[]): number {
    const a = new Set(setA);
    const b = new Set(setB);
    const intersection = [...a].filter((t) => b.has(t)).length;
    const union = new Set([...a, ...b]).size;
    return union === 0 ? 0 : intersection / union;
}
