import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, CheckCircle, Lock } from 'lucide-react';
import { getLesson, getQuizQuestions } from '../data/sampleCourse';
import { evaluate } from '../lib/evaluator/arAnswerEvaluator';
import { useAppStore } from '../store/useAppStore';
import type { SavedChatMessage } from '../services/storage';
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
    const saveChatHistory = useAppStore((s) => s.saveChatHistory);
    const getLessonProgress = useAppStore((s) => s.getLessonProgress);

    const lesson = getLesson(unitId, lessonId);
    const questions = getQuizQuestions(lessonId);

    const isFriendly = activeUserId === 'student2';

    const progress = getLessonProgress(lessonId);

    // ── If quiz already done, restore saved history ─────────────────────────
    const isReadOnly = progress.quizDone;
    const savedHistory = progress.chatHistory as SavedChatMessage[] | undefined;

    // ── State ──────────────────────────────────────────────────────────────
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        // On mount: if quiz done and history saved → restore it
        if (isReadOnly && savedHistory && savedHistory.length > 0) {
            return savedHistory as ChatMessage[];
        }
        return [];
    });
    const [input, setInput] = useState('');
    const [qIdx, setQIdx] = useState(0);
    const [awaitingAnswer, setAwaitingAnswer] = useState(!isReadOnly);
    const [quizFinished, setQuizFinished] = useState(isReadOnly);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const initRef = useRef(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // ── Init bot opening messages (only if starting fresh) ─────────────────
    useEffect(() => {
        if (isReadOnly) return;           
        if (!lesson || questions.length === 0) return;
        if (initRef.current) return; 
        initRef.current = true;

        const greeting = isFriendly
            ? `أهلاً! 🎉 جاهز نبدأ أسئلة درس "${lesson.title}"؟ خذ وقتك بالإجابة 😊`
            : `مرحبًا. سنبدأ التقييم الكتابي لدرس: "${lesson.title}". يُرجى الإجابة بصياغة كاملة.`;

        let t1: any, t2: any;

        setIsBotTyping(true);
        t1 = setTimeout(() => {
            setMessages([
                { id: uid(), sender: 'bot', text: greeting }
            ]);
            t2 = setTimeout(() => {
                addMsg({ sender: 'bot', text: `س١: ${questions[0].question}` });
                setIsBotTyping(false);
            }, 1500); 
        }, 1500); 

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMsg = (msg: Omit<ChatMessage, 'id'>) =>
        setMessages((prev) => [...prev, { id: uid(), ...msg }]);

    const addBotMsgWithDelay = (text: string, verdict?: VerdictType, delay = 1000) => {
        setIsBotTyping(true);
        setTimeout(() => {
            addMsg({ sender: 'bot', text, verdict });
            setIsBotTyping(false);
        }, delay);
    };

    // ── Send handler ──────────────────────────────────────────────────────
    const handleSend = () => {
        const text = input.trim();
        if (!text || !awaitingAnswer || quizFinished || isReadOnly) return;
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

        addBotMsgWithDelay(reactMsg, result.verdict);

        const nextIdx = qIdx + 1;

        if (nextIdx < questions.length) {
            setTimeout(() => {
                addBotMsgWithDelay(`س${nextIdx + 1}: ${questions[nextIdx].question}`);
                setQIdx(nextIdx);
            }, 1500); // 1s typing + 0.5s buffer
        } else {
            // For the VERY LAST question, send the final summary slightly after the feedback
            setTimeout(() => {
                const finalMsg = isFriendly
                    ? 'ممتاز! 🎊 أنهيت جميع الأسئلة. اضغط الزر للانتقال للنشاط.'
                    : 'انتهت الأسئلة. اضغط "إرسال الإجابات" للمتابعة.';
                addBotMsgWithDelay(finalMsg, undefined, 1000); 
                setQuizFinished(true);
                setAwaitingAnswer(false);
            }, 1500); 
        }
    };

    const handleSubmitQuiz = () => {
        // Save history to localStorage before navigating away
        const historyToSave: SavedChatMessage[] = messages.map((m) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            verdict: m.verdict,
        }));
        // Add final done message to saved history if not already there
        const doneMsg: SavedChatMessage = {
            id: uid(),
            sender: 'bot',
            text: isFriendly
                ? 'ممتاز! 🎊 أنهيت جميع الأسئلة. اضغط الزر للانتقال للنشاط.'
                : 'انتهت الأسئلة. اضغط "إرسال الإجابات" للمتابعة.',
        };
        // Only add if last message isn't already the final done msg
        const last = historyToSave[historyToSave.length - 1];
        const finalHistory =
            last?.text === doneMsg.text ? historyToSave : historyToSave;

        markQuizDone(lessonId);
        saveChatHistory(lessonId, finalHistory);
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

            {/* Read-only banner */}
            {isReadOnly && (
                <div className="chat-readonly-banner">
                    <Lock size={14} />
                    <span>تم إكمال هذا الدرس — المحادثة للقراءة فقط</span>
                </div>
            )}

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

                {isBotTyping && (
                    <div className="chat-bubble-wrap chat-bubble-wrap--bot">
                        <div className="chat-bot-avatar">🤖</div>
                        <div className="chat-bubble chat-bubble--bot chat-bubble--typing">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Footer */}
            {isReadOnly ? (
                /* Read-only: show a button to go to activity page */
                <div className="chat-footer chat-footer--done">
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => navigate(`/units/${unitId}/lessons/${lessonId}/activity`)}
                    >
                        الانتقال للنشاط 📋
                    </Button>
                </div>
            ) : quizFinished ? (
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
