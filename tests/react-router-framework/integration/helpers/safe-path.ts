import path from "node:path";

export function resolvePathWithinRoot(
  rootDirectory: string,
  requestPath: string,
  ...segments: string[]
): string | undefined {
  const rootPath = path.resolve(rootDirectory);
  const candidatePath = path.resolve(rootPath, `.${requestPath}`, ...segments);
  if (
    candidatePath !== rootPath &&
    !candidatePath.startsWith(`${rootPath}${path.sep}`)
  ) {
    return undefined;
  }
  return candidatePath;
}
