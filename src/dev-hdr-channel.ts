import { randomUUID } from 'node:crypto';
import type { RsbuildDevServer } from '@rsbuild/core';

export const DEV_HDR_UPDATE_EVENT = 'react-router:hdr-update';

export const createDevHdrChannel = ({
  hot,
  isEnabled,
}: {
  hot: RsbuildDevServer['environments'][string]['hot'];
  isEnabled: () => boolean;
}) => {
  const sessionId = randomUUID();
  let revision = 0;
  let closed = false;
  const payload = () => ({
    event: DEV_HDR_UPDATE_EVENT,
    data: { sessionId, revision },
  });
  const unsubscribe = hot.onConnect(client => {
    if (!closed && isEnabled() && revision > 0) {
      client.send('custom', payload());
    }
  });

  return {
    publish(): void {
      if (closed || !isEnabled()) return;
      revision += 1;
      hot.send('custom', payload());
    },
    close(): void {
      if (closed) return;
      closed = true;
      unsubscribe();
    },
  };
};
