import React, { useState } from 'react';
import clsx from 'clsx';
import './Tabs.css';

export interface Tab {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

export interface TabsProps {
    tabs: Tab[];
    defaultTab?: string;
    onChange?: (id: string) => void;
    children?: (activeTab: string) => React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab, onChange, children }) => {
    const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');

    const handleClick = (id: string) => {
        setActive(id);
        onChange?.(id);
    };

    return (
        <div className="tabs">
            <div className="tabs__list" role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        aria-selected={active === tab.id}
                        className={clsx('tabs__tab', { 'tabs__tab--active': active === tab.id })}
                        onClick={() => handleClick(tab.id)}
                        type="button"
                    >
                        {tab.icon && <span className="tabs__tab-icon">{tab.icon}</span>}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
            {children && (
                <div className="tabs__panel" role="tabpanel">
                    {children(active)}
                </div>
            )}
        </div>
    );
};

export default Tabs;
