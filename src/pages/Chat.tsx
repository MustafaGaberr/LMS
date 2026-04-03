import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, CheckCircle, Lock } from 'lucide-react';
import { getLesson, getQuizQuestions } from '../data/sampleCourse';
import { detailedAnswers } from '../data/detailedAnswers';
import { evaluate } from '../lib/evaluator/arAnswerEvaluator';
import { useAppStore } from '../store/useAppStore';
import type { SavedChatMessage } from '../services/storage';
import { Button } from '../components/Button';
import BotHeaderAvatar, { type BotState } from '../components/BotHeaderAvatar';
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
    const [isSpeaking, setIsSpeaking] = useState(false);
    const scheduledRef = useRef(false);
    const typingCount = useRef(0);

    // Derive bot state for avatar
    const botState: BotState = isSpeaking ? 'speaking' : isBotTyping ? 'thinking' : 'idle';
    const botStatusText =
        botState === 'thinking' ? 'جاري التفكير...' :
        botState === 'speaking' ? 'جاري الرد...' :
        'جاهز للمساعدة';
    const timeoutsRef = useRef<any[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    // ── Init bot opening messages (only if starting fresh) ─────────────────
    useEffect(() => {
        if (isReadOnly || !lesson || questions.length === 0 || messages.length > 0 || scheduledRef.current) return;
        scheduledRef.current = true;

        const greeting = 'مرحباً. أنا هنا علشان أساعدك، وهنبدأ مع بعض بأسئلة بسيطة تساعدنا نكمل بشكل أفضل ونوصل لأفضل نتيجة ممكنة.';

        addBotMsgWithDelay(greeting);

        // Send first question after greeting
        const t1 = setTimeout(() => {
            addBotMsgWithDelay(`س١: ${questions[0].question}`);
            timeoutsRef.current = timeoutsRef.current.filter(x => x !== t1);
        }, 1200);
        timeoutsRef.current.push(t1);

        return () => {
            timeoutsRef.current.forEach(clearTimeout);
            timeoutsRef.current = [];
            scheduledRef.current = false;
            setIsBotTyping(false);
            typingCount.current = 0;
        };
    }, [lesson, questions, lessonId, isFriendly, isReadOnly]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMsg = (msg: Omit<ChatMessage, 'id'>) =>
        setMessages((prev) => [...prev, { id: uid(), ...msg }]);

    const addBotMsgWithDelay = (text: string, verdict?: VerdictType, delay = 1000) => {
        typingCount.current++;
        setIsBotTyping(true);
        setIsSpeaking(false);
        const t = setTimeout(() => {
            // Switch from thinking → speaking while message renders
            setIsSpeaking(true);
            addMsg({ sender: 'bot', text, verdict });
            typingCount.current--;
            if (typingCount.current <= 0) {
                typingCount.current = 0;
                setIsBotTyping(false);
                // Brief speaking pause then go idle
                setTimeout(() => setIsSpeaking(false), 600);
            }
            // Remove from array after execution
            timeoutsRef.current = timeoutsRef.current.filter(x => x !== t);
        }, delay);
        timeoutsRef.current.push(t);
    };

    // ── Send handler ──────────────────────────────────────────────────────
    const handleSend = () => {
        const text = input.trim();
        if (!text || !awaitingAnswer || quizFinished || isReadOnly || isBotTyping) return;
        setInput('');
        addMsg({ sender: 'user', text });

        const q = questions[qIdx];
        const result = evaluate(text, q);

        // Select answer based on user type: student2 gets detailed answers
        const da = isFriendly ? detailedAnswers[q.id] : undefined;
        const answerText = da?.modelAnswer ?? q.modelAnswer;
        const explanationText = da?.explanation ?? q.explanation;

        // Verdict message
        // Build video link suffix — only for student2 (detailed/friendly mode)
        const videoSuffix = isFriendly && q.videoUrl ? `\n\n📺 شاهد الفيديو التوضيحي:\n${q.videoUrl}` : '';

        let reactMsg = '';
        if (result.verdict === 'correct') {
            reactMsg = isFriendly
                ? `رائع جدًا! ✅ أحسنت 🌟\n\n**الإجابة النموذجية:** ${answerText}\n\n💡 ${explanationText}${videoSuffix}`
                : `إجابة صحيحة ✅\n\n**الإجابة النموذجية:** ${answerText}\n\n${explanationText}${videoSuffix}`;
        } else if (result.verdict === 'close') {
            const hint = result.uncoveredGroupHints.length
                ? `حاول إضافة: «${result.uncoveredGroupHints[0]}»\n\n`
                : '';
            reactMsg = isFriendly
                ? `إجابة قريبة جدًا 👍😊 ${hint}**الإجابة الأكمل:** ${answerText}\n\n💡 ${explanationText}${videoSuffix}`
                : `إجابة مقبولة مع ملاحظات 🟡\n\n${hint}**الإجابة النموذجية:** ${answerText}\n\n${explanationText}${videoSuffix}`;
        } else {
            reactMsg = isFriendly
                ? `لا بأس عليك! 💪 الإجابة الصحيحة هي:\n\n${answerText}\n\n💡 ${explanationText}${videoSuffix}`
                : `الإجابة غير صحيحة ❌\n\nالإجابة الصحيحة: ${answerText}\n\n${explanationText}${videoSuffix}`;
        }

        addBotMsgWithDelay(reactMsg, result.verdict);

        const nextIdx = qIdx + 1;

        if (nextIdx < questions.length) {
            const tNext = setTimeout(() => {
                addBotMsgWithDelay(`س${nextIdx + 1}: ${questions[nextIdx].question}`);
                setQIdx(nextIdx);
                timeoutsRef.current = timeoutsRef.current.filter(x => x !== tNext);
            }, 1500); 
            timeoutsRef.current.push(tNext);
        } else {
            // For the VERY LAST question, send the final summary slightly after the feedback
            const tFinal = setTimeout(() => {
                const finalMsg = isFriendly
                    ? 'ممتاز! 🎊 أنهيت جميع الأسئلة. اضغط الزر للانتقال للنشاط.'
                    : 'انتهت الأسئلة. اضغط "إرسال الإجابات" للمتابعة.';
                addBotMsgWithDelay(finalMsg, undefined, 1000); 
                setQuizFinished(true);
                setAwaitingAnswer(false);
                timeoutsRef.current = timeoutsRef.current.filter(x => x !== tFinal);
            }, 1500); 
            timeoutsRef.current.push(tFinal);
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
                <BotHeaderAvatar state={botState} />
                <div className="chat-header__info">
                    <p className="chat-header__title">المساعد الذكي</p>
                    <p className={`chat-header__status chat-header__status--${botState}`}>
                        {botStatusText}
                    </p>
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
                            <BotHeaderAvatar state="idle" size="sm" />
                        )}
                        <div
                            className={`chat-bubble chat-bubble--${msg.sender}${msg.verdict ? ` chat-bubble--${msg.verdict}` : ''
                                }`}
                        >
                            {/* Render newlines in bot messages */}
                            {msg.text.split('\n').map((line, i) => {
                                // Check if line is a URL
                                const isUrl = /^https?:\/\/\S+$/.test(line.trim());
                                return (
                                    <span key={i}>
                                        {isUrl ? (
                                            <a href={line.trim()} target="_blank" rel="noopener noreferrer" className="chat-link">
                                                {line.trim()}
                                            </a>
                                        ) : line.startsWith('**') && line.endsWith('**') ? (
                                            <strong>{line.slice(2, -2)}</strong>
                                        ) : (
                                            line
                                        )}
                                        {i < msg.text.split('\n').length - 1 && <br />}
                                    </span>
                                );
                            })}
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
                        <BotHeaderAvatar state="thinking" size="sm" />
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
                <div className={`chat-footer chat-footer--input ${isBotTyping ? 'chat-footer--disabled' : ''}`}>
                    <textarea
                        className="chat-input"
                        placeholder={isBotTyping ? "انتظر رد البوت..." : "اكتب إجابتك هنا…"}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isBotTyping}
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
                        disabled={!input.trim() || isBotTyping}
                    >
                        <Send size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Chat;
