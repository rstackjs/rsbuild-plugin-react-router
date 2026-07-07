import {
  cleanupOrphanedTestProcesses,
  ensureFrameworkTestRunId,
} from "./test-resource-guard.js";

export default function globalSetup() {
  ensureFrameworkTestRunId();
  cleanupOrphanedTestProcesses();
}
