import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Circle } from 'lucide-react';
import { course } from '../data/sampleCourse';
import { useAppStore } from '../store/useAppStore';
import './Roadmap.css';

// ─── Tree data ───────────────────────────────────────────────────────────────

interface TreeNode {
    id: string;
    label: string;
    icon?: string;
    children?: TreeNode[];
    type?: 'root' | 'branch' | 'leaf' | 'done' | 'locked';
}

function buildTree(isUnitUnlocked: (uid: string) => boolean, isLessonUnlocked: (uid: string, lid: string) => boolean): TreeNode {
    return {
        id: 'root',
        label: 'التطبيق',
        icon: '📱',
        type: 'root',
        children: [
            {
                id: 'path',
                label: 'مسار التعلم',
                icon: '🎓',
                type: 'branch',
                children: course.units.map((unit) => ({
                    id: unit.id,
                    label: unit.title,
                    icon: unit.icon,
                    type: isUnitUnlocked(unit.id) ? 'branch' : 'locked',
                    children: unit.lessons.map((lesson) => ({
                        id: lesson.id,
                        label: lesson.title,
                        type: isLessonUnlocked(unit.id, lesson.id) ? 'leaf' : 'locked',
                        children: [
                            { id: `${lesson.id}-concept`, label: 'المحتوى النصي', type: 'leaf' },
                            { id: `${lesson.id}-video`, label: 'الفيديو التعليمي', type: 'leaf' },
                            { id: `${lesson.id}-chat`, label: 'المحادثة الذكية', type: 'leaf' },
                            { id: `${lesson.id}-activity`, label: 'رفع النشاط', type: 'leaf' },
                        ],
                    })),
                })),
            },
            {
                id: 'survey',
                label: 'الاستبيان والإحصائيات',
                icon: '📊',
                type: 'branch',
                children: [
                    { id: 'survey-q', label: 'الاستبيان التقييمي', type: 'leaf' },
                    { id: 'survey-results', label: 'مخططات النتائج', type: 'leaf' },
                ],
            },
        ],
    };
}

// ─── TreeItem component ───────────────────────────────────────────────────────

interface TreeItemProps {
    node: TreeNode;
    depth: number;
    defaultOpen?: boolean;
}

const TreeItem: React.FC<TreeItemProps> = ({ node, depth, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    const hasChildren = node.children && node.children.length > 0;

    const dotClass =
        node.type === 'root'
            ? 'rm-dot rm-dot--root'
            : node.type === 'locked'
                ? 'rm-dot rm-dot--locked'
                : node.type === 'done'
                    ? 'rm-dot rm-dot--done'
                    : node.type === 'branch'
                        ? 'rm-dot rm-dot--branch'
                        : 'rm-dot rm-dot--leaf';

    return (
        <div className={`rm-node rm-node--depth${Math.min(depth, 4)}`}>
            {/* Connector line from parent */}
            {depth > 0 && <div className="rm-connector" />}

            <button
                className={`rm-row ${!hasChildren ? 'rm-row--no-expand' : ''}`}
                onClick={() => hasChildren && setOpen((o) => !o)}
            >
                <div className={dotClass}>
                    {node.icon ? (
                        <span className="rm-dot__emoji">{node.icon}</span>
                    ) : (
                        <Circle size={8} />
                    )}
                </div>
                <span className="rm-label">{node.label}</span>
                {hasChildren && (
                    <motion.div
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="rm-chevron"
                    >
                        <ChevronDown size={14} />
                    </motion.div>
                )}
            </button>

            {/* Children */}
            {hasChildren && (
                <AnimatePresence initial={false}>
                    {open && (
                        <motion.div
                            key="children"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="rm-children"
                            style={{ overflow: 'hidden' }}
                        >
                            {node.children!.map((child) => (
                                <TreeItem key={child.id} node={child} depth={depth + 1} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

// ─── Roadmap page ─────────────────────────────────────────────────────────────

const Roadmap: React.FC = () => {
    const isUnitUnlocked = useAppStore((s) => s.isUnitUnlocked);
    const isLessonUnlocked = useAppStore((s) => s.isLessonUnlocked);
    const tree = buildTree(isUnitUnlocked, isLessonUnlocked);

    return (
        <div className="roadmap-page">
            <div className="roadmap-header">
                <h2 className="roadmap-title">خريطة التطبيق</h2>
                <p className="roadmap-sub">استعرض هيكل الدورة التعليمية</p>
            </div>
            <div className="roadmap-tree">
                <TreeItem node={tree} depth={0} defaultOpen />
            </div>
        </div>
    );
};

export default Roadmap;
