import React, { useEffect, useState, memo } from 'react';
import { useLottie } from 'lottie-react';
import './BotHeaderAvatar.css';

export type BotState = 'idle' | 'thinking' | 'speaking';
export type BotAvatarSize = 'sm' | 'md';

interface BotHeaderAvatarProps {
    state: BotState;
    size?: BotAvatarSize;
}

// Cache animation JSON at module level — fetched only once
let cachedAnim: object | null = null;
let fetchPromise: Promise<object> | null = null;

function getAnimationData(): Promise<object> {
    if (cachedAnim) return Promise.resolve(cachedAnim);
    if (!fetchPromise) {
        fetchPromise = fetch('/assets/lottie/chatbot_header.json')
            .then((r) => r.json())
            .then((data) => { cachedAnim = data; return data; });
    }
    return fetchPromise;
}

// ─── Inner player (runs after data is ready) ───────────────────────────────
const LottiePlayer: React.FC<{ animData: object; state: BotState }> = memo(({ animData, state }) => {
    const { View, play, stop, setSpeed } = useLottie({
        animationData: animData,
        loop: true,
        autoplay: false, // full manual control
        style: { width: '100%', height: '100%' },
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    });

    useEffect(() => {
        if (state === 'idle') {
            stop();
        } else {
            setSpeed(state === 'speaking' ? 1.3 : 1);
            play();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    return <>{View}</>;
});
LottiePlayer.displayName = 'LottiePlayer';

// ─── Public component ───────────────────────────────────────────────────────
const BotHeaderAvatar: React.FC<BotHeaderAvatarProps> = memo(({ state, size = 'md' }) => {
    const [animData, setAnimData] = useState<object | null>(cachedAnim);

    useEffect(() => {
        if (!animData) {
            getAnimationData().then(setAnimData);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={`bot-avatar-wrap bot-avatar-wrap--${state} bot-avatar-wrap--${size}`}>
            {animData ? (
                <LottiePlayer animData={animData} state={state} />
            ) : (
                <span className="bot-avatar-fallback">🤖</span>
            )}
        </div>
    );
});
BotHeaderAvatar.displayName = 'BotHeaderAvatar';

export default BotHeaderAvatar;
