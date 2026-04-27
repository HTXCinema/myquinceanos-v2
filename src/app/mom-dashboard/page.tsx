'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import type { MomProfile, ChecklistItem, VendorPayment } from '@/types'

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

const DEFAULT_CHECKLIST = [
  'Venue', 'Photographer', 'Videographer', 'DJ / Music',
  'Catering', 'Dress & Boutique', 'Makeup & Hair', 'Choreographer',
  'Cake & Desserts', 'Decor & Flowers', 'Limo / Transport', 'Entertainment',
]

const fmt = (n: number) => '$' + Math.round(n).toLocaleString()

function daysBreakdown(dateStr: string) {
  if (!dateStr) return null
  const ms = new Date(dateStr).getTime() - Date.now()
  if (ms <= 0) return null
  const totalDays = Math.ceil(ms / 86400000)
  const months = Math.floor(totalDays / 30)
  const weeks = Math.floor((totalDays % 30) / 7)
  const days = totalDays % 7
  return { totalDays, months, weeks, days }
}

function urgencyBadge(due: string, paid: boolean) {
  if (paid) return { label: 'PAID', color: '#1a7a4a', bg: 'rgba(26,122,74,.1)' }
  const days = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000)
  if (days < 0)  return { label: 'OVERDUE', color: '#E24B4A', bg: 'rgba(226,75,74,.1)' }
  if (days <= 14) return { label: 'URGENT',  color: '#E24B4A', bg: 'rgba(226,75,74,.1)' }
  if (days <= 45) return { label: `${days} DAYS`, color: '#C9A040', bg: 'rgba(201,160,64,.1)' }
  return { label: 'ON TRACK', color: '#1a7a4a', bg: 'rgba(26,122,74,.1)' }
}

type Tab = 'compare' | 'budget' | 'payments' | 'timeline'

export default function MomDashboard() {
  const [profile, setProfile]   = useState<MomProfile | null>(null)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [payments, setPayments]  = useState<VendorPayment[]>([])
  const [loading, setLoading]    = useState(true)
  const [activeTab, setActiveTab] = useState<Tab | null>(null)
  const [addVendor, setAddVendor] = useState<string | null>(null)
  const [vendorInput, setVendorInput] = useState('')
  const [addPayment, setAddPayment]   = useState(false)
  const [payForm, setPayForm] = useState({ vendor: '', label: 'Deposit', amount: '', due: '' })
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'upcoming' | 'done'>('all')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: momData } = await supabase
      .from('mom_profiles').select('*').eq('user_id', user.id).single()

    let activeProfile = momData
    if (!momData) {
      const { data: np } = await supabase
        .from('mom_profiles').insert({ user_id: user.id }).select().single()
      activeProfile = np
    }
    setProfile(activeProfile)

    // Load checklist — deduplicate by item_name
    const { data: clData } = await supabase
      .from('mom_checklist')
      .select('*, vendors(business_name, tier, avg_rating)')
      .eq('mom_profile_id', activeProfile?.id || '')
      .order('sort_order')

    let clRows = clData || []

    // Seed if empty
    if (clRows.length === 0 && activeProfile?.id) {
      await supabase.from('mom_checklist').insert(
        DEFAULT_CHECKLIST.map((name, i) => ({
          mom_profile_id: activeProfile!.id,
          item_name: name,
          sort_order: i,
          is_booked: false,
        }))
      )
      const { data: reseeded } = await supabase
        .from('mom_checklist')
        .select('*, vendors(business_name, tier, avg_rating)')
        .eq('mom_profile_id', activeProfile.id)
        .order('sort_order')
      clRows = reseeded || []
    }

    // Deduplicate: keep only first occurrence of each item_name
    const seen = new Set<string>()
    const deduped = clRows.filter(r => {
      const key = r.item_name?.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    setChecklist(deduped)

    const { data: payData } = await supabase
      .from('vendor_payments').select('*')
      .eq('mom_profile_id', activeProfile?.id || '').order('due_date')
    setPayments(payData || [])

    setLoading(false)
  }

  async function toggleBooked(item: ChecklistItem) {
    const val = !item.is_booked
    await supabase.from('mom_checklist').update({ is_booked: val }).eq('id', item.id)
    setChecklist(l => l.map(i => i.id === item.id ? { ...i, is_booked: val } : i))
  }

  async function setVendorOnItem(itemId: string, name: string) {
    await supabase.from('mom_checklist').update({ vendor_name_override: name, is_booked: true }).eq('id', itemId)
    setChecklist(l => l.map(i => i.id === itemId ? { ...i, vendor_name_override: name, is_booked: true } : i))
    setAddVendor(null); setVendorInput('')
  }

  async function togglePaid(p: VendorPayment) {
    const val = !p.is_paid
    await supabase.from('vendor_payments').update({ is_paid: val, paid_at: val ? new Date().toISOString().split('T')[0] : null }).eq('id', p.id)
    setPayments(l => l.map(x => x.id === p.id ? { ...x, is_paid: val } : x))
  }

  async function addPaymentDue() {
    if (!profile || !payForm.vendor || !payForm.amount || !payForm.due) return
    const { data } = await supabase.from('vendor_payments').insert({
      mom_profile_id: profile.id,
      vendor_name: payForm.vendor,
      payment_label: payForm.label,
      amount_due: Number(payForm.amount),
      due_date: payForm.due,
    }).select().single()
    if (data) setPayments(p => [...p, data].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()))
    setPayForm({ vendor: '', label: 'Deposit', amount: '', due: '' })
    setAddPayment(false)
  }

  // Derived
  const countdown    = profile?.event_date ? daysBreakdown(profile.event_date) : null
  const eventPassed  = profile?.event_date ? new Date(profile.event_date) < new Date() : false
  const bookedCount  = checklist.filter(c => c.is_booked).length
  const totalPaid    = payments.filter(p => p.is_paid).reduce((a, p) => a + (p.amount_paid || 0), 0)
  const totalDue     = payments.reduce((a, p) => a + (p.amount_due || 0), 0)
  const progressPct  = checklist.length > 0 ? Math.round((bookedCount / checklist.length) * 100) : 0
  const budget       = Number(profile?.total_budget) || 0
  const upcomingPays = payments.filter(p => !p.is_paid).slice(0, 4)
  const nextUnbooked = VENDOR_CATEGORIES.find(c =>
    !checklist.find(cl => cl.item_name?.toLowerCase().includes(c.label.toLowerCase()) && cl.is_booked)
  )

  const filteredChecklist = checklist.filter(item => {
    if (checklistFilter === 'done')     return item.is_booked
    if (checklistFilter === 'upcoming') return !item.is_booked
    return true
  })

  if (loading) return (
    <><Nav />
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 14, color: '#7a5c65' }}>Loading your dashboard...</div>
    </div></>
  )

  return (
    <>
      <Nav />

      {/* COUNTDOWN BANNER */}
      {countdown && (
        <div style={{ background: 'rgba(201,160,64,.1)', borderBottom: '0.5px solid rgba(201,160,64,.2)', padding: '7px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#C9A040', letterSpacing: '0.5px' }}>
            {countdown.months > 0 ? `${countdown.months} MONTHS · ` : ''}
            {countdown.weeks  > 0 ? `${countdown.weeks} WEEKS · `  : ''}
            {countdown.days} DAYS UNTIL {profile?.daughter_name?.toUpperCase() || 'THE'}'S QUINCEAÑERA
          </span>
        </div>
      )}
      {eventPassed && (
        <div style={{ background: 'rgba(26,122,74,.1)', borderBottom: '0.5px solid rgba(26,122,74,.2)', padding: '7px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#5DCAA5' }}>🎉 THE BIG DAY HAS PASSED — LEAVE REVIEWS FOR YOUR VENDORS</span>
        </div>
      )}

      {/* DARK HEADER */}
      <div style={{ background: '#1a0a0f', padding: '24px 24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(250,216,233,.35)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 5 }}>Your Planning Hub</div>
              <h1 className="font-serif" style={{ fontSize: 'clamp(20px,3.5vw,30px)', color: '#fff', marginBottom: 4 }}>
                {profile?.daughter_name ? `${profile.daughter_name}'s Quinceañera` : 'My Quinceañera Planner'}
              </h1>
              {profile?.event_date && (
                <div style={{ fontSize: 12, color: 'rgba(250,216,233,.4)' }}>
                  {new Date(profile.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  {profile?.guest_count ? ` · ${profile.guest_count} guests` : ''}
                  {budget > 0 ? ` · ${fmt(budget)} budget` : ''}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {countdown && (
                <div style={{ textAlign: 'center', background: 'rgba(201,160,64,.12)', border: '0.5px solid rgba(201,160,64,.3)', borderRadius: 12, padding: '10px 18px' }}>
                  <div className="font-serif" style={{ fontSize: 36, color: '#C9A040', lineHeight: 1 }}>{countdown.totalDays}</div>
                  <div style={{ fontSize: 9, color: 'rgba(250,216,233,.4)', marginTop: 2 }}>days away</div>
                  <div style={{ fontSize: 9, color: 'rgba(201,160,64,.5)', marginTop: 1 }}>
                    {countdown.months > 0 ? `${countdown.months}mo ` : ''}{countdown.weeks > 0 ? `${countdown.weeks}wk ` : ''}{countdown.days}d
                  </div>
                </div>
              )}
              <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
                style={{ background: 'transparent', color: 'rgba(250,216,233,.4)', border: '0.5px solid rgba(250,216,233,.15)', padding: '8px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer' }}>
                Sign Out
              </button>
            </div>
          </div>

          {/* STAT STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '0.5px solid rgba(250,216,233,.08)' }}>
            {[
              ['BUDGET',          budget > 0 ? fmt(budget) : 'Not set'],
              ['SPENT',           fmt(totalPaid)],
              ['VENDORS BOOKED',  `${bookedCount} / ${checklist.length}`],
              ['PAYMENTS',        `${fmt(totalPaid)} / ${fmt(totalDue)}`],
            ].map(([l, v]) => (
              <div key={l} style={{ padding: '14px 16px', borderRight: '0.5px solid rgba(250,216,233,.06)' }}>
                <div style={{ fontSize: 9, color: 'rgba(250,216,233,.3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{v}</div>
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
            ] as [Tab, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(activeTab === key ? null : key)}
                style={{ padding: '11px 18px', background: 'transparent', border: 'none', borderBottom: activeTab === key ? '2px solid #C97C8A' : '2px solid transparent', color: activeTab === key ? '#FAD8E9' : 'rgba(250,216,233,.35)', fontSize: 13, fontWeight: activeTab === key ? 500 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px 60px' }}>

        {/* DEFAULT VIEW: two-column dashboard */}
        {!activeTab && (
          <div style={{ display: 'grid', gap: 20 }} className="dash-grid">

            {/* LEFT: Checklist + Saved Vendors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

              {/* PLANNING CHECKLIST — scrollable box */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(201,124,138,.1)' }}>
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

                {/* SCROLLABLE LIST */}
                <div style={{ height: 360, overflowY: 'auto', padding: '8px 16px' }}>
                  {/* Group by timeline months */}
                  {TIMELINE_GROUPS.map(group => {
                    const groupItems = filteredChecklist.filter(item =>
                      VENDOR_CATEGORIES.find(c =>
                        item.item_name?.toLowerCase().includes(c.label.toLowerCase()) && c.month === group.months
                      )
                    )
                    // fallback: show items not matched to any group in first group
                    const unmatchedItems = group.months === 12
                      ? filteredChecklist.filter(item =>
                          !VENDOR_CATEGORIES.find(c => item.item_name?.toLowerCase().includes(c.label.toLowerCase()))
                        )
                      : []
                    const allItems = [...groupItems, ...unmatchedItems]
                    if (allItems.length === 0) return null
                    const allDone = allItems.every(i => i.is_booked)
                    return (
                      <div key={group.months} style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: allDone ? '#1a7a4a' : 'rgba(201,124,138,.5)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {group.label}
                          {allDone && <span style={{ fontSize: 8, background: 'rgba(26,122,74,.12)', color: '#1a7a4a', padding: '1px 6px', borderRadius: 8 }}>DONE</span>}
                        </div>
                        {allItems.map(item => {
                          const vendorName = item.vendor_name_override || (item.vendors as any)?.business_name || ''
                          const catMatch = VENDOR_CATEGORIES.find(c => item.item_name?.toLowerCase().includes(c.label.toLowerCase()))
                          return (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '0.5px solid rgba(201,124,138,.06)' }}>
                              <button onClick={() => toggleBooked(item)}
                                style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${item.is_booked ? '#1a7a4a' : '#C97C8A'}`, background: item.is_booked ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                                {item.is_booked && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                              </button>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: item.is_booked ? '#aaa' : '#1a0a0f', textDecoration: item.is_booked ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.item_name}</div>
                                {vendorName && <div style={{ fontSize: 11, color: '#C97C8A', fontWeight: 500 }}>{vendorName}</div>}
                              </div>
                              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                {!vendorName && addVendor !== item.id && (
                                  <button onClick={() => setAddVendor(item.id)}
                                    style={{ fontSize: 10, color: '#C97C8A', background: 'rgba(201,124,138,.08)', border: 'none', borderRadius: 20, padding: '2px 8px', cursor: 'pointer' }}>+ Add</button>
                                )}
                                {addVendor === item.id && (
                                  <div style={{ display: 'flex', gap: 3 }}>
                                    <input value={vendorInput} onChange={e => setVendorInput(e.target.value)} placeholder="Vendor name..." autoFocus
                                      onKeyDown={e => e.key === 'Enter' && vendorInput && setVendorOnItem(item.id, vendorInput)}
                                      style={{ fontSize: 11, border: '0.5px solid rgba(201,124,138,.4)', borderRadius: 6, padding: '3px 7px', outline: 'none', width: 110 }} />
                                    <button onClick={() => vendorInput && setVendorOnItem(item.id, vendorInput)}
                                      style={{ background: '#C97C8A', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 7px', fontSize: 10, cursor: 'pointer' }}>✓</button>
                                    <button onClick={() => { setAddVendor(null); setVendorInput('') }}
                                      style={{ background: 'transparent', color: '#999', border: 'none', cursor: 'pointer', fontSize: 12 }}>✕</button>
                                  </div>
                                )}
                                {catMatch && (
                                  <Link href={`/vendors?category=${catMatch.slug}`}
                                    style={{ fontSize: 10, color: '#bbb', background: 'rgba(0,0,0,.04)', borderRadius: 20, padding: '2px 8px', textDecoration: 'none' }}>Browse</Link>
                                )}
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
                    const matchingItem = checklist.find(cl =>
                      cl.item_name?.toLowerCase().includes(cat.label.toLowerCase())
                    )
                    const vendorName = matchingItem?.vendor_name_override || (matchingItem?.vendors as any)?.business_name || ''
                    const isBooked = matchingItem?.is_booked || false
                    return (
                      <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < VENDOR_CATEGORIES.length - 1 ? '0.5px solid rgba(201,124,138,.07)' : 'none' }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#C97C8A', textTransform: 'uppercase', letterSpacing: '.5px', width: 100, flexShrink: 0 }}>{cat.label}</div>
                        <div style={{ flex: 1, fontSize: 12, color: vendorName ? '#1a0a0f' : '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {vendorName || 'Not selected yet'}
                        </div>
                        {isBooked ? (
                          <div style={{ fontSize: 11, color: '#1a7a4a', fontWeight: 600, flexShrink: 0 }}>✓ Booked</div>
                        ) : (
                          <Link href={`/vendors?category=${cat.slug}`}
                            style={{ fontSize: 11, color: '#C97C8A', textDecoration: 'none', flexShrink: 0 }}>+ Browse</Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

              {/* BUDGET TRACKER */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 14 }}>Budget Tracker</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
                  <div className="font-serif" style={{ fontSize: 32, color: '#1a0a0f', lineHeight: 1 }}>{fmt(totalPaid)}</div>
                  <div style={{ fontSize: 13, color: '#7a5c65', marginBottom: 3 }}>of {budget > 0 ? fmt(budget) : '—'}</div>
                </div>
                {budget > 0 && (
                  <div style={{ height: 7, borderRadius: 4, background: 'rgba(201,124,138,.1)', overflow: 'hidden', marginBottom: 12 }}>
                    <div style={{ height: '100%', borderRadius: 4, background: totalPaid > budget ? '#E24B4A' : 'linear-gradient(90deg,#C97C8A,#C9A040)', width: `${Math.min((totalPaid / budget) * 100, 100)}%`, transition: 'width 0.4s' }} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {VENDOR_CATEGORIES.map(cat => {
                    const item = checklist.find(cl => cl.item_name?.toLowerCase().includes(cat.label.toLowerCase()))
                    const vendorName = item?.vendor_name_override || (item?.vendors as any)?.business_name || ''
                    return (
                      <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: '#555' }}>{cat.label}</span>
                        <span style={{ fontWeight: 500, color: vendorName ? '#1a0a0f' : '#ccc' }}>{vendorName || '—'}</span>
                      </div>
                    )
                  })}
                  {budget > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: budget - totalPaid < 0 ? '#E24B4A' : '#1a7a4a', borderTop: '0.5px solid rgba(201,124,138,.1)', paddingTop: 8, marginTop: 4 }}>
                      <span>Remaining</span>
                      <span>{fmt(Math.abs(budget - totalPaid))}{budget - totalPaid < 0 ? ' over' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PAYMENT DUE DATES */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 12 }}>Payment Due Dates</div>
                {upcomingPays.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#ccc', textAlign: 'center', padding: '12px 0' }}>No payments tracked yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {upcomingPays.map(p => {
                      const badge = urgencyBadge(p.due_date, p.is_paid)
                      return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <button onClick={() => togglePaid(p)}
                            style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${p.is_paid ? '#1a7a4a' : '#C97C8A'}`, background: p.is_paid ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                            {p.is_paid && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: p.is_paid ? '#aaa' : '#1a0a0f', textDecoration: p.is_paid ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.vendor_name}</div>
                            <div style={{ fontSize: 11, color: '#7a5c65' }}>{fmt(p.amount_due)} · Due {new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: badge.color, background: badge.bg, padding: '3px 8px', borderRadius: 20, flexShrink: 0, letterSpacing: '.5px' }}>{badge.label}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <button onClick={() => setActiveTab('payments')}
                  style={{ width: '100%', marginTop: 10, padding: '8px 0', border: '0.5px dashed rgba(201,124,138,.3)', borderRadius: 10, background: 'transparent', color: '#C97C8A', fontSize: 12, cursor: 'pointer' }}>
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
                    <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 6 }}>{bookedCount} of {checklist.length} tasks done</div>
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
              </div>
            </div>
          </div>
        )}

        {/* ── COMPARE VENDORS TAB ── */}
        {activeTab === 'compare' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h2 className="font-serif" style={{ fontSize: 22, color: '#1a0a0f' }}>Compare & Save Vendors</h2>
              <p style={{ fontSize: 13, color: '#7a5c65', marginTop: 4 }}>Save up to 3 vendors per category, compare side by side, then pick one</p>
            </div>
            {VENDOR_CATEGORIES.map(cat => {
              const item = checklist.find(cl => cl.item_name?.toLowerCase().includes(cat.label.toLowerCase()))
              const isBooked = item?.is_booked || false
              const vendorName = item?.vendor_name_override || (item?.vendors as any)?.business_name || ''
              return (
                <div key={cat.id} style={{ background: '#fff', border: `0.5px solid ${isBooked ? 'rgba(26,122,74,.2)' : 'rgba(201,124,138,.18)'}`, borderRadius: 12, marginBottom: 8, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isBooked ? '#1a7a4a' : '#C97C8A'}`, background: isBooked ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isBooked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#1a0a0f', flex: 1 }}>{cat.label}</span>
                  {vendorName && <span style={{ fontSize: 12, color: '#1a7a4a', fontWeight: 500 }}>✓ {vendorName}</span>}
                  <Link href={`/vendors?category=${cat.slug}`}
                    style={{ fontSize: 12, color: '#C97C8A', textDecoration: 'none', padding: '6px 14px', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 20 }}>
                    Browse {cat.label} →
                  </Link>
                </div>
              )
            })}
          </div>
        )}

        {/* ── BUDGET TAB ── */}
        {activeTab === 'budget' && (
          <div style={{ maxWidth: 680 }}>
            <h2 className="font-serif" style={{ fontSize: 22, color: '#1a0a0f', marginBottom: 20 }}>Budget Tracker</h2>
            <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 4 }}>Total paid</div>
                  <div className="font-serif" style={{ fontSize: 36, color: '#1a0a0f' }}>{fmt(totalPaid)}</div>
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
                    <div style={{ height: '100%', borderRadius: 4, background: totalPaid > budget ? '#E24B4A' : '#C97C8A', width: `${Math.min((totalPaid / budget) * 100, 100)}%` }} />
                  </div>
                  <div style={{ fontSize: 13, color: totalPaid > budget ? '#E24B4A' : '#1a7a4a', fontWeight: 500, marginBottom: 16 }}>
                    {totalPaid > budget ? `⚠ ${fmt(totalPaid - budget)} over budget` : `✓ ${fmt(budget - totalPaid)} remaining`}
                  </div>
                </>
              )}
              {VENDOR_CATEGORIES.map(cat => {
                const item = checklist.find(cl => cl.item_name?.toLowerCase().includes(cat.label.toLowerCase()))
                const vendorName = item?.vendor_name_override || (item?.vendors as any)?.business_name || ''
                return (
                  <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid rgba(201,124,138,.08)', fontSize: 13 }}>
                    <span style={{ color: '#1a0a0f', fontWeight: 500 }}>{cat.label}</span>
                    <span style={{ color: vendorName ? '#7a5c65' : '#ccc' }}>{vendorName || '—'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {activeTab === 'payments' && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="font-serif" style={{ fontSize: 22, color: '#1a0a0f' }}>Payment Tracker</h2>
              <button onClick={() => setAddPayment(true)}
                style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                + Add Payment
              </button>
            </div>
            {addPayment && (
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.25)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginBottom: 14 }}>
                  {[
                    { key: 'vendor', label: 'Vendor Name',   placeholder: 'Bell Tower', type: 'text' },
                    { key: 'label',  label: 'Payment Type',  placeholder: 'Deposit',    type: 'text' },
                    { key: 'amount', label: 'Amount ($)',     placeholder: '1500',       type: 'number' },
                    { key: 'due',    label: 'Due Date',       placeholder: '',           type: 'date' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 11, color: '#7a5c65', fontWeight: 500, marginBottom: 5 }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder}
                        value={payForm[f.key as keyof typeof payForm]}
                        onChange={e => setPayForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={addPaymentDue} style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setAddPayment(false)} style={{ background: 'transparent', color: '#7a5c65', border: '0.5px solid rgba(201,124,138,.3)', padding: '9px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {payments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#7a5c65', fontSize: 14 }}>No payments added yet.</div>
              ) : payments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).map(p => {
                const overdue = !p.is_paid && new Date(p.due_date) < new Date()
                return (
                  <div key={p.id} style={{ background: '#fff', border: `0.5px solid ${overdue ? 'rgba(226,75,74,.4)' : p.is_paid ? 'rgba(26,122,74,.2)' : 'rgba(201,124,138,.2)'}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => togglePaid(p)}
                      style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${p.is_paid ? '#1a7a4a' : overdue ? '#E24B4A' : '#C97C8A'}`, background: p.is_paid ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                      {p.is_paid && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: p.is_paid ? '#aaa' : '#1a0a0f', textDecoration: p.is_paid ? 'line-through' : 'none' }}>{p.vendor_name}</div>
                      <div style={{ fontSize: 12, color: '#7a5c65', marginTop: 1 }}>{p.payment_label}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: p.is_paid ? '#1a7a4a' : overdue ? '#E24B4A' : '#1a0a0f' }}>{fmt(p.amount_due)}</div>
                      <div style={{ fontSize: 11, color: overdue ? '#E24B4A' : '#7a5c65', marginTop: 1 }}>
                        {overdue ? '⚠ Overdue · ' : ''}{new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── TIMELINE TAB ── */}
        {activeTab === 'timeline' && (
          <div style={{ maxWidth: 600 }}>
            <h2 className="font-serif" style={{ fontSize: 22, color: '#1a0a0f', marginBottom: 24 }}>Planning Timeline</h2>
            {TIMELINE_GROUPS.map((t, i) => {
              const monthsLeft = countdown?.months ?? null
              const isPast    = monthsLeft !== null && t.months > monthsLeft
              const isCurrent = monthsLeft !== null && monthsLeft <= t.months && monthsLeft > (TIMELINE_GROUPS[i + 1]?.months ?? -1)
              return (
                <div key={i} style={{ display: 'flex', gap: 18 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 13, height: 13, borderRadius: '50%', background: isCurrent ? '#C9A040' : isPast ? '#1a7a4a' : 'rgba(201,124,138,.3)', marginTop: 3, boxShadow: isCurrent ? '0 0 0 4px rgba(201,160,64,.15)' : 'none' }} />
                    {i < TIMELINE_GROUPS.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(201,124,138,.15)', minHeight: 24, marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingBottom: 24 }}>
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

      <style>{`
        .dash-grid {
          grid-template-columns: minmax(0,1fr) minmax(0,360px);
        }
        @media (max-width: 900px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .dash-grid { padding: 0; }
        }
      `}</style>

      <Footer />
    </>
  )
}
