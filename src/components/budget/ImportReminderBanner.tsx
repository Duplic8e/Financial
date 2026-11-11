import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus, Download, X } from 'lucide-react'
import { useTriageStore } from '../../store/useTriageStore'
import { useBudgetStore } from '../../store/useBudgetStore'
import { dismissImportReminder, importReminderDue, importReminderIcs, notifyImportReminder } from '../../utils/importReminder'

/** Shown from the 1st of each month until that month's import is done. */
export const ImportReminderBanner: React.FC<{ linkToBudget?: boolean }> = ({ linkToBudget }) => {
  const lastImportAt = useTriageStore((s) => s.lastImportAt)
  const hasImports = useTriageStore((s) => Object.keys(s.importSources).length > 0)
  const hasTransactions = useBudgetStore((s) => Object.keys(s.transactions).length > 0)
  const [dismissed, setDismissed] = useState(false)
  const due = !dismissed && importReminderDue({ now: new Date(), lastImportAt, hasData: hasImports || hasTransactions })
  const calendarHref = useMemo(() => `data:text/calendar;charset=utf-8,${encodeURIComponent(importReminderIcs())}`, [])

  useEffect(() => {
    if (due) notifyImportReminder()
  }, [due])

  if (!due) return null
  const monthName = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleDateString(undefined, { month: 'long' })
  return (
    <section className="themed-card p-4 flex flex-col gap-3" role="status" data-testid="import-reminder">
      <div className="flex items-start gap-3">
        <span className="w-9 h-9 shrink-0 rounded-full bg-accent text-bg-primary flex items-center justify-center"><Download className="w-5 h-5" aria-hidden="true" /></span>
        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-semibold">Time to import {monthName}</p>
          <p className="text-[14px] text-text-secondary">Download last month's transactions from your bank and import them so your budget stays accurate.</p>
        </div>
        <button type="button" aria-label="Dismiss import reminder" onClick={() => { dismissImportReminder(); setDismissed(true) }} className="shrink-0 w-11 h-11 -mt-2 -mr-2 flex items-center justify-center text-text-secondary">
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {linkToBudget && (
          <Link to="/budget" className="min-h-[44px] px-4 rounded-[10px] inline-flex items-center bg-accent text-bg-primary font-semibold">Go to Import</Link>
        )}
        <a href={calendarHref} download="ledger-import-reminder.ics" className="min-h-[44px] px-4 rounded-[10px] inline-flex items-center gap-1.5 bg-[color-mix(in_srgb,var(--text-secondary)_14%,transparent)] text-accent font-semibold">
          <CalendarPlus className="w-4 h-4" aria-hidden="true" /> Remind me on the 1st
        </a>
      </div>
    </section>
  )
}
