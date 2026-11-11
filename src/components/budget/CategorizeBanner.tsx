import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Tags } from 'lucide-react'
import { useTriageStore } from '../../store/useTriageStore'
import { isQueueRow } from '../../utils/budget/categorizeQueue'

/** The way into the Categorize page whenever imported transactions are waiting. */
export const CategorizeBanner: React.FC = () => {
  const count = useTriageStore((s) => Object.values(s.pendingTransactions).filter(isQueueRow).length)
  if (count === 0) return null
  return (
    <Link
      to="/budget/categorize"
      data-testid="categorize-banner"
      className="themed-card flex items-center gap-3 p-4 min-h-[64px] active:opacity-60"
    >
      <span className="w-9 h-9 shrink-0 rounded-full bg-accent text-white flex items-center justify-center">
        <Tags className="w-5 h-5" aria-hidden="true" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[17px] font-semibold">{count.toLocaleString()} to categorize</span>
        <span className="block text-[14px] text-text-secondary">Pick a category once per store; Ledger does the rest.</span>
      </span>
      <span className="text-[15px] font-semibold text-accent shrink-0 flex items-center">Start<ChevronRight className="w-5 h-5" aria-hidden="true" /></span>
    </Link>
  )
}
