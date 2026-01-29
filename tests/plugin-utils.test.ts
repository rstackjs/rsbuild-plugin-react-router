import { describe, expect, it } from '@rstest/core';
import {
  combineURLs,
  stripFileExtension,
  createRouteId,
  generateWithProps,
  normalizeAssetPrefix,
} from '../src/plugin-utils';

describe('plugin-utils', () => {
  describe('combineURLs', () => {
    it('should combine base and relative URLs', () => {
      expect(combineURLs('/base', 'relative')).toBe('/base/relative');
    });

    it('should handle trailing slashes on base URL', () => {
      expect(combineURLs('/base/', 'relative')).toBe('/base/relative');
    });

    it('should handle leading slashes on relative URL', () => {
      expect(combineURLs('/base', '/relative')).toBe('/base/relative');
    });

    it('should handle both trailing and leading slashes', () => {
      expect(combineURLs('/base/', '/relative')).toBe('/base/relative');
    });

    it('should return base URL when relative is empty', () => {
      expect(combineURLs('/base', '')).toBe('/base');
    });

    it('should handle multiple slashes', () => {
      expect(combineURLs('/base///', '///relative')).toBe('/base/relative');
    });
  });

  describe('stripFileExtension', () => {
    it('should strip .tsx extension', () => {
      expect(stripFileExtension('file.tsx')).toBe('file');
    });

    it('should strip .ts extension', () => {
      expect(stripFileExtension('file.ts')).toBe('file');
    });

    it('should strip .jsx extension', () => {
      expect(stripFileExtension('file.jsx')).toBe('file');
    });

    it('should strip .js extension', () => {
      expect(stripFileExtension('file.js')).toBe('file');
    });

    it('should handle files with multiple dots', () => {
      expect(stripFileExtension('file.test.tsx')).toBe('file.test');
    });

    it('should handle paths with directories', () => {
      expect(stripFileExtension('routes/home.tsx')).toBe('routes/home');
    });
  });

  describe('createRouteId', () => {
    it('should create route ID from file path', () => {
      expect(createRouteId('routes/home.tsx')).toBe('routes/home');
    });

    it('should normalize path separators', () => {
      const result = createRouteId('routes\\home.tsx');
      expect(result).toBe('routes/home');
    });

    it('should handle nested routes', () => {
      expect(createRouteId('routes/users/$userId.tsx')).toBe(
        'routes/users/$userId'
      );
    });
  });

  describe('generateWithProps', () => {
    it('should generate withComponentProps HOC', () => {
      const result = generateWithProps();
      expect(result).toContain('withComponentProps');
      expect(result).toContain('useLoaderData');
      expect(result).toContain('useActionData');
      expect(result).toContain('useParams');
      expect(result).toContain('useMatches');
    });

    it('should generate withHydrateFallbackProps HOC', () => {
      const result = generateWithProps();
      expect(result).toContain('withHydrateFallbackProps');
    });

    it('should generate withErrorBoundaryProps HOC', () => {
      const result = generateWithProps();
      expect(result).toContain('withErrorBoundaryProps');
      expect(result).toContain('useRouteError');
    });

    it('should import from react-router', () => {
      const result = generateWithProps();
      expect(result).toContain('from "react-router"');
    });
  });

  describe('normalizeAssetPrefix', () => {
    it('should default to "/" when undefined', () => {
      expect(normalizeAssetPrefix()).toBe('/');
    });

    it('should normalize "auto" to "/"', () => {
      expect(normalizeAssetPrefix('auto')).toBe('/');
    });

    it('should ensure trailing slash', () => {
      expect(normalizeAssetPrefix('/assets')).toBe('/assets/');
    });

    it('should keep trailing slash intact', () => {
      expect(normalizeAssetPrefix('/assets/')).toBe('/assets/');
    });
  });
});
