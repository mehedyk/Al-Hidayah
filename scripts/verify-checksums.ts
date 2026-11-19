import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const checksums = JSON.parse(await readFile('data/checksums.json', 'utf8')) as Record<
  string,
  string
>;

for (const [file, expected] of Object.entries(checksums)) {
  const bytes = await readFile(file);
  const actual = createHash('sha256').update(bytes).digest('hex');
  if (actual !== expected) {
    throw new Error(`${file}: SHA-256 mismatch. Expected ${expected}, received ${actual}.`);
  }
  console.log(`${file}: SHA-256 verified.`);
}
