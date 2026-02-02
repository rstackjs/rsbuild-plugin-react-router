import { describe, expect, it } from '@rstest/core';
import { generateServerBuild } from '../src/server-utils';

describe('SPA Mode (ssr: false)', () => {
  describe('server build generation', () => {
    const mockRoutes = {
      root: { id: 'root', path: '', file: 'root.tsx' },
      'routes/home': {
        id: 'routes/home',
        path: '/',
        file: 'routes/home.tsx',
        parentId: 'root',
        index: true,
      },
    };

    it('should set isSpaMode to true when ssr is false', () => {
      const result = generateServerBuild(mockRoutes, {
        entryServerPath: './app/entry.server.tsx',
        assetsBuildDirectory: 'build/client',
        basename: '/',
        appDirectory: 'app',
        ssr: false,
        routeDiscovery: { mode: 'initial' },
      });

      expect(result).toContain('export const isSpaMode = true');
      expect(result).toContain('export const ssr = false');
    });

    it('should set isSpaMode to false when ssr is true', () => {
      const result = generateServerBuild(mockRoutes, {
        entryServerPath: './app/entry.server.tsx',
        assetsBuildDirectory: 'build/client',
        basename: '/',
        appDirectory: 'app',
        ssr: true,
        routeDiscovery: { mode: 'lazy', manifestPath: '/__manifest' },
      });

      expect(result).toContain('export const isSpaMode = false');
      expect(result).toContain('export const ssr = true');
    });
  });

  describe('route discovery configuration', () => {
    const mockRoutes = {
      root: { id: 'root', path: '', file: 'root.tsx' },
    };

    it('should use initial mode for SPA builds', () => {
      const result = generateServerBuild(mockRoutes, {
        entryServerPath: './app/entry.server.tsx',
        assetsBuildDirectory: 'build/client',
        basename: '/',
        appDirectory: 'app',
        ssr: false,
        routeDiscovery: { mode: 'initial' },
      });

      expect(result).toContain('"mode":"initial"');
    });

    it('should use lazy mode with manifest path for SSR builds', () => {
      const result = generateServerBuild(mockRoutes, {
        entryServerPath: './app/entry.server.tsx',
        assetsBuildDirectory: 'build/client',
        basename: '/',
        appDirectory: 'app',
        ssr: true,
        routeDiscovery: { mode: 'lazy', manifestPath: '/__manifest' },
      });

      expect(result).toContain('"mode":"lazy"');
      expect(result).toContain('"manifestPath":"/__manifest"');
    });
  });

  describe('federation mode', () => {
    const mockRoutes = {
      root: { id: 'root', path: '', file: 'root.tsx' },
    };

    it('should generate static template for federation mode', () => {
      const result = generateServerBuild(mockRoutes, {
        entryServerPath: './app/entry.server.tsx',
        assetsBuildDirectory: 'build/client',
        basename: '/',
        appDirectory: 'app',
        ssr: true,
        federation: true,
        routeDiscovery: { mode: 'lazy', manifestPath: '/__manifest' },
      });

      // Federation mode no longer requires async entry wrappers
      expect(result).toContain('import * as entryServer from');
      expect(result).not.toContain('ensureEntryServerLoaded');
    });

    it('should generate static template for non-federation mode', () => {
      const result = generateServerBuild(mockRoutes, {
        entryServerPath: './app/entry.server.tsx',
        assetsBuildDirectory: 'build/client',
        basename: '/',
        appDirectory: 'app',
        ssr: true,
        federation: false,
        routeDiscovery: { mode: 'lazy', manifestPath: '/__manifest' },
      });

      // Non-federation mode uses static imports
      expect(result).toContain('import * as entryServer from');
      expect(result).not.toContain('ensureEntryServerLoaded');
    });
  });

  describe('basename configuration', () => {
    const mockRoutes = {
      root: { id: 'root', path: '', file: 'root.tsx' },
    };

    it('should include custom basename in server build', () => {
      const result = generateServerBuild(mockRoutes, {
        entryServerPath: './app/entry.server.tsx',
        assetsBuildDirectory: 'build/client',
        basename: '/my-app',
        appDirectory: 'app',
        ssr: true,
        routeDiscovery: { mode: 'lazy', manifestPath: '/__manifest' },
      });

      expect(result).toContain('export const basename = "/my-app"');
    });

    it('should use default basename of "/" when not specified', () => {
      const result = generateServerBuild(mockRoutes, {
        entryServerPath: './app/entry.server.tsx',
        assetsBuildDirectory: 'build/client',
        basename: '/',
        appDirectory: 'app',
        ssr: true,
        routeDiscovery: { mode: 'lazy', manifestPath: '/__manifest' },
      });

      expect(result).toContain('export const basename = "/"');
    });
  });

  describe('future flags', () => {
    const mockRoutes = {
      root: { id: 'root', path: '', file: 'root.tsx' },
    };

    it('should include future flags in server build', () => {
      const result = generateServerBuild(mockRoutes, {
        entryServerPath: './app/entry.server.tsx',
        assetsBuildDirectory: 'build/client',
        basename: '/',
        appDirectory: 'app',
        ssr: true,
        future: { v3_fetcherPersist: true },
        routeDiscovery: { mode: 'lazy', manifestPath: '/__manifest' },
      });

      expect(result).toContain('v3_fetcherPersist');
    });

    it('should use empty object when no future flags provided', () => {
      const result = generateServerBuild(mockRoutes, {
        entryServerPath: './app/entry.server.tsx',
        assetsBuildDirectory: 'build/client',
        basename: '/',
        appDirectory: 'app',
        ssr: true,
        routeDiscovery: { mode: 'lazy', manifestPath: '/__manifest' },
      });

      expect(result).toContain('export const future = {}');
    });
  });

  describe('allowed action origins', () => {
    const mockRoutes = {
      root: { id: 'root', path: '', file: 'root.tsx' },
    };

    it('should include allowed action origins when provided', () => {
      const result = generateServerBuild(mockRoutes, {
        entryServerPath: './app/entry.server.tsx',
        assetsBuildDirectory: 'build/client',
        basename: '/',
        appDirectory: 'app',
        ssr: true,
        allowedActionOrigins: ['https://example.com'],
        routeDiscovery: { mode: 'lazy', manifestPath: '/__manifest' },
      });

      expect(result).toContain('https://example.com');
    });
  });
});
