// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (C) 2026 Mathias Brunkow Moser
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.
//
// This file was generated with AI assistance (Claude Code, Anthropic).

// A catalog of major European listings with the symbol/exchange codes Twelve
// Data expects, so adding a European holding is a click rather than a guess.
// `proxy` is a US-listed stand-in used ONLY for charting when the user's data
// plan does not include the European exchange (see realportfolio.js).

export const EXCHANGES = [
  { code: 'XETR', name: 'Xetra (Frankfurt)', country: 'Germany', currency: 'EUR' },
  { code: 'EURONEXT', name: 'Euronext Paris', country: 'France', currency: 'EUR' },
  { code: 'AMS', name: 'Euronext Amsterdam', country: 'Netherlands', currency: 'EUR' },
  { code: 'BME', name: 'Bolsa de Madrid', country: 'Spain', currency: 'EUR' },
  { code: 'MIL', name: 'Borsa Italiana', country: 'Italy', currency: 'EUR' },
  { code: 'LSE', name: 'London Stock Exchange', country: 'UK', currency: 'GBP' },
  { code: 'SIX', name: 'SIX Swiss Exchange', country: 'Switzerland', currency: 'CHF' },
  { code: 'OMXSTO', name: 'Nasdaq Stockholm', country: 'Sweden', currency: 'SEK' },
]

// type: stock | etf. sector helps the analyst reason about concentration.
export const EUROPEAN_INSTRUMENTS = [
  // --- Germany (Xetra) ---
  { name: 'BMW', symbol: 'BMW', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Automotive', proxy: 'BMWYY' },
  { name: 'Mercedes-Benz Group', symbol: 'MBG', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Automotive', proxy: 'MBGYY' },
  { name: 'Volkswagen (Vz.)', symbol: 'VOW3', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Automotive', proxy: 'VWAGY' },
  { name: 'Porsche AG', symbol: 'P911', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Automotive', proxy: 'POAHY' },
  { name: 'SAP', symbol: 'SAP', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Technology', proxy: 'SAP' },
  { name: 'Siemens', symbol: 'SIE', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Industrials', proxy: 'SIEGY' },
  { name: 'Allianz', symbol: 'ALV', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Financials', proxy: 'ALIZY' },
  { name: 'Deutsche Telekom', symbol: 'DTE', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Telecoms', proxy: 'DTEGY' },
  { name: 'Deutsche Bank', symbol: 'DBK', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Financials', proxy: 'DB' },
  { name: 'Bayer', symbol: 'BAYN', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Healthcare', proxy: 'BAYRY' },
  { name: 'BASF', symbol: 'BAS', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Materials', proxy: 'BASFY' },
  { name: 'Adidas', symbol: 'ADS', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Consumer', proxy: 'ADDYY' },
  { name: 'Infineon', symbol: 'IFX', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Technology', proxy: 'IFNNY' },
  { name: 'Rheinmetall', symbol: 'RHM', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Industrials', proxy: 'RNMBY' },
  { name: 'Munich Re', symbol: 'MUV2', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Financials', proxy: 'MURGY' },
  { name: 'Airbus', symbol: 'AIR', exchange: 'XETR', currency: 'EUR', type: 'stock', sector: 'Industrials', proxy: 'EADSY' },

  // --- France / Netherlands / rest of euro area ---
  { name: 'LVMH', symbol: 'MC', exchange: 'EURONEXT', currency: 'EUR', type: 'stock', sector: 'Consumer', proxy: 'LVMUY' },
  { name: 'TotalEnergies', symbol: 'TTE', exchange: 'EURONEXT', currency: 'EUR', type: 'stock', sector: 'Energy', proxy: 'TTE' },
  { name: 'Sanofi', symbol: 'SAN', exchange: 'EURONEXT', currency: 'EUR', type: 'stock', sector: 'Healthcare', proxy: 'SNY' },
  { name: 'Schneider Electric', symbol: 'SU', exchange: 'EURONEXT', currency: 'EUR', type: 'stock', sector: 'Industrials', proxy: 'SBGSY' },
  { name: 'ASML', symbol: 'ASML', exchange: 'AMS', currency: 'EUR', type: 'stock', sector: 'Technology', proxy: 'ASML' },
  { name: 'Ahold Delhaize', symbol: 'AD', exchange: 'AMS', currency: 'EUR', type: 'stock', sector: 'Consumer Staples', proxy: 'ADRNY' },
  { name: 'ING Group', symbol: 'INGA', exchange: 'AMS', currency: 'EUR', type: 'stock', sector: 'Financials', proxy: 'ING' },
  { name: 'Banco Santander', symbol: 'SAN', exchange: 'BME', currency: 'EUR', type: 'stock', sector: 'Financials', proxy: 'SAN' },
  { name: 'Iberdrola', symbol: 'IBE', exchange: 'BME', currency: 'EUR', type: 'stock', sector: 'Utilities', proxy: 'IBDRY' },
  { name: 'Ferrari', symbol: 'RACE', exchange: 'MIL', currency: 'EUR', type: 'stock', sector: 'Automotive', proxy: 'RACE' },
  { name: 'Enel', symbol: 'ENEL', exchange: 'MIL', currency: 'EUR', type: 'stock', sector: 'Utilities', proxy: 'ENLAY' },
  { name: 'Nestlé', symbol: 'NESN', exchange: 'SIX', currency: 'CHF', type: 'stock', sector: 'Consumer Staples', proxy: 'NSRGY' },
  { name: 'Novartis', symbol: 'NOVN', exchange: 'SIX', currency: 'CHF', type: 'stock', sector: 'Healthcare', proxy: 'NVS' },
  { name: 'Roche', symbol: 'ROG', exchange: 'SIX', currency: 'CHF', type: 'stock', sector: 'Healthcare', proxy: 'RHHBY' },
  { name: 'Shell', symbol: 'SHEL', exchange: 'LSE', currency: 'GBP', type: 'stock', sector: 'Energy', proxy: 'SHEL' },
  { name: 'AstraZeneca', symbol: 'AZN', exchange: 'LSE', currency: 'GBP', type: 'stock', sector: 'Healthcare', proxy: 'AZN' },
  { name: 'Unilever', symbol: 'ULVR', exchange: 'LSE', currency: 'GBP', type: 'stock', sector: 'Consumer Staples', proxy: 'UL' },

  // --- UCITS ETFs commonly held by European investors ---
  { name: 'iShares Core MSCI World (Acc)', symbol: 'EUNL', exchange: 'XETR', currency: 'EUR', type: 'etf', sector: 'Global equity', proxy: 'URTH' },
  { name: 'iShares Core S&P 500 (Acc)', symbol: 'SXR8', exchange: 'XETR', currency: 'EUR', type: 'etf', sector: 'US equity', proxy: 'IVV' },
  { name: 'Vanguard FTSE All-World (Acc)', symbol: 'VWCE', exchange: 'XETR', currency: 'EUR', type: 'etf', sector: 'Global equity', proxy: 'VT' },
  { name: 'iShares Core MSCI EM IMI (Acc)', symbol: 'IS3N', exchange: 'XETR', currency: 'EUR', type: 'etf', sector: 'Emerging markets', proxy: 'IEMG' },
  { name: 'iShares Core EURO STOXX 50 (Acc)', symbol: 'SXRT', exchange: 'XETR', currency: 'EUR', type: 'etf', sector: 'Europe equity', proxy: 'FEZ' },
  { name: 'Xtrackers MSCI Europe (Acc)', symbol: 'XMEU', exchange: 'XETR', currency: 'EUR', type: 'etf', sector: 'Europe equity', proxy: 'IEUR' },
  { name: 'L&G Artificial Intelligence (Acc)', symbol: 'AIAI', exchange: 'LSE', currency: 'USD', type: 'etf', sector: 'Thematic — AI', proxy: 'AIQ' },
  { name: 'iShares Global Clean Energy', symbol: 'IQQH', exchange: 'XETR', currency: 'EUR', type: 'etf', sector: 'Thematic — energy', proxy: 'ICLN' },
  { name: 'iShares EUR Corp Bond', symbol: 'IEAC', exchange: 'XETR', currency: 'EUR', type: 'etf', sector: 'Bonds', proxy: 'LQD' },
  { name: 'Xtrackers II EUR Overnight Rate', symbol: 'XEON', exchange: 'XETR', currency: 'EUR', type: 'etf', sector: 'Cash / money market', proxy: 'BIL' },
]

export function searchEuropean(query) {
  const q = query.trim().toLowerCase()
  if (!q) return EUROPEAN_INSTRUMENTS
  return EUROPEAN_INSTRUMENTS.filter((i) =>
    i.name.toLowerCase().includes(q) ||
    i.symbol.toLowerCase().includes(q) ||
    i.sector.toLowerCase().includes(q) ||
    i.exchange.toLowerCase().includes(q)
  )
}
