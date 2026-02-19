import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Settings } from 'lucide-react';
import clsx from 'clsx';
import './BottomNav.css';

interface NavItem {
    to: string;
    label: string;
    icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
    { to: '/units', label: 'الرئيسية', icon: <Home size={22} /> },
    { to: '/roadmap', label: 'الخريطة', icon: <Map size={22} /> },
    { to: '/settings', label: 'الإعدادات', icon: <Settings size={22} /> },
];

export const BottomNav: React.FC = () => {
    return (
        <nav className="bottom-nav" aria-label="القائمة الرئيسية">
            <div className="bottom-nav__inner">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            clsx('bottom-nav__item', { 'bottom-nav__item--active': isActive })
                        }
                    >
                        <span className="bottom-nav__icon">{item.icon}</span>
                        <span className="bottom-nav__label">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;
