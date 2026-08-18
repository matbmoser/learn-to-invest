// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Mathias Brunkow Moser
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.
//
// This file was generated with AI assistance (Claude Code, Anthropic).

// Inline stroke icons (24x24 grid, 1.75 stroke) — no icon-font or SVG-sprite
// dependency. Every icon takes `size` and inherits `currentColor`.

function Svg({ size = 18, children, fill = 'none', ...rest }) {
  return (
    <svg
      className="ico"
      width={size} height={size} viewBox="0 0 24 24"
      fill={fill} stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

/* ---------- navigation ---------- */
export const IconDashboard = (p) => (
  <Svg {...p}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></Svg>
)
export const IconAcademy = (p) => (
  <Svg {...p}><path d="M22 9 12 4 2 9l10 5 10-5Z" /><path d="M6 11.5V17c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" /><path d="M22 9v6" /></Svg>
)
export const IconMentor = (p) => (
  <Svg {...p}><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" /><path d="M9 11h6M9 15h4" /></Svg>
)
export const IconGlossary = (p) => (
  <Svg {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 0 4 21.5Z" /><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /></Svg>
)
export const IconMarket = (p) => (
  <Svg {...p}><path d="M3 21h18" /><rect x="4" y="12" width="3.5" height="6" rx="1" /><rect x="10.25" y="7" width="3.5" height="11" rx="1" /><rect x="16.5" y="3" width="3.5" height="15" rx="1" /></Svg>
)
export const IconPortfolio = (p) => (
  <Svg {...p}><rect x="2.5" y="7" width="19" height="13" rx="2" /><path d="M8.5 7V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" /><path d="M2.5 12h19" /></Svg>
)
export const IconTools = (p) => (
  <Svg {...p}><rect x="4" y="2.5" width="16" height="19" rx="2.5" /><path d="M8 7h8" /><path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01" /></Svg>
)
export const IconSettings = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.7 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.7a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.3 9v.05A1.7 1.7 0 0 0 21 10h.09a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.56 1Z" /></Svg>
)

/* ---------- module / topic ---------- */
export const IconSprout = (p) => (
  <Svg {...p}><path d="M12 21v-8" /><path d="M12 13C12 9 9 7 4 7c0 4.5 3 6 8 6Z" /><path d="M12 13c0-3.5 2.5-5.5 7-5.5 0 4-2.5 5.5-7 5.5Z" /></Svg>
)
export const IconSearch = (p) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>
)
export const IconTrend = (p) => (
  <Svg {...p}><path d="m3 16 5.5-5.5 3.5 3.5L21 5" /><path d="M15 5h6v6" /></Svg>
)
export const IconShield = (p) => (
  <Svg {...p}><path d="M12 2.5 4.5 6v6c0 4.7 3.1 8.4 7.5 9.5 4.4-1.1 7.5-4.8 7.5-9.5V6Z" /><path d="m9 12 2 2 4-4" /></Svg>
)
export const IconBrain = (p) => (
  <Svg {...p}><path d="M9.5 3A2.5 2.5 0 0 0 7 5.5 2.5 2.5 0 0 0 4.5 8c0 .8.4 1.5 1 2A2.5 2.5 0 0 0 4 12.5c0 1 .6 1.9 1.5 2.3-.3.4-.5 1-.5 1.5A2.7 2.7 0 0 0 7.7 19c.4 1.2 1.5 2 2.8 2 .9 0 1.5-.5 1.5-1.4V4.9C12 3.8 11 3 9.5 3Z" /><path d="M14.5 3A2.5 2.5 0 0 1 17 5.5 2.5 2.5 0 0 1 19.5 8c0 .8-.4 1.5-1 2a2.5 2.5 0 0 1 1.5 2.5c0 1-.6 1.9-1.5 2.3.3.4.5 1 .5 1.5a2.7 2.7 0 0 1-2.7 2.7c-.4 1.2-1.5 2-2.8 2-.9 0-1.5-.5-1.5-1.4V4.9C12 3.8 13 3 14.5 3Z" /></Svg>
)
export const IconFinance = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M15 8.5h-3.9a1.85 1.85 0 0 0 0 3.7h1.8a1.85 1.85 0 0 1 0 3.7H9" /><path d="M12 7v1.5M12 15.9v1.6" /></Svg>
)
export const IconAnalyst = (p) => (
  <Svg {...p}><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9.5 11h1M13.5 11h1M9.5 15h1M13.5 15h1" /></Svg>
)

/* ---------- content ---------- */
export const IconBulb = (p) => (
  <Svg {...p}><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" /></Svg>
)
export const IconWarning = (p) => (
  <Svg {...p}><path d="M10.3 3.9 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4.5M12 17.5h.01" /></Svg>
)
export const IconExample = (p) => (
  <Svg {...p}><path d="M14 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5Z" /><path d="M14 2.5v5h5" /><path d="M8.5 13h7M8.5 16.5h4.5" /></Svg>
)
export const IconQuiz = (p) => (
  <Svg {...p}><path d="M9 3h6v3a2 2 0 0 1-.4 1.2L13 9.5v10a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 9 19.5v-10L7.4 7.2A2 2 0 0 1 7 6V3Z" /><path d="M7 3h10" /><path d="M9.2 13.5h4.6" /></Svg>
)
export const IconCheck = (p) => (<Svg {...p}><path d="m4.5 12.5 5 5 10-11" /></Svg>)
export const IconX = (p) => (<Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>)
export const IconTrophy = (p) => (
  <Svg {...p}><path d="M7 4h10v5a5 5 0 0 1-10 0Z" /><path d="M7 5.5H4.5A1.5 1.5 0 0 0 3 7a4 4 0 0 0 4 4" /><path d="M17 5.5h2.5A1.5 1.5 0 0 1 21 7a4 4 0 0 1-4 4" /><path d="M12 14v3.5" /><path d="M8.5 21h7l-.7-3.5H9.2Z" /></Svg>
)
export const IconClock = (p) => (<Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.2 2" /></Svg>)
export const IconArrowRight = (p) => (<Svg {...p}><path d="M4 12h15" /><path d="m13.5 6 6 6-6 6" /></Svg>)
export const IconArrowLeft = (p) => (<Svg {...p}><path d="M20 12H5" /><path d="m10.5 6-6 6 6 6" /></Svg>)
export const IconChevronRight = (p) => (<Svg {...p}><path d="m9 5 7 7-7 7" /></Svg>)

/* ---------- stock / analysis ---------- */
export const IconClipboard = (p) => (
  <Svg {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" /><path d="M9 10h6M9 14h6M9 18h3" /></Svg>
)
export const IconPulse = (p) => (
  <Svg {...p}><path d="M2.5 12h4l2-5.5 4 12 2.5-6.5H21.5" /></Svg>
)
export const IconCompass = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5Z" /></Svg>
)
export const IconTrade = (p) => (
  <Svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="2.5" /><path d="M2.5 10h19" /><path d="M6 14.5h4" /></Svg>
)
export const IconScale = (p) => (
  <Svg {...p}><path d="M12 3v18" /><path d="M7 21h10" /><path d="M4 7h16" /><path d="M6.5 7 3 14h7Z" /><path d="M17.5 7 14 14h7Z" /></Svg>
)
export const IconRuler = (p) => (
  <Svg {...p}><rect x="2" y="8" width="20" height="8" rx="1.5" /><path d="M6.5 8v3M10 8v4M13.5 8v3M17 8v4" /></Svg>
)
export const IconTag = (p) => (
  <Svg {...p}><path d="M3 12.5V4a1 1 0 0 1 1-1h8.5a1 1 0 0 1 .7.3l7.5 7.5a1 1 0 0 1 0 1.4l-8.5 8.5a1 1 0 0 1-1.4 0L3.3 13.2a1 1 0 0 1-.3-.7Z" /><circle cx="7.5" cy="7.5" r="1.5" /></Svg>
)

/* ---------- feedback ---------- */
export const IconLock = (p) => (
  <Svg {...p}><rect x="4" y="10" width="16" height="11" rx="2.5" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></Svg>
)
export const IconRefresh = (p) => (
  <Svg {...p}><path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" /><path d="M20.5 4v5h-5" /></Svg>
)
export const IconInfo = (p) => (<Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.6h.01" /></Svg>)
export const IconThumbsUp = (p) => (
  <Svg {...p}><path d="M7 21V10l4.5-7.5a2 2 0 0 1 2.9 2.6L12.5 9H19a2 2 0 0 1 2 2.3l-1.3 7A2 2 0 0 1 17.7 20H7Z" /><rect x="2.5" y="10" width="4.5" height="11" rx="1.5" /></Svg>
)
export const IconStop = (p) => (<Svg {...p}><rect x="6" y="6" width="12" height="12" rx="2" /></Svg>)
export const IconSend = (p) => (<Svg {...p}><path d="M21 3 10.5 13.5" /><path d="M21 3 14.5 21l-4-7.5L3 9.5Z" /></Svg>)

/* ---------- theme & footer ---------- */
export const IconSun = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" /></Svg>
)
export const IconMoon = (p) => (
  <Svg {...p}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" /></Svg>
)
export const IconCoffee = (p) => (
  <Svg {...p}><path d="M18 8h1a3.5 3.5 0 0 1 0 7h-1" /><path d="M2.5 8H18v8a4 4 0 0 1-4 4H6.5a4 4 0 0 1-4-4Z" /><path d="M6.5 2v3M10.5 2v3M14.5 2v3" /></Svg>
)
export const IconStar = (p) => (
  <Svg {...p}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9Z" /></Svg>
)
export const IconGitHub = (p) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.2c-3.34.72-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z" />
  </Svg>
)
export const IconHeart = (p) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M12 20.7 4.4 13.4a4.8 4.8 0 0 1 6.8-6.8l.8.8.8-.8a4.8 4.8 0 1 1 6.8 6.8Z" />
  </Svg>
)
export const IconLogo = (p) => (
  <Svg {...p}><path d="m3.5 16.5 5-5.5 3.5 3.5 8.5-9" /><path d="M15 5.5h6v6" /><path d="M3.5 21h17" /></Svg>
)

// Name → component, for data files that reference an icon by string.
export const ICONS = {
  dashboard: IconDashboard, academy: IconAcademy, mentor: IconMentor,
  glossary: IconGlossary, market: IconMarket, portfolio: IconPortfolio,
  tools: IconTools, settings: IconSettings,
  sprout: IconSprout, search: IconSearch, trend: IconTrend,
  shield: IconShield, brain: IconBrain, analyst: IconAnalyst,
  finance: IconFinance, pulse: IconPulse, compass: IconCompass,
  scale: IconScale,
}

export function Icon({ name, ...rest }) {
  const C = ICONS[name]
  return C ? <C {...rest} /> : null
}
