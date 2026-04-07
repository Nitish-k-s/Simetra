# Design System Specification: Clinical Precision & Tonal Depth

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Surgeon"**

This design system moves away from the generic "tech-bro" aesthetic to embrace a philosophy of **Clinical Precision**. We are building a space that feels as sterile, organized, and high-trust as a modern surgical suite, but with the editorial soul of a premium medical journal. 

Unlike standard medical apps that rely on heavy borders and loud alerts, this system utilizes **Tonal Layering** and **Intentional Asymmetry**. We break the "template" look by using exaggerated typographic scales and overlapping surfaces that suggest a sophisticated, multi-dimensional data environment. The goal is "High-Trust Modernism": where every pixel feels intentional, and every piece of data is given the breath it needs to be interpreted accurately.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep, authoritative teals and navies, balanced by a sophisticated range of "cool" neutrals that prevent the UI from feeling flat or sterile.

### The Color Tokens
*   **Primary (The Precision Core):** `#00647c` (Deep Teal). Used for primary actions and brand presence.
*   **Secondary (The Authority):** `#565e74` (Muted Navy). Used for secondary data points and structural elements.
*   **Tertiary (The Insight):** `#894e00` (Amber). Used sparingly for high-attention data insights or warnings that require professional nuance.
*   **Surface Hierarchy:**
    *   `surface`: `#f7f9fb` (Base background)
    *   `surface_container_low`: `#f2f4f6`
    *   `surface_container_highest`: `#e0e3e5` (Top-tier floating elements)

### The "No-Line" Rule
Standard UI relies on 1px borders to separate content. **This system prohibits 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. For example, a `surface_container_low` section sitting directly on a `surface` background provides enough contrast to define a zone without creating visual "noise" that distracts from clinical data.

### Signature Textures: The Gradient Pulse
To inject "soul," use a subtle linear gradient (45-degree) from `primary` (#00647c) to `primary_container` (#007f9d) for hero CTA buttons and primary dashboard headers. This creates a sense of depth and "active energy" that flat teal cannot achieve.

---

## 3. Typography: Editorial Authority
We use a high-contrast pairing of **Space Grotesk** (Display/Headlines) and **Inter** (Body/Labels) to balance technological edge with human readability.

*   **Display & Headline (Space Grotesk):** These should be used with generous letter-spacing (approx -0.02em). The geometric nature of Space Grotesk provides the "precise" feel. 
    *   *Scale Example:* `display-lg` (3.5rem) should be used for critical KPIs or hero statements to command immediate attention.
*   **Title & Body (Inter):** Inter is used for all functional and clinical data. It is highly legible at small scales.
*   **Hierarchy as Brand:** Use `headline-lg` (2rem) in `primary` color against a `surface_container_low` background to create a clear editorial anchor for every page.

---

## 4. Elevation & Depth
In this system, depth is a functional tool for data organization, not just an aesthetic choice.

### The Layering Principle
Stacking surfaces creates "Nested Importance."
1.  **Level 0:** `surface` (#f7f9fb) — The foundation.
2.  **Level 1:** `surface_container_low` (#f2f4f6) — Large content areas/sections.
3.  **Level 2:** `surface_container_highest` (#e0e3e5) — Individual cards or interactive modules.

### The "Ghost Border" Fallback
If a border is required for accessibility in high-density data tables, use the `outline_variant` token at **20% opacity**. This creates a "Ghost Border"—it is felt rather than seen, maintaining the "No-Line" aesthetic.

### Ambient Shadows
For floating modals or tooltips, use a **Global Ambient Shadow**:
*   `Shadow:` 0px 12px 32px rgba(25, 28, 30, 0.06)
*   The shadow is tinted with the `on_surface` color, making it look like a natural occlusion of light rather than a dark grey smudge.

---

## 5. Components

### Buttons
*   **Primary:** A gradient fill (Primary to Primary-Container) with `xl` (0.75rem) rounded corners. This provides a "soft-tech" feel.
*   **Tertiary:** No background, no border. Use `title-sm` typography in `primary` color. Interaction is shown through a subtle `surface_container_high` background reveal on hover.

### Cards & Data Modules
*   **Strict Rule:** No dividers. Use 24px or 32px of vertical white space to separate content groups within a card.
*   **Surface:** Use `surface_container_lowest` (#ffffff) for the card body to make it "pop" against the `surface` background.

### Input Fields
*   **Style:** Minimalist. No bottom line, no full border. Use a subtle `surface_container_high` fill with a `md` (0.375rem) radius.
*   **Focus State:** The background remains static, but a 2px `primary` "pill" appears vertically at the left edge of the input to indicate focus.

### Glassmorphism Overlays
For patient sidebars or quick-action menus, use a `surface_container_lowest` background with **60% opacity** and a **20px Backdrop Blur**. This allows the clinical data beneath to remain visible but softly obscured, maintaining the user's context.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use extreme white space. If you think there is enough padding, add 8px more. Medical data requires "mental breathing room."
*   **Do** use `secondary_fixed` (#dae2fd) for subtle highlighting of active states in navigation.
*   **Do** align text-heavy headers to a 12-column grid, but allow visual imagery or data visualizations to "break the grid" and bleed into the margins.

### Don't:
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#191c1e) to maintain a soft, premium feel.
*   **Don't** use standard shadows. If a component needs to feel "elevated," use a background color shift first.
*   **Don't** use 1px dividers to separate list items. Use an 8px gap and a subtle hover state shift to `surface_container_low`.

---