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

import paypalQr from '../../docs/screenshots/buymeacoffeepaypal.png'

const REPO = 'https://github.com/matbmoser/learn-to-invest'
const PAYPAL = 'https://paypal.me/mathiasbrunkowmoser'

function IconCoffee() {
  return (
    <svg className="mi" width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  )
}

function IconGitHub() {
  return (
    <svg className="mi" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.2c-3.34.72-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="foot-copy">
          <span>Learn to Invest · From zero to business analyst</span>
          <span className="foot-made">
            Made with <span className="foot-heart" aria-label="love">♥</span> by{' '}
            <a href="https://github.com/matbmoser" target="_blank" rel="noopener noreferrer">
              Mathias Brunkow Moser
            </a>
          </span>
        </div>

        <div className="foot-actions">
          <a className="coffee-qr" href={PAYPAL} target="_blank" rel="noopener noreferrer"
            aria-label="Open Mathias's PayPal page">
            <img src={paypalQr} alt="PayPal QR code for Mathias Brunkow Moser" width="500" height="500" />
          </a>
          <div className="coffee-copy">
            <span className="foot-local">Your progress and keys stay local in this browser.</span>
            <div className="foot-support-buttons">
              <a className="coffee-btn" href={PAYPAL} target="_blank" rel="noopener noreferrer"
                aria-label="Buy Mathias a coffee with PayPal">
                <IconCoffee />
                Buy me a coffee
                <span className="coffee-provider">PayPal</span>
              </a>
              <a className="coffee-btn github-star-btn" href={REPO} target="_blank" rel="noopener noreferrer"
                aria-label="Give this project a star on GitHub">
                <IconGitHub />
                Give us a star
              </a>
            </div>
          </div>
        </div>

        <span className="foot-legal">
          © 2026 Mathias Brunkow Moser ·{' '}
          <a href={`${REPO}/blob/master/LICENSE`} target="_blank" rel="noopener noreferrer">
            GPL-3.0-or-later
          </a>{' '}
          · Educational simulator — not financial advice
        </span>
      </div>
    </footer>
  )
}
