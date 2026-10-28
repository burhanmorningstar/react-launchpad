# Manual Accessibility (a11y) Testing Guide

This guide establishes the manual verification protocol for keyboard navigation, screen reader behavior, zoom/reflow, and high-contrast rendering across the React Launchpad design system.

---

## 1. Automated vs. Manual Boundary

Automated accessibility tools (such as `@axe-core/playwright` and Storybook a11y) catch roughly 30–50% of accessibility issues (contrast tags, missing ARIA attributes, duplicate IDs). The remaining issues require human and assistive tech verification:

- Logical focus flow and trap management
- Screen reader announce clarity and verbosity
- Visual affordances at 200% zoom
- Touch target sizing on small mobile viewports ($\ge 44 \times 44$ px)

---

## 2. Keyboard Navigation Protocol

### Global Navigation Rules

1. **Tab Key:** Advances focus forward through all interactive elements (links, buttons, inputs).
2. **Shift + Tab:** Advances focus backward.
3. **Space / Enter:** Activates buttons, links, toggles, and form controls.
4. **Escape:** Dismisses overlays (modals, dialogs, drawers, dropdown menus, command palettes). Focus must return to the trigger element.
5. **Arrow Keys:** Navigates radio groups, tabs, slider controls, and data table rows.

### Critical Focus Checks

- **Skip Link:** Pressing `Tab` on first page load must reveal the skip link (`#main-content`) with high-contrast visible focus. Pressing `Enter` must transfer focus directly to `<main id="main-content">`.
- **Focus Rings:** Every interactive element must display a distinct ring (`ring-2 ring-primary ring-offset-2`). Never suppress focus outlines with `outline-none` unless accompanied by a custom focus indicator.
- **Focus Trap:** When a modal or dialog is open, pressing `Tab` must cycle exclusively within the modal content until closed.

---

## 3. Screen Reader Testing Procedures

### VoiceOver (macOS / iOS)

- **Turn On/Off:** `Cmd + F5`
- **VoiceOver Modifier:** `Control + Option` (`VO`)
- **Next Item:** `VO + Right Arrow`
- **Previous Item:** `VO + Left Arrow`
- **Activate Item:** `VO + Space`
- **Rotor Menu:** `VO + U` (Check Headings, Landmarks, Links, Form Controls)

### NVDA (Windows)

- **Turn On/Off:** `Ctrl + Alt + N` / `Insert + Q`
- **NVDA Modifier:** `Insert` or `Caps Lock`
- **Next Line / Item:** `Down Arrow`
- **Next Heading:** `H` (or `1-6` for heading levels)
- **Next Landmark:** `D`
- **Next Button:** `B`
- **Next Form Field:** `F`

### Verification Checklist:

- [ ] Every icon-only button possesses an `aria-label` describing the action (e.g. "Close dialog", "Toggle theme", "Delete user").
- [ ] Form errors announce validation messages on blur or submit.
- [ ] Loading spinners and skeleton screens communicate state via `aria-busy="true"` or `role="status"`.
- [ ] Modals announce their title via `aria-labelledby` and description via `aria-describedby`.

---

## 4. Zoom and Responsive Reflow (WCAG 1.4.10)

1. Open the application in Google Chrome or Firefox at $1280 \times 1024$ viewport.
2. Zoom to **200%** (`Ctrl + +` / `Cmd + +`).
3. Zoom to **400%** (mobile reflow boundary).
4. Verify:
   - No two-dimensional scrolling (content stacks vertically into a single column).
   - No text overlaps, clippings, or hidden action buttons.
   - Fixed headers and navigation bars do not consume more than 30% of the visible viewport.

---

## 5. Color Contrast (WCAG 1.4.3 & 1.4.11)

- **Normal Text (< 18pt / 24px):** Minimum contrast ratio of **4.5:1** against adjacent background.
- **Large Text ($\ge$ 18pt / 24px bold or 24pt):** Minimum contrast ratio of **3:1**.
- **UI Components & Graphical Objects:** Minimum contrast ratio of **3:1** (e.g. input borders, toggle switches, active states).
- Verify both **Light Mode** and **Dark Mode** color tokens using WebAIM Contrast Checker or DevTools CSS Overview.

---

## 6. Bidirectionality & Localization (RTL)

When switching to an RTL locale (or setting `<html dir="rtl">`):

- Direction-sensitive icons (e.g. arrows, back buttons, chevron menus) mirror appropriately.
- Padding and margins flip (`ps-` / `pe-`, `start-` / `end-` instead of hardcoded `left`/`right`).
- Text alignment flows from right to left naturally without horizontal distortion.
