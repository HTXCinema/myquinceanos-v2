'use client'
import { useState } from 'react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import ReviewModal from '@/components/ReviewModal'

const VENDOR_CATEGORIES = [
  { id: 'venue', label: 'Venue', slug: 'venues', month: 12 },
  { id: 'photo', label: 'Photographer', slug: 'photographers', month: 12 },
  { id: 'video', label: 'Videographer', slug: 'videography', month: 9 },
  { id: 'dj', label: 'DJ / Music', slug: 'djs-music', month: 9 },
  { id: 'catering', label: 'Catering', slug: 'catering', month: 6 },
  { id: 'dress', label: 'Dress & Boutique', slug: 'dresses-boutiques', month: 9 },
  { id: 'makeup', label: 'Makeup & Hair', slug: 'makeup-hair', month: 3 },
  { id: 'choreo', label: 'Choreographer', slug: 'choreographers', month: 6 },
  { id: 'cake', label: 'Cake & Desserts', slug: 'cakes-bakeries', month: 3 },
  { id: 'decor', label: 'Decor & Flowers', slug: 'decor-flowers', month: 6 },
  { id: 'limo', label: 'Limo / Transport', slug: 'limos-transport', month: 3 },
  { id: 'entertainment', label: 'Entertainment', slug: 'entertainment', month: 3 },
]

const TIMELINE_GROUPS = [
  { months: 12, label: '12 Months Before', tasks: ['Set your date & budget', 'Book your venue', 'Book photographer & videographer'] },
  { months: 9, label: '9 Months Before', tasks: ['Book DJ or band', 'Start dress shopping', 'Book choreographer'] },
  { months: 6, label: '6 Months Before', tasks: ['Book catering', 'Book decor & flowers', 'Choose court of honor'] },
  { months: 3, label: '3 Months Before', tasks: ['Send invitations', 'Book makeup & hair', 'Confirm all vendors'] },
  { months: 1, label: '1 Month Before', tasks: ['Final dress fitting', 'Confirm guest count', 'Create seating plan'] },
  { months: 0, label: 'Week Of', tasks: ['Confirm vendor arrival times', 'Prepare final payments', 'Relax and enjoy!'] },
]

const BUDGET_SPLITS: Record<string, number> = {
  venue: 0.26, photo: 0.12, video: 0.09, dj: 0.10,
  catering: 0.21, dress: 0.09, makeup: 0.05, choreo: 0.03,
  cake: 0.02, decor: 0.07, limo: 0.03, entertainment: 0.03,
}

type VendorEntry = { id: string; name: string; price?: number; phone?: string; note?: string }
type ChecklistItem = { catId: string; booked: boolean; selectedVendor: string; savedVendors: VendorEntry[] }
type Payment = { id: string; vendor: string; label: string; amount: number; due: string; paid: boolean }

function initChecklist(): ChecklistItem[] {
  return VENDOR_CATEGORIES.map(c => ({ catId: c.id, booked: false, selectedVendor: '', savedVendors: [] }))
}

const fmt = (n: number) => '$' + Math.round(n).toLocaleString()

function daysBreakdown(date: string) {
  if (!date) return null
  const ms = new Date(date).getTime() - Date.now()
  if (ms <= 0) return null
  const totalDays = Math.ceil(ms / 86400000)
  const months = Math.floor(totalDays / 30)
  const weeks = Math.floor((totalDays % 30) / 7)
  const days = totalDays % 7
  return { totalDays, months, weeks, days }
}

function getUrgencyBadge(due: string, paid: boolean) {
  if (paid) return { label: 'PAID', color: '#1a7a4a', bg: 'rgba(26,122,74,.1)' }
  const days = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: 'OVERDUE', color: '#E24B4A', bg: 'rgba(226,75,74,.1)' }
  if (days <= 14) return { label: 'URGENT', color: '#E24B4A', bg: 'rgba(226,75,74,.1)' }
  if (days <= 45) return { label: `${days} DAYS`, color: '#C9A040', bg: 'rgba(201,160,64,.1)' }
  return { label: 'ON TRACK', color: '#1a7a4a', bg: 'rgba(26,122,74,.1)' }
}

export default function PlanningPage() {
  const [step, setStep] = useState<'setup' | 'dashboard'>('setup')
  const [activeSection, setActiveSection] = useState<'checklist' | 'compare' | 'timeline'>('checklist')
  const [form, setForm] = useState({ daughter: '', date: '', budget: '', guests: '' })
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initChecklist())
  const [payments, setPayments] = useState<Payment[]>([])
  const [compareMode, setCompareMode] = useState<string | null>(null)
  const [addingVendorTo, setAddingVendorTo] = useState<string | null>(null)
  const [newVendor, setNewVendor] = useState({ name: '', price: '', phone: '', note: '' })
  const [addPayment, setAddPayment] = useState(false)
  const [newPayment, setNewPayment] = useState({ vendor: '', label: 'Deposit', amount: '', due: '' })
  const [reviewVendor, setReviewVendor] = useState<{ id: string; name: string; category: string } | null>(null)
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'upcoming' | 'done'>('all')

  const countdown = daysBreakdown(form.date)
  const eventPassed = form.date ? new Date(form.date) < new Date() : false
  const budget = Number(form.budget) || 0
  const totalSpent = checklist.reduce((a, c) => {
    const sel = c.savedVendors.find(v => v.name === c.selectedVendor)
    return a + (sel?.price || 0)
  }, 0)
  const bookedCount = checklist.filter(c => c.booked).length
  const totalPaid = payments.filter(p => p.paid).reduce((a, p) => a + p.amount, 0)
  const totalDue = payments.reduce((a, p) => a + p.amount, 0)
  const progressPct = Math.round((bookedCount / VENDOR_CATEGORIES.length) * 100)

  const getCatItem = (catId: string) => checklist.find(c => c.catId === catId)!
  const updateCat = (catId: string, updates: Partial<ChecklistItem>) =>
    setChecklist(prev => prev.map(c => c.catId === catId ? { ...c, ...updates } : c))

  const addVendorToCategory = (catId: string) => {
    if (!newVendor.name.trim()) return
    const v: VendorEntry = {
      id: Date.now().toString(),
      name: newVendor.name.trim(),
      price: newVendor.price ? Number(newVendor.price) : undefined,
      phone: newVendor.phone || undefined,
      note: newVendor.note || undefined,
    }
    updateCat(catId, { savedVendors: [...getCatItem(catId).savedVendors, v] })
    setNewVendor({ name: '', price: '', phone: '', note: '' })
    setAddingVendorTo(null)
  }

  const selectVendor = (catId: string, vendorName: string) => {
    updateCat(catId, { selectedVendor: vendorName, booked: true })
    setCompareMode(null)
  }

  const removeVendor = (catId: string, vendorId: string) => {
    const item = getCatItem(catId)
    const removing = item.savedVendors.find(v => v.id === vendorId)
    const remaining = item.savedVendors.filter(v => v.id !== vendorId)
    updateCat(catId, {
      savedVendors: remaining,
      selectedVendor: removing?.name === item.selectedVendor ? '' : item.selectedVendor,
      booked: removing?.name === item.selectedVendor ? false : item.booked,
    })
  }

  const filteredChecklist = VENDOR_CATEGORIES.filter(cat => {
    const item = getCatItem(cat.id)
    if (checklistFilter === 'done') return item.booked
    if (checklistFilter === 'upcoming') return !item.booked
    return true
  })

  const monthsLeft = countdown?.months ?? null
  const nextUnbooked = VENDOR_CATEGORIES.find(c => !getCatItem(c.id).booked)

  // ── SETUP SCREEN ──
  if (step === 'setup') {
    return (
      <>
        <Nav />
        <div style={{ minHeight: '80vh', background: 'linear-gradient(160deg, #1a0a0f 0%, #2d1020 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
          <div style={{ maxWidth: 580, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 12 }}>Free Planning Hub</div>
              <h1 className="font-serif" style={{ fontSize: 'clamp(28px,6vw,42px)', fontWeight: 600, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>Your Quince Command Center</h1>
              <p style={{ fontSize: 14, color: 'rgba(250,216,233,.6)', lineHeight: 1.6 }}>Checklist · Budget tracker · Vendor comparison · Payment due dates — all free.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(250,216,233,.12)', borderRadius: 20, padding: '32px 28px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
                {[
                  { key: 'daughter', label: "Daughter's Name", placeholder: 'Sofia', type: 'text' },
                  { key: 'date', label: 'Event Date', placeholder: '', type: 'date' },
                  { key: 'budget', label: 'Total Budget ($)', placeholder: '15000', type: 'number' },
                  { key: 'guests', label: 'Guest Count', placeholder: '150', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(250,216,233,.45)', marginBottom: 7 }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', background: 'rgba(255,255,255,.07)', border: '0.5px solid rgba(250,216,233,.15)', borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s' }} />
                  </div>
                ))}
              </div>
              <button onClick={() => form.daughter && form.date ? setStep('dashboard') : alert('Please enter your daughter\'s name and event date')}
                style={{ width: '100%', background: 'linear-gradient(135deg,#C97C8A,#b56a78)', color: '#fff', border: 'none', padding: '14px 0', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 20px rgba(201,124,138,.35)' }}>
                Open my command center →
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(250,216,233,.3)', marginTop: 14 }}>No account needed · <Link href="/auth/signup" style={{ color: '#C97C8A', textDecoration: 'none' }}>Create free account</Link> to save your progress</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // ── DASHBOARD ──
  return (
    <>
      <Nav />

      {/* COUNTDOWN BANNER */}
      {countdown && (
        <div style={{ background: 'rgba(201,160,64,.1)', borderBottom: '0.5px solid rgba(201,160,64,.2)', padding: '8px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#C9A040', letterSpacing: '0.5px' }}>
            {countdown.months > 0 ? `${countdown.months} MONTHS · ` : ''}{countdown.weeks > 0 ? `${countdown.weeks} WEEKS · ` : ''}{countdown.days} DAYS UNTIL {form.daughter.toUpperCase()}'S QUINCEAÑERA
          </span>
        </div>
      )}
      {eventPassed && (
        <div style={{ background: 'rgba(26,122,74,.1)', borderBottom: '0.5px solid rgba(26,122,74,.2)', padding: '8px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#5DCAA5' }}>🎉 THE BIG DAY HAS PASSED — LEAVE REVIEWS FOR YOUR VENDORS</span>
        </div>
      )}

      {/* HERO HEADER */}
      <div style={{ background: '#1a0a0f', padding: '24px 24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <h1 className="font-serif" style={{ fontSize: 'clamp(22px,4vw,32px)', color: '#fff', marginBottom: 6 }}>
                {form.daughter}'s Quinceañera
                {form.date && <span style={{ color: 'rgba(250,216,233,.6)', fontWeight: 400 }}> — {new Date(form.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>}
              </h1>
              <div style={{ fontSize: 13, color: 'rgba(250,216,233,.45)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {form.guests && <span>Houston, TX · {form.guests} guests</span>}
                {budget > 0 && <span>{fmt(budget)} budget</span>}
              </div>
            </div>
            {countdown && (
              <div style={{ textAlign: 'center', background: 'rgba(201,160,64,.12)', border: '0.5px solid rgba(201,160,64,.3)', borderRadius: 12, padding: '12px 20px', flexShrink: 0 }}>
                <div className="font-serif" style={{ fontSize: 42, color: '#C9A040', lineHeight: 1 }}>{countdown.totalDays}</div>
                <div style={{ fontSize: 10, color: 'rgba(250,216,233,.4)', marginTop: 2 }}>days away</div>
                <div style={{ fontSize: 10, color: 'rgba(201,160,64,.6)', marginTop: 2 }}>
                  {countdown.months > 0 ? `${countdown.months}mo ` : ''}{countdown.weeks > 0 ? `${countdown.weeks}wk ` : ''}{countdown.days}d
                </div>
              </div>
            )}
          </div>

          {/* STAT STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, borderTop: '0.5px solid rgba(250,216,233,.08)' }}>
            {[
              ['BUDGET', budget ? fmt(budget) : '—'],
              ['SPENT', fmt(totalSpent)],
              ['BOOKED', `${bookedCount} / ${VENDOR_CATEGORIES.length}`],
              ['PROGRESS', `${progressPct}%`],
            ].map(([l, v]) => (
              <div key={l} style={{ padding: '14px 16px', borderRight: '0.5px solid rgba(250,216,233,.06)' }}>
                <div style={{ fontSize: 9, color: 'rgba(250,216,233,.3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 500, color: l === 'SPENT' && totalSpent > budget && budget > 0 ? '#E24B4A' : '#fff' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* NAV TABS */}
          <div style={{ display: 'flex', gap: 0, borderTop: '0.5px solid rgba(250,216,233,.08)', marginTop: 0, overflowX: 'auto' }}>
            {([
              ['checklist', 'Checklist'],
              ['compare', 'Compare Vendors'],
              ['timeline', 'Timeline'],
            ] as [typeof activeSection, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setActiveSection(key)}
                style={{ padding: '12px 20px', background: 'transparent', border: 'none', borderBottom: activeSection === key ? '2px solid #C97C8A' : '2px solid transparent', color: activeSection === key ? '#FAD8E9' : 'rgba(250,216,233,.35)', fontSize: 13, fontWeight: activeSection === key ? 500 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 60px' }}>

        {/* ── CHECKLIST + RIGHT PANEL (default view) ── */}
        {activeSection === 'checklist' && (
          <div className="planning-two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,380px)', gap: 20, alignItems: 'start' }}>

            {/* LEFT: PLANNING CHECKLIST */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A' }}>Planning Checklist</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['all', 'upcoming', 'done'] as const).map(f => (
                    <button key={f} onClick={() => setChecklistFilter(f)}
                      style={{ padding: '4px 12px', borderRadius: 20, border: `0.5px solid ${checklistFilter === f ? '#C97C8A' : 'rgba(201,124,138,.25)'}`, background: checklistFilter === f ? '#C97C8A' : 'transparent', color: checklistFilter === f ? '#fff' : '#7a5c65', fontSize: 11, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Group by timeline */}
              {TIMELINE_GROUPS.map(group => {
                const groupCats = filteredChecklist.filter(cat => cat.month === group.months)
                if (groupCats.length === 0) return null
                const allBooked = groupCats.every(cat => getCatItem(cat.id).booked)
                const isCurrent = monthsLeft !== null && monthsLeft <= group.months && monthsLeft > (TIMELINE_GROUPS.find((g, i) => TIMELINE_GROUPS[i - 1]?.months === group.months)?.months ?? -1)
                return (
                  <div key={group.months} style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: allBooked ? '#1a7a4a' : isCurrent ? '#C9A040' : 'rgba(201,124,138,.5)' }}>{group.label}</div>
                      {allBooked && <div style={{ fontSize: 9, background: 'rgba(26,122,74,.12)', color: '#1a7a4a', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>DONE</div>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {groupCats.map(cat => {
                        const item = getCatItem(cat.id)
                        return (
                          <div key={cat.id} style={{ background: '#fff', border: `0.5px solid ${item.booked ? 'rgba(26,122,74,.2)' : 'rgba(201,124,138,.18)'}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button onClick={() => updateCat(cat.id, { booked: !item.booked })}
                              style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${item.booked ? '#1a7a4a' : '#C97C8A'}`, background: item.booked ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                              {item.booked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                            </button>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span style={{ fontSize: 13, fontWeight: 500, color: item.booked ? '#aaa' : '#1a0a0f', textDecoration: item.booked ? 'line-through' : 'none' }}>{cat.label}</span>
                              {item.selectedVendor && <span style={{ fontSize: 11, color: '#C97C8A', fontWeight: 500, marginLeft: 8 }}>{item.selectedVendor}</span>}
                              {!item.selectedVendor && item.savedVendors.length > 0 && (
                                <span style={{ fontSize: 10, color: '#C9A040', marginLeft: 8 }}>{item.savedVendors.length} saved · pick one</span>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                              {item.booked && item.selectedVendor && eventPassed && (
                                <button onClick={() => setReviewVendor({ id: '', name: item.selectedVendor, category: cat.label })}
                                  style={{ fontSize: 10, color: '#C9A040', background: 'rgba(201,160,64,.1)', border: 'none', borderRadius: 20, padding: '3px 8px', cursor: 'pointer' }}>⭐ Review</button>
                              )}
                              {item.savedVendors.length > 0 && (
                                <button onClick={() => { setActiveSection('compare'); setCompareMode(cat.id) }}
                                  style={{ fontSize: 10, color: '#C9A040', background: 'rgba(201,160,64,.08)', border: 'none', borderRadius: 20, padding: '3px 8px', cursor: 'pointer' }}>
                                  Compare {item.savedVendors.length}
                                </button>
                              )}
                              <Link href={`/vendors?category=${cat.slug}`}
                                style={{ fontSize: 10, color: '#bbb', background: 'rgba(201,124,138,.06)', borderRadius: 20, padding: '3px 8px', textDecoration: 'none' }}>
                                Browse →
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Add custom task */}
              <button style={{ width: '100%', padding: '10px 0', border: '0.5px dashed rgba(201,124,138,.3)', borderRadius: 10, background: 'transparent', color: '#C97C8A', fontSize: 12, cursor: 'pointer', marginTop: 4 }}>
                + Add custom task
              </button>

              {/* MY SAVED VENDORS */}
              <div style={{ marginTop: 24, background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 14 }}>My Saved Vendors</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {VENDOR_CATEGORIES.map((cat, i) => {
                    const item = getCatItem(cat.id)
                    const hasVendor = item.selectedVendor || item.savedVendors.length > 0
                    return (
                      <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < VENDOR_CATEGORIES.length - 1 ? '0.5px solid rgba(201,124,138,.08)' : 'none' }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#C97C8A', textTransform: 'uppercase', letterSpacing: '.5px', width: 90, flexShrink: 0 }}>{cat.label}</div>
                        <div style={{ flex: 1, fontSize: 13, color: item.selectedVendor ? '#1a0a0f' : item.savedVendors.length > 0 ? '#C9A040' : '#bbb' }}>
                          {item.selectedVendor || (item.savedVendors.length > 0 ? `${item.savedVendors.map(v => v.name).join(' · ')}` : 'Not selected yet')}
                        </div>
                        {item.booked ? (
                          <div style={{ fontSize: 11, color: '#1a7a4a', fontWeight: 600, flexShrink: 0 }}>✓ Booked</div>
                        ) : item.savedVendors.length > 1 ? (
                          <button onClick={() => { setActiveSection('compare'); setCompareMode(cat.id) }}
                            style={{ fontSize: 11, color: '#C9A040', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}>Comparing {item.savedVendors.length}</button>
                        ) : (
                          <Link href={`/vendors?category=${cat.slug}`} style={{ fontSize: 11, color: '#C97C8A', textDecoration: 'none', flexShrink: 0 }}>+ Browse</Link>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button onClick={() => setActiveSection('compare')}
                  style={{ width: '100%', marginTop: 12, padding: '9px 0', border: '0.5px dashed rgba(201,124,138,.3)', borderRadius: 10, background: 'transparent', color: '#C97C8A', fontSize: 12, cursor: 'pointer' }}>
                  + Add vendor to list
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* BUDGET TRACKER */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '18px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 14 }}>Budget Tracker</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
                  <div className="font-serif" style={{ fontSize: 34, color: '#1a0a0f', lineHeight: 1 }}>{fmt(totalSpent)}</div>
                  <div style={{ fontSize: 13, color: '#7a5c65', marginBottom: 4 }}>of {budget ? fmt(budget) : '—'}</div>
                </div>
                {budget > 0 && (
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(201,124,138,.1)', overflow: 'hidden', marginBottom: 14 }}>
                    <div style={{ height: '100%', borderRadius: 4, background: totalSpent > budget ? '#E24B4A' : 'linear-gradient(90deg,#C97C8A,#C9A040)', width: `${Math.min((totalSpent / budget) * 100, 100)}%`, transition: 'width 0.4s' }} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {VENDOR_CATEGORIES.map(cat => {
                    const item = getCatItem(cat.id)
                    const sel = item.savedVendors.find(v => v.name === item.selectedVendor)
                    const price = sel?.price || 0
                    const suggested = budget ? Math.round(budget * (BUDGET_SPLITS[cat.id] || 0)) : 0
                    return (
                      <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                        <span style={{ color: '#555', flex: 1 }}>{cat.label}</span>
                        <span style={{ fontWeight: price > 0 ? 500 : 400, color: price > 0 ? '#1a0a0f' : '#ccc', minWidth: 60, textAlign: 'right' }}>
                          {price > 0 ? fmt(price) : suggested > 0 ? <span style={{ color: '#ddd' }}>{fmt(suggested)}</span> : '—'}
                        </span>
                      </div>
                    )
                  })}
                  {budget > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 600, color: budget - totalSpent < 0 ? '#E24B4A' : '#1a7a4a', borderTop: '0.5px solid rgba(201,124,138,.12)', paddingTop: 8, marginTop: 4 }}>
                      <span>Remaining</span>
                      <span>{fmt(Math.abs(budget - totalSpent))}{budget - totalSpent < 0 ? ' over' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PAYMENT DUE DATES */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '18px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A' }}>Payment Due Dates</div>
                </div>

                {payments.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#bbb', textAlign: 'center', padding: '16px 0' }}>No payments tracked yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                    {payments.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()).slice(0, 4).map(p => {
                      const badge = getUrgencyBadge(p.due, p.paid)
                      return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button onClick={() => setPayments(prev => prev.map(x => x.id === p.id ? { ...x, paid: !x.paid } : x))}
                            style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${p.paid ? '#1a7a4a' : '#C97C8A'}`, background: p.paid ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                            {p.paid && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: p.paid ? '#aaa' : '#1a0a0f', textDecoration: p.paid ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.vendor}</div>
                            <div style={{ fontSize: 11, color: '#7a5c65' }}>{fmt(p.amount)} · Due {new Date(p.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: badge.color, background: badge.bg, padding: '3px 8px', borderRadius: 20, flexShrink: 0, letterSpacing: '.5px' }}>{badge.label}</div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {addPayment ? (
                  <div style={{ background: 'rgba(201,124,138,.04)', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 10, padding: 14, marginTop: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                      {[
                        { key: 'vendor', label: 'Vendor', placeholder: 'Bell Tower', type: 'text' },
                        { key: 'label', label: 'Type', placeholder: 'Deposit', type: 'text' },
                        { key: 'amount', label: 'Amount ($)', placeholder: '1500', type: 'number' },
                        { key: 'due', label: 'Due Date', placeholder: '', type: 'date' },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display: 'block', fontSize: 10, color: '#7a5c65', marginBottom: 3 }}>{f.label}</label>
                          <input type={f.type} placeholder={f.placeholder}
                            value={newPayment[f.key as keyof typeof newPayment]}
                            onChange={e => setNewPayment(p => ({ ...p, [f.key]: e.target.value }))}
                            style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 7, padding: '7px 9px', fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <button onClick={() => {
                        if (!newPayment.vendor || !newPayment.amount || !newPayment.due) return
                        setPayments(prev => [...prev, { id: Date.now().toString(), vendor: newPayment.vendor, label: newPayment.label || 'Payment', amount: Number(newPayment.amount), due: newPayment.due, paid: false }])
                        setNewPayment({ vendor: '', label: 'Deposit', amount: '', due: '' })
                        setAddPayment(false)
                      }} style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Save</button>
                      <button onClick={() => setAddPayment(false)}
                        style={{ background: 'transparent', color: '#7a5c65', border: '0.5px solid rgba(201,124,138,.25)', padding: '8px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddPayment(true)}
                    style={{ width: '100%', padding: '9px 0', border: '0.5px dashed rgba(201,124,138,.3)', borderRadius: 10, background: 'transparent', color: '#C97C8A', fontSize: 12, cursor: 'pointer', marginTop: 4 }}>
                    + Add payment
                  </button>
                )}
              </div>

              {/* OVERALL PROGRESS */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '18px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 14 }}>Overall Progress</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(201,124,138,.12)" strokeWidth="7"/>
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#C97C8A" strokeWidth="7"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - progressPct / 100)}`}
                        strokeLinecap="round"/>
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="font-serif" style={{ fontSize: 18, color: '#C97C8A', fontWeight: 600 }}>{progressPct}%</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1a0a0f', marginBottom: 4 }}>
                      {progressPct === 100 ? 'All done! 🎉' : progressPct >= 50 ? 'Great progress!' : 'Just getting started!'}
                    </div>
                    <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 6 }}>{bookedCount} of {VENDOR_CATEGORIES.length} tasks done</div>
                    {nextUnbooked && !eventPassed && (
                      <div>
                        <Link href={`/vendors?category=${nextUnbooked.slug}`}
                          style={{ fontSize: 12, color: '#C97C8A', fontWeight: 500, textDecoration: 'none' }}>
                          Next: Book your {nextUnbooked.label} →
                        </Link>
                        {countdown && (
                          <div style={{ fontSize: 11, color: '#7a5c65', marginTop: 2 }}>
                            {countdown.months > 0 ? `${countdown.months}mo ` : ''}{countdown.weeks > 0 ? `${countdown.weeks}wk ` : ''}{countdown.days}d remaining
                          </div>
                        )}
                      </div>
                    )}
                    {eventPassed && <div style={{ fontSize: 12, color: '#5DCAA5', fontWeight: 500 }}>🎉 Leave reviews for your vendors!</div>}
                  </div>
                </div>

                {/* Payment summary */}
                {payments.length > 0 && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '0.5px solid rgba(201,124,138,.1)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#7a5c65' }}>Payments: <strong style={{ color: '#1a7a4a' }}>{fmt(totalPaid)}</strong> paid</span>
                    <span style={{ color: '#7a5c65' }}>{fmt(totalDue - totalPaid)} remaining</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── COMPARE VENDORS ── */}
        {activeSection === 'compare' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 className="font-serif" style={{ fontSize: 24, color: '#1a0a0f' }}>Compare & Save Vendors</h2>
                <p style={{ fontSize: 13, color: '#7a5c65', marginTop: 4 }}>Save up to 3 vendors per category, compare side by side, then pick one</p>
              </div>
            </div>
            {VENDOR_CATEGORIES.map(cat => {
              const item = getCatItem(cat.id)
              const isOpen = compareMode === cat.id
              return (
                <div key={cat.id} style={{ background: '#fff', border: `0.5px solid ${item.booked ? 'rgba(26,122,74,.25)' : 'rgba(201,124,138,.18)'}`, borderRadius: 14, marginBottom: 10, overflow: 'hidden' }}>
                  <div onClick={() => setCompareMode(isOpen ? null : cat.id)}
                    style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: isOpen ? 'rgba(201,124,138,.03)' : 'transparent' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${item.booked ? '#1a7a4a' : '#C97C8A'}`, background: item.booked ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.booked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#1a0a0f', flex: 1 }}>{cat.label}</span>
                    {item.selectedVendor && <span style={{ fontSize: 12, color: '#1a7a4a', fontWeight: 500 }}>✓ {item.selectedVendor}</span>}
                    {!item.selectedVendor && item.savedVendors.length > 0 && <span style={{ fontSize: 12, color: '#C9A040' }}>{item.savedVendors.length} saved · pick one</span>}
                    {!item.selectedVendor && item.savedVendors.length === 0 && <span style={{ fontSize: 12, color: '#ccc' }}>No vendors saved yet</span>}
                    <svg width="14" height="14" fill="none" stroke="#7a5c65" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}><polyline points="3,5 7,9 11,5"/></svg>
                  </div>
                  {isOpen && (
                    <div style={{ padding: '0 18px 18px', borderTop: '0.5px solid rgba(201,124,138,.08)' }}>
                      {item.savedVendors.length === 0 ? (
                        <div style={{ padding: '20px 0', textAlign: 'center', color: '#7a5c65', fontSize: 13 }}>
                          No vendors saved yet. <Link href={`/vendors?category=${cat.slug}`} style={{ color: '#C97C8A', textDecoration: 'none', fontWeight: 500 }}>Browse {cat.label} →</Link>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14 }}>
                          {item.savedVendors.map(v => (
                            <div key={v.id} style={{ border: `1.5px solid ${v.name === item.selectedVendor ? '#1a7a4a' : 'rgba(201,124,138,.2)'}`, borderRadius: 12, padding: 14, position: 'relative', background: v.name === item.selectedVendor ? 'rgba(26,122,74,.03)' : '#fff' }}>
                              {v.name === item.selectedVendor && (
                                <div style={{ position: 'absolute', top: -1, right: -1, background: '#1a7a4a', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: '0 10px 0 8px', letterSpacing: .5, textTransform: 'uppercase' }}>Selected</div>
                              )}
                              <div style={{ fontSize: 14, fontWeight: 500, color: '#1a0a0f', marginBottom: 4 }}>{v.name}</div>
                              {v.price && <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 3 }}>Starting at <strong style={{ color: '#1a0a0f' }}>{fmt(v.price)}</strong></div>}
                              {v.phone && <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 3 }}>{v.phone}</div>}
                              {v.note && <div style={{ fontSize: 12, color: '#7a5c65', fontStyle: 'italic', marginBottom: 8 }}>{v.note}</div>}
                              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                {v.name !== item.selectedVendor ? (
                                  <button onClick={() => selectVendor(cat.id, v.name)}
                                    style={{ flex: 1, background: '#C97C8A', color: '#fff', border: 'none', padding: '7px 0', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Select</button>
                                ) : (
                                  <button onClick={() => updateCat(cat.id, { selectedVendor: '', booked: false })}
                                    style={{ flex: 1, background: 'transparent', color: '#1a7a4a', border: '0.5px solid #1a7a4a', padding: '7px 0', borderRadius: 20, fontSize: 12, cursor: 'pointer' }}>Unselect</button>
                                )}
                                <button onClick={() => removeVendor(cat.id, v.id)}
                                  style={{ background: 'transparent', color: '#E24B4A', border: '0.5px solid rgba(226,75,74,.3)', padding: '7px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer' }}>Remove</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {addingVendorTo === cat.id ? (
                        <div style={{ marginTop: 14, background: 'rgba(201,124,138,.04)', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 12, padding: 16 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 10 }}>
                            {[
                              { key: 'name', label: 'Vendor Name *', placeholder: 'DreamLite Productions', type: 'text' },
                              { key: 'price', label: 'Starting Price ($)', placeholder: '2800', type: 'number' },
                              { key: 'phone', label: 'Phone', placeholder: '(713) 555-0100', type: 'tel' },
                              { key: 'note', label: 'Note', placeholder: 'Includes same-day edit', type: 'text' },
                            ].map(f => (
                              <div key={f.key}>
                                <label style={{ display: 'block', fontSize: 11, color: '#7a5c65', marginBottom: 4 }}>{f.label}</label>
                                <input type={f.type} placeholder={f.placeholder}
                                  value={newVendor[f.key as keyof typeof newVendor]}
                                  onChange={e => setNewVendor(p => ({ ...p, [f.key]: e.target.value }))}
                                  style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => addVendorToCategory(cat.id)}
                              style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save vendor</button>
                            <button onClick={() => { setAddingVendorTo(null); setNewVendor({ name: '', price: '', phone: '', note: '' }) }}
                              style={{ background: 'transparent', color: '#7a5c65', border: '0.5px solid rgba(201,124,138,.25)', padding: '9px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                          {item.savedVendors.length < 3 && (
                            <button onClick={() => setAddingVendorTo(cat.id)}
                              style={{ background: 'transparent', border: '0.5px dashed rgba(201,124,138,.4)', color: '#C97C8A', padding: '8px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer' }}>
                              + Add vendor to compare
                            </button>
                          )}
                          <Link href={`/vendors?category=${cat.slug}`}
                            style={{ color: '#7a5c65', fontSize: 12, textDecoration: 'none', padding: '8px 16px', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 20 }}>
                            Browse {cat.label} on MYQ →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── TIMELINE ── */}
        {activeSection === 'timeline' && (
          <div style={{ maxWidth: 640 }}>
            <h2 className="font-serif" style={{ fontSize: 24, color: '#1a0a0f', marginBottom: 24 }}>Planning Timeline</h2>
            {TIMELINE_GROUPS.map((t, i) => {
              const isPast = monthsLeft !== null && t.months > monthsLeft
              const isCurrent = monthsLeft !== null && monthsLeft <= t.months && monthsLeft > (TIMELINE_GROUPS[i + 1]?.months ?? -1)
              return (
                <div key={i} style={{ display: 'flex', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: isCurrent ? '#C9A040' : isPast ? '#1a7a4a' : 'rgba(201,124,138,.3)', marginTop: 3, boxShadow: isCurrent ? '0 0 0 4px rgba(201,160,64,.15)' : 'none' }} />
                    {i < TIMELINE_GROUPS.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(201,124,138,.15)', minHeight: 24, marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingBottom: 28 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isCurrent ? '#C9A040' : isPast ? '#1a7a4a' : '#C97C8A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                      {t.label} {isCurrent && '← You are here'}
                    </div>
                    {t.tasks.map(task => (
                      <div key={task} style={{ fontSize: 14, color: isPast ? '#aaa' : '#555', marginBottom: 5, textDecoration: isPast ? 'line-through' : 'none' }}>· {task}</div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* REVIEW MODAL */}
      {reviewVendor && (
        <ReviewModal vendor={reviewVendor} momProfileId="" onClose={() => setReviewVendor(null)} onSubmitted={() => setReviewVendor(null)} />
      )}

      {/* MOBILE STYLES */}
      <style>{`
        @media (max-width: 768px) {
          .planning-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </>
  )
}
