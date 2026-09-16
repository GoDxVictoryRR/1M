---
name: TerraOps Design System
colors:
  bg-base: "#06090f"
  bg-surface: "#0d1117"
  bg-elevated: "#161b24"
  brand: "#00d47e"
  text-primary: "#e6edf3"
  text-secondary: "#8b949e"
  accent-blue: "#58a6ff"
  accent-amber: "#e3b341"
  accent-red: "#f85149"
---

# Design System: TerraOps Operational Sustainability DSS

## 1. Visual Theme & Atmosphere

TerraOps occupies the rare intersection of **analytical rigor and environmental responsibility** — a deep-space data cockpit built for the serious operator who must translate raw telemetry into carbon reduction decisions. The atmosphere is **Clinical Midnight**: surfaces layered from near-absolute voids (#06090f base) up through ink-blue planes (#161b24 elevated), creating visible depth without any decorative chrome. The single green accent (#00d47e, a precisely calibrated bioluminescent emerald) acts as the sole high-energy signal in an otherwise restrained monochromatic field — it marks life, confirmation, and environmental positive action, never used decoratively.

Density sits at **7/10** — information-dense like a trading terminal, yet hierarchically aerated through strict section layering and whitespace gutters. Motion is **5/10**: responsive and intentional (hover lifts, fade transitions, pulsing status dots) but never theatrical. This is a professional instrument, not an experience. Typography is weight-driven, not size-driven — the scale is tight and disciplined, hierarchy expressed through weight contrast (800 → 400), never through headline screaming.

## 2. Color Palette & Roles

### Primary Foundation (Layered Dark Surfaces)
- **Void Ink** (#06090f) — Page base, the deepest layer. Never pure black
- **Midnight Surface** (#0d1117) — Sidebar, topbar backdrop. Primary container plane  
- **Elevated Card** (#161b24) — Panel and card bodies. Creates perceivable lift above base
- **Hover Ghost** (#1c2433) — Interactive hover fill. A single stop above elevated
- **Overlay Scrim** (#21293a) — Dropdowns, tooltips, secondary overlays

### Borders (Opacity-based, not flat colors)
- **Whisper Line** (rgba(255,255,255,0.06)) — Structural separators, panel outlines at rest
- **Default Line** (rgba(255,255,255,0.10)) — Input borders, button edges
- **Strong Line** (rgba(255,255,255,0.18)) — Hover borders, focused states, emphasis

### Single Accent & Semantic Color
- **Bioluminescent Emerald** (#00d47e) — THE brand accent. Primary CTAs, active nav, success states, positive data signals. Saturation 80%. Never used decoratively
- **Signal Amber** (#e3b341) — Warnings, optimization opportunities, rate limit indicators
- **Alert Crimson** (#f85149) — Errors, critical anomalies, dangerous thresholds
- **Data Blue** (#58a6ff) — Secondary data series, informational links, forecast values
- **Utility Cyan** (#39d0d8) — Similarity scores, tertiary data labels, metadata accents

### Typography & Text Hierarchy
- **Platinum Text** (#e6edf3) — Primary content, all body text, card values
- **Slate Secondary** (#8b949e) — Labels, subtitles, helper text
- **Muted Ash** (#484f58) — Timestamps, tertiary metadata, disabled states

## 3. Typography Rules

### Font Stack
- **Display & UI:** `Geist` (Google Fonts) — geometric grotesque with technical precision. Track-tight on headings (-0.02em to -0.03em). NOT Inter. NOT system-ui for premium contexts
- **Monospace:** `Geist Mono` — paired with Geist for a unified type system. Used for ALL numeric data, metric values, timestamps, code labels, and KPI figures
- **Fallback chain:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Hierarchy & Weights
- **Page Title / H1:** Geist 700, 1.1rem, tracking -0.02em — used once per page in topbar
- **Section Title / H2:** Geist 700, 1.05rem, tracking -0.01em
- **Panel Title / H3:** Geist 700, 0.95rem
- **KPI Value:** Geist Mono 700, 1.65rem, tracking -0.03em — ALL numeric KPIs
- **Body / Description:** Geist 400, 0.875rem, line-height 1.6
- **Label / Caption:** Geist 600, 0.72rem, tracking 0.07em, ALL-CAPS for section labels
- **Metadata / Mono Data:** Geist Mono 400, 0.82rem

### Spacing Principles
- Maximum line width: 65ch on descriptive paragraphs
- Heading letter-spacing scales inversely with size: larger = tighter
- No gradient text effects on headings — weight contrast only
- Numbers ALWAYS in Geist Mono — never mix serif or sans in data contexts

## 4. Component Stylings

### Buttons
Three variants only — no proliferation:
- **Primary:** Bioluminescent Emerald fill (#00d47e), near-black text (#0a0f0a), 8px radius. Hover: brightens to #00f090 + translateY(-1px). Active: tactile translateY(+1px) push. No outer glow, no neon shadow. 
- **Secondary:** Overlay Scrim background (#21293a), Default Line border, Platinum text. Hover: Hover Ghost background + Strong Line border. Same translate physics
- **Ghost / Icon:** Transparent background, icon-only 34×34px tap target. Hover: Elevated Card fill

### Panels & Cards
- Elevated Card background (#161b24) with Whisper Line border (rgba(255,255,255,0.06))
- Corner radius: **14px** (--r-lg) — generously rounded but not pill-shaped
- No decorative drop shadows — depth communicated entirely through surface layering
- Hover: border transitions to Default Line. translateY(-2px) max. No glow  
- Panel anatomy: `panel-header` (18px/22px padding) | divider | `panel-body` (22px padding)
- KPI cards: 20px internal padding, 2px bottom accent stripe in card's semantic color. Never 3-column equal grids — use 4-column KPI bar

### Navigation Sidebar
- Fixed 240px, full viewport height. Midnight Surface background
- Active item: Emerald brand-dim fill + Emerald text + subtle border. NOT underline
- Hover: Elevated Card fill only. No transition-delay
- Section labels: 0.65rem, ALL-CAPS, 0.08em tracking, Muted Ash color — structural, not decorative
- Brand logo: 36×36px gradient tile (Emerald → Teal), 10px radius, brand-glow shadow

### Tables (Data Tables)
- Header: Void Ink background, 0.72rem ALL-CAPS labels, 0.06em tracking — always sticky
- Row hover: Hover Ghost fill only. No row borders except Whisper Line separators
- Numeric cells: ALWAYS Geist Mono, right-aligned
- Severity badges: chip system — colored fill (12%) + matching border (25% opacity)

### Inputs & Search Fields
- Default Line border, Midnight Surface background
- Focus: Emerald border + 0 0 0 3px rgba(0,212,126,0.12) ring — no floating labels
- Label always ABOVE input, never floating
- Pill-style toggle groups for mode switching (not tabs, not radio buttons)

### Status Chips / Badges
- Pill-shaped (999px radius), Geist Mono font
- Semantic colors: green/amber/red/blue/purple — always 12% fill + 25% opacity border
- Never flat color fill (too loud) — always transparent tinted

### Empty States
- Centered content, large tinted icon (50% opacity), single line description
- Never just "No data" — explain what action populates the state

### Loading
- Skeleton shimmer matching exact component dimensions — never circular spinners
- Shimmer animation: CSS gradient sweep, hardware-accelerated via transform

### Toast Notifications
- Slide-in from top, 0.25s ease. Auto-dismiss 5s
- Success: Emerald tinted. Error: Crimson tinted. Warning: Amber tinted
- Icon + message in single line. No dismiss button needed (auto-dismiss)

## 5. Layout Principles

### Grid & Structure
- **App shell:** Fixed sidebar (240px) + fluid main content — NOT centered single-column
- **KPI row:** CSS Grid, `repeat(4, 1fr)`, gap 16px. Collapses: 4→2→1 at 1100px/640px
- **Panel grid:** Single-column stack within main. Max content width: 1300px
- **Section spacing:** 22px between panels (margin-bottom), 28px page padding
- **No 3-equal-column feature rows** — use 4-column KPI bar or asymmetric 2-column splits

### Whitespace Strategy
- Base unit: 4px grid. Scale: 4, 8, 12, 16, 20, 22, 28, 40px
- Panel internal padding: 22px (body), 18px (header vertical)
- Page edge padding: 28px horizontal
- Section header margin-bottom: 20px before content

### Responsive Behavior
- Mobile-first collapse at 768px: sidebar converts to bottom drawer (future enhancement)
- All multi-column grids collapse to single column below 640px
- Typography scaling via `clamp()` on display sizes
- All interactive elements minimum 44px tap target
- No horizontal overflow — ever

### Visual Hierarchy
- Depth through surface layering, NOT shadows
- Accent color used only on actionable/status elements — never decorative
- Weight contrast (700/600/400/300) communicates hierarchy, not size contrast

## 6. Motion & Interaction Philosophy

### Timing Contracts
- **Micro (hover/focus):** 150ms ease — buttons, borders, color transitions
- **Standard (reveal/mount):** 250ms ease — toast slide-in, panel fade
- **Emphasis (cascade):** 300–400ms for staggered list items
- **No linear easing anywhere** — always `ease`, `ease-in-out`, or spring physics

### Perpetual Micro-Interactions
- Status pulse dot: 2s ease-in-out infinite scale + opacity loop
- Brand glow: ambient, never animated — static shadow only
- Skeleton loaders: horizontal shimmer sweep on 1.5s loop

### Hardware-Accelerated Only
- Animate ONLY: `transform` and `opacity`
- NEVER animate: `top`, `left`, `width`, `height`, `background-color` directly
- Score bar fill: `width` transition exception — 0.6s ease for visual drama (one-time on mount)

### State Transitions
- Nav item activation: background + color cross-fade, 150ms
- Card hover: `translateY(-2px)` + border-color, 200ms ease
- Button press: `translateY(+1px)` active state, instant

## 7. Anti-Patterns (Banned)

The following are explicitly banned in TerraOps UI:

- ❌ **No emojis** — not even in empty states or toast messages
- ❌ **No Inter font** — replaced by Geist/Geist Mono for premium positioning
- ❌ **No pure black (#000000)** — use Void Ink (#06090f) minimum
- ❌ **No neon outer glows** — the brand accent has ONE inner glow via box-shadow on the logo only
- ❌ **No oversaturated accent proliferation** — one brand accent, used purposefully
- ❌ **No gradient text on headlines** — weight and color contrast only
- ❌ **No custom mouse cursors**
- ❌ **No 3-equal-column card grids** — use 4-KPI-bar or asymmetric layouts
- ❌ **No AI copywriting clichés** ("Unleash", "Seamless", "Elevate", "Next-Gen")
- ❌ **No multiple accent colors** — Emerald is the single brand signal, semantic colors (amber/red/blue) are data-only
- ❌ **No scroll-to-explore indicators, scroll arrows, bouncing chevrons**
- ❌ **No centered hero layouts** (the app shell is already left-aligned by sidebar architecture)
- ❌ **No invented metrics or fabricated data** — all displayed numbers come from the live API
- ❌ **No "SYSTEM // 2024" label-slash-year formatting**
- ❌ **No generic placeholder names** (John Doe, Acme Corp, etc.)
- ❌ **No circular loading spinners** — skeleton shimmer only
- ❌ **No elements overlapping each other** — strict spatial separation

## 8. Design System Notes for Stitch Generation

### Atmosphere Language
"Deep-space analytical cockpit. Clinical midnight surfaces layered from void to card. Single bioluminescent emerald accent marking positive action and environmental signal. Weight-driven typographic hierarchy using geometric grotesque. No decoration — only function."

### Color References (for prompting)
- Background base: Void Ink (#06090f)
- Panel surface: Elevated Card (#161b24)  
- Brand CTA: Bioluminescent Emerald (#00d47e)
- Warning data: Signal Amber (#e3b341)
- Error/critical: Alert Crimson (#f85149)
- Data series: Data Blue (#58a6ff)
- Text primary: Platinum (#e6edf3)
- Text secondary: Slate (#8b949e)

### Component Prompts
- "A KPI card on Elevated Card surface, Geist Mono value in 1.65rem/700 weight, Platinum color. 2px brand-colored bottom stripe. 20px padding. Whisper border. Hover lifts 2px."
- "A data table with Void Ink sticky header in 0.72rem ALL-CAPS Slate labels. Hover Ghost row hover. Geist Mono right-aligned numeric cells. Chip severity badges with 12% tinted fill."
- "A sidebar nav item: icon + label, Elevated Card hover, Emerald brand-dim active state with Emerald text and 20% opacity border."
