import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootPackagePath = path.join(rootDir, 'package.json');
const distDir = path.join(rootDir, 'dist');
const distPackagePath = path.join(distDir, 'package.json');

const rootPackage = JSON.parse(await readFile(rootPackagePath, 'utf8'));

const publishFields = [
  'name',
  'version',
  'description',
  'type',
  'license',
  'repository',
  'homepage',
  'bugs',
  'keywords',
  'author',
];

const distPackage = {};

for (const field of publishFields) {
  if (rootPackage[field] !== undefined) {
    distPackage[field] = rootPackage[field];
  }
}

if (!distPackage.name || !distPackage.version) {
  throw new Error('Root package.json must include name and version before publishing dist.');
}

distPackage.private = false;

await mkdir(distDir, { recursive: true });
await writeFile(distPackagePath, `${JSON.stringify(distPackage, null, 2)}\n`);

console.log(`Wrote ${path.relative(rootDir, distPackagePath)} for ${distPackage.name}@${distPackage.version}`);
