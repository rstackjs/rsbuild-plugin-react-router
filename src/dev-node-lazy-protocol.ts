export const NODE_LAZY_BRIDGE = 'react-router:node-lazy-bridge';
export const NODE_LAZY_REGISTRY = 'rsbuild-plugin-react-router.node-lazy.v1';
export const NODE_LAZY_SIDECAR = '__react_router_node_lazy.cjs';

export type NodeLazyHotRuntime = {
  hash(): string;
  check(): Promise<readonly (string | number)[] | null>;
  apply(): Promise<readonly (string | number)[] | null>;
};

export type NodeLazyClientOptions = {
  active: boolean;
  data: string;
  onError(error: Error): void;
};

export type NodeLazyBridge = {
  gate<T>(native: Promise<T>): Promise<T>;
  demand(options: NodeLazyClientOptions, endpoint: string): () => void;
};

export type NodeLazyRegistration = {
  register(runtime: NodeLazyHotRuntime): NodeLazyBridge;
};
