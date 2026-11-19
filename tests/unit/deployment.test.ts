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

  it.each([
    ['/assets/(.*)', '/assets/*'],
    ['/images/(.*)', '/images/*'],
  ])('keeps immutable caching aligned for %s', (vercelPath, netlifyPath) => {
    expect(vercelHeaders(vercelPath)).toEqual(netlifyRule(netlifyPath));
  });
});
