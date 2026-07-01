declare const __RESTRICTED__: boolean;
declare function __syntheticSecret(value: string): number;

declare module 'leaflet';
declare module 'markdown-it';
declare module 'prismjs';

declare module '*.css?url' {
  const url: string;
  export default url;
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.svg?react' {
  import type { ComponentType, SVGProps } from 'react';
  const component: ComponentType<SVGProps<SVGSVGElement>>;
  export default component;
}
