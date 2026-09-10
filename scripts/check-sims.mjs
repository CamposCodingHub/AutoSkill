import fs from 'fs'
import path from 'path'

const names = new Set()
for (const d of fs.readdirSync('src/data', { withFileTypes: true })) {
  if (!d.isDirectory() || !d.name.startsWith('modulo')) continue
  for (const f of fs.readdirSync(path.join('src/data', d.name))) {
    if (!/^aula\d+\.json$/.test(f)) continue
    const j = JSON.parse(fs.readFileSync(path.join('src/data', d.name, f), 'utf8'))
    for (const b of j.content || []) if (b.type === 'simulator' && b.name) names.add(b.name)
  }
}
const rend = fs.readFileSync('src/components/simulators/SimulatorRenderer.tsx', 'utf8')
const files = new Set(
  fs
    .readdirSync('src/components/simulators')
    .filter((f) => f.endsWith('.tsx') && f !== 'SimulatorRenderer.tsx' && f !== 'SimulatorShell.tsx')
    .map((f) => f.replace(/\.tsx$/, '')),
)
const used = [...names].sort()
const missingFile = used.filter((n) => !files.has(n))
const missingCase = used.filter((n) => !rend.includes(`case '${n}'`))
console.log(JSON.stringify({ used, missingFile, missingCase }, null, 2))
