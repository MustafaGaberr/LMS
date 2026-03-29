import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLottie } from 'lottie-react';
import { getLesson } from '../data/sampleCourse';
import './QuizIntro.css';

// ── Lottie loader (reuse cached data) ────────────────────────────────────────
let cachedAnim: object | null = null;
let fetchPromise: Promise<object> | null = null;

function getAnimationData(): Promise<object> {
    if (cachedAnim) return Promise.resolve(cachedAnim);
    if (!fetchPromise) {
        fetchPromise = fetch('/assets/lottie/chatbot_header.json')
            .then((r) => r.json())
            .then((data) => {
                cachedAnim = data;
                return data;
            });
    }
    return fetchPromise;
}

const LottieIcon: React.FC<{ animData: object }> = ({ animData }) => {
    const { View } = useLottie({
        animationData: animData,
        loop: true,
        autoplay: true,
        style: { width: '100%', height: '100%' },
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    });
    return <>{View}</>;
};

// ── Parse quizIntroFullContent into structured sections ──────────────────────
interface ParsedContent {
    introLines: string[];
    numberedItems: string[];
    bulletItems: string[];
}

function parseQuizContent(raw: string): ParsedContent {
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    const introLines: string[] = [];
    const numberedItems: string[] = [];
    const bulletItems: string[] = [];

    for (const line of lines) {
        if (/^\d+[\.\)]\s/.test(line)) {
            // Numbered item: "1. ..." or "1) ..."
            numberedItems.push(line.replace(/^\d+[\.\)]\s*/, ''));
        } else if (/^[•\-]\s/.test(line)) {
            // Bullet item: "• ..." or "- ..."
            bulletItems.push(line.replace(/^[•\-]\s*/, ''));
        } else {
            // Regular intro line
            introLines.push(line);
        }
    }

    return { introLines, numberedItems, bulletItems };
}

// ── Component ────────────────────────────────────────────────────────────────
const QuizIntro: React.FC = () => {
    const { unitId = '', lessonId = '' } = useParams<{ unitId: string; lessonId: string }>();
    const navigate = useNavigate();
    const [animData, setAnimData] = useState<object | null>(cachedAnim);

    const lesson = getLesson(unitId, lessonId);

    useEffect(() => {
        if (!animData) {
            getAnimationData().then(setAnimData);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!lesson) {
        return (
            <div className="quiz-intro-page">
                <p className="quiz-intro-error">الدرس غير موجود.</p>
            </div>
        );
    }

    const { introLines, numberedItems, bulletItems } = parseQuizContent(lesson.quizIntroFullContent);
    const allItems = [...numberedItems, ...bulletItems];

    return (
        <div className="quiz-intro-page">
            {/* ── Dark blue header with Lottie icon ──────────────── */}
            <div className="quiz-intro-header">
                <div className="quiz-intro-header__icon">
                    {animData ? (
                        <LottieIcon animData={animData} />
                    ) : (
                        <span className="quiz-intro-header__fallback">🤖</span>
                    )}
                </div>
                <h2 className="quiz-intro-header__title">
                    قم بتنفيذ النشاط القادم باستخدام chatbot
                </h2>
            </div>

            {/* ── Instructions body ──────────────────────────────── */}
            <div className="quiz-intro-body">
                {/* Intro paragraph */}
                {introLines.length > 0 && (
                    <div className="quiz-intro-intro">
                        {introLines.map((line, i) => (
                            <p key={i} className="quiz-intro-intro__line">{line}</p>
                        ))}
                    </div>
                )}

                {/* Numbered instruction cards */}
                {allItems.length > 0 && (
                    <div className="quiz-intro-steps">
                        {allItems.map((item, i) => (
                            <div key={i} className="quiz-intro-step">
                                <div className="quiz-intro-step__num">{i + 1}</div>
                                <div className="quiz-intro-step__text">{item}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── CTA Button ──────────────────────────────────────── */}
            <button
                className="quiz-intro-cta"
                onClick={() => navigate(`/units/${unitId}/lessons/${lessonId}/chat`)}
            >
                ابدأ المحادثة مع chatbot
            </button>
        </div>
    );
};

export default QuizIntro;
