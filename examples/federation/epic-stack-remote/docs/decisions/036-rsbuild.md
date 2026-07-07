# Adopting Rsbuild

Date: 2024-02-22

Status: accepted

## Context

This app uses Rsbuild via `rsbuild-plugin-react-router` to replace the existing Remix compiler path.

Using rsbuild also means we get better hot module replacement, a thriving ecosystem
of tools, and shared efforts with other projects using rsbuild.

If we don't adopt rsbuild, we'll be stuck on Remix v2 forever 🙃 The Rsbuild path keeps the app aligned with this repository.

That said, we currently have a few route modules that mix server-only utilities
with server/client code. In rsbuild, you cannot have any exported functions which
use server-only code, so those utilities will need to be moved. Luckily, the
rsbuild plugin will fail the build if it finds any issues so if it builds, it
works. Additionally, this will help us make a cleaner separation between server
and server/client code which is a good thing.

The simple rule is this: if it's a Remix export (like `loader`, or `action`)
then it can be in the route. If it's our own utility export (like
`requireRecentVerification` we had in the `/verify` route) then it needs to go
in a `.server` file. To be clear, if you don't export it, then it's fine.
Server-only utility functions are fine in routes. It just becomes a problem for
remix when they are exported.

An interesting exception to this is sever-only code in the `handle` export like
the [`getSitemapEntries` function](https://github.com/nasa-gcn/remix-seo). For
this, you need to use
server-only route-module boundaries.

## Decision

Adopt Rsbuild.

## Consequences

Almost everything is better. We have slightly more complicated rules around the
server/client code separation, but for the most part that's better and there are
fewer surprises.
