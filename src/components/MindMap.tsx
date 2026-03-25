import React, { useRef, useEffect, useState, useCallback } from 'react';
import './MindMap.css';

interface MindMapProps {
  title: string;
  points: string[];
  centerLabel?: string;
}

interface NodeRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const CHILD_COLORS = ['#4A90D9', '#34A853', '#9B59B6', '#E67E22'];

const MindMap: React.FC<MindMapProps> = ({ points, centerLabel = 'الأهمية' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const childRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [lines, setLines] = useState<
    { x1: number; y1: number; x2: number; y2: number; color: string }[]
  >([]);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const computeLines = useCallback(() => {
    const container = containerRef.current;
    const center = centerRef.current;
    if (!container || !center) return;

    const cRect = container.getBoundingClientRect();
    const rCenter = center.getBoundingClientRect();

    const centerNode: NodeRect = {
      x: rCenter.left - cRect.left + rCenter.width / 2,
      y: rCenter.top - cRect.top + rCenter.height,
      w: rCenter.width,
      h: rCenter.height,
    };

    const newLines = childRefs.current
      .map((el, i) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        const childNode: NodeRect = {
          x: r.left - cRect.left + r.width / 2,
          y: r.top - cRect.top,
          w: r.width,
          h: r.height,
        };
        return {
          x1: centerNode.x,
          y1: centerNode.y - 4,
          x2: childNode.x,
          y2: childNode.y + 4,
          color: CHILD_COLORS[i % CHILD_COLORS.length],
        };
      })
      .filter(Boolean) as typeof lines;

    setLines(newLines);
    setContainerSize({ w: cRect.width, h: cRect.height });
  }, []);

  useEffect(() => {
    // Wait for entrance animations to settle before computing lines
    const timer = setTimeout(computeLines, 350);

    const ro = new ResizeObserver(() => {
      computeLines();
    });
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [computeLines]);

  const displayPoints = points.slice(0, 4);

  return (
    <div className="mindmap" ref={containerRef}>
      {/* SVG connector lines */}
      <svg
        className="mindmap__svg"
        viewBox={`0 0 ${containerSize.w || 400} ${containerSize.h || 420}`}
        preserveAspectRatio="none"
        width={containerSize.w || '100%'}
        height={containerSize.h || '100%'}
      >
        {lines.map((line, i) => {
          const midY = line.y1 + (line.y2 - line.y1) * 0.5;
          const path = `M ${line.x1} ${line.y1} C ${line.x1} ${midY}, ${line.x2} ${midY}, ${line.x2} ${line.y2}`;
          return (
            <path
              key={i}
              d={path}
              className={`mindmap__line mindmap__line--${i}`}
              stroke={line.color}
            />
          );
        })}
      </svg>

      {/* HTML nodes */}
      <div className="mindmap__nodes">
        {/* Center node */}
        <div className="mindmap__center" ref={centerRef} role="button" tabIndex={0}>
          {centerLabel}
        </div>

        {/* Child nodes grid */}
        <div className="mindmap__children">
          {displayPoints.map((point, i) => (
            <div
              key={i}
              ref={(el) => { childRefs.current[i] = el; }}
              className={`mindmap__child mindmap__child--${i}`}
              role="button"
              tabIndex={0}
            >
              <span className={`mindmap__dot mindmap__dot--${i}`} />
              {point}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MindMap;
