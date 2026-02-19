import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, CheckCircle } from 'lucide-react';
import { getLesson, getQuizQuestions } from '../data/sampleCourse';
import { evaluate } from '../lib/evaluator/arAnswerEvaluator';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import './Chat.css';

type SenderType = 'bot' | 'user';
type VerdictType = 'correct' | 'close' | 'wrong';

interface ChatMessage {
    id: string;
    sender: SenderType;
    text: string;
    verdict?: VerdictType;
}

function uid() {
    return Math.random().toString(36).slice(2);
}

const Chat: React.FC = () => {
    const { unitId = '', lessonId = '' } = useParams<{ unitId: string; lessonId: string }>();
    const navigate = useNavigate();

    const activeUserId = useAppStore((s) => s.activeUserId);
    const markQuizDone = useAppStore((s) => s.markQuizDone);
    const getLessonProgress = useAppStore((s) => s.getLessonProgress);

    const lesson = getLesson(unitId, lessonId);
    const questions = getQuizQuestions(lessonId);

    const isFriendly = activeUserId === 'student2';

    // ── State ──────────────────────────────────────────────────────────────
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [qIdx, setQIdx] = useState(0);
    const [awaitingAnswer, setAwaitingAnswer] = useState(true);
    const [quizFinished, setQuizFinished] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    const progress = getLessonProgress(lessonId);

    // ── Init bot opening messages ─────────────────────────────────────────
    useEffect(() => {
        if (!lesson || questions.length === 0) return;

        const greeting = isFriendly
            ? `أهلاً! 🎉 جاهز نبدأ أسئلة درس "${lesson.title}"؟ خذ وقتك بالإجابة 😊`
            : `مرحبًا. سنبدأ التقييم الكتابي لدرس: "${lesson.title}". يُرجى الإجابة بصياغة كاملة.`;

        setMessages([
            { id: uid(), sender: 'bot', text: greeting },
            { id: uid(), sender: 'bot', text: `س١: ${questions[0].question}` },
        ]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMsg = (msg: Omit<ChatMessage, 'id'>) =>
        setMessages((prev) => [...prev, { id: uid(), ...msg }]);

    // ── Send handler ──────────────────────────────────────────────────────
    const handleSend = () => {
        const text = input.trim();
        if (!text || !awaitingAnswer || quizFinished) return;
        setInput('');
        addMsg({ sender: 'user', text });

        const q = questions[qIdx];
        const result = evaluate(text, q);

        // Verdict message
        let reactMsg = '';
        if (result.verdict === 'correct') {
            reactMsg = isFriendly
                ? `رائع جدًا! ✅ أحسنت 🌟\n\n**الإجابة النموذجية:** ${q.modelAnswer}\n\n💡 ${q.explanation}`
                : `إجابة صحيحة ✅\n\n**الإجابة النموذجية:** ${q.modelAnswer}\n\n${q.explanation}`;
        } else if (result.verdict === 'close') {
            const hint = result.uncoveredGroupHints.length
                ? `حاول إضافة: «${result.uncoveredGroupHints[0]}»\n\n`
                : '';
            reactMsg = isFriendly
                ? `إجابة قريبة جدًا 👍😊 ${hint}**الإجابة الأكمل:** ${q.modelAnswer}\n\n💡 ${q.explanation}`
                : `إجابة مقبولة مع ملاحظات 🟡\n\n${hint}**الإجابة النموذجية:** ${q.modelAnswer}\n\n${q.explanation}`;
        } else {
            reactMsg = isFriendly
                ? `لا بأس عليك! 💪 الإجابة الصحيحة هي:\n\n${q.modelAnswer}\n\n💡 ${q.explanation}`
                : `الإجابة غير صحيحة ❌\n\nالإجابة الصحيحة: ${q.modelAnswer}\n\n${q.explanation}`;
        }

        addMsg({ sender: 'bot', text: reactMsg, verdict: result.verdict });

        const nextIdx = qIdx + 1;

        if (nextIdx < questions.length) {
            setTimeout(() => {
                addMsg({
                    sender: 'bot',
                    text: `س${nextIdx + 1}: ${questions[nextIdx].question}`,
                });
                setQIdx(nextIdx);
            }, 600);
        } else {
            setTimeout(() => {
                const finalMsg = isFriendly
                    ? 'ممتاز! 🎊 أنهيت جميع الأسئلة. اضغط الزر للانتقال للنشاط.'
                    : 'انتهت الأسئلة. اضغط "إرسال الإجابات" للمتابعة.';
                addMsg({ sender: 'bot', text: finalMsg });
                setQuizFinished(true);
                setAwaitingAnswer(false);
            }, 600);
        }
    };

    const handleSubmitQuiz = () => {
        markQuizDone(lessonId);
        navigate(`/units/${unitId}/lessons/${lessonId}/activity`);
    };

    if (!lesson || questions.length === 0) {
        return (
            <div className="chat-page chat-page--empty">
                <p>لا توجد أسئلة لهذا الدرس بعد.</p>
                <Button variant="primary" onClick={() => navigate(-1)}>
                    رجوع
                </Button>
            </div>
        );
    }

    return (
        <div className="chat-page">
            {/* Header */}
            <div className="chat-header">
                <div className="chat-header__bot-avatar">🤖</div>
                <div>
                    <p className="chat-header__title">المساعد التعليمي</p>
                    <p className="chat-header__sub">{lesson.title}</p>
                </div>
                {progress.quizDone && (
                    <CheckCircle size={18} className="chat-header__done" />
                )}
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`chat-bubble-wrap chat-bubble-wrap--${msg.sender}`}
                    >
                        {msg.sender === 'bot' && (
                            <div className="chat-bot-avatar">🤖</div>
                        )}
                        <div
                            className={`chat-bubble chat-bubble--${msg.sender}${msg.verdict ? ` chat-bubble--${msg.verdict}` : ''
                                }`}
                        >
                            {/* Render newlines in bot messages */}
                            {msg.text.split('\n').map((line, i) => (
                                <span key={i}>
                                    {line.startsWith('**') && line.endsWith('**') ? (
                                        <strong>{line.slice(2, -2)}</strong>
                                    ) : (
                                        line
                                    )}
                                    {i < msg.text.split('\n').length - 1 && <br />}
                                </span>
                            ))}
                            {msg.verdict && (
                                <div className="chat-verdict-badge">
                                    {msg.verdict === 'correct' && '✅ صحيح'}
                                    {msg.verdict === 'close' && '🟡 قريب'}
                                    {msg.verdict === 'wrong' && '❌ غير صحيح'}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Footer */}
            {quizFinished ? (
                <div className="chat-footer chat-footer--done">
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleSubmitQuiz}
                    >
                        إرسال الإجابات والانتقال للنشاط 📤
                    </Button>
                </div>
            ) : (
                <div className="chat-footer chat-footer--input">
                    <textarea
                        className="chat-input"
                        placeholder="اكتب إجابتك هنا…"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        rows={3}
                    />
                    <button
                        className="chat-send-btn"
                        onClick={handleSend}
                        disabled={!input.trim()}
                    >
                        <Send size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Chat;
