# Design System Specification: Clinical Precision & Tonal Depth

## 1. Overview & Creative North Star: "The Sterile Architect"
This design system moves away from the "flat and friendly" SaaS aesthetic toward a **High-End Clinical Editorial** experience. In a surgical and medical context, the UI must project absolute precision, calm, and high-tech authority.

The Creative North Star for this system is **"The Sterile Architect."** We treat the digital interface like a high-end surgical suite: organized, hyper-clean, and intentionally layered. We break the standard "box-and-grid" template by using **Tonal Layering** and **Asymmetric Breathing Room**. Instead of containment, we focus on flow; instead of borders, we focus on elevation. The goal is a "signature" feel where the interface feels like an expensive piece of medical instrumentation—intentional, professional, and sophisticated.

---

## 2. Colors & Surface Architecture

The palette is a sophisticated interplay between the warmth of the `surface` (cream) and the clinical sharpness of the `primary` (cyan).

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` card sits on a `surface` background. If you feel the need for a line, use a 24px vertical gap instead.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine paper or frosted medical-grade glass.
*   **Base:** `surface` (#faf9f5) — The foundational "operating table."
*   **Sections:** `surface-container-low` (#f4f4f0) — For secondary content areas.
*   **Active Modules:** `surface-container-highest` (#e3e2df) — To draw immediate focus without using color.

### The Glass & Gradient Rule
To achieve a "high-tech" feel without "gamer" glows, use **Glassmorphism** for floating elements (modals, tooltips, or persistent nav). Apply `surface` at 80% opacity with a 20px `backdrop-blur`. 
*   **Signature Textures:** Use a subtle linear gradient for primary CTAs: `primary` (#00696b) to `primary-container` (#00ced1). This adds a "lithographic" depth that flat colors lack.

---

## 3. Typography: Technical Authority

We utilize a pairing of **Space Grotesk** (Technical/Headlines) and **Inter** (Functional/Body).

*   **Display & Headlines (Space Grotesk):** These are your architectural anchors. The monospaced-leaning terminals of Space Grotesk convey "data" and "precision." Use `display-lg` for high-impact metrics (e.g., heart rate, surgical duration) to give them an editorial weight.
*   **Body & Titles (Inter):** Inter is used for high-readability medical notes and patient data. It is neutral, allowing the cyan accents and technical headlines to take center stage.
*   **Hierarchy Note:** Use `label-md` in all caps with 0.05em letter spacing for "Metadata" or "System Status" to reinforce the clinical instrumentation aesthetic.

---

## 4. Elevation & Depth: Tonal Layering

We convey hierarchy through light and density rather than structural lines.

*   **The Layering Principle:** Depth is achieved by stacking tiers. Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a "soft lift" that feels integrated into the environment.
*   **Ambient Shadows:** For floating elements (Modals/Popovers), use "Invisible Shadows."
    *   *Values:* `0px 20px 40px rgba(27, 28, 26, 0.06)` (A tinted version of `on-surface`). Never use pure black or high-opacity shadows.
*   **The Ghost Border:** If accessibility requires a stroke (e.g., in high-glare environments), use `outline-variant` at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** Use for "Overlays." By letting the background cream bleed through a blurred cyan accent, you create a sense of environmental continuity.

---

## 5. Components

### Buttons
*   **Primary:** A gradient from `primary` to `primary-container`. `radius-md` (0.375rem). No shadow. On hover, increase the `primary-container` saturation.
*   **Secondary:** `surface-container-highest` background with `primary` text. This feels like a "soft-touch" physical button.
*   **Tertiary:** No background. `primary` text with a 2px `primary` underline on hover only.

### Cards & Lists
*   **The Rule:** No dividers. Use `surface-container-low` for the list container and `surface-container-lowest` for individual items to create separation. Use the Spacing Scale (24px or 32px) to define groups.
*   **Surgical Metadata:** Use `label-sm` in `secondary` (#515f74) for timestamps and ID numbers.

### Input Fields
*   **State:** Background should be `surface-container-lowest`. 
*   **Focus:** A 2px "Ghost Border" of `primary` at 40% opacity. No "glow."
*   **Error:** Use `error` (#ba1a1a) text for helper messages, but keep the input border subtle to avoid "visual panic."

### Specialized Medical Components
*   **The Vital Pulse (Micro-graph):** Use `primary` for data lines on a `surface-container-highest` background. Use a `1.5px` stroke width for an "etched" look.
*   **Status Badges:** Use `secondary-container` for neutral states and `tertiary-container` for critical alerts. Badges should be `radius-full` (capsule shape) with `label-sm` text.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use intentional asymmetry. Align high-level stats to the right while labels stay left to create an "instrument panel" feel.
*   **Do** use `primary` sparingly. It is a "laser"—it should point the eye to the most critical action or data point.
*   **Do** embrace the cream. The #faf9f5 background reduces eye strain in high-pressure medical environments compared to pure white.

### Don't:
*   **Don't** use 1px dividers. They clutter the clinical "sterile" field of the UI.
*   **Don't** use heavy drop shadows. They make the UI feel "dirty" and heavy.
*   **Don't** use rounded corners above `0.75rem` (xl). We want "professional precision," not "consumer friendliness."
*   **Don't** use high-contrast black. Use `on-surface` (#1b1c1a) for a softer, more premium "Slate" legibility.