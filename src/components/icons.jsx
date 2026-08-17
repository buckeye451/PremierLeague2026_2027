// ─── Icons ──────────────────────────────────────────────────
// Lucide paths inlined rather than pulling in lucide-react — the app uses a
// handful of icons and has no component library, so a dependency would cost
// more than it saves.
//
// House style: fill none, stroke currentColor, round caps and joins,
// stroke-width 2 (2.5 at 12–14px so small icons hold their weight).

function Icon({ size = 18, strokeWidth, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? (size <= 14 ? 2.5 : 2)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", flexShrink: 0 }}
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconHome = (p) => (
  <Icon {...p}><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></Icon>
);

export const IconTable = (p) => (
  <Icon {...p}><rect x="3" y="4" width="18" height="16" /><path d="M3 10h18M3 15h18M9 4v16" /></Icon>
);

export const IconTarget = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </Icon>
);

export const IconUsers = (p) => (
  <Icon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

export const IconTrophy = (p) => (
  <Icon {...p}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </Icon>
);

// A ball: circle with an inscribed pentagon.
export const IconBall = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m12 7 4.5 3.3-1.7 5.3h-5.6L7.5 10.3z" />
  </Icon>
);

export const IconRefresh = (p) => (
  <Icon {...p}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </Icon>
);

export const IconUser = (p) => (
  <Icon {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

export const IconLock = (p) => (
  <Icon {...p}><rect x="3" y="11" width="18" height="11" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>
);

export const IconDownload = (p) => (
  <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></Icon>
);

export const IconChevronUp = (p) => <Icon {...p}><path d="m18 15-6-6-6 6" /></Icon>;
export const IconChevronDown = (p) => <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>;
export const IconArrowLeft = (p) => <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>;

// Drag handle — two rules, deliberately lighter than Lucide's grip-dots.
export const IconGrip = (p) => (
  <Icon strokeLinejoin={undefined} {...p}><path d="M4 8h16M4 16h16" /></Icon>
);
