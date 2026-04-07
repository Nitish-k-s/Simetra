# Design System Strategy: Clinical Cybernetics

## 1. Overview & Creative North Star: "The Neon Surgeon"
This design system moves away from the clunky, weathered "low-life" cyberpunk trope and moves toward "High-Tech Clinical Precision." The North Star is **The Neon Surgeon**: an aesthetic that marries the sterile, absolute authority of a surgical suite with the aggressive, data-dense edge of a futuristic simulation.

We break the "standard web template" by embracing **hard-edged modularity** and **intentional asymmetry**. The UI is not a collection of boxes; it is a Heads-Up Display (HUD) projected onto the user’s retina. We prioritize light-emission over physical surfaces, using glows and transparency to suggest a UI made of light rather than pixels.

## 2. Colors: Chromatic Radiation
The palette is built on an absolute void (`surface-dim`), punctuated by high-energy light sources.

*   **The "No-Line" Rule:** Traditional 1px borders are strictly prohibited for layout containment. To separate the surgical feed from the data telemetry, use background shifts. A `surface-container-low` panel sitting on a `surface` background creates a "machined" look without the clutter of lines.
*   **Surface Hierarchy & Nesting:** Treat the UI as a series of optical lenses.
    *   **Base:** `surface-dim` (#0e0e0e) for the primary environment.
    *   **Secondary HUD Layers:** `surface-container` (#1a1919) for persistent sidebars.
    *   **Active Overlays:** `surface-container-highest` (#262626) for modal dialogs or critical data readouts.
*   **The "Glass & Gradient" Rule:** Use `primary` (#8ff5ff) with a 15% opacity and a 20px backdrop-blur for all floating panels. This creates a "glass-cockpit" effect.
*   **Signature Textures:** Interactive elements must feel radioactive. Apply a subtle linear gradient to primary CTAs transitioning from `primary` (#8ff5ff) to `primary-container` (#00eefc) at a 45-degree angle. This simulates the flicker of a high-refresh-rate monitor.

## 3. Typography: Technical Authority
We utilize a dual-font system to balance futuristic character with high-pressure legibility.

*   **Display & Headlines (Space Grotesk):** This is our "Technical Signature." Its wide apertures and geometric construction feel like data etched into glass. Use `display-lg` for vital patient statistics or system headers to command immediate attention.
*   **Body & Titles (Inter):** For surgical procedures and micro-copy, we use Inter. It provides the neutral, high-legibility required when lives (even simulated ones) are on the line.
*   **Hierarchy as Data Priority:** Use `label-md` in all-caps with 0.1em letter spacing for metadata (e.g., "HEART RATE," "OXYGEN SATURATION"). This moves the UI away from "website" and toward "instrumentation panel."

## 4. Elevation & Depth: Tonal Layering
In a world of light-based interfaces, shadows are rare; luminosity defines depth.

*   **The Layering Principle:** Depth is achieved by "stacking" luminosity. An inner component should use `surface-container-high` (#201f1f) to appear "closer" to the user than the `surface-container-low` (#131313) base.
*   **Ambient Glows (Not Shadows):** Instead of dark shadows, use "Light Leaks." For floating active elements, apply a glow using `surface-tint` (#8ff5ff) at 10% opacity with a 30px blur. This makes the component appear as if it is emitting light onto the surfaces behind it.
*   **The "Ghost Border" Fallback:** If a boundary is required for a text input or a critical card, use a "Ghost Border": 1px of `outline-variant` (#494847) at **15% opacity**. It should be felt, not seen.
*   **Sharp Edges:** All `borderRadius` tokens are set to `0px`. This is a non-negotiable rule. The system must feel sharp, dangerous, and precise.

## 5. Components: Surgical Instruments

### Buttons: High-Energy Actuators
*   **Primary:** Solid `primary` (#8ff5ff) background with `on-primary` (#005d63) text. Add a `0 0 15px` outer glow of the same color to simulate "Power On" state.
*   **Secondary:** No background. `primary` (#8ff5ff) Ghost Border (15% opacity). Text in `primary`. 
*   **Tertiary:** Text-only in `secondary` (#e5e2e1) with a subtle underline that appears only on hover.

### Input Fields: Telemetry Entries
*   **Styling:** Forgo the standard box. Use a bottom-only border of `outline` (#777575). When focused, the border transitions to `primary` (#8ff5ff) with a 2px height.
*   **Error State:** Border shifts to `tertiary` (#ff7073). Helper text appears in `error` (#ff716c) with a subtle "flicker" animation on entry.

### Cards & Data Modules
*   **The Forbid Rule:** No divider lines. Separate content using `body-sm` labels as headers and vertical white space (32px increments).
*   **Backgrounds:** Use `surface-container-low` for inactive modules and `surface-container-high` for active surgical steps.

### Specialized Components
*   **The "Biometric Pulse":** A custom progress bar component using a `primary` to `primary-dim` gradient that pulses slowly (2s duration) to indicate system vitality.
*   **Status Beacons:** Small 4x4px squares using `tertiary` (#ff7073) for "Critical" and `primary` (#8ff5ff) for "Stable."

## 6. Do's and Don'ts

### Do:
*   **Embrace the Void:** Let the black background breathe. Space is a luxury in a data-heavy environment.
*   **Use Asymmetry:** Place critical alerts slightly off-center or in corner "HUD brackets" to create a sense of advanced scanning.
*   **Iterate on "Active" States:** An active state shouldn't just change color; it should increase in luminosity (e.g., adding a glow or increasing the opacity of a container).

### Don't:
*   **Don't Round Corners:** Rounding even a single corner to 2px destroys the "machined" surgical aesthetic.
*   **Don't Use Grey for Depth:** Use the `surface-container` tiers. Pure greys look "web-standard"; our containers must feel like they have depth and "electronic" substance.
*   **Don't Over-Red:** Use `tertiary` (#ff7073) sparingly. If everything is red, nothing is an emergency. It should be reserved for bleeding, system failure, or terminal errors.