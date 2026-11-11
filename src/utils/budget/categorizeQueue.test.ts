import { describe, expect, it } from 'vitest'
import { buildMerchantGroups, monthsBefore } from './categorizeQueue'
import type { TriageTransaction } from '../../types/triage'

const tx = (id: string, description: string, date: string, amount: number, extra: Partial<TriageTransaction> = {}): TriageTransaction =>
  ({ id, description, date, amount, type: 'expense', ...extra })

describe('buildMerchantGroups', () => {
  const rows = [
    tx('a', 'LOBLAWS #1234 TORONTO ON', '2026-11-03', 80.5),
    tx('b', 'LOBLAWS #5678 NORTH YORK ON', '2026-10-20', 40.25),
    tx('c', 'TIM HORTONS #22 OTTAWA ON', '2026-11-05', 3.1),
    tx('d', 'LOBLAWS #1234 TORONTO ON', '2025-01-10', 12),
    tx('e', 'NETFLIX.COM', '2026-11-01', 18.99, { duplicate: 'possible' }),
    tx('f', 'PAYMENT THANK YOU', '2026-11-02', 500, { flag: 'card-payment', type: 'income' }),
    tx('g', 'LOBLAWS REFUND', '2026-11-04', -10, { categoryId: 'groceries' }),
  ]

  it('puts every branch of one store in one group, newest merchant first', () => {
    const groups = buildMerchantGroups(rows)
    expect(groups.map((g) => g.label)).toEqual(['Tim Hortons', 'Loblaws Refund', 'Loblaws'])
    const loblaws = groups.find((g) => g.key === 'loblaws')!
    expect(loblaws.ids.sort()).toEqual(['a', 'b', 'd'])
    expect(loblaws.count).toBe(3)
    expect(loblaws.total).toBe(132.75)
    expect(loblaws.latestDate).toBe('2026-11-03')
    expect(loblaws.samples).toEqual(['LOBLAWS #1234 TORONTO ON', 'LOBLAWS #5678 NORTH YORK ON'])
  })

  it('leaves possible duplicates and card payments to the Transactions tab', () => {
    const ids = buildMerchantGroups(rows).flatMap((g) => g.ids)
    expect(ids).not.toContain('e')
    expect(ids).not.toContain('f')
  })

  it('limits to a window but still groups within it', () => {
    const groups = buildMerchantGroups(rows, { since: '2026-08-11' })
    expect(groups.find((g) => g.key === 'loblaws')!.ids.sort()).toEqual(['a', 'b'])
  })

  it('carries the bank suggestion', () => {
    expect(buildMerchantGroups(rows).find((g) => g.key === 'loblaws refund')!.suggestedCategoryId).toBe('groceries')
  })
})

describe('monthsBefore', () => {
  it('goes back calendar months', () => {
    expect(monthsBefore('2026-11-11', 3)).toBe('2026-08-11')
    expect(monthsBefore('2026-01-15', 2)).toBe('2025-11-15')
  })
})
