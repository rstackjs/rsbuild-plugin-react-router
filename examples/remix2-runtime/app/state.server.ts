import { createHash } from 'node:crypto';

export const SERVER_ONLY_SENTINEL = 'REMIX2_LOADER_ONLY_NODE_SENTINEL';
let revision = 0;

export function readState() {
  return {
    message: 'native-loader-v1',
    revision,
    digest: createHash('sha256').update(SERVER_ONLY_SENTINEL).digest('hex').slice(0, 8),
  };
}

export function mutateState() {
  revision += 1;
  return revision;
}
