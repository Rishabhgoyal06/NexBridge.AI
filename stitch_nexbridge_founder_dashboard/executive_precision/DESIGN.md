---
name: Executive Precision
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#404940'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#707a6f'
  outline-variant: '#bfc9bd'
  surface-tint: '#1f6c3a'
  primary: '#004c22'
  on-primary: '#ffffff'
  primary-container: '#166534'
  on-primary-container: '#93e0a2'
  inverse-primary: '#8bd79b'
  secondary: '#625e59'
  on-secondary: '#ffffff'
  secondary-container: '#e5ded8'
  on-secondary-container: '#66625d'
  tertiary: '#3a433e'
  on-tertiary: '#ffffff'
  tertiary-container: '#515a55'
  on-tertiary-container: '#c8d1ca'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a6f4b5'
  primary-fixed-dim: '#8bd79b'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#005226'
  secondary-fixed: '#e8e1db'
  secondary-fixed-dim: '#ccc5bf'
  on-secondary-fixed: '#1e1b17'
  on-secondary-fixed-variant: '#4a4641'
  tertiary-fixed: '#dce5de'
  tertiary-fixed-dim: '#c0c9c2'
  on-tertiary-fixed: '#151d19'
  on-tertiary-fixed-variant: '#404944'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.005em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an editorial, high-trust SaaS interface tailored for startup founders and executive decision-makers. The aesthetic rejects aggressive tech neon and visual clutter in favor of intentional whitespace, disciplined geometry, and an understated utilitarian poise reminiscent of modern productivity tools.

Key brand tenets:
- **Calm Authority**: Muted tones, warm off-white canvas surfaces, and natural forest green accents create a focused, low-stress operational environment.
- **Structural Legibility**: Tight letter-spacing, hairline architectural borders, and strict typographic hierarchy provide immediate data scannability.
- **Tactile Softness**: 16px radius cards, whisper-soft diffuse shadows, and organic pill elements ensure dense analytical data feels accessible and human.

## Colors

The palette is engineered around an editorial canvas hierarchy:
- **Canvas Base**: `#F6F5F2` sets an organic, warm off-white tone that prevents screen glare and sets off pure white cards.
- **Surfaces**: `#FFFFFF` pure white containers float over the canvas, structured by `#ECEAE4` hairline borders.
- **Ink Tiers**: Text hierarchy is strictly mapped to `#111111` for high-impact titles and metrics, `#57534E` for body copy and contextual descriptions, and `#A8A29E` for disabled states, timestamps, and subtle hints.
- **Primary Accent**: `#166534` deep forest green is reserved for primary commitment actions, active navigational states, and positive indicators. Paired with `#E8F1EA` for subtle background fills, selections, and muted tags.
- **Semantic Accents**: Critical feedback uses `#B91C1C` text against a `#FEE2E2` wash. Warning states use `#B45309` resting on `#FEF3C7`.

## Typography

The type scale relies entirely on Inter with dense, negative tracking to mimic tight editorial typesetting:
- **Headlines**: Semi-bold weight with optical negative letter-spacing (`-0.02em` to `-0.03em`) creates a concise, publication-grade tone for section headers and KPI metrics.
- **Body Text**: Normal weight set with generous line heights to preserve long-form reading comfort across executive summaries, AI-generated action briefs, and board updates.
- **Labels & Microcopy**: Medium weight with neutral to slightly positive tracking for badges, table column headers, and breadcrumbs to ensure legibility at micro dimensions.

## Layout & Spacing

The layout is built on an architectural 12-column grid with a maximum content container width of 1440px:
- **Desktop (1024px+)**: 12 columns with 24px gutters and 32px margins. Modules align in clean 3, 4, 6, or 12-column increments.
- **Tablet (768px - 1023px)**: 8 columns with 16px gutters and 24px outer margins. Multi-column dashboards collapse into dual-column grids.
- **Mobile (<768px)**: 4 columns with 16px gutters and 16px outer canvas margins. Multi-column widgets collapse into a single vertical stack.
- **Vertical Rhythm**: Layout components adhere to an 8px baseline rhythm. Dense metric cards utilize `space-md` (16px) internal padding, while macro cards and analytical dashboards use `space-lg` (24px) to create an airy editorial feel.

## Elevation & Depth

Visual hierarchy relies on structural hairline delineation layered over whisper-thin atmospheric shadows rather than heavy drop shadows:
- **Level 0 (Canvas)**: Background `#F6F5F2` without shadows or borders.
- **Level 1 (Cards & Modules)**: Pure white `#FFFFFF` surface enclosed by a 1px solid `#ECEAE4` hairline border and an ambient shadow: `0px 1px 3px rgba(17, 17, 17, 0.04), 0px 4px 12px rgba(17, 17, 17, 0.02)`.
- **Level 2 (Popovers & Dropdowns)**: Elevated panels, context menus, and select flyouts use `#FFFFFF`, a 1px `#ECEAE4` border, and an ambient shadow: `0px 4px 16px rgba(17, 17, 17, 0.06), 0px 8px 32px rgba(17, 17, 17, 0.04)`.
- **Level 3 (Modals & Sheets)**: Centered action modals use a 1px `#ECEAE4` border accompanied by an elevated shadow: `0px 12px 48px rgba(17, 17, 17, 0.12)` over a semi-transparent `#111111` backdrop with 20% opacity and 4px blur.

## Shapes

The shape system leverages level-2 roundedness (8px default, 16px for cards):
- **Base Components**: Inputs, buttons, segmented controls, and dropdown triggers use an 8px (`0.5rem`) border radius.
- **Structural Cards**: Primary content cards, dashboard panels, and modals use a prominent 16px (`1rem`, `rounded-lg`) corner radius, creating soft, tactile containers.
- **Specialized Pill & Circle Elements**: Status chips, tag badges, and AI quick-prompts use a fully pill-shaped (`9999px`) radius. User avatars and circular icon action buttons use a 50% circle geometry.
- **Stroke Weights**: All icon strokes, hairline borders, and dividers use a precise 1px or 1.5px stroke weight to sustain an ultra-sharp, high-craft finish.

## Components

- **Buttons**:
  - *Primary*: `#166534` solid fill, white text, 8px radius, height 40px, padding 0 16px. Subtle hover darkening to `#14532D`.
  - *Secondary*: `#FFFFFF` fill with 1px `#ECEAE4` border, `#111111` text, hover transition to `#F6F5F2`.
  - *Tertiary / Ghost*: Transparent background, `#57534E` text, hover transition to `#E8F1EA` with `#166534` text.
- **Cards**:
  - `#FFFFFF` surface, 16px radius, 1px `#ECEAE4` border, soft Level 1 shadow. Header, body, and footer separated by 1px horizontal `#ECEAE4` dividers when containing table data or analytical sections.
- **Chips & Badges**:
  - Pill geometry (`9999px`), height 24px, padding 2px 10px, typography `label-sm`.
  - *Selected / Active*: `#E8F1EA` fill, `#166534` text.
  - *Warning*: `#FEF3C7` fill, `#B45309` text.
  - *Error*: `#FEE2E2` fill, `#B91C1C` text.
- **Inputs & Form Controls**:
  - Height 40px, 8px radius, `#FFFFFF` background, 1px `#ECEAE4` border, `#111111` value text, `#A8A29E` placeholder. Focus state displays a crisp 1px `#166534` border with a 2px `#E8F1EA` outer ring.
- **Checkboxes & Radios**:
  - Checkboxes use 4px radius; radios are circular. 16px outer size with 1.5px `#A8A29E` stroke. When active: `#166534` fill, white check icon.
- **Lists & Data Tables**:
  - Row height 48px, horizontal borders using 1px `#ECEAE4`. Row hover introduces `#F6F5F2` background tint. Text aligned with numeric tabular figures for financial/metric comparison.
- **AI Action Bar**:
  - Floating bottom bar with `#FFFFFF` background, 9999px pill radius, Level 2 elevation shadow, 1px `#ECEAE4` border, containing an integrated input, microphone icon, and `#166534` action trigger.