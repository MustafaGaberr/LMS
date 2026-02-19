import { tokenize } from './arNormalizer';
import { levenshtein, trigramSimilarity } from './similarity';

/**
 * Auto-generates synonym groups from a model answer.
 * Groups tokens by: same first 3 chars, small edit distance, or high 3-gram similarity.
 * NOTE: Manual groups (in question.accept.groups) are always preferred.
 */
export function generateSynonymGroups(modelAnswer: string): string[][] {
    const tokens = tokenize(modelAnswer, 3);
    if (tokens.length === 0) return [];

    const used = new Set<number>();
    const groups: string[][] = [];

    for (let i = 0; i < tokens.length; i++) {
        if (used.has(i)) continue;
        const group: string[] = [tokens[i]];
        used.add(i);

        for (let j = i + 1; j < tokens.length; j++) {
            if (used.has(j)) continue;
            const a = tokens[i];
            const b = tokens[j];
            const prefix = a.slice(0, 3) === b.slice(0, 3);
            const dist = levenshtein(a, b);
            const editClose = dist <= Math.floor(Math.max(a.length, b.length) * 0.35);
            const sim3g = trigramSimilarity(a, b);
            if (prefix || editClose || sim3g >= 0.65) {
                group.push(b);
                used.add(j);
            }
        }
        groups.push(group);
        if (groups.length >= 6) break; // cap at 6 groups
    }

    return groups;
}
