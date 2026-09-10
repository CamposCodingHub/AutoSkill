// Valida estrutura das aulas e nomes de simuladores conhecidos
import fs from 'fs'
import path from 'path'

const ROOT = path.join(process.cwd(), 'src', 'data')
const KNOWN_SIMS = new Set([
  'OhmLawCalculator',
  'VoltageDropSimulator',
  'PowerSimulator',
  'PowerCalculator',
  'CircuitFaultSimulator',
  'MultimeterPracticeSimulator',
  'BatteryChargeSimulator',
  'CANBusSimulator',
  'ParasiticDrawSimulator',
  'WiringTraceSimulator',
  'ScopeWaveformSimulator',
  'RelayCircuitSimulator',
  'DiagnosticCasePlayer',
  'HVSafetyChecklistSimulator',
  'StarterCurrentSimulator',
  'CurrentPathSimulator',
  'PowerUpSequenceSimulator',
  'ASEA6ExamSimulator',
  'UDSLiteSimulator',
  'DailyMicroCaseSimulator',
  'HVIsolationMeterSimulator',
  'FlashCodingSandboxSimulator',
  'CANTrafficViewerSimulator',
  'OficinaBRSimulator',
  'TutorRAGLiteSimulator',
  'DiagnosticCompetitionSimulator',
  'ProfessorModeSimulator',
])

let lessons = 0
let quizzes = 0
let sims = 0
let enriched = 0
let errors = []
let warnings = []

for (const ent of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!ent.isDirectory() || !/^modulo\d+$/.test(ent.name)) continue
  const dir = path.join(ROOT, ent.name)
  for (const file of fs.readdirSync(dir)) {
    if (!/^aula\d+\.json$/.test(file)) continue
    const full = path.join(dir, file)
    lessons += 1
    let lesson
    try {
      lesson = JSON.parse(fs.readFileSync(full, 'utf8'))
    } catch (e) {
      errors.push(`${ent.name}/${file}: JSON parse ${e.message}`)
      continue
    }
    if (!lesson.title || !Array.isArray(lesson.content)) {
      errors.push(`${ent.name}/${file}: missing title/content`)
      continue
    }
    for (const [i, b] of lesson.content.entries()) {
      if (b.type === 'callout' && String(b.text || '').includes('autoskill-enriched-v2')) enriched += 1
      if (b.type === 'quiz') {
        quizzes += 1
        if (!Array.isArray(b.options) || typeof b.correct !== 'number') {
          errors.push(`${ent.name}/${file}#${i}: bad quiz`)
        } else if (b.correct < 0 || b.correct >= b.options.length) {
          errors.push(`${ent.name}/${file}#${i}: correct OOB ${b.correct}`)
        }
        if ((b.explanation || '').includes('Revise a medição')) {
          warnings.push(`${ent.name}/${file}#${i}: generic explanation left`)
        }
      }
      if (b.type === 'simulator') {
        sims += 1
        if (!b.name) errors.push(`${ent.name}/${file}#${i}: sim without name`)
        else if (!KNOWN_SIMS.has(b.name)) warnings.push(`${ent.name}/${file}: unknown sim ${b.name}`)
      }
    }
  }
}

const report = { lessons, quizzes, sims, enrichedLessonsApprox: enriched, errors: errors.length, warnings: warnings.length, errorSamples: errors.slice(0, 20), warningSamples: warnings.slice(0, 20) }
fs.mkdirSync('reports', { recursive: true })
fs.writeFileSync('reports/lesson-simulation-report.json', JSON.stringify(report, null, 2))
fs.writeFileSync(
  'reports/lesson-simulation-report.md',
  `# Simulação / validação de aulas\n\n- Aulas: **${lessons}**\n- Quizzes: **${quizzes}**\n- Blocos simulator: **${sims}**\n- Blocos enrich marker: **${enriched}**\n- Erros: **${errors.length}**\n- Warnings: **${warnings.length}**\n\n## Erros\n${errors.slice(0, 30).map((e) => `- ${e}`).join('\n') || '- nenhum'}\n\n## Warnings (amostra)\n${warnings.slice(0, 30).map((e) => `- ${e}`).join('\n') || '- nenhum'}\n`,
)
console.log(JSON.stringify(report, null, 2))
process.exit(errors.length ? 1 : 0)
