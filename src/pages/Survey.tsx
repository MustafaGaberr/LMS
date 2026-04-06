import React, { useState, useEffect, useCallback } from 'react';
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

// ─── Scale 1: قوة السيطرة المعرفية (28 questions = 2 sections × 14) ──────────

const COGNITIVE_CONTROL_SCALE: Scale = {
    id: 'cognitive-control',
    title: 'مقياس قوة السيطرة المعرفية',
    subtitle: 'Cognitive Control Strength Scale',
    emoji: '🧠',
    sections: [
        {
            id: 'cc-rank1',
            title: 'قوة السيطرة المعرفية من الرتبة الأولى',
            questions: [
                { id: 'cc1-1', text: 'أواصل أداء المهمة ولا أستسلم عندما أواجه صعوبة أثناء تنفيذها' },
                { id: 'cc1-2', text: 'أستطيع تنفيذ خطوات العمل دون التأثر بالأمور المحيطة من حولي.' },
                { id: 'cc1-3', text: 'أُعيد انتباهي سريعًا إذا شعرت بالملل.' },
                { id: 'cc1-4', text: 'أركّز على المهم وأؤجّل غيره حتى الانتهاء منه.' },
                { id: 'cc1-5', text: 'أستطيع التفكير بوضوح عند الشعور بالتعب.' },
                { id: 'cc1-6', text: 'أرتب أفكاري من جديد في حالة انشغالي بأشياء غير مهمة.' },
                { id: 'cc1-7', text: 'أستخدم أسلوب التذكير الذاتي لأحافظ على تركيزي.' },
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
            id: 'cc-rank2',
            title: 'قوة السيطرة المعرفية من الرتبة الثانية',
            questions: [
                { id: 'cc2-1', text: 'أطرح أسئلة للتحقق من صحة إجابتي' },
                { id: 'cc2-2', text: 'أشعر برغبة في تجريب أفكار جديدة عند مواجهة مهام غير مألوفة.' },
                { id: 'cc2-3', text: 'أشعر برغبة في البحث عن المعلومات بنفسي.' },
                { id: 'cc2-4', text: 'أتحقق من إجابتي بما لدي من معلومات.' },
                { id: 'cc2-5', text: 'أنفذ المهام بأسلوبي الخاص' },
                { id: 'cc2-6', text: 'أجد علاقات بين الأشياء التي أتعلمها.' },
                { id: 'cc2-7', text: 'أُعيد تنظيم أولوياتي فورًا إذا استجدّ ما هو أهم.' },
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
    id: 'self-efficacy',
    title: 'مقياس الكفاءة الذاتية',
    subtitle: 'Self-Efficacy Scale',
    emoji: '💪',
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

const ALL_SCALES: Scale[] = [COGNITIVE_CONTROL_SCALE, SELF_EFFICACY_SCALE];

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

type SurveyPhase = 'scale1' | 'transition' | 'scale2';

const Survey: React.FC = () => {
    const navigate = useNavigate();
    const isAllCourseDone = useAppStore((s) => s.isAllCourseDone);
    const submitSurveyResponse = useAppStore((s) => s.submitSurveyResponse);
    const progress = useAppStore((s) => s.progress);

    const [responses, setResponses] = useState<Record<string, number>>(
        progress.surveyResponses || {}
    );
    const [phase, setPhase] = useState<SurveyPhase>('scale1');
    const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [animDir, setAnimDir] = useState<'next' | 'prev'>('next');
    const [animKey, setAnimKey] = useState(0);

    // Current scale based on phase
    const currentScale = phase === 'scale2' ? SELF_EFFICACY_SCALE : COGNITIVE_CONTROL_SCALE;
    const currentSection = currentScale.sections[currentSectionIdx];

    // Question counts for current scale
    const scaleQuestionCount = currentScale.sections.reduce((sum, s) => sum + s.questions.length, 0);
    const scaleAnsweredCount = currentScale.sections
        .flatMap((s) => s.questions)
        .filter((q) => responses[q.id] !== undefined).length;

    // Section-level answered
    const sectionAnswered = currentSection
        ? currentSection.questions.filter((q) => responses[q.id] !== undefined).length
        : 0;
    const sectionComplete = currentSection ? sectionAnswered === currentSection.questions.length : false;

    // Total counts
    const totalScale1Questions = COGNITIVE_CONTROL_SCALE.sections.reduce((sum, s) => sum + s.questions.length, 0);
    const totalScale2Questions = SELF_EFFICACY_SCALE.sections.reduce((sum, s) => sum + s.questions.length, 0);

    const scale1Answered = COGNITIVE_CONTROL_SCALE.sections
        .flatMap((s) => s.questions)
        .filter((q) => responses[q.id] !== undefined).length;
    const scale2Answered = SELF_EFFICACY_SCALE.sections
        .flatMap((s) => s.questions)
        .filter((q) => responses[q.id] !== undefined).length;

    const scale1Complete = scale1Answered >= totalScale1Questions;
    const scale2Complete = scale2Answered >= totalScale2Questions;
    const allAnswered = scale1Complete && scale2Complete;

    const isLastSectionInScale = currentSectionIdx === currentScale.sections.length - 1;

    // Scroll to top on section/phase change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentSectionIdx, phase]);

    const handleSelect = useCallback((questionId: string, value: number) => {
        setResponses((r) => ({ ...r, [questionId]: value }));
    }, []);

    const goNextSection = useCallback(() => {
        if (currentSectionIdx < currentScale.sections.length - 1) {
            setAnimDir('next');
            setAnimKey((k) => k + 1);
            setCurrentSectionIdx((s) => s + 1);
        }
    }, [currentSectionIdx, currentScale.sections.length]);

    const goPrevSection = useCallback(() => {
        if (currentSectionIdx > 0) {
            setAnimDir('prev');
            setAnimKey((k) => k + 1);
            setCurrentSectionIdx((s) => s - 1);
        }
    }, [currentSectionIdx]);

    // Transition to Scale 2
    const goToTransition = useCallback(() => {
        setPhase('transition');
    }, []);

    // Start Scale 2
    const startScale2 = useCallback(() => {
        setPhase('scale2');
        setCurrentSectionIdx(0);
        setAnimDir('next');
        setAnimKey((k) => k + 1);
    }, []);

    // Go back to Scale 1
    const goBackToScale1 = useCallback(() => {
        setPhase('scale1');
        setCurrentSectionIdx(COGNITIVE_CONTROL_SCALE.sections.length - 1);
        setAnimDir('prev');
        setAnimKey((k) => k + 1);
    }, []);

    // Go back to transition from Scale 2
    const goBackToTransition = useCallback(() => {
        setPhase('transition');
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!allAnswered || isSubmitting) return;
        setIsSubmitting(true);
        setSubmitError(null);

        // Build ordered arrays from responses keyed by question IDs
        const scale1Answers = COGNITIVE_CONTROL_SCALE.sections
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

    // ── Transition screen between Scale 1 and Scale 2 ────────────────
    if (phase === 'transition') {
        return (
            <div className="survey-page survey-page--transition">
                <div className="survey-transition">
                    <div className="survey-transition__check">✅</div>
                    <h2 className="survey-transition__title">أحسنت! أكملت المقياس الأول</h2>
                    <p className="survey-transition__subtitle">
                        {COGNITIVE_CONTROL_SCALE.emoji} {COGNITIVE_CONTROL_SCALE.title}
                    </p>
                    <div className="survey-transition__stats">
                        <span>{totalScale1Questions} سؤال</span>
                        <span className="survey-transition__stats-dot">•</span>
                        <span>تمت الإجابة ✓</span>
                    </div>

                    <div className="survey-transition__divider" />

                    <p className="survey-transition__next-label">المقياس التالي:</p>
                    <div className="survey-transition__next-scale">
                        <span className="survey-transition__next-emoji">{SELF_EFFICACY_SCALE.emoji}</span>
                        <div>
                            <h3 className="survey-transition__next-title">{SELF_EFFICACY_SCALE.title}</h3>
                            <p className="survey-transition__next-info">
                                {SELF_EFFICACY_SCALE.sections.length} أبعاد • {totalScale2Questions} سؤال
                            </p>
                        </div>
                    </div>

                    <div className="survey-transition__actions">
                        <Button variant="primary" size="lg" fullWidth onClick={startScale2}>
                            الانتقال للمقياس التالي →
                        </Button>
                        <Button variant="secondary" size="lg" fullWidth onClick={goBackToScale1}>
                            ← الرجوع للمقياس السابق
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Active survey with section-based flow ────────────────────────
    let qNum = 0;

    return (
        <div className="survey-page">
            {/* Scale indicator badges */}
            <div className="survey-scale-indicator">
                <div className={`survey-scale-badge ${phase === 'scale1' ? 'survey-scale-badge--active' : 'survey-scale-badge--done'}`}>
                    <span className="survey-scale-badge__emoji">{COGNITIVE_CONTROL_SCALE.emoji}</span>
                    <span className="survey-scale-badge__label">المقياس الأول</span>
                    {phase === 'scale2' && <span className="survey-scale-badge__check">✓</span>}
                </div>
                <div className="survey-scale-connector" />
                <div className={`survey-scale-badge ${phase === 'scale2' ? 'survey-scale-badge--active' : ''}`}>
                    <span className="survey-scale-badge__emoji">{SELF_EFFICACY_SCALE.emoji}</span>
                    <span className="survey-scale-badge__label">المقياس الثاني</span>
                </div>
            </div>

            {/* Progress */}
            <ProgressHeader
                scaleTitle={currentScale.title}
                scaleEmoji={currentScale.emoji}
                currentSectionIndex={currentSectionIdx}
                totalSections={currentScale.sections.length}
                answeredCount={scaleAnsweredCount}
                totalQuestions={scaleQuestionCount}
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
                {/* Primary action (right side in RTL) */}
                {phase === 'scale1' && isLastSectionInScale ? (
                    <Button
                        variant="primary"
                        size="lg"
                        disabled={!scale1Complete}
                        onClick={goToTransition}
                    >
                        الانتقال للمقياس التالي →
                    </Button>
                ) : phase === 'scale2' && isLastSectionInScale ? (
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
                        onClick={goNextSection}
                    >
                        التالي →
                    </Button>
                )}

                <div className="survey-nav__spacer" />

                {/* Back button */}
                {phase === 'scale1' && currentSectionIdx > 0 && (
                    <Button variant="secondary" size="lg" onClick={goPrevSection} disabled={isSubmitting}>
                        ← السابق
                    </Button>
                )}
                {phase === 'scale2' && currentSectionIdx > 0 && (
                    <Button variant="secondary" size="lg" onClick={goPrevSection} disabled={isSubmitting}>
                        ← السابق
                    </Button>
                )}
                {phase === 'scale2' && currentSectionIdx === 0 && (
                    <Button variant="secondary" size="lg" onClick={goBackToTransition} disabled={isSubmitting}>
                        ← المقياس السابق
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
