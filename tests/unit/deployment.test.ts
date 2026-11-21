import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../../', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');

interface HeaderRule {
  source: string;
  headers: Array<{ key: string; value: string }>;
}

const vercel = JSON.parse(read('vercel.json')) as {
  framework: string;
  installCommand: string;
  buildCommand: string;
  outputDirectory: string;
  headers: HeaderRule[];
};
const netlify = read('netlify.toml');
const netlifyHeaders = read('public/_headers');

function vercelHeaders(source: string) {
  const rule = vercel.headers.find((candidate) => candidate.source === source);
  expect(rule).toBeDefined();
  return Object.fromEntries(rule!.headers.map((header) => [header.key, header.value]));
}

function netlifyRule(path: string) {
  const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = netlifyHeaders.match(new RegExp(`^${escapedPath}\\n((?:  .+\\n?)*)`, 'm'));
  expect(match).not.toBeNull();
  return Object.fromEntries(
    match![1]
      .trim()
      .split('\n')
      .map((line) => {
        const [key, value] = line.trim().split(/: (.+)/);
        return [key, value];
      }),
  );
}

describe('static deployment configuration', () => {
  it('uses the verified static build on both providers', () => {
    expect(vercel).toMatchObject({
      framework: 'astro',
      installCommand: 'pnpm install --frozen-lockfile',
      buildCommand: 'pnpm build',
      outputDirectory: 'dist',
    });
    expect(netlify).toContain('command = "pnpm build"');
    expect(netlify).toContain('publish = "dist"');
    expect(netlify).toContain('NODE_VERSION = "24"');
    expect(netlify).toContain('PNPM_VERSION = "12.21.0"');
  });

  it('keeps Vercel security headers identical to Netlify', () => {
    expect(vercelHeaders('/(.*)')).toEqual(netlifyRule('/*'));
  });

  it('allows only the supplied media hosts, and nothing broader', () => {
    const csp = vercelHeaders('/(.*)')['Content-Security-Policy'];
    expect(csp).toContain("media-src 'self' https://d8j0ntlcm91z4.cloudfront.net https://everyayah.com;");
    expect(csp).toContain('https://d2ol7oe51mr4n9.cloudfront.net');
    expect(csp).toContain('https://images.pexels.com');
    expect(csp).toContain("script-src 'self';");
    expect(csp).not.toContain('unsafe-inline');
    expect(csp).not.toContain('unsafe-eval');
    expect(csp).not.toMatch(/(?:img|media)-src[^;]*\*/);
  });

  it.each([
    ['/assets/(.*)', '/assets/*'],
    ['/images/(.*)', '/images/*'],
  ])('keeps immutable caching aligned for %s', (vercelPath, netlifyPath) => {
    expect(vercelHeaders(vercelPath)).toEqual(netlifyRule(netlifyPath));
  });
});
