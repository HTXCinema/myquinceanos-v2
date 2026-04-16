'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav style={{ background: '#1a0a0f', height: 56 }}
      className="flex items-center justify-between px-7 sticky top-0 z-50">
      <Link href="/" className="font-serif text-xl" style={{ color: '#FAD8E9' }}>
        My<span style={{ color: '#C9A040' }}>Quince</span>Años
      </Link>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-6">
        {[
          ['Find Vendors', '/vendors'],
          ['Plan My Quince', '/planning'],
          ['Budget Calculator', '/#calculator'],
          ['Events', '/events'],
          ['Español', '/?lang=es'],
        ].map(([label, href]) => (
          <Link key={href} href={href}
            className="text-sm" style={{ color: 'rgba(250,216,233,0.65)' }}>
            {label}
          </Link>
        ))}
        <Link href="/get-listed"
          className="text-sm font-medium text-white px-4 py-2 rounded-full"
          style={{ background: '#C97C8A' }}>
          Get Listed
        </Link>
      </div>

      {/* Mobile hamburger */}
      <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
          {open
            ? <><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></>
            : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
          }
        </svg>
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-14 left-0 right-0 z-50 flex flex-col gap-1 p-4"
          style={{ background: '#1a0a0f', borderTop: '0.5px solid rgba(250,216,233,0.1)' }}>
          {[
            ['Find Vendors', '/vendors'],
            ['Plan My Quince', '/planning'],
            ['Events', '/events'],
            ['Get Listed', '/get-listed'],
            ['Vendor Pricing', '/vendor-pricing'],
          ].map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="py-3 text-sm border-b"
              style={{ color: 'rgba(250,216,233,0.75)', borderColor: 'rgba(250,216,233,0.08)' }}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
