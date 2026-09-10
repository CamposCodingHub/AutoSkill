import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import guide from '../data/guia-iniciante.json'

type Tab = 'start' | 'defects' | 'traps' | 'measure' | 'week' | 'quiz'

export default function BeginnerGuidePage() {
  const [tab, setTab] = useState<Tab>('start')
  const [defectId, setDefectId] = useState(guide.commonDefects[0]?.id)
  const [quizIdx, setQuizIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)

  const defect = useMemo(
    () => guide.commonDefects.find((d) => d.id === defectId) ?? guide.commonDefects[0],
    [defectId],
  )
  const quiz = guide.quickQuizzes[quizIdx]

  const tabs: { id: Tab; label: string }[] = [
    { id: 'start', label: 'Por onde começar' },
    { id: 'defects', label: 'Defeitos comuns' },
    { id: 'traps', label: 'Onde o iniciante se perde' },
    { id: 'measure', label: 'Medir certo' },
    { id: 'week', label: 'Semana 1' },
    { id: 'quiz', label: 'Quiz rápido' },
  ]

  return (
    <Layout>
      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        <header className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 p-6 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Didática para quem está começando</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{guide.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-200 sm:text-base">{guide.subtitle}</p>
          <p className="mt-4 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium">{guide.mantra}</p>
        </header>

        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                tab === t.id
                  ? 'bg-orange-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'start' && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{guide.whereToStart.headline}</h2>
            {guide.whereToStart.steps.map((s) => (
              <article
                key={s.n}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-800"
              >
                <p className="text-xs font-bold text-orange-600">Passo {s.n}</p>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Por quê:</span> {s.why}
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Faça:</span> {s.do}
                </p>
                <Link
                  to={`/modulo/${s.moduleId}/aula/${s.lessonId}`}
                  className="btn-primary mt-3 inline-flex text-sm"
                >
                  Abrir aula
                </Link>
              </article>
            ))}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900/40">
              <h3 className="font-bold">Fluxo diagnóstico (decore este)</h3>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
                {guide.diagnosticFlow.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {tab === 'defects' && (
          <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
            <aside className="space-y-2">
              {guide.commonDefects.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDefectId(d.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium ${
                    defectId === d.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800'
                  }`}
                >
                  {d.title}
                </button>
              ))}
            </aside>
            <article className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-600 dark:bg-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{defect.title}</h2>
              <h3 className="mt-4 text-sm font-bold">Sintomas</h3>
              <ul className="mt-1 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
                {defect.symptoms.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <h3 className="mt-4 text-sm font-bold">Primeiros testes</h3>
              <ol className="mt-1 list-decimal pl-5 text-sm text-slate-600 dark:text-slate-300">
                {defect.firstTests.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ol>
              <h3 className="mt-4 text-sm font-bold">Causas prováveis</h3>
              <ul className="mt-1 list-disc pl-5 text-sm text-slate-600 dark:text-slate-300">
                {defect.likelyCauses.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-900/30">
                <span className="font-bold">Não faça:</span> {defect.dontDo}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/modulo/${defect.moduleId}/aula/${defect.lessonId}`} className="btn-primary text-sm">
                  Estudar no módulo
                </Link>
                <span className="rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs dark:border-slate-500">
                  Lab: {defect.lab}
                </span>
              </div>
            </article>
          </section>
        )}

        {tab === 'traps' && (
          <section className="space-y-3">
            {guide.lostBeginnerTraps.map((t) => (
              <article
                key={t.trap}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-600 dark:bg-slate-800"
              >
                <h3 className="font-bold text-red-600 dark:text-red-400">Armadilha: {t.trap}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">Como aparece:</span> {t.fix}
                </p>
                <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                  <span className="font-semibold">Correção:</span> {t.fix}
                </p>
              </article>
            ))}
          </section>
        )}

        {tab === 'measure' && (
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3">Modo</th>
                  <th className="px-4 py-3">Quando usar</th>
                  <th className="px-4 py-3">Regra de ouro</th>
                </tr>
              </thead>
              <tbody>
                {guide.measurementCheatSheet.map((row) => (
                  <tr key={row.mode} className="border-t border-slate-200 dark:border-slate-600">
                    <td className="px-4 py-3 font-semibold">{row.mode}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.when}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{row.rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {tab === 'week' && (
          <section className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Uma semana para sair do “perdido” e entrar no método. Não pule para HV/CAN ainda.
            </p>
            {guide.firstWeek.map((d) => (
              <div
                key={d.day}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-600 dark:bg-slate-800"
              >
                <div>
                  <p className="text-xs font-bold text-orange-600">Dia {d.day}</p>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{d.focus}</p>
                </div>
                <Link to={`/modulo/${d.moduleId}/aula/${d.lessonId}`} className="btn-primary text-center text-sm">
                  Abrir
                </Link>
              </div>
            ))}
          </section>
        )}

        {tab === 'quiz' && quiz && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-600 dark:bg-slate-800">
            <p className="text-xs text-slate-500">
              Questão {quizIdx + 1}/{guide.quickQuizzes.length}
            </p>
            <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{quiz.q}</p>
            <div className="mt-4 flex flex-col gap-2">
              {quiz.options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  disabled={checked}
                  onClick={() => setSelected(i)}
                  className={`rounded-lg border px-3 py-3 text-left text-sm ${
                    selected === i ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-slate-300 dark:border-slate-500'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary disabled:opacity-40"
                disabled={selected === null || checked}
                onClick={() => setChecked(true)}
              >
                Verificar
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setQuizIdx((i) => (i + 1) % guide.quickQuizzes.length)
                  setSelected(null)
                  setChecked(false)
                }}
              >
                Próxima
              </button>
            </div>
            {checked && (
              <div
                className={`mt-4 rounded-lg border p-3 text-sm ${
                  selected === quiz.correct
                    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30'
                    : 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/30'
                }`}
              >
                <p className="font-semibold">
                  {selected === quiz.correct ? 'Correto.' : `Resposta: ${quiz.options[quiz.correct]}`}
                </p>
                <p className="mt-1">{quiz.why}</p>
              </div>
            )}
          </section>
        )}

        <footer className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/40">
          Fontes didáticas usadas na elaboração: {guide.sources.join(' · ')}. Sempre confirme especificação OEM do
          veículo.
        </footer>
      </div>
    </Layout>
  )
}
