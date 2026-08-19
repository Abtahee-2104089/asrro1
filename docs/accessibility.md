# Accessibility acceptance record

The target is WCAG 2.2 Level AA where practical across public, authentication, applicant, member, executive, finance, and administration surfaces.

## Release checks

- Run the strict accessibility lint rules through `bun run lint`.
- Confirm every route has one descriptive page title and a visible `h1`.
- Navigate every interactive control with keyboard only.
- Confirm visible focus styling and logical focus order.
- Verify labels, names, roles, status announcements, and error messages with a screen reader.
- Verify text and interface contrast in light and dark themes.
- Verify desktop, tablet, and mobile reflow at 200% zoom.
- Verify motion-sensitive interactions with reduced motion enabled.
- Verify membership cards, charts, icons, uploads, dialogs, tables, and exported documents have meaningful non-visual equivalents.

## Current exceptions

No exception is accepted indefinitely. Any failed criterion must be recorded here with its WCAG success criterion, affected route, user impact, compensating behavior, owner, and target date before a release can claim AA conformance.

The repository’s automated lint and React diagnostics are necessary but do not replace keyboard, contrast, zoom, and screen-reader testing. The final production acceptance record belongs in `docs/verification.md`.
