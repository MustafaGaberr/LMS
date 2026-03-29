import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useAppStore } from '../store/useAppStore';
import './LessonVideoPlayer.css';

interface LessonVideoPlayerProps {
    videoUrl: string;
    lessonId: string;
    onComplete?: () => void;
}

const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({
    videoUrl,
    lessonId,
    onComplete,
}) => {
    const markVideoDone = useAppStore((s) => s.markVideoDone);
    const videoDone = useAppStore(
        (s) => s.progress.completedLessons[lessonId]?.videoDone ?? false
    );

    const [isCompleted, setIsCompleted] = useState(videoDone);
    const [progress, setProgress] = useState(videoDone ? 100 : 0);
    const [duration, setDuration] = useState(0);
    const completedRef = useRef(videoDone);

    // Sync from store on mount (handles persisted state)
    useEffect(() => {
        if (videoDone && !completedRef.current) {
            completedRef.current = true;
            setIsCompleted(true);
            setProgress(100);
        }
    }, [videoDone]);

    // ── Mark completion (fires once only) ──────────────────────────────────
    const handleComplete = useCallback(() => {
        if (completedRef.current) return;
        completedRef.current = true;
        setIsCompleted(true);
        setProgress(100);
        markVideoDone(lessonId);
        onComplete?.();
    }, [lessonId, markVideoDone, onComplete]);

    // ── onProgress: fires every ~1 s with { played, playedSeconds } ──────
    const handleProgress = useCallback(
        (state: { played: number; playedSeconds: number }) => {
            if (completedRef.current) return;

            const pct = Math.round(state.played * 100);
            setProgress(pct);

            // Complete if ≥ 90% played OR within 2 seconds of end
            if (
                state.played >= 0.9 ||
                (duration > 0 && state.playedSeconds >= duration - 2)
            ) {
                handleComplete();
            }
        },
        [duration, handleComplete]
    );

    // ── onDuration ───────────────────────────────────────────────────────
    const handleDuration = useCallback((d: number) => {
        setDuration(d);
    }, []);

    // ── onSeek: user dragged to a specific second ────────────────────────
    const handleSeek = useCallback(
        (seconds: number) => {
            if (completedRef.current) return;
            if (duration > 0 && seconds >= duration * 0.9) {
                handleComplete();
            }
        },
        [duration, handleComplete]
    );

    // ── onEnded: video naturally finished ────────────────────────────────
    const handleEnded = useCallback(() => {
        handleComplete();
    }, [handleComplete]);

    return (
        <div className="lesson-video-player">
            {/* 16:9 video wrapper */}
            <div className="lesson-video-player__wrapper">
                <ReactPlayer
                    url={videoUrl}
                    controls
                    width="100%"
                    height="100%"
                    onProgress={handleProgress}
                    onDuration={handleDuration}
                    onSeek={handleSeek}
                    onEnded={handleEnded}
                    progressInterval={1000}
                    config={{
                        playerVars: {
                            rel: 0,
                            modestbranding: 1,
                        },
                    }}
                />
            </div>

            {/* Progress indicator */}
            <div className="lesson-video-player__status">
                {isCompleted ? (
                    <div className="lesson-video-player__completed">
                        <span className="lesson-video-player__check">✅</span>
                        <span>تم إكمال مشاهدة الفيديو</span>
                    </div>
                ) : (
                    <div className="lesson-video-player__progress">
                        <div className="lesson-video-player__bar-bg">
                            <div
                                className="lesson-video-player__bar-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="lesson-video-player__pct">
                            تم مشاهدة {progress}% من الفيديو
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LessonVideoPlayer;
