'use client'
import { useState } from 'react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
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

const TIMELINE_ITEMS = [
  { months: 12, label: '12 months before', tasks: ['Set your date & budget', 'Book your venue', 'Book photographer & videographer'] },
  { months: 9, label: '9 months before', tasks: ['Book DJ or band', 'Start dress shopping', 'Book choreographer'] },
  { months: 6, label: '6 months before', tasks: ['Book catering', 'Book decor & flowers', 'Choose court of honor'] },
  { months: 3, label: '3 months before', tasks: ['Send invitations', 'Book makeup & hair', 'Confirm all vendors'] },
  { months: 1, label: '1 month before', tasks: ['Final dress fitting', 'Confirm guest count', 'Create seating plan'] },
  { months: 0, label: 'Week of', tasks: ['Confirm vendor arrival times', 'Prepare final payments', 'Relax and enjoy!'] },
]

type VendorEntry = {
  id: string
  name: string
  price?: number
  phone?: string
  note?: string
}

type ChecklistItem = {
  catId: string
  booked: boolean
  selectedVendor: string
  savedVendors: VendorEntry[]
}

type Payment = {
  id: string
  vendor: string
  label: string
  amount: number
  due: string
  paid: boolean
}

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

export default function PlanningPage() {
  const [step, setStep] = useState<'setup' | 'dashboard'>('setup')
  const [tab, setTab] = useState<'checklist' | 'vendors' | 'budget' | 'payments' | 'timeline'>('checklist')
  const [form, setForm] = useState({ daughter: '', date: '', budget: '', guests: '' })
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initChecklist())
  const [payments, setPayments] = useState<Payment[]>([])
  const [compareMode, setCompareMode] = useState<string | null>(null)
  const [addingVendorTo, setAddingVendorTo] = useState<string | null>(null)
  const [newVendor, setNewVendor] = useState({ name: '', price: '', phone: '', note: '' })
  const [addPayment, setAddPayment] = useState(false)
  const [newPayment, setNewPayment] = useState({ vendor: '', label: '', amount: '', due: '' })
  const [reviewVendor, setReviewVendor] = useState<{ id: string; name: string; category: string } | null>(null)

  const countdown = daysBreakdown(form.date)
  const eventPassed = form.date ? new Date(form.date) < new Date() : false
  const budget = Number(form.budget) || 0
  const totalSpent = checklist.reduce((a, c) => {
    const sel = c.savedVendors.find(v => v.name === c.selectedVendor)
    return a + (sel?.price || 0)
  }, 0)
  const bookedCount = checklist.filter(c => c.booked).length
  const totalPaid = payments.filter(p => p.paid).reduce((a, p) => a + p.amount, 0)
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

  // ── SETUP SCREEN ──
  if (step === 'setup') {
    return (
      <>
        <Nav />
        <div style={{ minHeight: '80vh', background: '#FDF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 560, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 10 }}>Free Planning Hub</div>
              <h1 className="font-serif" style={{ fontSize: 38, fontWeight: 600, color: '#1a0a0f', marginBottom: 10, lineHeight: 1.2 }}>Your Quince Command Center</h1>
              <p style={{ fontSize: 14, color: '#7a5c65', lineHeight: 1.6 }}>Checklist, budget tracker, vendor comparison, payment due dates — all in one free hub built for Houston moms.</p>
            </div>
            <div style={{ background: '#1a0a0f', borderRadius: 16, padding: 32 }}>
              <h2 className="font-serif" style={{ fontSize: 20, color: '#fff', marginBottom: 20 }}>Set up your planner</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                {[
                  { key: 'daughter', label: "Girl's Name", placeholder: 'Sofia', type: 'text' },
                  { key: 'date', label: 'Event Date', placeholder: '', type: 'date' },
                  { key: 'budget', label: 'Total Budget ($)', placeholder: '15000', type: 'number' },
                  { key: 'guests', label: 'Guest Count', placeholder: '150', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 6 }}>{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', background: 'rgba(255,255,255,.07)', border: '0.5px solid rgba(250,216,233,.15)', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <button onClick={() => form.daughter && form.date ? setStep('dashboard') : alert('Please enter name and date')}
                style={{ width: '100%', background: '#C97C8A', color: '#fff', border: 'none', padding: '13px 0', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Open my command center →
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(250,216,233,.35)', marginTop: 12 }}>No account needed · Save progress by creating a free account</p>
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

      {/* HERO HEADER */}
      <div style={{ background: '#1a0a0f', padding: '28px 28px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(250,216,233,.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Quince Command Center</div>
              <h1 className="font-serif" style={{ fontSize: 32, color: '#fff', marginBottom: 4 }}>{form.daughter}'s Quinceañera</h1>
              <div style={{ fontSize: 13, color: 'rgba(250,216,233,.5)' }}>
                {form.guests ? `${form.guests} guests · ` : ''}
                {form.date ? new Date(form.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
              </div>
            </div>
            {countdown && (
              <div style={{ textAlign: 'center', background: 'rgba(201,160,64,.12)', border: '0.5px solid rgba(201,160,64,.3)', borderRadius: 14, padding: '14px 24px' }}>
                <div className="font-serif" style={{ fontSize: 44, color: '#C9A040', lineHeight: 1 }}>{countdown.totalDays}</div>
                <div style={{ fontSize: 11, color: 'rgba(250,216,233,.5)', marginTop: 2 }}>days away</div>
                <div style={{ fontSize: 10, color: 'rgba(201,160,64,.6)', marginTop: 3 }}>
                  {countdown.months > 0 ? `${countdown.months}mo ` : ''}{countdown.weeks > 0 ? `${countdown.weeks}wk ` : ''}{countdown.days}d
                </div>
              </div>
            )}
            {eventPassed && (
              <div style={{ background: 'rgba(26,122,74,.15)', border: '0.5px solid rgba(26,122,74,.3)', borderRadius: 14, padding: '14px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 20 }}>🎉</div>
                <div style={{ fontSize: 12, color: '#5DCAA5', fontWeight: 500, marginTop: 4 }}>The big day has passed!</div>
                <div style={{ fontSize: 11, color: 'rgba(93,202,165,.7)', marginTop: 2 }}>Leave reviews for your vendors</div>
              </div>
            )}
          </div>

          {/* STAT STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
            {[
              ['Budget', budget ? fmt(budget) : '—'],
              ['Spent', fmt(totalSpent)],
              ['Booked', `${bookedCount} / ${VENDOR_CATEGORIES.length}`],
              ['Progress', `${progressPct}%`],
            ].map(([l, v]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,.05)', border: '0.5px solid rgba(250,216,233,.08)', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: 'rgba(250,216,233,.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '0.5px solid rgba(250,216,233,.1)', overflowX: 'auto' }}>
            {([
              ['checklist', 'Checklist'],
              ['vendors', 'Compare Vendors'],
              ['budget', 'Budget'],
              ['payments', 'Payments'],
              ['timeline', 'Timeline'],
            ] as [typeof tab, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)}
                style={{ padding: '12px 20px', background: 'transparent', border: 'none', borderBottom: tab === key ? '2px solid #C97C8A' : '2px solid transparent', color: tab === key ? '#FAD8E9' : 'rgba(250,216,233,.4)', fontSize: 13, fontWeight: tab === key ? 500 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 28px 60px' }}>

        {/* ── CHECKLIST TAB ── */}
        {tab === 'checklist' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
            <div>
              <h2 className="font-serif" style={{ fontSize: 24, color: '#1a0a0f', marginBottom: 16 }}>Vendor Checklist</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {VENDOR_CATEGORIES.map(cat => {
                  const item = getCatItem(cat.id)
                  return (
                    <div key={cat.id} style={{ background: '#fff', border: `0.5px solid ${item.booked ? 'rgba(26,122,74,.25)' : 'rgba(201,124,138,.2)'}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => updateCat(cat.id, { booked: !item.booked })}
                        style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${item.booked ? '#1a7a4a' : '#C97C8A'}`, background: item.booked ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                        {item.booked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                      </button>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 14, fontWeight: 500, textDecoration: item.booked ? 'line-through' : 'none', color: item.booked ? '#aaa' : '#1a0a0f' }}>{cat.label}</span>
                        {item.selectedVendor && <span style={{ fontSize: 12, color: '#C97C8A', fontWeight: 500, marginLeft: 8 }}>{item.selectedVendor}</span>}
                        {item.savedVendors.length > 0 && !item.selectedVendor && (
                          <span style={{ fontSize: 11, color: '#C9A040', marginLeft: 8 }}>{item.savedVendors.length} saved</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {/* Review button — only shows after event date */}
                        {item.booked && item.selectedVendor && eventPassed && (
                          <button onClick={() => setReviewVendor({ id: '', name: item.selectedVendor, category: cat.label })}
                            style={{ fontSize: 11, color: '#C9A040', background: 'rgba(201,160,64,.1)', border: 'none', borderRadius: 20, padding: '3px 10px', cursor: 'pointer', fontWeight: 500 }}>
                            ⭐ Review
                          </button>
                        )}
                        {item.savedVendors.length > 0 && (
                          <button onClick={() => { setTab('vendors'); setCompareMode(cat.id) }}
                            style={{ fontSize: 11, color: '#C9A040', background: 'rgba(201,160,64,.1)', border: 'none', borderRadius: 20, padding: '3px 10px', cursor: 'pointer' }}>
                            Compare {item.savedVendors.length}
                          </button>
                        )}
                        <Link href={`/vendors?category=${cat.slug}`}
                          style={{ fontSize: 11, color: '#7a5c65', background: 'rgba(201,124,138,.08)', borderRadius: 20, padding: '3px 10px', textDecoration: 'none' }}>
                          Browse →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* PROGRESS CARD */}
            <div>
              <h2 className="font-serif" style={{ fontSize: 24, color: '#1a0a0f', marginBottom: 16 }}>Your Progress</h2>
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: 24, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                  <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                    <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(201,124,138,.12)" strokeWidth="7"/>
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#C97C8A" strokeWidth="7"
                      strokeDasharray={`${2 * Math.PI * 32}`}
                      strokeDashoffset={`${2 * Math.PI * 32 * (1 - progressPct / 100)}`}
                      strokeLinecap="round"/>
                  </svg>
                  <div>
                    <div className="font-serif" style={{ fontSize: 36, color: '#C97C8A', lineHeight: 1 }}>{progressPct}%</div>
                    <div style={{ fontSize: 13, color: '#7a5c65', marginTop: 4 }}>{bookedCount} of {VENDOR_CATEGORIES.length} vendors booked</div>
                    {countdown && (
                      <div style={{ fontSize: 12, color: '#C9A040', marginTop: 6, fontWeight: 500 }}>
                        {countdown.months > 0 ? `${countdown.months}mo ` : ''}{countdown.weeks > 0 ? `${countdown.weeks}wk ` : ''}{countdown.days}d to go
                      </div>
                    )}
                    {eventPassed && <div style={{ fontSize: 12, color: '#5DCAA5', marginTop: 6, fontWeight: 500 }}>🎉 Big day complete!</div>}
                  </div>
                </div>
                <div style={{ height: 0.5, background: 'rgba(201,124,138,.12)', marginBottom: 16 }} />
                <div style={{ fontSize: 12, fontWeight: 600, color: '#C97C8A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Book next</div>
                {VENDOR_CATEGORIES.filter(c => !getCatItem(c.id).booked).slice(0, 3).map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '0.5px solid rgba(201,124,138,.08)' }}>
                    <span style={{ fontSize: 13, color: '#1a0a0f' }}>{c.label}</span>
                    <Link href={`/vendors?category=${c.slug}`} style={{ fontSize: 12, color: '#C97C8A', textDecoration: 'none', fontWeight: 500 }}>Find vendors →</Link>
                  </div>
                ))}
                {eventPassed && (
                  <div style={{ marginTop: 12, background: 'rgba(201,160,64,.08)', border: '0.5px solid rgba(201,160,64,.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#7a5c65' }}>
                    Your event has passed — go back to the checklist and leave reviews for your vendors!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── COMPARE VENDORS TAB ── */}
        {tab === 'vendors' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h2 className="font-serif" style={{ fontSize: 24, color: '#1a0a0f' }}>Compare & Save Vendors</h2>
              <div style={{ fontSize: 13, color: '#7a5c65' }}>Save up to 3 vendors per category, compare, then pick one</div>
            </div>
            {VENDOR_CATEGORIES.map(cat => {
              const item = getCatItem(cat.id)
              const isOpen = compareMode === cat.id
              return (
                <div key={cat.id} style={{ background: '#fff', border: `0.5px solid ${item.booked ? 'rgba(26,122,74,.25)' : 'rgba(201,124,138,.18)'}`, borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}>
                  <div onClick={() => setCompareMode(isOpen ? null : cat.id)}
                    style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: isOpen ? 'rgba(201,124,138,.04)' : 'transparent' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${item.booked ? '#1a7a4a' : '#C97C8A'}`, background: item.booked ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.booked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#1a0a0f', flex: 1 }}>{cat.label}</span>
                    {item.selectedVendor && <span style={{ fontSize: 12, color: '#1a7a4a', fontWeight: 500 }}>✓ {item.selectedVendor}</span>}
                    {!item.selectedVendor && item.savedVendors.length > 0 && <span style={{ fontSize: 12, color: '#C9A040' }}>{item.savedVendors.length} saved · pick one</span>}
                    {!item.selectedVendor && item.savedVendors.length === 0 && <span style={{ fontSize: 12, color: '#bbb' }}>No vendors saved yet</span>}
                    <svg width="14" height="14" fill="none" stroke="#7a5c65" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}><polyline points="3,5 7,9 11,5"/></svg>
                  </div>
                  {isOpen && (
                    <div style={{ padding: '0 18px 18px', borderTop: '0.5px solid rgba(201,124,138,.1)' }}>
                      {item.savedVendors.length === 0 ? (
                        <div style={{ padding: '20px 0', textAlign: 'center', color: '#7a5c65', fontSize: 13 }}>
                          No vendors saved yet.
                          <Link href={`/vendors?category=${cat.slug}`} style={{ color: '#C97C8A', marginLeft: 6, textDecoration: 'none', fontWeight: 500 }}>Browse {cat.label} vendors →</Link>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(item.savedVendors.length, 3)}, 1fr)`, gap: 12, marginTop: 14 }}>
                          {item.savedVendors.map(v => (
                            <div key={v.id} style={{ border: `1.5px solid ${v.name === item.selectedVendor ? '#1a7a4a' : 'rgba(201,124,138,.2)'}`, borderRadius: 12, padding: 14, position: 'relative', background: v.name === item.selectedVendor ? 'rgba(26,122,74,.04)' : '#fff' }}>
                              {v.name === item.selectedVendor && (
                                <div style={{ position: 'absolute', top: -1, right: -1, background: '#1a7a4a', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: '0 10px 0 8px', letterSpacing: .5, textTransform: 'uppercase' }}>Selected</div>
                              )}
                              <div style={{ fontSize: 14, fontWeight: 500, color: '#1a0a0f', marginBottom: 6 }}>{v.name}</div>
                              {v.price && <div style={{ fontSize: 13, color: '#7a5c65', marginBottom: 4 }}>Starting at <strong style={{ color: '#1a0a0f' }}>{fmt(v.price)}</strong></div>}
                              {v.phone && <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 4 }}>{v.phone}</div>}
                              {v.note && <div style={{ fontSize: 12, color: '#7a5c65', fontStyle: 'italic', marginBottom: 8 }}>{v.note}</div>}
                              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                {v.name !== item.selectedVendor ? (
                                  <button onClick={() => selectVendor(cat.id, v.name)}
                                    style={{ flex: 1, background: '#C97C8A', color: '#fff', border: 'none', padding: '7px 0', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
                                    Select this vendor
                                  </button>
                                ) : (
                                  <button onClick={() => updateCat(cat.id, { selectedVendor: '', booked: false })}
                                    style={{ flex: 1, background: 'transparent', color: '#1a7a4a', border: '0.5px solid #1a7a4a', padding: '7px 0', borderRadius: 20, fontSize: 12, cursor: 'pointer' }}>
                                    Unselect
                                  </button>
                                )}
                                <button onClick={() => removeVendor(cat.id, v.id)}
                                  style={{ background: 'transparent', color: '#E24B4A', border: '0.5px solid rgba(226,75,74,.3)', padding: '7px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer' }}>
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {addingVendorTo === cat.id ? (
                        <div style={{ marginTop: 14, background: 'rgba(201,124,138,.04)', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 12, padding: 16 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#C97C8A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Add vendor to compare</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
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
                              style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                              Save vendor
                            </button>
                            <button onClick={() => { setAddingVendorTo(null); setNewVendor({ name: '', price: '', phone: '', note: '' }) }}
                              style={{ background: 'transparent', color: '#7a5c65', border: '0.5px solid rgba(201,124,138,.25)', padding: '9px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}>
                              Cancel
                            </button>
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

        {/* ── BUDGET TAB ── */}
        {tab === 'budget' && (
          <div style={{ maxWidth: 700 }}>
            <h2 className="font-serif" style={{ fontSize: 24, color: '#1a0a0f', marginBottom: 20 }}>Budget Tracker</h2>
            <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 4 }}>Total budget</div>
                  <div className="font-serif" style={{ fontSize: 36, color: '#1a0a0f' }}>{budget ? fmt(budget) : '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 4 }}>Spent so far</div>
                  <div className="font-serif" style={{ fontSize: 28, color: '#C97C8A' }}>{fmt(totalSpent)}</div>
                </div>
              </div>
              {budget > 0 && (
                <>
                  <div style={{ height: 10, borderRadius: 5, background: 'rgba(201,124,138,.12)', overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ height: '100%', borderRadius: 5, background: totalSpent > budget ? '#E24B4A' : '#C97C8A', width: `${Math.min((totalSpent / budget) * 100, 100)}%`, transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ fontSize: 13, color: totalSpent > budget ? '#E24B4A' : '#1a7a4a', fontWeight: 500 }}>
                    {totalSpent > budget ? `⚠ ${fmt(totalSpent - budget)} over budget` : `✓ ${fmt(budget - totalSpent)} remaining`}
                  </div>
                </>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {VENDOR_CATEGORIES.map(cat => {
                const item = getCatItem(cat.id)
                const sel = item.savedVendors.find(v => v.name === item.selectedVendor)
                const price = sel?.price || 0
                const pct = budget ? Math.round((price / budget) * 100) : 0
                return (
                  <div key={cat.id} style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.15)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 110, fontSize: 13, color: '#1a0a0f', fontWeight: 500, flexShrink: 0 }}>{cat.label}</div>
                    <div style={{ flex: 1 }}>
                      {item.selectedVendor
                        ? <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: price > 0 ? 4 : 0 }}>{item.selectedVendor}</div>
                        : <div style={{ fontSize: 12, color: '#bbb', marginBottom: 0 }}>Not booked yet</div>
                      }
                      {price > 0 && budget > 0 && (
                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(201,124,138,.1)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 2, background: '#C97C8A', width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {price > 0 ? (
                        <>
                          <div style={{ fontSize: 14, fontWeight: 500, color: '#1a0a0f' }}>{fmt(price)}</div>
                          {budget > 0 && <div style={{ fontSize: 11, color: '#7a5c65' }}>{pct}% of budget</div>}
                        </>
                      ) : (
                        <div style={{ fontSize: 13, color: '#bbb' }}>—</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {tab === 'payments' && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="font-serif" style={{ fontSize: 24, color: '#1a0a0f' }}>Payment Due Dates</h2>
              <button onClick={() => setAddPayment(true)}
                style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                + Add payment
              </button>
            </div>
            {addPayment && (
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1a0a0f', marginBottom: 14 }}>Add payment due date</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  {[
                    { key: 'vendor', label: 'Vendor Name', placeholder: 'Bell Tower on 34th', type: 'text' },
                    { key: 'label', label: 'Payment Type', placeholder: 'Deposit / Final Payment', type: 'text' },
                    { key: 'amount', label: 'Amount ($)', placeholder: '1500', type: 'number' },
                    { key: 'due', label: 'Due Date', placeholder: '', type: 'date' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 11, color: '#7a5c65', marginBottom: 4 }}>{f.label}</label>
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
                    setNewPayment({ vendor: '', label: '', amount: '', due: '' })
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
                  const overdue = !p.paid && new Date(p.due) < new Date()
                  const dueDate = new Date(p.due)
                  const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / 86400000)
                  return (
                    <div key={p.id} style={{ background: '#fff', border: `0.5px solid ${overdue ? 'rgba(226,75,74,.4)' : p.paid ? 'rgba(26,122,74,.2)' : 'rgba(201,124,138,.2)'}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => setPayments(prev => prev.map(x => x.id === p.id ? { ...x, paid: !x.paid } : x))}
                        style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${p.paid ? '#1a7a4a' : overdue ? '#E24B4A' : '#C97C8A'}`, background: p.paid ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                        {p.paid && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: p.paid ? '#aaa' : '#1a0a0f', textDecoration: p.paid ? 'line-through' : 'none' }}>{p.vendor}</div>
                        <div style={{ fontSize: 12, color: '#7a5c65', marginTop: 1 }}>{p.label} · {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
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

        {/* ── TIMELINE TAB ── */}
        {tab === 'timeline' && (
          <div style={{ maxWidth: 600 }}>
            <h2 className="font-serif" style={{ fontSize: 24, color: '#1a0a0f', marginBottom: 24 }}>Planning Timeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {TIMELINE_ITEMS.map((t, i) => {
                const monthsLeft = countdown ? countdown.months : null
                const isPast = monthsLeft !== null && t.months > monthsLeft
                const isCurrent = monthsLeft !== null && monthsLeft <= t.months && monthsLeft > (TIMELINE_ITEMS[i + 1]?.months ?? -1)
                return (
                  <div key={i} style={{ display: 'flex', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: isCurrent ? '#C9A040' : isPast ? '#1a7a4a' : 'rgba(201,124,138,.3)', flexShrink: 0, marginTop: 3, boxShadow: isCurrent ? '0 0 0 4px rgba(201,160,64,.15)' : 'none' }} />
                      {i < TIMELINE_ITEMS.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(201,124,138,.15)', minHeight: 24, marginTop: 4 }} />}
                    </div>
                    <div style={{ paddingBottom: 24 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isCurrent ? '#C9A040' : isPast ? '#1a7a4a' : '#C97C8A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                        {t.label} {isCurrent && '← You are here'}
                      </div>
                      {t.tasks.map(task => (
                        <div key={task} style={{ fontSize: 14, color: isPast ? '#aaa' : '#555', marginBottom: 4, textDecoration: isPast ? 'line-through' : 'none' }}>· {task}</div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      {/* REVIEW MODAL */}
      {reviewVendor && (
        <ReviewModal
          vendor={reviewVendor}
          momProfileId=""
          onClose={() => setReviewVendor(null)}
          onSubmitted={() => setReviewVendor(null)}
        />
      )}

      <Footer />
    </>
  )
}
