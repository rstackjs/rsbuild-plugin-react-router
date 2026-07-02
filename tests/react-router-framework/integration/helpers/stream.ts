import type { Readable } from "node:stream";
import waitOn from "wait-on";

export async function match(
  stream: Readable,
  pattern: string | RegExp,
  options: {
    /** Measured in ms */
    timeout?: number;
  } = {},
): Promise<RegExpMatchArray> {
  // Prepare error outside of promise so that stacktrace points to caller of `matchLine`
  const timeoutError = new Error(
    `Timed out - Could not find pattern: ${pattern}`,
  );
  return new Promise(async (resolve, reject) => {
    const timeout = setTimeout(
      () => reject(timeoutError),
      options.timeout ?? 10_000,
    );
    stream.on("data", (data) => {
      const line: string = data.toString();
      const matches = line.match(pattern);
      if (matches) {
        clearTimeout(timeout);
        const matchedUrl = typeof pattern === "string" ? pattern : matches[0];
        const waitForUrl =
          matchedUrl.startsWith("http://") || matchedUrl.startsWith("https://");

        Promise.resolve(
          waitForUrl
            ? waitOn({ resources: [matchedUrl], timeout: options.timeout ?? 10_000 })
            : undefined,
        )
          .then(() => resolve(matches))
          .catch(reject);
      }
    });
  });
}
