#!/usr/bin/env node

import { cp, mkdir, mkdtemp, readFile, rename, rm, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(packageRoot, "skills-manifest.json");
const supportedTargets = new Set(["codex", "claude"]);

function fail(message) {
  process.stderr.write(`Error: ${message}\n`);
  process.exitCode = 1;
}

function usage() {
  return `Uso:
  skils install [--target all|codex|claude] [--skill nombre[,nombre]] [--dry-run]
  skils update  [--target all|codex|claude] [--skill nombre[,nombre]] [--dry-run]
  skils list
  skils doctor [--target all|codex|claude]

Opciones:
  --target <destino>     Destino de instalación. Predeterminado: all.
  --skill <nombres>      Uno o más skills separados por comas. Predeterminado: todos.
  --codex-dir <ruta>     Sobrescribe el directorio de Codex.
  --claude-dir <ruta>    Sobrescribe el directorio de Claude Code.
  --dry-run              Muestra cambios sin escribir archivos.
  --help                 Muestra esta ayuda.
`;
}

function parseArgs(argv) {
  const [command = "help", ...rest] = argv;
  const options = { target: "all", skills: [], dryRun: false };
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token === "--help" || token === "-h") return { command: "help", options };
    if (token === "--dry-run") { options.dryRun = true; continue; }
    if (["--target", "--skill", "--codex-dir", "--claude-dir"].includes(token)) {
      const value = rest[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`Falta un valor para ${token}.`);
      index += 1;
      if (token === "--target") options.target = value;
      if (token === "--skill") options.skills.push(...value.split(",").filter(Boolean));
      if (token === "--codex-dir") options.codexDir = value;
      if (token === "--claude-dir") options.claudeDir = value;
      continue;
    }
    throw new Error(`Opción no reconocida: ${token}`);
  }
  return { command, options };
}

async function loadManifest() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (!Array.isArray(manifest.skills) || manifest.skills.some((name) => !/^[a-z0-9-]+$/.test(name))) {
    throw new Error("skills-manifest.json no es válido.");
  }
  return manifest;
}

function targetsFor(options) {
  const targets = options.target === "all" ? ["codex", "claude"] : [options.target];
  if (targets.some((target) => !supportedTargets.has(target))) {
    throw new Error("--target debe ser all, codex o claude.");
  }
  return targets;
}

function destinationRoot(target, options) {
  const home = process.env.USERPROFILE || process.env.HOME;
  if (!home) throw new Error("No se pudo determinar el directorio de usuario.");
  if (target === "codex") return resolve(options.codexDir || process.env.CODEX_SKILLS_DIR || join(home, ".codex", "skills"));
  return resolve(options.claudeDir || process.env.CLAUDE_SKILLS_DIR || join(home, ".claude", "skills"));
}

async function validateSkill(source, name) {
  const skillFile = join(source, "SKILL.md");
  try {
    if (!(await stat(source)).isDirectory() || !(await stat(skillFile)).isFile()) {
      throw new Error();
    }
  } catch {
    throw new Error(`El catálogo no contiene un SKILL.md válido para ${name}.`);
  }
}

async function replaceAtomically(source, destination) {
  const tempRoot = await mkdtemp(join(tmpdir(), "skils-"));
  const staged = join(tempRoot, "skill");
  const previous = `${destination}.previous-${process.pid}`;
  await cp(source, staged, { recursive: true, force: true });
  let movedPrevious = false;
  try {
    try { await rename(destination, previous); movedPrevious = true; } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    await rename(staged, destination);
    if (movedPrevious) await rm(previous, { recursive: true, force: true });
  } catch (error) {
    try {
      const destinationExists = await stat(destination).then(() => true).catch(() => false);
      if (!destinationExists && movedPrevious) await rename(previous, destination);
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
    throw error;
  }
  await rm(tempRoot, { recursive: true, force: true });
}

async function install(command, options) {
  const manifest = await loadManifest();
  const selected = options.skills.length ? [...new Set(options.skills)] : manifest.skills;
  const invalid = selected.filter((name) => !manifest.skills.includes(name));
  if (invalid.length) throw new Error(`Skills no declarados en el catálogo: ${invalid.join(", ")}`);
  for (const name of selected) await validateSkill(join(packageRoot, "skills", name), name);

  for (const target of targetsFor(options)) {
    const root = destinationRoot(target, options);
    if (!options.dryRun) await mkdir(root, { recursive: true });
    for (const name of selected) {
      const source = join(packageRoot, "skills", name);
      const destination = join(root, name);
      if (resolve(destination) !== join(root, name)) throw new Error(`Destino inválido para ${name}.`);
      const action = command === "update" ? "Actualizar" : "Instalar";
      if (options.dryRun) {
        console.log(`${action} ${name} → ${target}: ${destination}`);
      } else {
        await replaceAtomically(source, destination);
        console.log(`${command === "update" ? "Actualizado" : "Instalado"} ${name} → ${target}`);
      }
    }
  }
}

async function doctor(options) {
  const manifest = await loadManifest();
  let healthy = true;
  for (const target of targetsFor(options)) {
    const root = destinationRoot(target, options);
    console.log(`${target}: ${root}`);
    for (const name of manifest.skills) {
      const file = join(root, name, "SKILL.md");
      const present = await stat(file).then((entry) => entry.isFile()).catch(() => false);
      console.log(`  ${present ? "OK" : "FALTA"}  ${name}`);
      healthy &&= present;
    }
  }
  if (!healthy) process.exitCode = 1;
}

async function list() {
  const manifest = await loadManifest();
  manifest.skills.forEach((name) => console.log(name));
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (command === "help") { console.log(usage()); return; }
  if (command === "list") { await list(); return; }
  if (command === "doctor") { await doctor(options); return; }
  if (command === "install" || command === "update") { await install(command, options); return; }
  throw new Error(`Comando no reconocido: ${command}`);
}

main().catch((error) => fail(error.message));
