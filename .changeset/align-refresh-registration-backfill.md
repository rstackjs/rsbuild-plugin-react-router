---
'rsbuild-plugin-react-router': patch
---

Align the Fast Refresh registration backfill with react-refresh's own
component-detection rules so `memo`/`forwardRef` components in pre-lowered
(MDX) routes register for HMR. Multi-declarator lists, curried arrows, and
require/import interop callees no longer produce false registrations.
