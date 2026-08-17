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
import { IconCoffee, IconHeart, IconStar } from './icons.jsx'

const REPO = 'https://github.com/matbmoser/learn-to-invest'
const PAYPAL = 'https://paypal.me/mathiasbrunkowmoser'

export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="foot-copy">
          <span>Learn to Invest · From zero to business analyst</span>
          <span className="foot-made">
            Made with <span className="foot-heart"><IconHeart size={13} /></span> by{' '}
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
                <IconCoffee size={16} />
                Buy me a coffee
                <span className="coffee-provider">PayPal</span>
              </a>
              <a className="coffee-btn github-star-btn" href={REPO} target="_blank" rel="noopener noreferrer"
                aria-label="Give this project a star on GitHub">
                <IconStar size={16} />
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
