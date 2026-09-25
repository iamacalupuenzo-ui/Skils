#!/usr/bin/env node
// Sincroniza los skills oficiales del equipo de Angular (github.com/angular/skills,
// licencia MIT, Copyright 2026 Google LLC) dentro de este catálogo, SIN modificarlos.
//
// Uso:  node scripts/sync-angular-skills.mjs            (última versión de main)
//       node scripts/sync-angular-skills.mjs <commit>   (fija una revisión concreta)
//
// Copia cada skill tal cual a skills/<nombre>/, agrega LICENSE-UPSTREAM.md y escribe
// UPSTREAM.json con el commit y el hash SHA-256 de cada archivo. `npm test` verifica
// esos hashes: si alguien edita un archivo vendorizado, la validación falla. Las
// reglas propias (qué cede ante el repositorio, qué se sobrescribe) viven en
// angular-product-builder, nunca dentro de estas copias.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_URL = 'https://github.com/angular/skills';
export const VENDORED_SKILLS = ['angular-developer', 'angular-new-app'];

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const requestedCommit = process.argv[2];

export function listFiles(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir).sort()) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listFiles(full, base));
    else out.push(relative(base, full).split('\\').join('/'));
  }
  return out;
}

export function hashFile(path) {
  // Normaliza saltos de línea para que el hash no dependa de autocrlf de Git.
  const text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  return createHash('sha256').update(text).digest('hex');
}

const MIT_NOTICE = (commit) => `# Licencia del contenido vendorizado

Este directorio es una copia sin modificar de un skill publicado por el equipo de
Angular en ${REPO_URL} (commit \`${commit}\`).

El propio skill declara en su encabezado \`license: MIT\` y
\`author: Copyright 2026 Google LLC\`. El repositorio de origen no incluye un archivo
LICENSE en su raíz; se reproduce aquí el texto estándar de la licencia MIT
correspondiente a esa declaración para cumplir su condición de conservar el aviso de
copyright y de permiso.

---

MIT License

Copyright 2026 Google LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify,
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`;

function main() {
  const tmp = mkdtempSync(join(tmpdir(), 'angular-skills-'));
  try {
    execFileSync('git', ['clone', '--quiet', REPO_URL, tmp], { stdio: 'inherit' });
    if (requestedCommit) execFileSync('git', ['-C', tmp, 'checkout', '--quiet', requestedCommit], { stdio: 'inherit' });
    const commit = execFileSync('git', ['-C', tmp, 'rev-parse', 'HEAD']).toString().trim();

    for (const skill of VENDORED_SKILLS) {
      const source = join(tmp, skill);
      if (!existsSync(join(source, 'SKILL.md'))) throw new Error(`El origen no contiene ${skill}/SKILL.md`);
      const target = join(root, 'skills', skill);
      rmSync(target, { recursive: true, force: true });
      mkdirSync(target, { recursive: true });
      cpSync(source, target, { recursive: true });

      const files = {};
      for (const file of listFiles(target)) files[file] = hashFile(join(target, file));
      writeFileSync(join(target, 'LICENSE-UPSTREAM.md'), MIT_NOTICE(commit));
      writeFileSync(
        join(target, 'UPSTREAM.json'),
        JSON.stringify({ repository: REPO_URL, skill, commit, syncedAt: new Date().toISOString().slice(0, 10), license: 'MIT (Copyright 2026 Google LLC)', files }, null, 2) + '\n',
      );
      console.log(`OK  ${skill}  ${Object.keys(files).length} archivos  @ ${commit.slice(0, 8)}`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
