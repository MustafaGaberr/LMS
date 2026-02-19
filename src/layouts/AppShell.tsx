import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import './AppShell.css';

// Routes where bottom nav should be hidden
const HIDDEN_NAV_ROUTES = [
    '/login',
    '/onboarding',
    '/welcome',
    '/course-start',
];

// Page titles per route (prefix match)
const ROUTE_TITLES: Array<[string, string]> = [
    ['/login', 'تسجيل الدخول'],
    ['/onboarding', 'مرحباً بك'],
    ['/welcome', 'مرحباً'],
    ['/course-start', 'بداية الدورة'],
    ['/objectives/:id', 'الهدف'],
    ['/objectives', 'الأهداف'],
    ['/units', 'الوحدات'],
    ['/roadmap', 'خريطة التعلم'],
    ['/settings', 'الإعدادات'],
    ['/survey/results', 'نتائج الاستبيان'],
    ['/survey', 'الاستبيان'],
];

function getPageTitle(pathname: string): string {
    for (const [pattern, title] of ROUTE_TITLES) {
        if (pathname.startsWith(pattern)) return title;
    }
    return 'منصة التعلم';
}

function getShowBack(pathname: string): boolean {
    const noBackRoutes = ['/login', '/units', '/roadmap', '/settings', '/onboarding', '/welcome'];
    return !noBackRoutes.some((r) => pathname === r);
}

export interface AppShellProps {
    children: React.ReactNode;
}

const pageVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};

const pageTransition = { duration: 0.22, ease: 'easeInOut' };

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const location = useLocation();
    const showNav = !HIDDEN_NAV_ROUTES.some((r) => location.pathname.startsWith(r));
    const title = getPageTitle(location.pathname);
    const showBack = getShowBack(location.pathname);

    return (
        <div className="app-shell">
            <AppHeader title={title} showBack={showBack} />

            <main
                className={`app-shell__content ${showNav ? '' : 'app-shell__content--no-nav'}`}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={pageTransition}
                        className="app-shell__page"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>

            {showNav && <BottomNav />}
        </div>
    );
};

export default AppShell;
