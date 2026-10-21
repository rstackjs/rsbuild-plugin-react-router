import { describe, expect, it, rstest } from '@rstest/core';
import type { EntryContext } from 'react-router';
import { defer, json } from '../src/compat/responses';
import { RemixServer } from '../src/compat/remix-react';

describe('Remix compatibility facades', () => {
  it('creates a JSON Response with status and headers', async () => {
    const response = json(
      { value: 'ok' },
      { status: 201, headers: { 'X-Compat': 'json' } }
    );

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(201);
    expect(response.headers.get('X-Compat')).toBe('json');
    expect(response.headers.get('Content-Type')).toContain('application/json');
    await expect(response.json()).resolves.toEqual({ value: 'ok' });
  });

  it('preserves an explicit JSON content type', () => {
    const response = json(
      { value: 'ok' },
      { headers: { 'Content-Type': 'application/problem+json' } }
    );
    expect(response.headers.get('Content-Type')).toBe(
      'application/problem+json'
    );
  });

  it('passes deferred values and response metadata to React Router data', async () => {
    const resolved = Promise.resolve('done');
    const rejected = Promise.reject(new Error('deferred failure'));
    rejected.catch(() => undefined);
    const result = defer(
      { resolved, rejected },
      { status: 202, headers: { 'X-Compat': 'defer' } }
    );

    expect(result.type).toBe('DataWithResponseInit');
    expect(result.data).toEqual({ resolved, rejected });
    expect(result.init).toEqual({
      status: 202,
      headers: { 'X-Compat': 'defer' },
    });
    await expect(result.data.resolved).resolves.toBe('done');
    await expect(result.data.rejected).rejects.toThrow('deferred failure');
  });

  it('maps RemixServer to ServerRouter and warns about abortDelay', () => {
    const warn = rstest.spyOn(console, 'warn').mockImplementation(() => {});
    const context = {} as EntryContext;
    const element = RemixServer({
      context,
      url: 'https://example.test/',
      abortDelay: 1000,
    });

    expect(element.type).toBeDefined();
    expect(element.props).toEqual({ context, url: 'https://example.test/' });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Abort the render stream in entry.server')
    );
    warn.mockRestore();
  });
});
