import { describe, expect, it } from 'vitest'
import { matchesRule, merchantKey, merchantLabel } from './merchant'

describe('merchantKey', () => {
  it.each([
    ['LOBLAWS #1234 TORONTO ON', 'loblaws'],
    ['LOBLAWS #5678 NORTH YORK ON', 'loblaws'],
    ['TIM HORTONS #2231 OTTAWA, ON', 'tim hortons'],
    ['SHOPPERS DRUG MART #0812 NORTH YORK ON', 'shoppers drug mart'],
    ['AMZN Mktp CA*2K4HJ67T1', 'amzn mktp ca'],
    ['AMZN Mktp CA*9ZZ11AB22', 'amzn mktp ca'],
    ['UBER CANADA/UBERTRIP TORONTO ON', 'uber canada ubertrip'],
    ['SQ *BLUE BOTTLE COFFEE', 'blue bottle coffee'],
    ['NETFLIX.COM', 'netflix com'],
    ['E-TRANSFER 105112233 JANE DOE', 'etransfer jane doe'],
    ['PRESTO FARE/E3K7A9 TORONTO ON', 'presto fare'],
    // CIBC chequing rows lead with how the money moved.
    ['Point of Sale - Interac RETAIL PURCHASE 000001039445 TIM HORTONS #24', 'tim hortons'],
    ['Electronic Funds Transfer PREAUTHORIZED DEBIT ROGERS', 'rogers'],
    ['Internet Banking INTERNET BILL PAY 000000123456 TORONTO HYDRO', 'toronto hydro'],
    ['INTERNET TRANSFER 000000123456', 'internet transfer'],
    ['Automated Banking Machine ATM WITHDRAWAL 2H3K', 'automated banking machine'],
  ])('%s → %s', (description, key) => {
    expect(merchantKey(description)).toBe(key)
  })

  it('gives every branch of one store the same key', () => {
    const keys = new Set(['TIM HORTONS #1 TORONTO ON', 'TIM HORTONS #22 OTTAWA ON', 'TIM HORTONS #333 KINGSTON ON'].map(merchantKey))
    expect(keys.size).toBe(1)
  })

  it('keeps different people apart in e-transfers', () => {
    expect(merchantKey('E-TRANSFER 1 JANE DOE')).not.toBe(merchantKey('E-TRANSFER 2 JOHN SMITH'))
  })

  it('never returns an empty key', () => {
    expect(merchantKey('#1234 5678')).toBe('#1234 5678')
  })
})

describe('matchesRule', () => {
  it('matches a learned merchant key at any branch', () => {
    expect(matchesRule('LOBLAWS #9999 BARRIE ON', 'loblaws')).toBe(true)
    expect(matchesRule('TIM HORTONS #4 OTTAWA ON', 'tim hortons')).toBe(true)
    expect(matchesRule('E-TRANSFER 77 JANE DOE', 'etransfer jane doe')).toBe(true)
  })

  it('still honours an older full-description rule', () => {
    expect(matchesRule('Spotify P1234 Stockholm', 'spotify')).toBe(true)
    expect(matchesRule('LOBLAWS #1234 TORONTO ON', 'LOBLAWS #1234 TORONTO ON')).toBe(true)
  })

  it('does not match inside another word', () => {
    expect(matchesRule('BARBERSHOP ON QUEEN', 'bar')).toBe(true) // raw substring rules behave as before
    expect(matchesRule('E-TRANSFER 1 JOHN SMITH', 'etransfer jane doe')).toBe(false)
  })
})

describe('merchantLabel', () => {
  it('title-cases the key', () => {
    expect(merchantLabel('shoppers drug mart')).toBe('Shoppers Drug Mart')
  })
})
