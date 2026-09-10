import { ReactNode } from 'react'

interface SimulatorShellProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}

/** Shell visual único para todos os labs — leitura profissional, sem rainbow. */
export default function SimulatorShell({ title, subtitle, children, footer }: SimulatorShellProps) {
  return (
    <section className="sim-shell my-6 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800">
      <header className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-900/60 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
          Laboratório prático
        </p>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
        )}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
      {footer && (
        <footer className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-200 sm:px-5">
          {footer}
        </footer>
      )}
    </section>
  )
}
