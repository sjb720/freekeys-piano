import { readFileSync } from 'node:fs';

const tag = process.argv[2] ?? '';
const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };

if (tag !== `v${version}`) {
  console.error(`Tag "${tag}" does not match package.json version "v${version}".`);
  process.exit(1);
}
console.log(`Releasing v${version}`);
