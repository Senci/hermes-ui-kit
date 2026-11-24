// Check that every name the kit imports from '@hermes/plugin-sdk' exists in the SDK of the oldest
// supported Hermes. A missing export is a link-time SyntaxError in the desktop loader: the whole
// plugin module is dropped and nothing is logged.
//
//   node scripts/sdk-exports.mjs --generate <apps/desktop/src/sdk/index.ts> > scripts/sdk-floor-exports.txt
//   node scripts/sdk-exports.mjs                  check src/ against that list
//
// The list is generated from the floor release's SDK index (see its header) and committed, so CI
// needs no Hermes checkout. Value exports only: `export type` is erased at build time.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const LIST = join(here, 'sdk-floor-exports.txt')

const stripComments = src => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

// Exported value names of the SDK index.ts: `export const|function|class X`, `export { a, b as c }
// from '...'`, `export * as ns from '...'`. Entries marked `type` are skipped.
export function parseExports(source) {
  const src = stripComments(source)
  const names = new Set()
  for (const m of src.matchAll(/^export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)) names.add(m[1])
  for (const m of src.matchAll(/^export\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from/gm)) names.add(m[1])
  for (const m of src.matchAll(/^export\s*\{([^}]*)\}/gm)) {
    for (const part of m[1].split(',')) {
      const item = part.trim()
      if (!item || /^type\s/.test(item)) continue
      const as = item.match(/\bas\s+([A-Za-z_$][\w$]*)$/)
      names.add(as ? as[1] : item)
    }
  }
  return [...names].sort()
}

// Names imported from '@hermes/plugin-sdk' in one source file (aliases resolve to the SDK name).
export function importedNames(source) {
  const out = []
  for (const m of stripComments(source).matchAll(/import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*(['"])@hermes\/plugin-sdk\2/g)) {
    for (const part of m[1].split(',')) {
      const item = part.trim()
      if (!item || /^type\s/.test(item)) continue
      out.push(item.split(/\s+as\s+/)[0].trim())
    }
  }
  return out
}

function walkFiles(dir, accept, acc = []) {
  if (!existsSync(dir)) return acc
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walkFiles(p, accept, acc)
    else if (accept(p)) acc.push(p)
  }
  return acc
}

function targets() {
  return walkFiles(join(root, 'src'), p => /\.js$/.test(p))
}

function main() {
  const args = process.argv.slice(2)
  if (args[0] === '--generate') {
    if (!args[1]) { console.error('usage: sdk-exports.mjs --generate <sdk/index.ts>'); return 2 }
    console.log(parseExports(readFileSync(args[1], 'utf8')).join('\n'))
    return 0
  }
  const floor = new Set(readFileSync(LIST, 'utf8').split('\n').filter(l => l && !l.startsWith('#')))
  if (floor.size < 50) { console.error(`FAIL: ${LIST} lists only ${floor.size} names`); return 1 }
  let bad = 0
  const seen = new Set()
  for (const file of targets()) {
    for (const name of importedNames(readFileSync(file, 'utf8'))) {
      seen.add(name)
      if (!floor.has(name)) {
        console.log(`FAIL: ${file.slice(root.length + 1)} imports ${name}, not exported by the floor SDK`)
        bad++
      }
    }
  }
  if (bad) return 1
  console.log(`OK: ${seen.size} distinct SDK names imported across ${targets().length} files, all in the floor SDK (${floor.size} names listed)`)
  return 0
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main())
