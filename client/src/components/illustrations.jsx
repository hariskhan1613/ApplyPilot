// Theme-aware line-art illustrations. Stroke inherits `color` (set in .empty svg),
// fills use tokens, so they adapt to light/dark automatically.
const line = { stroke: "currentColor", fill: "none", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const soft = { fill: "var(--primary-soft)", stroke: "currentColor", strokeWidth: 2, strokeLinejoin: "round" };
const accent = { stroke: "var(--primary-text)", fill: "none", strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" };
const solid = { fill: "var(--primary)", stroke: "none" };
const white = { stroke: "var(--on-primary)", fill: "none", strokeWidth: 2.5, strokeLinecap: "round" };
const surface = { fill: "var(--surface)", stroke: "currentColor", strokeWidth: 2, strokeLinejoin: "round" };

function Svg({ children }) {
  return (
    <svg viewBox="0 0 160 120" width="160" height="120" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export function EmptyApplications() {
  return (
    <Svg>
      <rect x="34" y="16" width="92" height="86" rx="12" style={soft} />
      {[38, 56, 74].map((y) => (
        <g key={y}>
          <circle cx="50" cy={y} r="5" style={surface} />
          <path d={`M62 ${y}h46`} style={line} />
        </g>
      ))}
      <circle cx="118" cy="94" r="16" style={solid} />
      <path d="M118 87v14M111 94h14" style={white} />
    </Svg>
  );
}

export function EmptyFollowups() {
  return (
    <Svg>
      <rect x="36" y="26" width="88" height="76" rx="12" style={soft} />
      <path d="M36 48h88" style={line} />
      <path d="M58 18v16M102 18v16" style={line} />
      <path d="m68 78 10 10 20-22" style={accent} />
    </Svg>
  );
}

export function EmptyResults() {
  return (
    <Svg>
      <rect x="42" y="14" width="64" height="86" rx="10" style={soft} />
      <path d="M56 36h36M56 50h36M56 64h22" style={line} />
      <circle cx="106" cy="84" r="16" style={surface} />
      <circle cx="106" cy="84" r="16" style={accent} />
      <path d="m118 96 12 12" style={accent} />
    </Svg>
  );
}

export function EmptySessions() {
  return (
    <Svg>
      <path d="M40 22h64a12 12 0 0 1 12 12v18a12 12 0 0 1-12 12H62l-14 12V64h-8a12 12 0 0 1-12-12V34a12 12 0 0 1 12-12Z" style={soft} />
      <path d="M48 38h44M48 50h28" style={line} />
      <rect x="66" y="74" width="66" height="30" rx="12" style={surface} />
      <path d="M84 89h.01M99 89h.01M114 89h.01" style={accent} />
    </Svg>
  );
}

export function NotFound() {
  return (
    <Svg>
      <circle cx="80" cy="56" r="38" style={soft} />
      <path d="M69 46c0-7 5-11 11-11s11 4 11 10c0 8-10 9-10 17" style={accent} />
      <circle cx="81" cy="76" r="2.5" style={{ fill: "var(--primary-text)" }} />
      <path d="M34 108h92" style={{ ...line, strokeDasharray: "2 8" }} />
    </Svg>
  );
}

export function ErrorState() {
  return (
    <Svg>
      <path d="M80 20 126 98H34Z" style={soft} />
      <path d="M80 50v24" style={accent} />
      <circle cx="80" cy="85" r="2.5" style={{ fill: "var(--primary-text)" }} />
    </Svg>
  );
}
