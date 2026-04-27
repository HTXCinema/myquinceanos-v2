'use client'
import { useState } from 'react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import ReviewModal from '@/components/ReviewModal'

const VENDOR_CATEGORIES = [
  { id: 'venue',         label: 'Venue',            slug: 'venues',            month: 12 },
  { id: 'photo',         label: 'Photographer',     slug: 'photographers',     month: 12 },
  { id: 'video',         label: 'Videographer',     slug: 'videography',       month: 9  },
  { id: 'dj',            label: 'DJ / Music',       slug: 'djs-music',         month: 9  },
  { id: 'catering',      label: 'Catering',         slug: 'catering',          month: 6  },
  { id: 'dress',         label: 'Dress & Boutique', slug: 'dresses-boutiques', month: 9  },
  { id: 'makeup',        label: 'Makeup & Hair',    slug: 'makeup-hair',       month: 3  },
  { id: 'choreo',        label: 'Choreographer',    slug: 'choreographers',    month: 6  },
  { id: 'cake',          label: 'Cake & Desserts',  slug: 'cakes-bakeries',    month: 3  },
  { id: 'decor',         label: 'Decor & Flowers',  slug: 'decor-flowers',     month: 6  },
  { id: 'limo',          label: 'Limo / Transport', slug: 'limos-transport',   month: 3  },
  { id: 'entertainment', label: 'Entertainment',    slug: 'entertainment',     month: 3  },
]

const TIMELINE_GROUPS = [
  { months: 12, label: '12 Months Before', tasks: ['Set your date & budget', 'Book your venue', 'Book photographer & videographer'] },
  { months: 9,  label: '9 Months Before',  tasks: ['Book DJ or band', 'Start dress shopping', 'Book choreographer'] },
  { months: 6,  label: '6 Months Before',  tasks: ['Book catering', 'Book decor & flowers', 'Choose court of honor'] },
  { months: 3,  label: '3 Months Before',  tasks: ['Send invitations', 'Book makeup & hair', 'Confirm all vendors'] },
  { months: 1,  label: '1 Month Before',   tasks: ['Final dress fitting', 'Confirm guest count', 'Create seating plan'] },
  { months: 0,  label: 'Week Of',          tasks: ['Confirm vendor arrival times', 'Prepare final payments', 'Relax and enjoy!'] },
]

const BUDGET_SPLITS: Record<string, number> = {
  venue: 0.26, photo: 0.12, video: 0.09, dj: 0.10,
  catering: 0.21, dress: 0.09, makeup: 0.05, choreo: 0.03,
  cake: 0.02, decor: 0.07, limo: 0.03, entertainment: 0.03,
}

type VendorEntry = { id: string; name: string; price?: number; phone?: string; note?: string }
type ChecklistItem = {
  catId: string
  booked: boolean
  selectedVendor: string
  savedVendors: VendorEntry[]
  budgetAmount?: number  // user-edited budget for this category
}
type Payment = { id: string; vendor: string; label: string; amount: number; due: string; paid: boolean }

function initChecklist(): ChecklistItem[] {
  return VENDOR_CATEGORIES.map(c => ({ catId: c.id, booked: false, selectedVendor: '', savedVendors: [], budgetAmount: undefined }))
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
  if (days < 0)   return { label: 'OVERDUE', color: '#E24B4A', bg: 'rgba(226,75,74,.1)' }
  if (days <= 14) return { label: 'URGENT',  color: '#E24B4A', bg: 'rgba(226,75,74,.1)' }
  if (days <= 45) return { label: `${days} DAYS`, color: '#C9A040', bg: 'rgba(201,160,64,.1)' }
  return { label: 'ON TRACK', color: '#1a7a4a', bg: 'rgba(26,122,74,.1)' }
}

type ActiveSection = 'compare' | 'budget' | 'payments' | 'timeline' | null

export default function PlanningPage() {
  const [step, setStep] = useState<'setup' | 'dashboard'>('setup')
  const [activeSection, setActiveSection] = useState<ActiveSection>(null)
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

  const countdown   = daysBreakdown(form.date)
  const eventPassed = form.date ? new Date(form.date) < new Date() : false
  const budget      = Number(form.budget) || 0

  // totalSpent = sum of user-edited budget amounts per category
  const totalSpent = checklist.reduce((a, c) => {
    if (c.budgetAmount !== undefined) return a + c.budgetAmount
    const sel = c.savedVendors.find(v => v.name === c.selectedVendor)
    return a + (sel?.price || 0)
  }, 0)

  const bookedCount  = checklist.filter(c => c.booked).length
  const totalPaid    = payments.filter(p => p.paid).reduce((a, p) => a + p.amount, 0)
  const progressPct  = Math.round((bookedCount / VENDOR_CATEGORIES.length) * 100)
  const monthsLeft   = countdown?.months ?? null
  const nextUnbooked = VENDOR_CATEGORIES.find(c => !checklist.find(cl => cl.catId === c.id)?.booked)

  const getCatItem = (catId: string) => checklist.find(c => c.catId === catId)!
  const updateCat  = (catId: string, updates: Partial<ChecklistItem>) =>
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
    if (checklistFilter === 'done')     return item.booked
    if (checklistFilter === 'upcoming') return !item.booked
    return true
  })

  // ── SETUP SCREEN ──
  if (step === 'setup') {
    return (
      <>
        <Nav />
        <div style={{ minHeight: '80vh', background: 'linear-gradient(160deg,#1a0a0f 0%,#2d1020 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
          <div style={{ maxWidth: 580, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 10 }}>Free Planning Hub</div>
              <h1 className="font-serif" style={{ fontSize: 'clamp(26px,6vw,40px)', color: '#fff', marginBottom: 10, lineHeight: 1.2 }}>Your Quince Command Center</h1>
              <p style={{ fontSize: 14, color: 'rgba(250,216,233,.55)', lineHeight: 1.6 }}>Checklist · Budget tracker · Vendor comparison · Payment due dates — all free. No account needed to try it.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(250,216,233,.12)', borderRadius: 20, padding: '28px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
                {[
                  { key: 'daughter', label: "Daughter's Name", placeholder: 'Sofia',  type: 'text'   },
                  { key: 'date',     label: 'Event Date',       placeholder: '',       type: 'date'   },
                  { key: 'budget',   label: 'Total Budget ($)', placeholder: '15000', type: 'number' },
                  { key: 'guests',   label: 'Guest Count',      placeholder: '150',   type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(250,216,233,.4)', marginBottom: 6 }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', background: 'rgba(255,255,255,.07)', border: '0.5px solid rgba(250,216,233,.15)', borderRadius: 10, padding: '11px 13px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <button onClick={() => form.daughter && form.date ? setStep('dashboard') : alert("Please enter your daughter's name and event date")}
                style={{ width: '100%', background: 'linear-gradient(135deg,#C97C8A,#b56a78)', color: '#fff', border: 'none', padding: '14px 0', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 20px rgba(201,124,138,.35)' }}>
                Open my command center →
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(250,216,233,.3)', marginTop: 14 }}>
                No account needed · <Link href="/auth/signup" style={{ color: '#C97C8A', textDecoration: 'none' }}>Create free account</Link> to save your progress
              </p>
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
        <div style={{ background: 'rgba(201,160,64,.1)', borderBottom: '0.5px solid rgba(201,160,64,.2)', padding: '7px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#C9A040', letterSpacing: '.5px' }}>
            {countdown.months > 0 ? `${countdown.months} MONTHS · ` : ''}
            {countdown.weeks  > 0 ? `${countdown.weeks} WEEKS · `  : ''}
            {countdown.days} DAYS UNTIL {form.daughter.toUpperCase()}'S QUINCEAÑERA
          </span>
        </div>
      )}
      {eventPassed && (
        <div style={{ background: 'rgba(26,122,74,.1)', borderBottom: '0.5px solid rgba(26,122,74,.2)', padding: '7px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#5DCAA5' }}>🎉 THE BIG DAY HAS PASSED — LEAVE REVIEWS FOR YOUR VENDORS</span>
        </div>
      )}

      {/* DARK HEADER */}
      <div style={{ background: '#1a0a0f', padding: '22px 24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div>
              <h1 className="font-serif" style={{ fontSize: 'clamp(20px,3.5vw,30px)', color: '#fff', marginBottom: 5 }}>
                {form.daughter}'s Quinceañera
                {form.date && <span style={{ color: 'rgba(250,216,233,.5)', fontWeight: 400 }}> — {new Date(form.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>}
              </h1>
              <div style={{ fontSize: 12, color: 'rgba(250,216,233,.4)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {form.guests && <span>Houston, TX · {form.guests} guests</span>}
                {budget > 0  && <span>{fmt(budget)} budget</span>}
              </div>
            </div>
            {countdown && (
              <div style={{ textAlign: 'center', background: 'rgba(201,160,64,.12)', border: '0.5px solid rgba(201,160,64,.3)', borderRadius: 12, padding: '10px 18px', flexShrink: 0 }}>
                <div className="font-serif" style={{ fontSize: 38, color: '#C9A040', lineHeight: 1 }}>{countdown.totalDays}</div>
                <div style={{ fontSize: 9, color: 'rgba(250,216,233,.4)', marginTop: 2 }}>days away</div>
                <div style={{ fontSize: 9, color: 'rgba(201,160,64,.5)', marginTop: 1 }}>
                  {countdown.months > 0 ? `${countdown.months}mo ` : ''}{countdown.weeks > 0 ? `${countdown.weeks}wk ` : ''}{countdown.days}d
                </div>
              </div>
            )}
          </div>

          {/* STAT STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '0.5px solid rgba(250,216,233,.08)' }}>
            {([
              ['BUDGET',   budget > 0 ? fmt(budget) : '—'],
              ['SPENT',    fmt(totalSpent)],
              ['BOOKED',   `${bookedCount} / ${VENDOR_CATEGORIES.length}`],
              ['PROGRESS', `${progressPct}%`],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l} style={{ padding: '12px 16px', borderRight: '0.5px solid rgba(250,216,233,.06)' }}>
                <div style={{ fontSize: 9, color: 'rgba(250,216,233,.3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: l === 'SPENT' && totalSpent > budget && budget > 0 ? '#E24B4A' : '#fff' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* SECTION TABS */}
          <div style={{ display: 'flex', overflowX: 'auto', borderTop: '0.5px solid rgba(250,216,233,.06)' }}>
            {([
              ['compare',  'Compare Vendors'],
              ['budget',   'Budget'],
              ['payments', 'Payments'],
              ['timeline', 'Timeline'],
            ] as [NonNullable<ActiveSection>, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setActiveSection(activeSection === key ? null : key)}
                style={{ padding: '11px 18px', background: 'transparent', border: 'none', borderBottom: activeSection === key ? '2px solid #C97C8A' : '2px solid transparent', color: activeSection === key ? '#FAD8E9' : 'rgba(250,216,233,.35)', fontSize: 13, fontWeight: activeSection === key ? 500 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px 60px' }}>

        {/* ── SAVE CTA BANNER (guest mode) ── */}
        <div style={{ background: 'linear-gradient(135deg,rgba(201,124,138,.12),rgba(201,160,64,.08))', border: '0.5px solid rgba(201,124,138,.25)', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a0a0f' }}>You're in preview mode — your data won't be saved. </span>
            <span style={{ fontSize: 13, color: '#7a5c65' }}>Create a free account to save your checklist, vendors & payments.</span>
          </div>
          <Link href="/auth/signup"
            style={{ background: '#C97C8A', color: '#fff', textDecoration: 'none', padding: '9px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(201,124,138,.3)' }}>
            Save my progress →
          </Link>
        </div>

        {/* ── DEFAULT: two-column dashboard ── */}
        {!activeSection && (
          <div className="plan-grid">

            {/* LEFT: Checklist + Saved Vendors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

              {/* PLANNING CHECKLIST — fixed-height scrollable */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '13px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(201,124,138,.1)', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A' }}>Planning Checklist</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {(['all', 'upcoming', 'done'] as const).map(f => (
                      <button key={f} onClick={() => setChecklistFilter(f)}
                        style={{ padding: '3px 10px', borderRadius: 20, border: `0.5px solid ${checklistFilter === f ? '#C97C8A' : 'rgba(201,124,138,.25)'}`, background: checklistFilter === f ? '#C97C8A' : 'transparent', color: checklistFilter === f ? '#fff' : '#7a5c65', fontSize: 10, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SCROLLABLE — fixed height so it doesn't push page */}
                <div style={{ height: 340, overflowY: 'auto', padding: '6px 14px 10px' }}>
                  {TIMELINE_GROUPS.map(group => {
                    const groupCats = filteredChecklist.filter(c => c.month === group.months)
                    if (groupCats.length === 0) return null
                    const allDone = groupCats.every(c => getCatItem(c.id).booked)
                    return (
                      <div key={group.months} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: allDone ? '#1a7a4a' : 'rgba(201,124,138,.45)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6, paddingTop: 4 }}>
                          {group.label}
                          {allDone && <span style={{ fontSize: 8, background: 'rgba(26,122,74,.12)', color: '#1a7a4a', padding: '1px 6px', borderRadius: 8 }}>DONE</span>}
                        </div>
                        {groupCats.map(cat => {
                          const item = getCatItem(cat.id)
                          return (
                            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '6px 0', borderBottom: '0.5px solid rgba(201,124,138,.06)' }}>
                              <button onClick={() => updateCat(cat.id, { booked: !item.booked })}
                                style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${item.booked ? '#1a7a4a' : '#C97C8A'}`, background: item.booked ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                                {item.booked && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                              </button>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: item.booked ? '#aaa' : '#1a0a0f', textDecoration: item.booked ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.label}</div>
                                {item.selectedVendor && <div style={{ fontSize: 11, color: '#C97C8A', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.selectedVendor}</div>}
                                {!item.selectedVendor && item.savedVendors.length > 0 && (
                                  <div style={{ fontSize: 10, color: '#C9A040' }}>{item.savedVendors.length} saved · pick one</div>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                {item.booked && item.selectedVendor && eventPassed && (
                                  <button onClick={() => setReviewVendor({ id: '', name: item.selectedVendor, category: cat.label })}
                                    style={{ fontSize: 10, color: '#C9A040', background: 'rgba(201,160,64,.1)', border: 'none', borderRadius: 20, padding: '2px 7px', cursor: 'pointer' }}>⭐</button>
                                )}
                                {item.savedVendors.length > 0 && (
                                  <button onClick={() => { setActiveSection('compare'); setCompareMode(cat.id) }}
                                    style={{ fontSize: 10, color: '#C9A040', background: 'rgba(201,160,64,.08)', border: 'none', borderRadius: 20, padding: '2px 7px', cursor: 'pointer' }}>
                                    {item.savedVendors.length} saved
                                  </button>
                                )}
                                <Link href={`/vendors?category=${cat.slug}`}
                                  style={{ fontSize: 10, color: '#bbb', background: 'rgba(0,0,0,.04)', borderRadius: 20, padding: '2px 7px', textDecoration: 'none' }}>Browse</Link>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* MY SAVED VENDORS */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 12 }}>My Saved Vendors</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {VENDOR_CATEGORIES.map((cat, i) => {
                    const item = getCatItem(cat.id)
                    return (
                      <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < VENDOR_CATEGORIES.length - 1 ? '0.5px solid rgba(201,124,138,.07)' : 'none' }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#C97C8A', textTransform: 'uppercase', letterSpacing: '.5px', width: 95, flexShrink: 0 }}>{cat.label}</div>
                        <div style={{ flex: 1, fontSize: 12, color: item.selectedVendor ? '#1a0a0f' : item.savedVendors.length > 0 ? '#C9A040' : '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.selectedVendor || (item.savedVendors.length > 0 ? item.savedVendors.map(v => v.name).join(' · ') : 'Not selected yet')}
                        </div>
                        {item.booked ? (
                          <div style={{ fontSize: 11, color: '#1a7a4a', fontWeight: 600, flexShrink: 0 }}>✓ Booked</div>
                        ) : item.savedVendors.length > 1 ? (
                          <button onClick={() => { setActiveSection('compare'); setCompareMode(cat.id) }}
                            style={{ fontSize: 11, color: '#C9A040', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}>Compare {item.savedVendors.length}</button>
                        ) : (
                          <Link href={`/vendors?category=${cat.slug}`} style={{ fontSize: 11, color: '#C97C8A', textDecoration: 'none', flexShrink: 0 }}>+ Browse</Link>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button onClick={() => setActiveSection('compare')}
                  style={{ width: '100%', marginTop: 12, padding: '9px 0', border: '0.5px dashed rgba(201,124,138,.3)', borderRadius: 10, background: 'transparent', color: '#C97C8A', fontSize: 12, cursor: 'pointer' }}>
                  + Add vendor to compare
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

              {/* BUDGET TRACKER */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 12 }}>Budget Tracker</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
                  <div className="font-serif" style={{ fontSize: 32, color: '#1a0a0f', lineHeight: 1 }}>{fmt(totalSpent)}</div>
                  <div style={{ fontSize: 13, color: '#7a5c65', marginBottom: 3 }}>of {budget > 0 ? fmt(budget) : '—'}</div>
                </div>
                {budget > 0 && (
                  <div style={{ height: 7, borderRadius: 4, background: 'rgba(201,124,138,.1)', overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ height: '100%', borderRadius: 4, background: totalSpent > budget ? '#E24B4A' : 'linear-gradient(90deg,#C97C8A,#C9A040)', width: `${Math.min((totalSpent / budget) * 100, 100)}%`, transition: 'width 0.4s' }} />
                  </div>
                )}
                {/* Editable category rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {VENDOR_CATEGORIES.map((cat, i) => {
                    const item = getCatItem(cat.id)
                    const suggested = budget ? Math.round(budget * (BUDGET_SPLITS[cat.id] || 0)) : 0
                    const displayVal = item.budgetAmount !== undefined ? item.budgetAmount : (item.savedVendors.find(v => v.name === item.selectedVendor)?.price ?? 0)
                    return (
                      <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < VENDOR_CATEGORIES.length - 1 ? '0.5px solid rgba(201,124,138,.07)' : 'none' }}>
                        <span style={{ flex: 1, fontSize: 12, color: '#555' }}>{cat.label}</span>
                        <input
                          type="number"
                          value={displayVal || ''}
                          placeholder={suggested > 0 ? String(suggested) : '—'}
                          onChange={e => updateCat(cat.id, { budgetAmount: e.target.value === '' ? undefined : Number(e.target.value) })}
                          style={{ width: 80, border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 6, padding: '3px 8px', fontSize: 12, outline: 'none', textAlign: 'right', color: '#1a0a0f', background: displayVal ? '#fff' : '#fafafa' }}
                        />
                      </div>
                    )
                  })}
                  {budget > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: budget - totalSpent < 0 ? '#E24B4A' : '#1a7a4a', paddingTop: 8, marginTop: 4, borderTop: '0.5px solid rgba(201,124,138,.1)' }}>
                      <span>Remaining</span>
                      <span>{fmt(Math.abs(budget - totalSpent))}{budget - totalSpent < 0 ? ' over' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PAYMENT DUE DATES */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 12 }}>Payment Due Dates</div>
                {payments.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#ccc', textAlign: 'center', padding: '10px 0' }}>No payments tracked yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                    {payments.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()).slice(0, 4).map(p => {
                      const badge = getUrgencyBadge(p.due, p.paid)
                      return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button onClick={() => setPayments(prev => prev.map(x => x.id === p.id ? { ...x, paid: !x.paid } : x))}
                            style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${p.paid ? '#1a7a4a' : '#C97C8A'}`, background: p.paid ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                            {p.paid && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: p.paid ? '#aaa' : '#1a0a0f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: p.paid ? 'line-through' : 'none' }}>{p.vendor}</div>
                            <div style={{ fontSize: 11, color: '#7a5c65' }}>{fmt(p.amount)} · Due {new Date(p.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: badge.color, background: badge.bg, padding: '3px 8px', borderRadius: 20, flexShrink: 0 }}>{badge.label}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <button onClick={() => setActiveSection('payments')}
                  style={{ width: '100%', marginTop: 8, padding: '8px 0', border: '0.5px dashed rgba(201,124,138,.3)', borderRadius: 10, background: 'transparent', color: '#C97C8A', fontSize: 12, cursor: 'pointer' }}>
                  + Add payment
                </button>
              </div>

              {/* OVERALL PROGRESS */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 14 }}>Overall Progress</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="38" cy="38" r="30" fill="none" stroke="rgba(201,124,138,.12)" strokeWidth="6"/>
                      <circle cx="38" cy="38" r="30" fill="none" stroke="#C97C8A" strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 30}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * (1 - progressPct / 100)}`}
                        strokeLinecap="round"/>
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="font-serif" style={{ fontSize: 16, color: '#C97C8A', fontWeight: 600 }}>{progressPct}%</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1a0a0f', marginBottom: 3 }}>
                      {progressPct === 100 ? '🎉 All done!' : progressPct >= 50 ? 'Great progress!' : 'Just getting started!'}
                    </div>
                    <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 6 }}>{bookedCount} of {VENDOR_CATEGORIES.length} vendors booked</div>
                    {nextUnbooked && !eventPassed && (
                      <Link href={`/vendors?category=${nextUnbooked.slug}`}
                        style={{ fontSize: 12, color: '#C97C8A', fontWeight: 500, textDecoration: 'none' }}>
                        Next: Book your {nextUnbooked.label} →
                      </Link>
                    )}
                    {countdown && (
                      <div style={{ fontSize: 11, color: '#7a5c65', marginTop: 3 }}>
                        {countdown.months > 0 ? `${countdown.months}mo ` : ''}{countdown.weeks > 0 ? `${countdown.weeks}wk ` : ''}{countdown.days}d remaining
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom CTA to sign up */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '0.5px solid rgba(201,124,138,.1)' }}>
                  <Link href="/auth/signup"
                    style={{ display: 'block', background: 'linear-gradient(135deg,#C97C8A,#b56a78)', color: '#fff', textDecoration: 'none', padding: '10px 0', borderRadius: 20, fontSize: 13, fontWeight: 600, textAlign: 'center', boxShadow: '0 2px 12px rgba(201,124,138,.25)' }}>
                    Save my progress — it's free →
                  </Link>
                  <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 6 }}>Your checklist & vendors will be saved to your account</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── COMPARE VENDORS ── */}
        {activeSection === 'compare' && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <h2 className="font-serif" style={{ fontSize: 22, color: '#1a0a0f' }}>Compare & Save Vendors</h2>
              <p style={{ fontSize: 13, color: '#7a5c65', marginTop: 4 }}>Save up to 3 vendors per category, compare side by side, then pick one</p>
            </div>
            {VENDOR_CATEGORIES.map(cat => {
              const item = getCatItem(cat.id)
              const isOpen = compareMode === cat.id
              return (
                <div key={cat.id} style={{ background: '#fff', border: `0.5px solid ${item.booked ? 'rgba(26,122,74,.2)' : 'rgba(201,124,138,.18)'}`, borderRadius: 14, marginBottom: 10, overflow: 'hidden' }}>
                  <div onClick={() => setCompareMode(isOpen ? null : cat.id)}
                    style={{ padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
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
                        <div style={{ padding: '18px 0', textAlign: 'center', color: '#7a5c65', fontSize: 13 }}>
                          No vendors saved yet. <Link href={`/vendors?category=${cat.slug}`} style={{ color: '#C97C8A', textDecoration: 'none', fontWeight: 500 }}>Browse {cat.label} →</Link>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginTop: 14 }}>
                          {item.savedVendors.map(v => (
                            <div key={v.id} style={{ border: `1.5px solid ${v.name === item.selectedVendor ? '#1a7a4a' : 'rgba(201,124,138,.2)'}`, borderRadius: 12, padding: 14, position: 'relative', background: v.name === item.selectedVendor ? 'rgba(26,122,74,.03)' : '#fff' }}>
                              {v.name === item.selectedVendor && (
                                <div style={{ position: 'absolute', top: -1, right: -1, background: '#1a7a4a', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: '0 10px 0 8px', textTransform: 'uppercase' }}>Selected</div>
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
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 10 }}>
                            {[
                              { key: 'name',  label: 'Vendor Name *',    placeholder: 'DreamLite Productions', type: 'text'   },
                              { key: 'price', label: 'Starting Price ($)', placeholder: '2800',                 type: 'number' },
                              { key: 'phone', label: 'Phone',             placeholder: '(713) 555-0100',        type: 'tel'    },
                              { key: 'note',  label: 'Note',              placeholder: 'Includes same-day edit', type: 'text'  },
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

        {/* ── BUDGET DETAIL ── */}
        {activeSection === 'budget' && (
          <div style={{ maxWidth: 680 }}>
            <h2 className="font-serif" style={{ fontSize: 22, color: '#1a0a0f', marginBottom: 20 }}>Budget Breakdown</h2>
            <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 4 }}>Total spent</div>
                  <div className="font-serif" style={{ fontSize: 36, color: '#1a0a0f' }}>{fmt(totalSpent)}</div>
                </div>
                {budget > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 4 }}>Budget</div>
                    <div className="font-serif" style={{ fontSize: 28, color: '#C97C8A' }}>{fmt(budget)}</div>
                  </div>
                )}
              </div>
              {budget > 0 && (
                <>
                  <div style={{ height: 8, borderRadius: 4, background: 'rgba(201,124,138,.1)', overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ height: '100%', borderRadius: 4, background: totalSpent > budget ? '#E24B4A' : '#C97C8A', width: `${Math.min((totalSpent / budget) * 100, 100)}%` }} />
                  </div>
                  <div style={{ fontSize: 13, color: totalSpent > budget ? '#E24B4A' : '#1a7a4a', fontWeight: 500, marginBottom: 16 }}>
                    {totalSpent > budget ? `⚠ ${fmt(totalSpent - budget)} over budget` : `✓ ${fmt(budget - totalSpent)} remaining`}
                  </div>
                </>
              )}
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 12 }}>Click any amount to edit</div>
              {VENDOR_CATEGORIES.map((cat, i) => {
                const item = getCatItem(cat.id)
                const suggested = budget ? Math.round(budget * (BUDGET_SPLITS[cat.id] || 0)) : 0
                const displayVal = item.budgetAmount !== undefined ? item.budgetAmount : (item.savedVendors.find(v => v.name === item.selectedVendor)?.price ?? 0)
                return (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < VENDOR_CATEGORIES.length - 1 ? '0.5px solid rgba(201,124,138,.08)' : 'none' }}>
                    <span style={{ flex: 1, fontSize: 13, color: '#1a0a0f', fontWeight: 500 }}>{cat.label}</span>
                    {item.selectedVendor && <span style={{ fontSize: 12, color: '#7a5c65' }}>{item.selectedVendor}</span>}
                    <input
                      type="number"
                      value={displayVal || ''}
                      placeholder={suggested > 0 ? String(suggested) : '0'}
                      onChange={e => updateCat(cat.id, { budgetAmount: e.target.value === '' ? undefined : Number(e.target.value) })}
                      style={{ width: 90, border: '0.5px solid rgba(201,124,138,.25)', borderRadius: 7, padding: '5px 8px', fontSize: 13, outline: 'none', textAlign: 'right', color: '#1a0a0f' }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {activeSection === 'payments' && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="font-serif" style={{ fontSize: 22, color: '#1a0a0f' }}>Payment Due Dates</h2>
              <button onClick={() => setAddPayment(true)}
                style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>+ Add Payment</button>
            </div>
            {addPayment && (
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.25)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 14 }}>
                  {[
                    { key: 'vendor', label: 'Vendor Name',  placeholder: 'Bell Tower', type: 'text'   },
                    { key: 'label',  label: 'Payment Type', placeholder: 'Deposit',    type: 'text'   },
                    { key: 'amount', label: 'Amount ($)',    placeholder: '1500',       type: 'number' },
                    { key: 'due',    label: 'Due Date',      placeholder: '',           type: 'date'   },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 11, color: '#7a5c65', fontWeight: 500, marginBottom: 5 }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder}
                        value={newPayment[f.key as keyof typeof newPayment]}
                        onChange={e => setNewPayment(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => {
                    if (!newPayment.vendor || !newPayment.amount || !newPayment.due) return
                    setPayments(prev => [...prev, { id: Date.now().toString(), vendor: newPayment.vendor, label: newPayment.label || 'Payment', amount: Number(newPayment.amount), due: newPayment.due, paid: false }])
                    setNewPayment({ vendor: '', label: 'Deposit', amount: '', due: '' })
                    setAddPayment(false)
                  }} style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setAddPayment(false)}
                    style={{ background: 'transparent', color: '#7a5c65', border: '0.5px solid rgba(201,124,138,.25)', padding: '9px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
            {payments.length === 0 ? (
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.15)', borderRadius: 14, padding: '40px 0', textAlign: 'center', color: '#7a5c65', fontSize: 14 }}>
                No payments tracked yet. Add your first deposit due date above.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {payments.sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime()).map(p => {
                  const overdue  = !p.paid && new Date(p.due) < new Date()
                  const daysLeft = Math.ceil((new Date(p.due).getTime() - Date.now()) / 86400000)
                  return (
                    <div key={p.id} style={{ background: '#fff', border: `0.5px solid ${overdue ? 'rgba(226,75,74,.4)' : p.paid ? 'rgba(26,122,74,.2)' : 'rgba(201,124,138,.2)'}`, borderRadius: 12, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => setPayments(prev => prev.map(x => x.id === p.id ? { ...x, paid: !x.paid } : x))}
                        style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${p.paid ? '#1a7a4a' : overdue ? '#E24B4A' : '#C97C8A'}`, background: p.paid ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                        {p.paid && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: p.paid ? '#aaa' : '#1a0a0f', textDecoration: p.paid ? 'line-through' : 'none' }}>{p.vendor}</div>
                        <div style={{ fontSize: 12, color: '#7a5c65', marginTop: 1 }}>{p.label} · {new Date(p.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: p.paid ? '#1a7a4a' : overdue ? '#E24B4A' : '#1a0a0f' }}>{fmt(p.amount)}</div>
                        {!p.paid && <div style={{ fontSize: 11, marginTop: 2, color: overdue ? '#E24B4A' : daysLeft <= 14 ? '#C9A040' : '#7a5c65', fontWeight: overdue || daysLeft <= 14 ? 500 : 400 }}>
                          {overdue ? '⚠ Overdue' : daysLeft === 0 ? 'Due today' : `In ${daysLeft} days`}
                        </div>}
                        {p.paid && <div style={{ fontSize: 11, color: '#1a7a4a', marginTop: 2 }}>Paid ✓</div>}
                      </div>
                      <button onClick={() => setPayments(prev => prev.filter(x => x.id !== p.id))}
                        style={{ background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}>×</button>
                    </div>
                  )
                })}
                <div style={{ background: 'rgba(201,124,138,.06)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: '#7a5c65' }}>Total paid</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#1a7a4a' }}>{fmt(totalPaid)} of {fmt(payments.reduce((a, p) => a + p.amount, 0))}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TIMELINE ── */}
        {activeSection === 'timeline' && (
          <div style={{ maxWidth: 620 }}>
            <h2 className="font-serif" style={{ fontSize: 22, color: '#1a0a0f', marginBottom: 24 }}>Planning Timeline</h2>
            {TIMELINE_GROUPS.map((t, i) => {
              const isPast    = monthsLeft !== null && t.months > monthsLeft
              const isCurrent = monthsLeft !== null && monthsLeft <= t.months && monthsLeft > (TIMELINE_GROUPS[i + 1]?.months ?? -1)
              return (
                <div key={i} style={{ display: 'flex', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 13, height: 13, borderRadius: '50%', background: isCurrent ? '#C9A040' : isPast ? '#1a7a4a' : 'rgba(201,124,138,.3)', marginTop: 3, boxShadow: isCurrent ? '0 0 0 4px rgba(201,160,64,.15)' : 'none' }} />
                    {i < TIMELINE_GROUPS.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(201,124,138,.15)', minHeight: 24, marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingBottom: 26 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isCurrent ? '#C9A040' : isPast ? '#1a7a4a' : '#C97C8A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                      {t.label}{isCurrent ? ' ← You are here' : ''}
                    </div>
                    {t.tasks.map(task => (
                      <div key={task} style={{ fontSize: 14, color: isPast ? '#aaa' : '#555', marginBottom: 4, textDecoration: isPast ? 'line-through' : 'none' }}>· {task}</div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {reviewVendor && (
        <ReviewModal vendor={reviewVendor} momProfileId="" onClose={() => setReviewVendor(null)} onSubmitted={() => setReviewVendor(null)} />
      )}

      <style>{`
        .plan-grid {
          display: grid;
          grid-template-columns: minmax(0,420px) minmax(0,1fr);
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .plan-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Footer />
    </>
  )
}
