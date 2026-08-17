export const fmtMoney = (v, digits = 2) =>
  v == null ? '—' : v.toLocaleString('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  })

export const fmtNum = (v, digits = 2) =>
  v == null ? '—' : v.toLocaleString('en-US', {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  })

export const fmtPct = (v, digits = 2, signed = true) => {
  if (v == null) return '—'
  const sign = signed && v > 0 ? '+' : ''
  return `${sign}${v.toFixed(digits)}%`
}

export const fmtBillions = (v) => (v == null ? '—' : `$${v.toFixed(1)}B`)

export const fmtDate = (d) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export const fmtDateShort = (d) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

export const fmtCompact = (v) =>
  v == null ? '—' : Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
