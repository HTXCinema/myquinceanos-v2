'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const supabase = createClient()

const NAV_LINKS = [
  { href: '/vendors', label: 'Find Vendors' },
  { href: '/planning', label: 'Planning Tools' },
  { href: '/events', label: 'Events' },
  { href: '/vendor-pricing', label: 'For Vendors' },
]

// Pages with dark backgrounds — hamburger should be white
const DARK_PAGES = ['/', '/vendors', '/auth/login', '/auth/signup', '/auth/forgot-password']

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ email: data.user.email })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ? { email: session.user.email } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isDarkPage = DARK_PAGES.includes(pathname) ||
    pathname.startsWith('/vendors/') ||
    pathname.startsWith('/events/')

  // Nav background color
  const navBg = open
    ? 'rgba(26,10,15,0.98)'
    : scrolled
      ? isDarkPage ? 'rgba(26,10,15,0.97)' : 'rgba(255,255,255,0.97)'
      : 'transparent'

  // Text colors for desktop links
  const textColor = isDarkPage || open
    ? 'rgba(255,255,255,0.7)'
    : 'rgba(74,48,64,0.9)'

  const activeTextColor = isDarkPage || open ? '#FAD8E9' : '#C97C8A'

  // Hamburger color — KEY FIX: always dark on light pages, always light on dark pages
  // When scrolled on a light page, bg is white so we need dark icon
  // When not scrolled on a light page, bg is transparent over white content — need dark icon
  // On dark pages — always white icon
  const hamburgerColor = isDarkPage ? '#fff' : '#1a0a0f'

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: navBg,
        backdropFilter: (scrolled || open) ? 'blur(12px)' : 'none',
        borderBottom: scrolled && !open ? `0.5px solid ${isDarkPage ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` : 'none',
        transition: 'background 0.2s, border 0.2s',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#C97C8A,#FAD8E9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1a0a0f' }}>MQ</span>
          </div>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 17,
            fontWeight: 600,
            color: isDarkPage || open ? '#fff' : '#1a0a0f',
            letterSpacing: '-0.3px',
          }}>MyQuinceAños</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-desktop">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} style={{
              fontSize: 14,
              fontWeight: pathname === link.href ? 600 : 400,
              color: pathname === link.href ? activeTextColor : textColor,
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <Link href="/mom-dashboard" style={{
              fontSize: 14, fontWeight: 500, color: '#C97C8A',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(201,124,138,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#C97C8A', fontWeight: 600 }}>
                {user.email?.[0]?.toUpperCase() || 'M'}
              </div>
            </Link>
          ) : (
            <Link href="/auth/signup" style={{
              padding: '8px 18px', borderRadius: 24,
              background: 'linear-gradient(135deg,#C97C8A,#b56a78)',
              color: '#fff', fontSize: 14, fontWeight: 600,
              textDecoration: 'none', boxShadow: '0 2px 12px rgba(201,124,138,0.35)',
            }}>
              Get started
            </Link>
          )}
        </div>

        {/* Mobile hamburger — color always correct */}
        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="nav-mobile-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            borderRadius: 8,
            color: open ? '#fff' : hamburgerColor,
          }}
        >
          {open ? (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="4" x2="18" y2="18" /><line x1="18" y1="4" x2="4" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="7" x2="19" y2="7" /><line x1="3" y1="12" x2="19" y2="12" /><line x1="3" y1="17" x2="19" y2="17" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 49,
          background: '#1a0a0f',
          display: 'flex', flexDirection: 'column',
          paddingTop: 80, paddingBottom: 40,
          paddingLeft: 32, paddingRight: 32,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} style={{
                fontSize: 24, fontWeight: 500,
                color: pathname === link.href ? '#C97C8A' : 'rgba(255,255,255,0.85)',
                textDecoration: 'none', padding: '14px 0',
                borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                fontFamily: "'Playfair Display', serif",
              }}>
                {link.label}
              </Link>
            ))}
          </div>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {user ? (
              <>
                <Link href="/mom-dashboard" style={{
                  padding: '14px 20px', borderRadius: 14, textAlign: 'center',
                  background: 'rgba(201,124,138,0.12)', color: '#C97C8A',
                  fontSize: 16, fontWeight: 600, textDecoration: 'none',
                }}>My Dashboard</Link>
                <button onClick={async () => { await supabase.auth.signOut(); setOpen(false) }} style={{
                  padding: '14px 20px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
                  fontSize: 15, fontWeight: 500, border: '0.5px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                }}>Sign out</button>
              </>
            ) : (
              <>
                <Link href="/auth/signup" style={{
                  padding: '16px 20px', borderRadius: 14, textAlign: 'center',
                  background: 'linear-gradient(135deg,#C97C8A,#b56a78)',
                  color: '#fff', fontSize: 16, fontWeight: 700, textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(201,124,138,0.3)',
                }}>Create free account</Link>
                <Link href="/auth/login" style={{
                  padding: '14px 20px', borderRadius: 14, textAlign: 'center',
                  background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
                  fontSize: 15, fontWeight: 500, textDecoration: 'none',
                  border: '0.5px solid rgba(255,255,255,0.1)',
                }}>Sign in</Link>
              </>
            )}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '0.5px solid rgba(255,255,255,0.06)' }}>
            <Link href="/get-listed" style={{
              fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>💼</span>
              Are you a vendor? Get listed →
            </Link>
          </div>
        </div>
      )}

      <div style={{ height: 60 }} />

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-btn { display: none !important; }
        }
      `}</style>
    </>
  )
}
