import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import './LessonMindMap.css';

/* ─── Public types ──────────────────────────────────────────────────────────── */

export interface MindMapNodeData {
  id: string;
  /** Short label shown inside the card */
  title: string;
  /** Optional even-shorter label for tight spaces */
  shortLabel?: string;
  /** Node accent colour (border / dot) */
  color?: string;
  /** Detail paragraphs rendered in the panel below */
  details?: string[];
  /** Nested child items (rendered inside details panel) */
  children?: MindMapNodeData[];
  /** If this node is a group header summarising several items */
  group?: string;
}

export interface LessonMindMapProps {
  /** Centre / root label */
  centerLabel: string;
  /** Child node data — flat, grouped, or nested */
  nodes: MindMapNodeData[];
  /** Max visible top-level cards (extras are grouped). Default 4 */
  maxVisible?: number;
  /** Called when a node is selected */
  onNodeSelect?: (node: MindMapNodeData) => void;
}

/* ─── Colour palette (fallback when node.color is missing) ──────────────────── */

const PALETTE = ['#4A90D9', '#34A853', '#9B59B6', '#E67E22', '#E74C3C', '#1ABC9C'];

/* ─── Component ─────────────────────────────────────────────────────────────── */

const LessonMindMap: React.FC<LessonMindMapProps> = ({
  centerLabel,
  nodes,
  maxVisible = 6,
  onNodeSelect,
}) => {
  /* — smart grouping -------------------------------------------------------- */
  const displayNodes: MindMapNodeData[] = useMemo(() => {
    if (nodes.length <= maxVisible) return nodes;

    // Split into groups of roughly equal size
    const groupSize = Math.ceil(nodes.length / maxVisible);
    const groups: MindMapNodeData[] = [];
    for (let i = 0; i < nodes.length; i += groupSize) {
      const slice = nodes.slice(i, i + groupSize);
      if (slice.length === 1) {
        groups.push(slice[0]);
      } else {
        groups.push({
          id: `group-${i}`,
          title: slice[0].group || slice[0].title,
          shortLabel: `${slice.length} عناصر`,
          color: slice[0].color,
          // No details at group level — children render their own details below
          details: [],
          children: slice,
          group: slice[0].group,
        });
      }
    }
    return groups;
  }, [nodes, maxVisible]);

  /* — selection state ------------------------------------------------------- */
  const [selectedId, setSelectedId] = useState<string>(displayNodes[0]?.id ?? '');

  // Keep selectedId in sync when displayNodes changes
  useEffect(() => {
    if (displayNodes.length && !displayNodes.find((n) => n.id === selectedId)) {
      setSelectedId(displayNodes[0].id);
    }
  }, [displayNodes, selectedId]);

  const selectedNode = displayNodes.find((n) => n.id === selectedId) ?? displayNodes[0];

  const handleSelect = useCallback(
    (node: MindMapNodeData) => {
      setSelectedId(node.id);
      onNodeSelect?.(node);
    },
    [onNodeSelect],
  );

  /* — SVG connector lines --------------------------------------------------- */
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const childRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; color: string }[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  const computeLines = useCallback(() => {
    const c = containerRef.current;
    const center = centerRef.current;
    if (!c || !center) return;
    const cR = c.getBoundingClientRect();
    const eR = center.getBoundingClientRect();
    const cx = eR.left - cR.left + eR.width / 2;
    const cy = eR.top - cR.top + eR.height;

    const result = childRefs.current
      .map((el, i) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x1: cx,
          y1: cy - 2,
          x2: r.left - cR.left + r.width / 2,
          y2: r.top - cR.top + 4,
          color: displayNodes[i]?.color || PALETTE[i % PALETTE.length],
        };
      })
      .filter(Boolean) as typeof lines;

    setLines(result);
    setSvgSize({ w: cR.width, h: cR.height });
  }, [displayNodes]);

  useEffect(() => {
    const t = setTimeout(computeLines, 400);
    const ro = new ResizeObserver(computeLines);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [computeLines]);

  /* — render ---------------------------------------------------------------- */
  return (
    <div className="lmm" dir="rtl">
      {/* ── map area ───────────────────────────────────── */}
      <div className="lmm__map" ref={containerRef}>
        {/* SVG lines */}
        <svg
          className="lmm__svg"
          viewBox={`0 0 ${svgSize.w || 100} ${svgSize.h || 100}`}
          preserveAspectRatio="none"
          style={{ width: svgSize.w || '100%', height: svgSize.h || '100%' }}
        >
          {lines.map((l, i) => {
            const midY = l.y1 + (l.y2 - l.y1) * 0.5;
            return (
              <path
                key={i}
                d={`M ${l.x1} ${l.y1} C ${l.x1} ${midY}, ${l.x2} ${midY}, ${l.x2} ${l.y2}`}
                className={`lmm__line lmm__line--${i}`}
                stroke={l.color}
              />
            );
          })}
        </svg>

        {/* Center card */}
        <div className="lmm__center" ref={centerRef}>
          {centerLabel}
        </div>

        {/* Child cards grid */}
        <div className="lmm__children">
          {displayNodes.map((node, i) => {
            const color = node.color || PALETTE[i % PALETTE.length];
            const isActive = node.id === selectedId;
            return (
              <div
                key={node.id}
                ref={(el) => { childRefs.current[i] = el; }}
                className={`lmm__card lmm__card--${i} ${isActive ? 'lmm__card--active' : ''}`}
                style={{
                  '--card-color': color,
                  animationDelay: `${0.25 + i * 0.12}s`,
                } as React.CSSProperties}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(node)}
                onKeyDown={(e) => e.key === 'Enter' && handleSelect(node)}
              >
                <span className="lmm__dot" style={{ background: color }} />
                {node.shortLabel || node.title}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── details panel ──────────────────────────────── */}
      {selectedNode && (
        <div className="lmm__details" key={selectedNode.id}>
          <h3 className="lmm__details-title">{selectedNode.title}</h3>

          {/* Detail paragraphs */}
          {selectedNode.details && selectedNode.details.length > 0 && (
            <ul className="lmm__details-list">
              {selectedNode.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}

          {/* Nested children as subsection cards */}
          {selectedNode.children && selectedNode.children.length > 0 && (
            <div className="lmm__sub-cards">
              {selectedNode.children.map((child) => (
                <div key={child.id} className="lmm__sub-card">
                  <div className="lmm__sub-card-title">{child.title}</div>
                  {child.details && child.details.length > 0 && (
                    <ul className="lmm__sub-card-list">
                      {child.details.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonMindMap;
