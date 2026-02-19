import { normalize, tokenize } from './arNormalizer';
import { trigramSimilarity, jaccardOverlap } from './similarity';
import { generateSynonymGroups } from './synonymGenerator';

export interface AcceptCriteria {
    exact?: string[];
    groups?: string[][];
    mustInclude?: string[];
    reject?: string[];
}

export interface QuizQuestion {
    id: string;
    question: string;
    modelAnswer: string;
    explanation: string;
    accept?: AcceptCriteria;
}

export interface EvaluationResult {
    verdict: 'correct' | 'close' | 'wrong';
    groupCoverage: number;
    overlap: number;
    similarity: number;
    uncoveredGroupHints: string[];
}

export function evaluate(userAnswer: string, question: QuizQuestion): EvaluationResult {
    const { modelAnswer, accept = {} } = question;
    const normUser = normalize(userAnswer);
    const normModel = normalize(modelAnswer);
    const userTokens = tokenize(userAnswer);
    const modelTokens = tokenize(modelAnswer);

    // ── Reject check ──────────────────────────────────────────────────────
    if (accept.reject) {
        for (const r of accept.reject) {
            if (normUser.includes(normalize(r))) {
                return { verdict: 'wrong', groupCoverage: 0, overlap: 0, similarity: 0, uncoveredGroupHints: [] };
            }
        }
    }

    // ── Scores ────────────────────────────────────────────────────────────
    const similarity = trigramSimilarity(normUser, normModel);
    const overlap = jaccardOverlap(userTokens, modelTokens);

    // ── Group coverage ────────────────────────────────────────────────────
    const groups: string[][] = accept.groups?.length
        ? accept.groups
        : generateSynonymGroups(modelAnswer);

    const uncoveredGroupHints: string[] = [];
    let coveredGroups = 0;
    for (const group of groups) {
        const covered = group.some((term) => normUser.includes(normalize(term)));
        if (covered) {
            coveredGroups++;
        } else {
            uncoveredGroupHints.push(group[0]);
        }
    }
    const groupCoverage = groups.length > 0 ? coveredGroups / groups.length : 0;

    // ── mustInclude check ─────────────────────────────────────────────────
    let mustIncludePassed = true;
    if (accept.mustInclude?.length) {
        mustIncludePassed = accept.mustInclude
            .map(normalize)
            .every((term) => normUser.includes(term));
    }

    // ── Verdict ────────────────────────────────────────────────────────────
    let verdict: 'correct' | 'close' | 'wrong';

    const isCorrect =
        (groupCoverage >= 0.75 && similarity >= 0.55) ||
        similarity >= 0.70 ||
        (groupCoverage >= 0.75 && overlap >= 0.45);

    const isClose =
        (groupCoverage >= 0.40 && similarity >= 0.45) ||
        similarity >= 0.55;

    if (isCorrect && mustIncludePassed) {
        verdict = 'correct';
    } else if (isClose) {
        verdict = 'close';
    } else {
        verdict = 'wrong';
    }

    return { verdict, groupCoverage, overlap, similarity, uncoveredGroupHints };
}
