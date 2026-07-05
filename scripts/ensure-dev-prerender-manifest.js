#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const devManifestPath = path.join(projectRoot, '.next', 'dev', 'prerender-manifest.json');
const rootManifestPath = path.join(projectRoot, '.next', 'prerender-manifest.json');

function readValidManifest(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

const devManifest = readValidManifest(devManifestPath);
if (devManifest) process.exit(0);

const rootManifest = readValidManifest(rootManifestPath);
if (!rootManifest) process.exit(0);

fs.mkdirSync(path.dirname(devManifestPath), { recursive: true });
fs.writeFileSync(devManifestPath, `${JSON.stringify(rootManifest)}\n`, 'utf8');
console.warn('[dev] Repaired invalid .next/dev/prerender-manifest.json');
