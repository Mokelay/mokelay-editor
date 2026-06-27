import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootPackagePath = path.join(rootDir, 'package.json');
const distDir = path.join(rootDir, 'dist');
const distPackagePath = path.join(distDir, 'package.json');
const distIndexPath = path.join(distDir, 'index.html');
const dist404Path = path.join(distDir, '404.html');

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

try {
  await copyFile(distIndexPath, dist404Path);
  console.log(`Wrote ${path.relative(rootDir, dist404Path)} for SPA fallback`);
} catch (error) {
  if (error?.code !== 'ENOENT') {
    throw error;
  }

  console.log('Skipped dist/404.html because dist/index.html does not exist yet');
}
