# MUTESOUND Design System

## 1. Atmosphere & Identity

MUTESOUND should feel like a measured acoustic engineering studio: calm, exact, practical, and credible. The signature is real site evidence presented with quiet industrial precision: sharp 2px radii, thin construction-line borders, off-white surfaces, navy technical panels, and actual project photography leading the story.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
|------|-------|-------|------|-------|
| Surface/page | --ms-surface-page | #f7f9fb | #131b2e | Main page background |
| Surface/band | --ms-surface-band | #f2f4f6 | #0f1218 | Alternating section bands |
| Surface-muted | --ms-surface-muted | #eceef0 | #1a1a20 | Placeholders, dividers, subtle fills |
| Surface-card | --ms-surface-card | #ffffff | #182238 | Cards, form panels, thumbnails |
| Text/primary | --ms-text-primary | #191c1e | #f7f9fb | Headlines, primary body |
| Text/secondary | --ms-text-secondary | #45464d | #eceef0 | Paragraphs and supporting copy |
| Text/muted | --ms-text-muted | #76777d | #bec6e0 | Captions, labels, metadata |
| Border/default | --ms-border-default | #c6c6cd | rgba(236,238,240,0.15) | Cards, nav, section boundaries |
| Brand/navy | --ms-brand-navy | #131b2e | #131b2e | Dark panels, icon tiles, contact section |
| Brand/ink | --ms-brand-ink | #191c1e | #f7f9fb | Primary CTA and high-contrast text |
| Brand/blue-gray | --ms-brand-blue-gray | #bec6e0 | #bec6e0 | Logo light strokes, dark-section accents |
| Status/error | --ms-status-error | #b3261e | #ffb4ab | Form submission error |

### Rules

- Use the navy and ink tokens for conversion actions, never as decoration-only color.
- Keep the palette mostly monochrome and material-led. The actual project photos provide warmth and color variation.
- Do not introduce saturated accent colors unless a new semantic role requires it and this file is updated first.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| Display | 64px desktop, 38px tablet, 30px mobile | 700 | 1.1 | 0 | Hero headline |
| H1 | 40-42px desktop, 26px tablet, 22px mobile | 600 | 1.2-1.3 | 0 | Section headlines |
| H2 | 32-38px | 600 | 1.3 | 0 | Secondary section headers |
| H3 | 20-24px | 600-700 | 1.4 | 0 | Card and process titles |
| Body/lg | 17-18px | 400 | 1.6-1.8 | 0 | Lead paragraphs |
| Body | 15-16px | 400-500 | 1.6-1.7 | 0 | Default copy and nav |
| Body/sm | 13-14px | 400-600 | 1.5 | 0 | Metadata, helper text |
| Overline | 12px | 700 | 1.4 | 0.1em | Section category labels |

### Font Stack

- Primary: Pretendard, system-ui, -apple-system, BlinkMacSystemFont, sans-serif
- Mono: not used in the shipped page
- Serif: not used

### Rules

- Korean display text should avoid awkward one-syllable orphan lines; reduce size before allowing broken phrases.
- Body copy must stay at or above 14px.
- Letter spacing is only used for small uppercase English/Korean section labels.

## 4. Spacing & Layout

### Base Unit

All spacing derives from a 4px base.

| Token | Value | Usage |
|-------|-------|-------|
| --ms-space-1 | 4px | Icon strokes, small offsets |
| --ms-space-2 | 8px | Icon-label gaps |
| --ms-space-3 | 12px | Button and thumbnail gaps |
| --ms-space-4 | 16px | CTA horizontal groups, form rhythm |
| --ms-space-5 | 20px | Mobile section padding and card internals |
| --ms-space-6 | 24px | Grid gaps, card padding |
| --ms-space-8 | 32px | Large card padding, subsection gaps |
| --ms-space-10 | 40px | Form panel and content blocks |
| --ms-space-12 | 48px | Header-to-grid gaps |
| --ms-space-16 | 64px | Desktop horizontal page padding |
| --ms-space-20 | 80px | Fixed nav height |
| --ms-space-30 | 120px | Desktop section vertical padding |

### Grid

- Max content width: 1280px.
- Desktop gutters: 64px. Tablet/mobile gutters: 20-24px.
- Breakpoints currently used: 900px and 540px.
- Primary layouts: 4-column stats, 3-column case/service grid, 4-column process grid, 2-column story/about/contact sections.

### Rules

- Multi-column layouts collapse intentionally at 900px and 540px.
- Fixed-format UI elements such as thumbnails and video cards use aspect-ratio to prevent layout shift.
- Page sections are full-width bands; cards are reserved for repeated portfolio, service, process, FAQ, and form surfaces.

## 5. Components

### Fixed Navigation
- **Structure**: fixed top nav with logo, four anchors, primary CTA, and mobile menu toggle.
- **Variants**: desktop inline nav, mobile dropdown menu.
- **Spacing**: --ms-space-4 to --ms-space-16.
- **States**: hover opacity, focus-visible outline, expanded mobile menu.
- **Accessibility**: button uses `aria-expanded`, `aria-controls`, and descriptive labels.
- **Motion**: menu icon swaps instantly; no decorative motion.

### Hero
- **Structure**: full-viewport image-backed section, dark gradient overlay, left-aligned copy, two CTAs.
- **Variants**: desktop left-aligned over image, mobile stacked CTAs.
- **Spacing**: --ms-space-6 to --ms-space-20.
- **States**: CTA hover/focus/active.
- **Accessibility**: background image is decorative because the portfolio section exposes the actual project images with labels.
- **Motion**: no scroll cue; avoids unnecessary infinite animation.

### Portfolio Gallery Card
- **Structure**: image viewport, thumbnail pager, optional arrows, project title and location.
- **Variants**: different image counts per project.
- **Spacing**: --ms-space-2 to --ms-space-6.
- **States**: active thumbnail ring, hover/focus controls, swipe on touch.
- **Accessibility**: controls should be real buttons with labels; title/locations remain visible text.
- **Motion**: transform-only slide transitions; auto-advance stops for reduced-motion users.

### Service Card
- **Structure**: icon tile, title, short body, two proof points.
- **Variants**: three equal service categories.
- **Spacing**: --ms-space-5 to --ms-space-8.
- **States**: desktop hover lift and shadow, focus-visible when interactive.
- **Accessibility**: icons are decorative because text carries the meaning.
- **Motion**: transform and shadow on hover only.

### FAQ Accordion
- **Structure**: list of button headers controlling answer panels.
- **Variants**: one panel open by default.
- **Spacing**: --ms-space-6 to --ms-space-8.
- **States**: expanded/collapsed with `aria-expanded`.
- **Accessibility**: keyboard operable through native buttons.
- **Motion**: max-height/opacity transition.

### Consultation Form
- **Structure**: labeled fields for name, phone, space type, message, submit button, error/success states.
- **Variants**: default, loading, success, error.
- **Spacing**: --ms-space-3 to --ms-space-10.
- **States**: required validation, disabled loading button, inline error, success replacement.
- **Accessibility**: labels are visible, required fields use native validation, error area uses alert semantics.
- **Motion**: no decorative motion.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
|------|----------|--------|-------|
| Micro | 150-200ms | ease-out | Focus, hover, active feedback |
| Standard | 300ms | cubic-bezier(0.4,0,0.2,1) | Cards, FAQ, menus |
| Gallery | 600ms | cubic-bezier(0.4,0,0.2,1) | Case image slide transition |

### Rules

- Animate only transform, opacity, and non-layout visual affordances.
- Respect `prefers-reduced-motion`; disable non-essential animation and gallery auto-advance.
- Motion must communicate state, hierarchy, or interaction feedback.

## 7. Depth & Surface

### Strategy

Mixed, with borders as the default and shadows only for hovered cards.

| Level | Value | Usage |
|-------|-------|-------|
| Border/default | 1px solid var(--ms-border-default) | Cards, nav, dividers |
| Hover shadow | 0 20px 40px rgba(15,23,42,0.07) | Service card hover |
| Glass nav | rgba(247,249,251,0.85) + blur(20px) | Fixed navigation |
| Hero overlay | linear-gradient over real photo | First viewport contrast and image legibility |

### Rules

- Rounded corners stay sharp: 2px for most UI, 4px for small icon tiles.
- Do not nest cards inside cards.
- Dark sections use tonal contrast and thin borders rather than heavy drop shadows.
