
import { serverOnly$ } from "vite-env-only/macros";

import { serverOnly as serverOnlyFile } from "~/utils.server";
import serverOnlyDir from "~/.server/utils";

export const handle = {
  escapeHatch: serverOnly$(async () => {
    return { serverOnlyFile, serverOnlyDir };
  })
}

export default () => <h1 data-title>This should work</h1>;
    