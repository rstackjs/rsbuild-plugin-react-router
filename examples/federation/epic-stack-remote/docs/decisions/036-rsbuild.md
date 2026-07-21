# Adopting Rsbuild

Date: 2026-07-10

Status: accepted

## Context

This example originated in the Epic Stack's React Router/Vite setup. This
repository exercises the same framework behavior through
`rsbuild-plugin-react-router` and Rsbuild/Rspack. React Router's upstream Vite
plugin remains the behavioral reference; React Router does not provide a native
Rsbuild plugin.

## Decision

Use Rsbuild with `rsbuild-plugin-react-router` for this example.

## Consequences

The example uses Rsbuild configuration and scripts while preserving React
Router route-module, SSR, and development semantics. Bundler-specific
differences are implemented by this plugin and covered by the repository's
framework integration tests.
