import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import type { SourceLock } from './data-model';

const pin = process.argv.includes('--pin');
const lockPath = 'data/sources.lock.json';
const lock = JSON.parse(await readFile(lockPath, 'utf8')) as SourceLock;
const checksums: Record<string, string> = {};

for (const source of lock.sources) {
  let bytes: Buffer | null = null;

  try {
    bytes = await readFile(source.file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }

  if (bytes) {
    const localHash = createHash('sha256').update(bytes).digest('hex');
    if (localHash !== source.sha256 && !pin) {
      throw new Error(
        `${source.id}: local bytes differ from the frozen SHA-256. Restore the reviewed file.`,
      );
    }
    if (localHash === source.sha256) {
      checksums[source.file] = localHash;
      console.log(`${source.id}: frozen copy verified; network not used.`);
      continue;
    }
  }

  if (!pin && !source.sha256) {
    throw new Error(`${source.id}: no pinned SHA-256. Run pnpm data:fetch -- --pin deliberately.`);
  }

  const response = await fetch(source.url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${source.id}: upstream returned HTTP ${response.status}.`);
  const downloaded = Buffer.from(await response.arrayBuffer());
  const hash = createHash('sha256').update(downloaded).digest('hex');

  if (!pin && hash !== source.sha256) {
    throw new Error(
      `${source.id}: upstream bytes differ from SHA-256 ${source.sha256}; local data was not changed.`,
    );
  }

  await writeFile(source.file, downloaded);
  source.sha256 = hash;
  checksums[source.file] = hash;
  console.log(`${source.id}: wrote ${downloaded.length} verbatim bytes with SHA-256 ${hash}.`);
}

if (pin) {
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  await writeFile('data/checksums.json', `${JSON.stringify(checksums, null, 2)}\n`);
}
