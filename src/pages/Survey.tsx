import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import { submitSurvey } from '../api/surveyApi';
import './Survey.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SurveyQuestion {
    id: string;
    text: string;
}

interface ScaleSection {
    id: string;
    title: string;
    questions: SurveyQuestion[];
}

interface Scale {
    id: string;
    title: string;
    subtitle: string;
    emoji: string;
    sections: ScaleSection[];
}

// ─── Likert Scale Labels (right-to-left: strongly agree → strongly disagree) ─

const LIKERT_OPTIONS = [
    { value: 5, label: 'موافق بشدة' },
    { value: 4, label: 'موافق' },
    { value: 3, label: 'محايد' },
    { value: 2, label: 'غير موافق' },
    { value: 1, label: 'غير موافق بشدة' },
];

// ─── Scale Data ───────────────────────────────────────────────────────────────

const COGNITIVE_SCALE: Scale = {
    id: 'cognitive',
    title: 'مقياس القابلية للتمسك المعرفي',
    subtitle: 'Cognitive Holding Power Scale',
    emoji: '🧠',
    sections: [
        {
            id: 'cog-s1',
            title: 'البعد الأول: التمسك بالفهم العميق',
            questions: [
                { id: 'cog-1', text: 'أجد متعة في فهم الأفكار المعقدة حتى لو استغرقت وقتًا طويلًا.' },
                { id: 'cog-2', text: 'أسعى لربط المعلومات الجديدة بما أعرفه مسبقًا.' },
                { id: 'cog-3', text: 'أفضّل التفكير في المشكلات من زوايا متعددة قبل الإجابة.' },
                { id: 'cog-4', text: 'أشعر بالرضا عندما أفهم موضوعًا بشكل كامل وليس سطحيًا.' },
                { id: 'cog-5', text: 'أتابع القراءة والبحث حتى بعد انتهاء المحاضرة لتعميق فهمي.' },
            ],
        },
        {
            id: 'cog-s2',
            title: 'البعد الثاني: المثابرة المعرفية',
            questions: [
                { id: 'cog-6', text: 'أستمر في محاولة حل المشكلات حتى عندما تبدو صعبة جدًا.' },
                { id: 'cog-7', text: 'لا أستسلم بسهولة عند مواجهة مفاهيم غامضة.' },
                { id: 'cog-8', text: 'أعيد مراجعة إجاباتي للتأكد من صحتها.' },
                { id: 'cog-9', text: 'أخصص وقتًا كافيًا لدراسة الموضوعات التي أجدها صعبة.' },
                { id: 'cog-10', text: 'أؤمن أن الجهد المتواصل يؤدي إلى إتقان المادة.' },
            ],
        },
        {
            id: 'cog-s3',
            title: 'البعد الثالث: التفاعل المعرفي مع المحتوى',
            questions: [
                { id: 'cog-11', text: 'أطرح أسئلة حول ما أتعلمه لتوسيع فهمي.' },
                { id: 'cog-12', text: 'أناقش زملائي في الأفكار التي أتعلمها.' },
                { id: 'cog-13', text: 'أبحث عن مصادر إضافية لفهم الموضوعات بشكل أعمق.' },
                { id: 'cog-14', text: 'أحاول تطبيق ما أتعلمه في مواقف الحياة اليومية.' },
                { id: 'cog-15', text: 'أقارن بين وجهات النظر المختلفة حول الموضوع الواحد.' },
            ],
        },
    ],
};

const SELF_EFFICACY_SCALE: Scale = {
    id: 'efficacy',
    title: 'مقياس الكفاءة الذاتية',
    subtitle: 'Self-Efficacy Scale',
    emoji: '💪',
    sections: [
        {
            id: 'eff-s1',
            title: 'البعد الأول: قدرة الكفاءة',
            questions: [
                { id: 'eff-1', text: 'أستطيع فهم المقررات الإلكترونية بسهولة عند دراستها.' },
                { id: 'eff-2', text: 'أثق في قدرتي على إنجاز المهام الأكاديمية بنجاح.' },
                { id: 'eff-3', text: 'أستطيع التعامل مع التحديات الدراسية بثقة.' },
                { id: 'eff-4', text: 'أشعر بأنني قادر على تحقيق أهدافي التعليمية.' },
                { id: 'eff-5', text: 'لديّ القدرة على التكيف مع أساليب التعلم المختلفة.' },
            ],
        },
        {
            id: 'eff-s2',
            title: 'البعد الثاني: المبادرة والمسؤولية',
            questions: [
                { id: 'eff-6', text: 'أبادر بتنظيم وقت دراستي بشكل فعال.' },
                { id: 'eff-7', text: 'أتحمل مسؤولية تعلمي الذاتي بشكل كامل.' },
                { id: 'eff-8', text: 'أضع خططًا واضحة لإنجاز مهامي الدراسية.' },
                { id: 'eff-9', text: 'أبادر بطلب المساعدة عندما أحتاجها.' },
                { id: 'eff-10', text: 'أسعى لتحسين أدائي الأكاديمي باستمرار.' },
            ],
        },
        {
            id: 'eff-s3',
            title: 'البعد الثالث: التحكم في الأداء',
            questions: [
                { id: 'eff-11', text: 'أستطيع التركيز أثناء الدراسة لفترات طويلة.' },
                { id: 'eff-12', text: 'أتعامل مع ضغوط الاختبارات بهدوء وثقة.' },
                { id: 'eff-13', text: 'أستطيع التغلب على التوتر الأكاديمي بشكل فعال.' },
                { id: 'eff-14', text: 'أتحكم في مستوى دافعيتي تجاه التعلم.' },
                { id: 'eff-15', text: 'أستطيع تقييم أدائي الدراسي بموضوعية.' },
            ],
        },
    ],
};

const ALL_SCALES: Scale[] = [COGNITIVE_SCALE, SELF_EFFICACY_SCALE];

// ─── Reusable Components ──────────────────────────────────────────────────────

/** Progress header showing current section and overall progress */
const ProgressHeader: React.FC<{
    scaleTitle: string;
    scaleEmoji: string;
    currentSectionIndex: number;
    totalSections: number;
    answeredCount: number;
    totalQuestions: number;
}> = ({ scaleTitle, scaleEmoji, currentSectionIndex, totalSections, answeredCount, totalQuestions }) => (
    <div className="survey-progress">
        <div className="survey-progress__scale">
            <span className="survey-progress__emoji">{scaleEmoji}</span>
            <span className="survey-progress__scale-title">{scaleTitle}</span>
        </div>
        <div className="survey-progress__bar-wrap">
            <div
                className="survey-progress__bar-fill"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
        </div>
        <div className="survey-progress__meta">
            <span>القسم {currentSectionIndex + 1} من {totalSections}</span>
            <span>{answeredCount} / {totalQuestions} سؤال</span>
        </div>
    </div>
);

/** Section header with title and question count */
const SectionHeader: React.FC<{ title: string; questionCount: number }> = ({ title, questionCount }) => (
    <div className="survey-section-header">
        <h3 className="survey-section-header__title">{title}</h3>
        <span className="survey-section-header__count">{questionCount} أسئلة</span>
    </div>
);

/** Individual question card with Likert buttons */
const QuestionCard: React.FC<{
    question: SurveyQuestion;
    index: number;
    selectedValue?: number;
    onSelect: (questionId: string, value: number) => void;
    readonly?: boolean;
}> = ({ question, index, selectedValue, onSelect, readonly }) => (
    <div className={`survey-q ${readonly ? 'survey-q--readonly' : ''}`}>
        <p className="survey-q__text">
            <span className="survey-q__num">{index}</span>
            {question.text}
        </p>
        {/* Fixed labels row */}
        <div className="survey-likert-labels">
            {LIKERT_OPTIONS.map((opt) => (
                <span key={opt.value} className="survey-likert-labels__item">{opt.label}</span>
            ))}
        </div>
        {/* Numbered circle buttons */}
        <div className="survey-likert">
            {LIKERT_OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    className={`survey-likert-btn ${selectedValue === opt.value ? 'survey-likert-btn--active' : ''}`}
                    onClick={() => !readonly && onSelect(question.id, opt.value)}
                    disabled={readonly}
                    type="button"
                >
                    <span className="survey-likert-btn__val">{opt.value}</span>
                </button>
            ))}
        </div>
    </div>
);

// ─── Flatten helpers ──────────────────────────────────────────────────────────

function buildGlobalSections(): { scale: Scale; section: ScaleSection; globalIndex: number }[] {
    const result: { scale: Scale; section: ScaleSection; globalIndex: number }[] = [];
    let idx = 0;
    for (const scale of ALL_SCALES) {
        for (const section of scale.sections) {
            result.push({ scale, section, globalIndex: idx++ });
        }
    }
    return result;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Survey: React.FC = () => {
    const navigate = useNavigate();
    const isAllCourseDone = useAppStore((s) => s.isAllCourseDone);
    const submitSurveyResponse = useAppStore((s) => s.submitSurveyResponse);
    const progress = useAppStore((s) => s.progress);

    const [responses, setResponses] = useState<Record<string, number>>(
        progress.surveyResponses || {}
    );
    const [currentStep, setCurrentStep] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [animDir, setAnimDir] = useState<'next' | 'prev'>('next');
    const [animKey, setAnimKey] = useState(0);

    const globalSections = useMemo(() => buildGlobalSections(), []);
    const totalGlobalSections = globalSections.length;
    const totalQuestions = useMemo(
        () => ALL_SCALES.reduce((sum, s) => sum + s.sections.reduce((ss, sec) => ss + sec.questions.length, 0), 0),
        []
    );

    const currentEntry = globalSections[currentStep];
    const currentScale = currentEntry?.scale;
    const currentSection = currentEntry?.section;

    // Section-level answered count
    const sectionAnswered = currentSection
        ? currentSection.questions.filter((q) => responses[q.id] !== undefined).length
        : 0;
    const sectionComplete = currentSection ? sectionAnswered === currentSection.questions.length : false;

    // Overall answered count
    const totalAnswered = Object.keys(responses).length;

    // Section index within current scale
    const sectionIndexInScale = currentScale
        ? currentScale.sections.findIndex((s) => s.id === currentSection?.id)
        : 0;
    const totalSectionsInScale = currentScale ? currentScale.sections.length : 0;

    // Scroll to top on section change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    const handleSelect = useCallback((questionId: string, value: number) => {
        setResponses((r) => ({ ...r, [questionId]: value }));
    }, []);

    const goNext = useCallback(() => {
        if (currentStep < totalGlobalSections - 1) {
            setAnimDir('next');
            setAnimKey((k) => k + 1);
            setCurrentStep((s) => s + 1);
        }
    }, [currentStep, totalGlobalSections]);

    const goPrev = useCallback(() => {
        if (currentStep > 0) {
            setAnimDir('prev');
            setAnimKey((k) => k + 1);
            setCurrentStep((s) => s - 1);
        }
    }, [currentStep]);

    const isLastSection = currentStep === totalGlobalSections - 1;
    const allAnswered = totalAnswered >= totalQuestions;

    const handleSubmit = useCallback(async () => {
        if (!allAnswered || isSubmitting) return;
        setIsSubmitting(true);
        setSubmitError(null);

        // Build ordered arrays from responses keyed by question IDs
        const scale1Answers = COGNITIVE_SCALE.sections
            .flatMap((s) => s.questions)
            .map((q) => responses[q.id] ?? 0);
        const scale2Answers = SELF_EFFICACY_SCALE.sections
            .flatMap((s) => s.questions)
            .map((q) => responses[q.id] ?? 0);

        try {
            await submitSurvey(scale1Answers, scale2Answers);
            // Also save locally
            submitSurveyResponse(responses);
            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            setSubmitError('حدث خطأ أثناء الإرسال، حاول مرة أخرى');
        } finally {
            setIsSubmitting(false);
        }
    }, [allAnswered, isSubmitting, responses, submitSurveyResponse]);

    // ── Guard: must complete all lessons first ────────────────────────
    if (!isAllCourseDone()) {
        return (
            <div className="survey-page survey-page--locked">
                <div className="survey-locked-icon">🔒</div>
                <h2 className="survey-locked-title">الاستبيان مقفل</h2>
                <p className="survey-locked-desc">
                    أكمل جميع دروس الدورة لفتح الاستبيان.
                </p>
                <Button variant="primary" onClick={() => navigate('/units')}>
                    العودة للوحدات
                </Button>
            </div>
        );
    }

    // ── Fresh submission thank you ───────────────────────────────────
    if (submitted) {
        return (
            <div className="survey-page survey-page--done">
                <div className="survey-done-emoji">🎉</div>
                <h2 className="survey-done-title">شكرًا على إجابتك!</h2>
                <p className="survey-done-desc">
                    تم حفظ ردودك بشكل مجهول. نقدّر رأيك ونسعد بمشاركتك.
                </p>
                <div style={{ marginTop: '2.5rem', width: '100%' }}>
                    <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/units')}>
                        الذهاب للقائمة الرئيسية 🏠
                    </Button>
                </div>
            </div>
        );
    }

    // ── Returning user read-only view ────────────────────────────────
    if (progress.surveyFilled) {
        return (
            <div className="survey-page survey-page--readonly">
                <div className="survey-header">
                    <h2 className="survey-header__title">إجاباتك السابقة</h2>
                    <p className="survey-header__sub">لقد قمت بملء هذا الاستبيان مسبقاً</p>
                </div>

                {ALL_SCALES.map((scale) => (
                    <div key={scale.id} className="survey-readonly-scale">
                        <div className="survey-readonly-scale__title">
                            {scale.emoji} {scale.title}
                        </div>
                        {scale.sections.map((section) => {
                            let qCounter = 0;
                            return (
                                <div key={section.id}>
                                    <SectionHeader title={section.title} questionCount={section.questions.length} />
                                    <div className="survey-questions">
                                        {section.questions.map((q) => {
                                            qCounter++;
                                            return (
                                                <QuestionCard
                                                    key={q.id}
                                                    question={q}
                                                    index={qCounter}
                                                    selectedValue={responses[q.id]}
                                                    onSelect={() => { }}
                                                    readonly
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                <div style={{ marginTop: '2rem', width: '100%' }}>
                    <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/units')}>
                        العودة للرئيسية 🏠
                    </Button>
                </div>
            </div>
        );
    }

    // ── Active survey with section-based flow ────────────────────────
    // Question numbering within current section
    let qNum = 0;

    return (
        <div className="survey-page">
            {/* Progress */}
            {currentScale && (
                <ProgressHeader
                    scaleTitle={currentScale.title}
                    scaleEmoji={currentScale.emoji}
                    currentSectionIndex={sectionIndexInScale}
                    totalSections={totalSectionsInScale}
                    answeredCount={totalAnswered}
                    totalQuestions={totalQuestions}
                />
            )}

            {/* Section content with animation */}
            <div
                key={animKey}
                className={`survey-section-anim survey-section-anim--${animDir}`}
            >
                {/* Section header */}
                {currentSection && (
                    <SectionHeader
                        title={currentSection.title}
                        questionCount={currentSection.questions.length}
                    />
                )}

                {/* Question cards */}
                <div className="survey-questions">
                    {currentSection?.questions.map((q) => {
                        qNum++;
                        return (
                            <QuestionCard
                                key={q.id}
                                question={q}
                                index={qNum}
                                selectedValue={responses[q.id]}
                                onSelect={handleSelect}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Navigation */}
            <div className="survey-nav">
                {currentStep > 0 && (
                    <Button variant="secondary" size="lg" onClick={goPrev} disabled={isSubmitting}>
                        ← السابق
                    </Button>
                )}
                <div className="survey-nav__spacer" />
                {isLastSection ? (
                    <Button
                        variant="primary"
                        size="lg"
                        disabled={!allAnswered || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'جارٍ الإرسال...' : 'إرسال الاستبيان 📤'}
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        size="lg"
                        disabled={!sectionComplete}
                        onClick={goNext}
                    >
                        التالي →
                    </Button>
                )}
            </div>

            {/* Error message */}
            {submitError && (
                <div className="survey-error">
                    ⚠️ {submitError}
                </div>
            )}
        </div>
    );
};

export default Survey;
