import { describe, it, expect, vi, afterEach } from 'vitest';
import { getAllowedOrigins, corsMiddleware } from '../cors';

function runMiddleware(method: string, origin?: string) {
  const headers: Record<string, string> = {};
  const res: any = {
    statusCode: 200,
    setHeader: (name: string, value: string) => {
      headers[name.toLowerCase()] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    end: vi.fn(),
  };
  const next = vi.fn();
  const req: any = { method, headers: origin ? { origin } : {} };
  corsMiddleware(req, res, next);
  return { headers, res, next };
}

describe('CORS middleware', () => {
  afterEach(() => {
    delete process.env.CORS_ORIGIN;
  });

  it('uses localhost defaults when CORS_ORIGIN is not set', () => {
    expect(getAllowedOrigins()).toEqual(['http://localhost:3000', 'http://localhost:5173']);
  });

  it('parses a comma-separated CORS_ORIGIN list', () => {
    process.env.CORS_ORIGIN = ' https://a.example.com , https://b.example.com ';
    expect(getAllowedOrigins()).toEqual(['https://a.example.com', 'https://b.example.com']);
  });

  it('echoes an allowed origin back and calls next', () => {
    process.env.CORS_ORIGIN = 'https://roam.example.com';
    const { headers, next } = runMiddleware('GET', 'https://roam.example.com');
    expect(headers['access-control-allow-origin']).toBe('https://roam.example.com');
    expect(headers['vary']).toBe('Origin');
    expect(next).toHaveBeenCalledOnce();
  });

  it('does not set allow-origin for a disallowed origin', () => {
    process.env.CORS_ORIGIN = 'https://roam.example.com';
    const { headers, next } = runMiddleware('GET', 'https://evil.example.com');
    expect(headers['access-control-allow-origin']).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
  });

  it('allows any origin when CORS_ORIGIN is "*"', () => {
    process.env.CORS_ORIGIN = '*';
    const { headers } = runMiddleware('GET', 'https://anything.example.com');
    expect(headers['access-control-allow-origin']).toBe('*');
  });

  it('answers preflight OPTIONS requests with 204 without calling next', () => {
    process.env.CORS_ORIGIN = 'https://roam.example.com';
    const { headers, res, next } = runMiddleware('OPTIONS', 'https://roam.example.com');
    expect(res.statusCode).toBe(204);
    expect(res.end).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(headers['access-control-allow-methods']).toContain('POST');
    expect(headers['access-control-allow-headers']).toContain('Authorization');
  });

  it('passes through requests without an Origin header', () => {
    const { headers, next } = runMiddleware('GET');
    expect(headers['access-control-allow-origin']).toBeUndefined();
    expect(next).toHaveBeenCalledOnce();
  });
});
