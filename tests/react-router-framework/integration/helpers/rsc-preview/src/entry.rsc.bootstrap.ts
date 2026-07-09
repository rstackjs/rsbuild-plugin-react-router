// The `use server-entry` directive makes the rspack RSC runtime wrap this
// module's server-component export with `createServerEntry`. That attaches the
// global client bootstrap scripts (`__rspack_rsc_manifest__.entryJsFiles`, i.e.
// the compiled browser entry) as `entryJsFiles` on the export.
//
// This lives in its own template-owned module (rather than on a route module
// like `root.tsx`) because the integration tests inject their own
// `src/routes/root.tsx` per fixture, which would drop the directive. entry.rsc
// reads `ClientBootstrap.entryJsFiles` and forwards it to the SSR renderer as
// `bootstrapScripts` so the server-rendered document boots the browser bundle
// and hydrates. `entryJsFiles` is manifest-global, so any server-entry export
// yields the same client bootstrap list.
"use server-entry";

export function ClientBootstrap(): null {
  return null;
}
