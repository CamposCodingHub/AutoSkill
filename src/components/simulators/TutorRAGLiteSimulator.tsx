import { useMemo, useState } from 'react'
import SimulatorShell from './SimulatorShell'
import modules from '../../data/modules.json'

interface ModuleInfo {
  id: number
  title: string
  description: string
  lessons?: { title: string; slug: string }[]
}

const FAQS: { q: string; a: string; keys: string[] }[] = [
  {
    q: 'O que é queda de tensão?',
    a: 'É a diferença de potencial ao longo de um condutor/conexão sob corrente. Alta ΔV indica resistência indesejada (fio fino, conector ruim, massa suja).',
    keys: ['queda', 'tensao', 'tensão', 'voltage drop', 'delta'],
  },
  {
    q: 'Como medir consumo parasita?',
    a: 'Após sleep, meça corrente em série no negativo (ou alicate de precisão). Isole por fusível. Valores típicos costumam ficar na casa de dezenas de mA — confirme OEM.',
    keys: ['parasita', 'consumo', 'drain', 'bateria descarreg'],
  },
  {
    q: 'O que é terminadores CAN?',
    a: 'Dois resistores de 120 Ω nas extremidades do barramento. Em paralelo medem ~60 Ω com a rede desenergizada e módulos conectados conforme procedimento.',
    keys: ['can', 'termin', '120', '60'],
  },
  {
    q: 'Quando usar sessão estendida UDS?',
    a: 'Para serviços privilegiados (clear em algumas ECUs, rotinas, coding). Sempre siga a ferramenta/OEM — segurança e condições (IG, tensão) importam.',
    keys: ['uds', 'sessao', 'sessão', 'extended', 'dtc'],
  },
]

export default function TutorRAGLiteSimulator({ config }: { config?: { title?: string } }) {
  const mods = modules as ModuleInfo[]
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')

  const hits = useMemo(() => {
    const empty = {
      faqHits: [] as typeof FAQS,
      moduleHits: [] as ModuleInfo[],
      lessonHits: [] as { module: string; lesson: string; slug: string }[],
    }
    const q = submitted.trim().toLowerCase()
    if (!q) return empty

    const faqHits = FAQS.filter((f) => f.keys.some((k) => q.includes(k)) || f.q.toLowerCase().includes(q)).slice(0, 2)

    const moduleHits = mods
      .filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          (m.lessons || []).some((l) => l.title.toLowerCase().includes(q)),
      )
      .slice(0, 4)

    const lessonHits = mods
      .flatMap((m) =>
        (m.lessons || []).map((l) => ({
          module: m.title,
          lesson: l.title,
          slug: l.slug,
        })),
      )
      .filter((l) => l.lesson.toLowerCase().includes(q) || l.module.toLowerCase().includes(q))
      .slice(0, 5)

    return { faqHits, moduleHits, lessonHits }
  }, [submitted, mods])

  const ask = () => setSubmitted(query)

  return (
    <SimulatorShell
      title={config?.title ?? 'Tutor AutoSkill (RAG lite)'}
      subtitle="Busca local nos módulos do curso + FAQs técnicas. Não substitui manual OEM."
      footer={<p>Resultados vêm de modules.json e de uma base curta de perguntas frequentes.</p>}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Ex.: queda de tensão, CAN, parasita, UDS…"
          className="min-w-[12rem] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-700"
        />
        <button
          type="button"
          onClick={ask}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Perguntar
        </button>
      </div>

      {!submitted && (
        <div className="flex flex-wrap gap-2">
          {FAQS.map((f) => (
            <button
              key={f.q}
              type="button"
              onClick={() => {
                setQuery(f.q)
                setSubmitted(f.q)
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs dark:border-slate-500"
            >
              {f.q}
            </button>
          ))}
        </div>
      )}

      {submitted && (
        <div className="space-y-4">
          {hits.faqHits.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100">Respostas rápidas</h4>
              <ul className="space-y-2">
                {hits.faqHits.map((f) => (
                  <li key={f.q} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-600">
                    <p className="font-semibold">{f.q}</p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">{f.a}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hits.moduleHits.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-bold">Módulos relacionados</h4>
              <ul className="space-y-2">
                {hits.moduleHits.map((m) => (
                  <li key={m.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-600">
                    <p className="font-semibold">
                      Módulo {m.id}: {m.title}
                    </p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">{m.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hits.lessonHits.length > 0 && (
            <section>
              <h4 className="mb-2 text-sm font-bold">Aulas</h4>
              <ul className="space-y-1 text-sm">
                {hits.lessonHits.map((l) => (
                  <li key={`${l.module}-${l.slug}`} className="text-slate-700 dark:text-slate-200">
                    <span className="font-medium">{l.lesson}</span>
                    <span className="text-slate-500"> — {l.module}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hits.faqHits.length === 0 && hits.moduleHits.length === 0 && hits.lessonHits.length === 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Nada encontrado para “{submitted}”. Tente termos como tensão, CAN, fusível, HV, diagnóstico.
            </p>
          )}
        </div>
      )}
    </SimulatorShell>
  )
}
