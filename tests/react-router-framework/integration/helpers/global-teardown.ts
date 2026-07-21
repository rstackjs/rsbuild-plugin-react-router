import { cleanupOrphanedTestProcesses } from "./test-resource-guard.js";

export default function globalTeardown() {
  cleanupOrphanedTestProcesses();
}
