import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useAppStore } from '../store/useAppStore';
import './LessonVideoPlayer.css';

interface LessonVideoPlayerProps {
    videoUrl: string;
    lessonId: string;
    onComplete?: () => void;
    onProgressChange?: (progress: number, isCompleted: boolean) => void;
}

const LessonVideoPlayer: React.FC<LessonVideoPlayerProps> = ({
    videoUrl,
    lessonId,
    onComplete,
    onProgressChange,
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
            onProgressChange?.(100, true);
        }
    }, [videoDone, onProgressChange]);

    // Notify parent of initial state
    useEffect(() => {
        onProgressChange?.(progress, isCompleted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Mark completion (fires once only) ──────────────────────────────────
    const handleComplete = useCallback(() => {
        if (completedRef.current) return;
        completedRef.current = true;
        setIsCompleted(true);
        setProgress(100);
        markVideoDone(lessonId);
        onComplete?.();
        onProgressChange?.(100, true);
    }, [lessonId, markVideoDone, onComplete, onProgressChange]);

    // ── onProgress: fires every ~1 s with { played, playedSeconds } ──────
    const handleProgress = useCallback(
        (state: { played: number; playedSeconds: number }) => {
            if (completedRef.current) return;

            const pct = Math.round(state.played * 100);
            setProgress(pct);
            onProgressChange?.(pct, false);

            // Complete if ≥ 90% played OR within 2 seconds of end
            if (
                state.played >= 0.9 ||
                (duration > 0 && state.playedSeconds >= duration - 2)
            ) {
                handleComplete();
            }
        },
        [duration, handleComplete, onProgressChange]
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
        </div>
    );
};

export default LessonVideoPlayer;
