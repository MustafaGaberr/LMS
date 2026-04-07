import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    scaleType: 'cognitive' | 'efficacy';
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

// ─── Scale 1: قوة السيطرة المعرفية (28 questions = 2 sections × 14) ──────────

const COGNITIVE_CONTROL_SCALE: Scale = {
    id: 'cognitive',
    title: 'مقياس قوة السيطرة المعرفية',
    subtitle: 'Cognitive Control Strength Scale',
    emoji: '🧠',
    scaleType: 'cognitive',
    sections: [
        {
            id: 'cc-rank1-a',
            title: 'الرتبة الأولى (1/2)',
            questions: [
                { id: 'cc1-1', text: 'أواصل أداء المهمة ولا أستسلم عندما أواجه صعوبة أثناء تنفيذها' },
                { id: 'cc1-2', text: 'أستطيع تنفيذ خطوات العمل دون التأثر بالأمور المحيطة من حولي.' },
                { id: 'cc1-3', text: 'أُعيد انتباهي سريعًا إذا شعرت بالملل.' },
                { id: 'cc1-4', text: 'أركّز على المهم وأؤجّل غيره حتى الانتهاء منه.' },
                { id: 'cc1-5', text: 'أستطيع التفكير بوضوح عند الشعور بالتعب.' },
                { id: 'cc1-6', text: 'أرتب أفكاري من جديد في حالة انشغالي بأشياء غير مهمة.' },
                { id: 'cc1-7', text: 'أستخدم أسلوب التذكير الذاتي لأحافظ على تركيزي.' },
            ],
        },
        {
            id: 'cc-rank1-b',
            title: 'الرتبة الأولى (2/2)',
            questions: [
                { id: 'cc1-8', text: 'أتقبل نتائجي مهما كانت' },
                { id: 'cc1-9', text: 'أستطيع ضبط نفسي عندما أشعر بالانفعال.' },
                { id: 'cc1-10', text: 'أطبق التعليمات بدقة بعد استيعابها جيداً.' },
                { id: 'cc1-11', text: 'أسيطر على رغبة التسرّع وأفكر في العواقب.' },
                { id: 'cc1-12', text: 'أركّز على هدف محدّد دون الانشغال بهدف آخر.' },
                { id: 'cc1-13', text: 'أتحكم في مشاعري حتى لا تؤثر على تفكيري.' },
                { id: 'cc1-14', text: 'أرتّب خطواتي الذهنية بوضوح عند مواجهة أي مشكلة' },
            ],
        },
        {
            id: 'cc-rank2-a',
            title: 'الرتبة الثانية (1/2)',
            questions: [
                { id: 'cc2-1', text: 'أطرح أسئلة للتحقق من صحة إجابتي' },
                { id: 'cc2-2', text: 'أشعر برغبة في تجريب أفكار جديدة عند مواجهة مهام غير مألوفة.' },
                { id: 'cc2-3', text: 'أشعر برغبة في البحث عن المعلومات بنفسي.' },
                { id: 'cc2-4', text: 'أتحقق من إجابتي بما لدي من معلومات.' },
                { id: 'cc2-5', text: 'أنفذ المهام بأسلوبي الخاص' },
                { id: 'cc2-6', text: 'أجد علاقات بين الأشياء التي أتعلمها.' },
                { id: 'cc2-7', text: 'أُعيد تنظيم أولوياتي فورًا إذا استجدّ ما هو أهم.' },
            ],
        },
        {
            id: 'cc-rank2-b',
            title: 'الرتبة الثانية (2/2)',
            questions: [
                { id: 'cc2-8', text: 'أستطيع الاحتفاظ بعدة أفكار في ذهني ومقارنتها معًا.' },
                { id: 'cc2-9', text: 'أتعلم من تجاربي السابقة وأطبّق الدروس في مواقف جديدة.' },
                { id: 'cc2-10', text: 'أستخدم طرقًا مختلفة لحل المشكلة الواحدة حتى أجد الأفضل.' },
                { id: 'cc2-11', text: 'أتعامل مع المواقف المفاجئة دون أن أفقد اتزاني العقلي.' },
                { id: 'cc2-12', text: 'أجد بدائل جديدة حتى عند فشل جميع المحاولات السابقة.' },
                { id: 'cc2-13', text: 'أضبط مشاعري لكي تُساعدني على التفكير' },
                { id: 'cc2-14', text: 'أطبّق أكثر من أسلوب للتفكير للوصول إلى نتيجة.' },
            ],
        },
    ],
};

// ─── Scale 2: الكفاءة الذاتية (30 questions = 6 dimensions × 5) ─────────────

const SELF_EFFICACY_SCALE: Scale = {
    id: 'efficacy',
    title: 'مقياس الكفاءة الذاتية',
    subtitle: 'Self-Efficacy Scale',
    emoji: '🎯',
    scaleType: 'efficacy',
    sections: [
        {
            id: 'se-d1',
            title: 'البعد الأول: قدرة الكفاءة',
            questions: [
                { id: 'se1-1', text: 'أمتلك القدرة على إنجاز المهام مهما بلغت صعوبتها.' },
                { id: 'se1-2', text: 'أثق في نفسي عند مواجهة المواقف الصعبة.' },
                { id: 'se1-3', text: 'أمتلك القدرة على تعلم مهام جديدة بإتقان وكفاءة.' },
                { id: 'se1-4', text: 'أتمكن من أداء المهام بنجاح بالرغم من ضيق الوقت.' },
                { id: 'se1-5', text: 'أستطيع تحقيق نتائج جيدة في ظل الظروف والأحداث المتغيرة.' },
            ],
        },
        {
            id: 'se-d2',
            title: 'البعد الثاني: الشدة (القوة)',
            questions: [
                { id: 'se2-1', text: 'أستطيع تحقيق أهدافي حتى لو واجهت صعوبات كثيرة.' },
                { id: 'se2-2', text: 'أتمسك بأهدافي وأسعى إلى تحقيقها.' },
                { id: 'se2-3', text: 'أعتقد أن التحديات التي تواجهني فرصة لاختبار قوتي.' },
                { id: 'se2-4', text: 'أحتفظ بعزيمتي عندما أشعر بالإرهاق في إنجاز المهام.' },
                { id: 'se2-5', text: 'أعتقد أن الفشل خطوة طبيعية في طريق النجاح.' },
            ],
        },
        {
            id: 'se-d3',
            title: 'البعد الثالث: المعتقدات المعرفية',
            questions: [
                { id: 'se3-1', text: 'أؤمن أنني أستطيع تطوير ذاتي إذا بذلت جهداً منظماً.' },
                { id: 'se3-2', text: 'أعتقد أن المجهود المبذول في إنجاز عمل أهم من الموهبة في حد ذاتها.' },
                { id: 'se3-3', text: 'أتعلم من أخطائي السابقة في تحسين أدائي في المهام المستقبلية.' },
                { id: 'se3-4', text: 'أؤمن أن أي متعلم يستطيع تطوير ذاته إذا بذل جهداً منظماً.' },
                { id: 'se3-5', text: 'أعتقد أن المعرفة قوة تعزز من فرص النجاح.' },
            ],
        },
        {
            id: 'se-d4',
            title: 'البعد الرابع: مهارات التفكير',
            questions: [
                { id: 'se4-1', text: 'أمتلك القدرة على تحليل المشكلات أثناء إنجاز العمل بطريقة منظمة.' },
                { id: 'se4-2', text: 'أعتقد أن التفكير النقدي يؤدي إلى اتخاذ القرار السليم.' },
                { id: 'se4-3', text: 'أستخدم حلول إبداعية غير تقليدية عند التعرض لمواقف معقدة.' },
                { id: 'se4-4', text: 'أقيّم البدائل المقترحة قبل اتخاذ القرار في حل المشكلة.' },
                { id: 'se4-5', text: 'أستخدم استراتيجيات التفكير المتعددة في حل المشكلات أثناء إنجاز المهمة.' },
            ],
        },
        {
            id: 'se-d5',
            title: 'البعد الخامس: المهارات العملية',
            questions: [
                { id: 'se5-1', text: 'لدي القدرة على استخدام مهاراتي بكفاءة في إنجاز المهام.' },
                { id: 'se5-2', text: 'أمتلك القدرة على استخدام مهاراتي بكفاءة في إنجاز المهام.' },
                { id: 'se5-3', text: 'أستطيع إنجاز الأعمال اليدوية والتطبيقية بكفاءة.' },
                { id: 'se5-4', text: 'أتعلم مهارات جديدة وأطبقها في إنجاز مهام أخرى.' },
                { id: 'se5-5', text: 'أمتلك القدرة على استخدام الأدوات والتقنيات المختلفة في تحقيق أهدافي.' },
            ],
        },
        {
            id: 'se-d6',
            title: 'البعد السادس: فهم الذات',
            questions: [
                { id: 'se6-1', text: 'أستطيع تحديد نقاط قوتي وضعفي.' },
                { id: 'se6-2', text: 'أقيّم أدائي بموضوعية وشفافية.' },
                { id: 'se6-3', text: 'أستطيع التحكم بمشاعري أثناء إنجاز المهام.' },
                { id: 'se6-4', text: 'أتعلم من خبراتي السابقة في تحسين مستواي.' },
                { id: 'se6-5', text: 'أثق في قدرتي في التعامل بكفاءة مع الأحداث المتوقعة.' },
            ],
        },
    ],
};

// ─── Scale lookup map ─────────────────────────────────────────────────────────

const SCALE_MAP: Record<string, Scale> = {
    cognitive: COGNITIVE_CONTROL_SCALE,
    efficacy: SELF_EFFICACY_SCALE,
};

// ─── Instructions points builder ──────────────────────────────────────────────

function getInstructionPoints(scaleTitle: string): string[] {
    return [
        `يهدف هذا المقياس إلى التعرف على مستوى ${scaleTitle} لدى الطلاب.`,
        'يتكون المقياس من مجموعة من الابعاد والعبارات، ويُرجى قراءة كل عبارة بعناية، ثم تحديد درجة موافقتك عليها من خلال اختيار البديل الذي يعبر عن رأيك بدقة.',
        'لا توجد إجابات صحيحة أو خاطئة، وإنما المطلوب هو التعبير الصادق عن رأيك.',
        'يُرجى الإجابة على جميع العبارات، وعدم ترك أي عبارة دون إجابة.',
        'جميع إجاباتك ستُستخدم لأغراض البحث العلمي فقط، وستُعامل بسرية تامة.',
    ];
}

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

// ─── Main Component ───────────────────────────────────────────────────────────

type SurveyPhase = 'instructions' | 'questions' | 'done';

const Survey: React.FC = () => {
    const navigate = useNavigate();
    const { scaleId } = useParams<{ scaleId: string }>();
    const isAllCourseDone = useAppStore((s) => s.isAllCourseDone);
    const submitScaleResponse = useAppStore((s) => s.submitScaleResponse);
    const progress = useAppStore((s) => s.progress);

    // Resolve active scale from URL param
    const activeScale = scaleId ? SCALE_MAP[scaleId] : undefined;

    const [responses, setResponses] = useState<Record<string, number>>({});
    const [phase, setPhase] = useState<SurveyPhase>('instructions');
    const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [animDir, setAnimDir] = useState<'next' | 'prev'>('next');
    const [animKey, setAnimKey] = useState(0);

    // Total question count for active scale
    const totalQuestions = useMemo(
        () => activeScale?.sections.reduce((sum, s) => sum + s.questions.length, 0) ?? 0,
        [activeScale]
    );

    // Answered count
    const answeredCount = useMemo(
        () =>
            activeScale?.sections
                .flatMap((s) => s.questions)
                .filter((q) => responses[q.id] !== undefined).length ?? 0,
        [activeScale, responses]
    );

    const allAnswered = answeredCount === totalQuestions && totalQuestions > 0;

    const currentSection = activeScale?.sections[currentSectionIdx];
    const isLastSection = activeScale ? currentSectionIdx === activeScale.sections.length - 1 : false;

    const sectionAnswered = currentSection
        ? currentSection.questions.filter((q) => responses[q.id] !== undefined).length
        : 0;
    const sectionComplete = currentSection ? sectionAnswered === currentSection.questions.length : false;

    // Scroll to top on phase/section change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentSectionIdx, phase]);

    const handleSelect = useCallback((questionId: string, value: number) => {
        setResponses((r) => ({ ...r, [questionId]: value }));
    }, []);

    const goNextSection = useCallback(() => {
        if (activeScale && currentSectionIdx < activeScale.sections.length - 1) {
            setAnimDir('next');
            setAnimKey((k) => k + 1);
            setCurrentSectionIdx((s) => s + 1);
        }
    }, [currentSectionIdx, activeScale]);

    const goPrevSection = useCallback(() => {
        if (currentSectionIdx > 0) {
            setAnimDir('prev');
            setAnimKey((k) => k + 1);
            setCurrentSectionIdx((s) => s - 1);
        }
    }, [currentSectionIdx]);

    const handleSubmit = useCallback(async () => {
        if (!allAnswered || isSubmitting || !activeScale) return;
        setIsSubmitting(true);
        setSubmitError(null);

        // Build ordered answers array
        const answersArray = activeScale.sections
            .flatMap((s) => s.questions)
            .map((q) => responses[q.id] ?? 0);

        try {
            await submitSurvey(activeScale.scaleType, answersArray);
            // Save locally
            submitScaleResponse(activeScale.scaleType, responses);
            setPhase('done');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            setSubmitError('حدث خطأ أثناء الإرسال، حاول مرة أخرى');
        } finally {
            setIsSubmitting(false);
        }
    }, [allAnswered, isSubmitting, activeScale, responses, submitScaleResponse]);

    // ── Guard: invalid scale ID ──────────────────────────────────────
    if (!activeScale) {
        return (
            <div className="survey-page survey-page--locked">
                <div className="survey-locked-icon">❌</div>
                <h2 className="survey-locked-title">مقياس غير موجود</h2>
                <p className="survey-locked-desc">هذا المقياس غير متاح.</p>
                <Button variant="primary" onClick={() => navigate('/scales')}>
                    العودة للمقاييس
                </Button>
            </div>
        );
    }

    // ── Guard: must complete all lessons first ────────────────────────
    if (!isAllCourseDone()) {
        return (
            <div className="survey-page survey-page--locked">
                <div className="survey-locked-icon">🔒</div>
                <h2 className="survey-locked-title">المقاييس مقفلة</h2>
                <p className="survey-locked-desc">
                    أكمل جميع دروس الدورة لفتح المقاييس.
                </p>
                <Button variant="primary" onClick={() => navigate('/units')}>
                    العودة للوحدات
                </Button>
            </div>
        );
    }

    // ── Phase: Done (just submitted) ─────────────────────────────────
    // Must come BEFORE alreadyFilled guard so the success screen shows
    // after submitScaleResponse triggers a re-render.
    if (phase === 'done') {
        return (
            <div className="survey-page survey-page--done">
                <div className="survey-done-emoji">🎉</div>
                <h2 className="survey-done-title">شكرًا على إجابتك!</h2>
                <p className="survey-done-desc">
                    تم حفظ ردودك على {activeScale.title} بنجاح.
                </p>
                <div style={{ marginTop: '2.5rem', width: '100%' }}>
                    <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/scales')}>
                        العودة للمقاييس 📋
                    </Button>
                </div>
            </div>
        );
    }

    // ── Guard: already filled this scale → read-only view ─────────────
    const alreadyFilled =
        (activeScale.scaleType === 'cognitive' && progress.cognitiveFilled) ||
        (activeScale.scaleType === 'efficacy' && progress.efficacyFilled);

    if (alreadyFilled) {
        const savedResponses = progress.surveyResponses ?? {};
        let globalQ = 0;
        return (
            <div className="survey-page survey-page--readonly">
                <div className="survey-header">
                    <h2 className="survey-header__title">
                        {activeScale.emoji} {activeScale.title}
                    </h2>
                    <p className="survey-header__sub">إجاباتك السابقة (للعرض فقط)</p>
                </div>

                {activeScale.sections.map((section) => (
                    <div key={section.id}>
                        <SectionHeader title={section.title} questionCount={section.questions.length} />
                        <div className="survey-questions">
                            {section.questions.map((q) => {
                                globalQ++;
                                return (
                                    <QuestionCard
                                        key={q.id}
                                        question={q}
                                        index={globalQ}
                                        selectedValue={savedResponses[q.id]}
                                        onSelect={() => {}}
                                        readonly
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div style={{ marginTop: '2rem', width: '100%' }}>
                    <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/scales')}>
                        العودة للمقاييس 📋
                    </Button>
                </div>
            </div>
        );
    }

    // ── Phase: Instructions ──────────────────────────────────────────
    if (phase === 'instructions') {
        const points = getInstructionPoints(activeScale.title);
        return (
            <div className="survey-page">
                <div className="survey-instructions__header">
                    <span className="survey-instructions__emoji">{activeScale.emoji}</span>
                    <h2 className="survey-instructions__title">{activeScale.title}</h2>
                </div>

                <p className="survey-instructions__greeting">عزيزي الطالب / عزيزتي الطالبة،</p>

                <div className="survey-instructions__section">
                    <h3 className="survey-instructions__section-title">📌 تعليمات قبل البدء</h3>
                    <ul className="survey-instructions__list">
                        {points.map((point, i) => (
                            <li key={i} className="survey-instructions__item">
                                <span className="survey-instructions__bullet">{i + 1}</span>
                                <span className="survey-instructions__item-text">{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => {
                        setPhase('questions');
                        setCurrentSectionIdx(0);
                    }}
                >
                    ابدأ المقياس ←
                </Button>
            </div>
        );
    }

    // ── Phase: Questions ─────────────────────────────────────────────
    let qNum = 0;

    return (
        <div className="survey-page">
            {/* Progress */}
            <ProgressHeader
                scaleTitle={activeScale.title}
                scaleEmoji={activeScale.emoji}
                currentSectionIndex={currentSectionIdx}
                totalSections={activeScale.sections.length}
                answeredCount={answeredCount}
                totalQuestions={totalQuestions}
            />

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
                {/* Primary action */}
                {isLastSection ? (
                    <Button
                        variant="primary"
                        size="lg"
                        disabled={!allAnswered || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'جارٍ الإرسال...' : 'إرسال المقياس 📤'}
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        size="lg"
                        disabled={!sectionComplete}
                        onClick={goNextSection}
                    >
                        التالي →
                    </Button>
                )}

                <div className="survey-nav__spacer" />

                {/* Back button */}
                {currentSectionIdx > 0 && (
                    <Button variant="secondary" size="lg" onClick={goPrevSection} disabled={isSubmitting}>
                        ← السابق
                    </Button>
                )}
                {currentSectionIdx === 0 && (
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => setPhase('instructions')}
                        disabled={isSubmitting}
                    >
                        ← التعليمات
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
