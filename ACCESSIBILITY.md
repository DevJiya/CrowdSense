# Accessibility Statement for CrowdSense AI

CrowdSense AI is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

## Conformance Status
The CrowdSense AI platform follows the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA** standards.

## Accessibility Features Implemented

### 1. Semantic HTML5 Structure
- The application uses a robust semantic structure including `<header>`, `<main>`, `<nav>`, `<aside>`, and `<section>` tags.
- Proper heading hierarchy (`h1`, `h2`) is maintained throughout the interface.

### 2. ARIA Implementation
- **Live Regions**: Dynamic updates such as AI chat responses, system alerts, and real-time telemetry markers use `aria-live` (polite/assertive) to ensure screen reader users are notified of changes.
- **Roles & Labels**: All interactive elements (buttons, inputs, navigation links) include descriptive `aria-label` or `aria-current` attributes.
- **Contextual Clarity**: Decorative elements are hidden from screen readers using `aria-hidden="true"`.

### 3. Keyboard Navigability
- All interactive components are fully navigable using the keyboard alone (Tab, Enter, Space).
- Explicit focus indicators (visual rings) are implemented for all focusable elements.
- Custom interactive cards support keyboard activation via `Enter`.

### 4. Visual Accessibility
- **High-Contrast Theme**: The interface uses a sleek, high-contrast dark theme optimized for readability.
- **Non-Color Indicators**: Critical security states (Risk Level, Threat Level) use text labels (CRITICAL, ELEVATED, NOMINAL) and icons, ensuring information is never conveyed by color alone.
- **Typography**: Uses modern, highly legible sans-serif fonts (Inter) with appropriate sizing.

## Feedback & Complaints
We welcome your feedback on the accessibility of CrowdSense AI. Please let us know if you encounter accessibility barriers:

- **Vulnerability / Accessibility Reporting**: [https://github.com/DevJiya/CrowdSense/security/advisories](https://github.com/DevJiya/CrowdSense/security/advisories)
- **GitHub Issues**: Please open an issue on our repository with the label `accessibility`.

We aim to respond to accessibility feedback within 2 business days.
