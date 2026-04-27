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
  const weeks  = Math.floor((totalDays % 30) / 7)
  const days   = totalDays % 7
  return { totalDays, months, weeks, days }
}

function urgencyBadge(due: string, paid: boolean) {
  if (paid) return { label: 'PAID', color: '#1a7a4a', bg: 'rgba(26,122,74,.1)' }
  const days = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000)
  if (days < 0)   return { label: 'OVERDUE', color: '#E24B4A', bg: 'rgba(226,75,74,.1)' }
  if (days <= 14) return { label: 'URGENT',  color: '#E24B4A', bg: 'rgba(226,75,74,.1)' }
  if (days <= 45) return { label: `${days} DAYS`, color: '#C9A040', bg: 'rgba(201,160,64,.1)' }
  return { label: 'ON TRACK', color: '#1a7a4a', bg: 'rgba(26,122,74,.1)' }
}

type Tab = 'compare' | 'budget' | 'payments' | 'timeline'

// ─── PROFILE SETUP SCREEN ───────────────────────────────────────
function MomProfileSetup({
  profile, supabase, onComplete,
}: {
  profile: MomProfile
  supabase: ReturnType<typeof createClient>
  onComplete: () => void
}) {
  const [form, setForm] = useState({
    daughter: profile?.daughter_name || '',
    date:     profile?.event_date    || '',
    budget:   profile?.total_budget  ? String(profile.total_budget) : '',
    guests:   profile?.guest_count   ? String(profile.guest_count)  : '',
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.daughter.trim() || !form.date) return
    setSaving(true)
    await supabase.from('mom_profiles').update({
      daughter_name: form.daughter.trim(),
      event_date:    form.date,
      total_budget:  form.budget ? Number(form.budget) : null,
      guest_count:   form.guests ? Number(form.guests) : null,
    }).eq('id', profile.id)
    onComplete()
  }

  const ready = form.daughter.trim() && form.date

  return (
    <>
      <Nav />
      <div style={{ minHeight: '80vh', background: 'linear-gradient(160deg,#1a0a0f 0%,#2d1020 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ maxWidth: 520, width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 10 }}>Welcome to Your Planning Hub</div>
            <h1 className="font-serif" style={{ fontSize: 'clamp(22px,5vw,34px)', color: '#fff', marginBottom: 10, lineHeight: 1.2 }}>
              Let&apos;s set up your dashboard
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(250,216,233,.45)', lineHeight: 1.6 }}>
              A few quick details and your command center is ready.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(250,216,233,.12)', borderRadius: 20, padding: '28px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
              {[
                { key: 'daughter', label: "Daughter's Name", placeholder: 'Sofia',  type: 'text'   },
                { key: 'date',     label: 'Quinceañera Date', placeholder: '',       type: 'date'   },
                { key: 'budget',   label: 'Total Budget ($)', placeholder: '15000', type: 'number' },
                { key: 'guests',   label: 'Guest Count',      placeholder: '150',   type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(250,216,233,.35)', marginBottom: 6 }}>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,.07)', border: '0.5px solid rgba(250,216,233,.15)', borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={save}
              disabled={saving || !ready}
              style={{ width: '100%', background: 'linear-gradient(135deg,#C97C8A,#b56a78)', color: '#fff', border: 'none', padding: '14px 0', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: saving ? 'wait' : 'pointer', opacity: ready ? 1 : 0.5, boxShadow: '0 4px 20px rgba(201,124,138,.3)', transition: 'opacity .2s' }}>
              {saving ? 'Saving...' : 'Open my dashboard →'}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(250,216,233,.2)', marginTop: 12 }}>
              You can update these details anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

// ─── MAIN DASHBOARD ─────────────────────────────────────────────
export default function MomDashboard() {
  const [profile, setProfile]     = useState<MomProfile | null>(null)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [payments, setPayments]   = useState<VendorPayment[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState<Tab | null>(null)
  const [addVendor, setAddVendor] = useState<string | null>(null)
  const [vendorInput, setVendorInput]   = useState('')
  const [addPayment, setAddPayment]     = useState(false)
  const [payForm, setPayForm] = useState({ vendor: '', label: 'Deposit', amount: '', due: '' })
  const [checklistFilter, setChecklistFilter] = useState<'all' | 'upcoming' | 'done'>('all')
  const [editingProfile, setEditingProfile] = useState(false)

  const router   = useRouter()
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

    const { data: clData } = await supabase
      .from('mom_checklist')
      .select('*, vendors(business_name, tier, avg_rating)')
      .eq('mom_profile_id', activeProfile?.id || '')
      .order('sort_order')

    let clRows = clData || []

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

    // Deduplicate — keep only the first occurrence of each item_name
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

  // ── Derived ──
  const countdown    = profile?.event_date ? daysBreakdown(profile.event_date) : null
  const eventPassed  = profile?.event_date ? new Date(profile.event_date) < new Date() : false
  const bookedCount  = checklist.filter(c => c.is_booked).length
  const totalPaid    = payments.filter(p => p.is_paid).reduce((a, p) => a + (p.amount_paid ?? 0), 0)
  const totalDue     = payments.reduce((a, p) => a + (p.amount_due ?? 0), 0)
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

  // ── Loading ──
  if (loading) return (
    <>
      <Nav />
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: '#7a5c65' }}>Loading your dashboard...</div>
      </div>
    </>
  )

  // ── Profile setup — show if no daughter name or event date ──
  if (!profile?.daughter_name || !profile?.event_date) {
    return (
      <MomProfileSetup
        profile={profile!}
        supabase={supabase}
        onComplete={loadDashboard}
      />
    )
  }

  return (
    <>
      <Nav />

      {/* COUNTDOWN BANNER */}
      {countdown && (
        <div style={{ background: 'rgba(201,160,64,.1)', borderBottom: '0.5px solid rgba(201,160,64,.2)', padding: '7px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#C9A040', letterSpacing: '0.5px' }}>
            {countdown.months > 0 ? `${countdown.months} MONTHS · ` : ''}
            {countdown.weeks  > 0 ? `${countdown.weeks} WEEKS · `  : ''}
            {countdown.days} DAYS UNTIL {profile?.daughter_name?.toUpperCase()}&apos;S QUINCEAÑERA
          </span>
        </div>
      )}
      {eventPassed && (
        <div style={{ background: 'rgba(26,122,74,.1)', borderBottom: '0.5px solid rgba(26,122,74,.2)', padding: '7px 20px', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#5DCAA5' }}>🎉 THE BIG DAY HAS PASSED — LEAVE REVIEWS FOR YOUR VENDORS</span>
        </div>
      )}

      {/* DARK HEADER */}
      <div style={{ background: '#1a0a0f', padding: '20px 16px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 10, color: 'rgba(250,216,233,.35)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 4 }}>Your Planning Hub</div>
              <h1 className="font-serif" style={{ fontSize: 'clamp(18px,3.5vw,28px)', color: '#fff', marginBottom: 4, lineHeight: 1.2 }}>
                {profile.daughter_name}&apos;s Quinceañera
              </h1>
              <div style={{ fontSize: 12, color: 'rgba(250,216,233,.4)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span>{new Date(profile.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                {profile?.guest_count ? <span>· {profile.guest_count} guests</span> : null}
                {budget > 0 ? <span>· {fmt(budget)}</span> : null}
                <button onClick={() => setEditingProfile(true)}
                  style={{ fontSize: 10, color: 'rgba(201,124,138,.6)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                  Edit
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              {countdown && (
                <div style={{ textAlign: 'center', background: 'rgba(201,160,64,.12)', border: '0.5px solid rgba(201,160,64,.3)', borderRadius: 12, padding: '8px 14px' }}>
                  <div className="font-serif" style={{ fontSize: 30, color: '#C9A040', lineHeight: 1 }}>{countdown.totalDays}</div>
                  <div style={{ fontSize: 9, color: 'rgba(250,216,233,.4)', marginTop: 1 }}>days away</div>
                  <div style={{ fontSize: 9, color: 'rgba(201,160,64,.5)', marginTop: 1 }}>
                    {countdown.months > 0 ? `${countdown.months}mo ` : ''}{countdown.weeks > 0 ? `${countdown.weeks}wk ` : ''}{countdown.days}d
                  </div>
                </div>
              )}
              <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
                style={{ background: 'transparent', color: 'rgba(250,216,233,.35)', border: '0.5px solid rgba(250,216,233,.12)', padding: '7px 14px', borderRadius: 20, fontSize: 11, cursor: 'pointer' }}>
                Sign Out
              </button>
            </div>
          </div>

          {/* STAT STRIP */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '0.5px solid rgba(250,216,233,.08)' }}>
            {([
              ['BUDGET',         budget > 0 ? fmt(budget) : 'Not set'],
              ['SPENT',          fmt(totalPaid)],
              ['VENDORS BOOKED', `${bookedCount} / ${checklist.length}`],
              ['PAYMENTS',       `${fmt(totalPaid)} / ${fmt(totalDue)}`],
            ] as [string, string][]).map(([l, v]) => (
              <div key={l} style={{ padding: '10px 12px', borderRight: '0.5px solid rgba(250,216,233,.05)' }}>
                <div style={{ fontSize: 8, color: 'rgba(250,216,233,.28)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* PINK PILL TABS */}
          <div style={{ display: 'flex', gap: 6, padding: '10px 0 0', borderTop: '0.5px solid rgba(250,216,233,.06)', overflowX: 'auto' }}>
            {([
              ['compare',  'Compare Vendors'],
              ['budget',   'Budget'],
              ['payments', 'Payments'],
              ['timeline', 'Timeline'],
            ] as [Tab, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(activeTab === key ? null : key)}
                style={{ padding: '7px 16px', borderRadius: 20, border: activeTab === key ? 'none' : '1px solid rgba(201,124,138,.35)', background: activeTab === key ? '#C97C8A' : 'transparent', color: activeTab === key ? '#fff' : '#C97C8A', fontSize: 12, fontWeight: activeTab === key ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s', marginBottom: 10, flexShrink: 0 }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px 60px', overflowX: 'hidden' }}>

        {/* EDIT PROFILE MODAL */}
        {editingProfile && profile && (
          <EditProfileModal
            profile={profile}
            supabase={supabase}
            onSave={async (updates) => {
              await supabase.from('mom_profiles').update(updates).eq('id', profile.id)
              setProfile({ ...profile, ...updates })
              setEditingProfile(false)
            }}
            onClose={() => setEditingProfile(false)}
          />
        )}

        {/* DEFAULT VIEW — two-column dashboard */}
        {!activeTab && (
          <div className="dash-grid">

            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

              {/* PLANNING CHECKLIST */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(201,124,138,.1)', gap: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A' }}>Planning Checklist</div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {(['all', 'upcoming', 'done'] as const).map(f => (
                      <button key={f} onClick={() => setChecklistFilter(f)}
                        style={{ padding: '3px 9px', borderRadius: 20, border: `0.5px solid ${checklistFilter === f ? '#C97C8A' : 'rgba(201,124,138,.25)'}`, background: checklistFilter === f ? '#C97C8A' : 'transparent', color: checklistFilter === f ? '#fff' : '#7a5c65', fontSize: 10, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize' }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ height: 380, overflowY: 'auto', padding: '6px 12px 8px' }}>
                  {TIMELINE_GROUPS.map(group => {
                    const groupItems = filteredChecklist.filter(item =>
                      VENDOR_CATEGORIES.find(c =>
                        item.item_name?.toLowerCase().includes(c.label.toLowerCase()) && c.month === group.months
                      )
                    )
                    const unmatchedItems = group.months === 12
                      ? filteredChecklist.filter(item =>
                          !VENDOR_CATEGORIES.find(c => item.item_name?.toLowerCase().includes(c.label.toLowerCase()))
                        )
                      : []
                    const allItems = [...groupItems, ...unmatchedItems]
                    if (allItems.length === 0) return null
                    const allDone = allItems.every(i => i.is_booked)
                    return (
                      <div key={group.months} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: allDone ? '#1a7a4a' : 'rgba(201,124,138,.45)', marginBottom: 4, paddingTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                          {group.label}
                          {allDone && <span style={{ fontSize: 8, background: 'rgba(26,122,74,.1)', color: '#1a7a4a', padding: '1px 5px', borderRadius: 6 }}>DONE</span>}
                        </div>
                        {allItems.map(item => {
                          const vendorName = item.vendor_name_override || (item.vendors as any)?.business_name || ''
                          const catMatch   = VENDOR_CATEGORIES.find(c => item.item_name?.toLowerCase().includes(c.label.toLowerCase()))
                          return (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '0.5px solid rgba(201,124,138,.05)', overflow: 'hidden' }}>
                              <button onClick={() => toggleBooked(item)}
                                style={{ width: 17, height: 17, borderRadius: '50%', border: `2px solid ${item.is_booked ? '#1a7a4a' : '#C97C8A'}`, background: item.is_booked ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', padding: 0 }}>
                                {item.is_booked && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                              </button>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 500, color: item.is_booked ? '#aaa' : '#1a0a0f', textDecoration: item.is_booked ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.item_name}</div>
                                {vendorName && <div style={{ fontSize: 10, color: '#C97C8A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vendorName}</div>}
                              </div>
                              <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                                {!vendorName && addVendor !== item.id && (
                                  <button onClick={() => setAddVendor(item.id)}
                                    style={{ fontSize: 10, color: '#C97C8A', background: 'rgba(201,124,138,.08)', border: 'none', borderRadius: 20, padding: '2px 7px', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Add</button>
                                )}
                                {addVendor === item.id && (
                                  <div style={{ display: 'flex', gap: 3 }}>
                                    <input value={vendorInput} onChange={e => setVendorInput(e.target.value)} placeholder="Vendor name..." autoFocus
                                      onKeyDown={e => e.key === 'Enter' && vendorInput && setVendorOnItem(item.id, vendorInput)}
                                      style={{ fontSize: 11, border: '0.5px solid rgba(201,124,138,.4)', borderRadius: 6, padding: '3px 7px', outline: 'none', width: 100 }} />
                                    <button onClick={() => vendorInput && setVendorOnItem(item.id, vendorInput)}
                                      style={{ background: '#C97C8A', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 6px', fontSize: 10, cursor: 'pointer' }}>✓</button>
                                    <button onClick={() => { setAddVendor(null); setVendorInput('') }}
                                      style={{ background: 'transparent', color: '#999', border: 'none', cursor: 'pointer', fontSize: 12 }}>✕</button>
                                  </div>
                                )}
                                {catMatch && !addVendor && (
                                  <Link href={`/vendors?category=${catMatch.slug}`}
                                    style={{ fontSize: 10, color: '#bbb', background: 'rgba(0,0,0,.04)', borderRadius: 20, padding: '2px 7px', textDecoration: 'none', whiteSpace: 'nowrap' }}>Browse</Link>
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
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '13px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 10 }}>My Saved Vendors</div>
                {VENDOR_CATEGORIES.map((cat, i) => {
                  const matchingItem = checklist.find(cl => cl.item_name?.toLowerCase().includes(cat.label.toLowerCase()))
                  const vendorName   = matchingItem?.vendor_name_override || (matchingItem?.vendors as any)?.business_name || ''
                  const isBooked     = matchingItem?.is_booked || false
                  return (
                    <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: i < VENDOR_CATEGORIES.length - 1 ? '0.5px solid rgba(201,124,138,.06)' : 'none', overflow: 'hidden' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#C97C8A', textTransform: 'uppercase', letterSpacing: '.4px', width: 82, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.label}</div>
                      <div style={{ flex: 1, fontSize: 12, color: vendorName ? '#1a0a0f' : '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                        {vendorName || 'Not selected yet'}
                      </div>
                      {isBooked ? (
                        <div style={{ fontSize: 10, color: '#1a7a4a', fontWeight: 700, flexShrink: 0 }}>✓</div>
                      ) : (
                        <Link href={`/vendors?category=${cat.slug}`} style={{ fontSize: 10, color: '#C97C8A', textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>+ Browse</Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

              {/* BUDGET TRACKER */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '15px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 10 }}>Budget Tracker</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
                  <div className="font-serif" style={{ fontSize: 26, color: '#1a0a0f', lineHeight: 1 }}>{fmt(totalPaid)}</div>
                  <div style={{ fontSize: 12, color: '#7a5c65', paddingBottom: 2 }}>of {budget > 0 ? fmt(budget) : '—'}</div>
                </div>
                {budget > 0 && (
                  <div style={{ height: 6, borderRadius: 3, background: 'rgba(201,124,138,.1)', overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ height: '100%', borderRadius: 3, background: totalPaid > budget ? '#E24B4A' : 'linear-gradient(90deg,#C97C8A,#C9A040)', width: `${Math.min((totalPaid / budget) * 100, 100)}%`, transition: 'width .4s' }} />
                  </div>
                )}
                {VENDOR_CATEGORIES.map(cat => {
                  const item       = checklist.find(cl => cl.item_name?.toLowerCase().includes(cat.label.toLowerCase()))
                  const vendorName = item?.vendor_name_override || (item?.vendors as any)?.business_name || ''
                  return (
                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '0.5px solid rgba(201,124,138,.06)', gap: 8, overflow: 'hidden' }}>
                      <span style={{ fontSize: 12, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{cat.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: vendorName ? '#1a0a0f' : '#ccc', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>{vendorName || '—'}</span>
                    </div>
                  )
                })}
                {budget > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: budget - totalPaid < 0 ? '#E24B4A' : '#1a7a4a', paddingTop: 8, marginTop: 2, borderTop: '0.5px solid rgba(201,124,138,.12)' }}>
                    <span>Remaining</span>
                    <span>{fmt(Math.abs(budget - totalPaid))}{budget - totalPaid < 0 ? ' over' : ''}</span>
                  </div>
                )}
              </div>

              {/* PAYMENT DUE DATES */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '15px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 12 }}>Payment Due Dates</div>
                {upcomingPays.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#ccc', textAlign: 'center', padding: '8px 0' }}>No payments tracked yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 6 }}>
                    {upcomingPays.map(p => {
                      const badge = urgencyBadge(p.due_date, p.is_paid)
                      return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                          <button onClick={() => togglePaid(p)}
                            style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${p.is_paid ? '#1a7a4a' : '#C97C8A'}`, background: p.is_paid ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', padding: 0 }}>
                            {p.is_paid && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: p.is_paid ? '#aaa' : '#1a0a0f', textDecoration: p.is_paid ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.vendor_name}</div>
                            <div style={{ fontSize: 10, color: '#7a5c65' }}>{fmt(p.amount_due ?? 0)} · Due {new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                          </div>
                          <div style={{ fontSize: 9, fontWeight: 700, color: badge.color, background: badge.bg, padding: '2px 7px', borderRadius: 20, flexShrink: 0 }}>{badge.label}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <button onClick={() => setActiveTab('payments')}
                  style={{ width: '100%', marginTop: 6, padding: '8px 0', border: '0.5px dashed rgba(201,124,138,.3)', borderRadius: 10, background: 'transparent', color: '#C97C8A', fontSize: 12, cursor: 'pointer' }}>
                  + Add payment
                </button>
              </div>

              {/* OVERALL PROGRESS */}
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 16 }}>Overall Progress</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ position: 'relative' }}>
                    <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(201,124,138,.1)" strokeWidth="8"/>
                      <circle cx="55" cy="55" r="46" fill="none" stroke="url(#pgGrad)" strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 46}`}
                        strokeDashoffset={`${2 * Math.PI * 46 * (1 - progressPct / 100)}`}
                        strokeLinecap="round"/>
                      <defs>
                        <linearGradient id="pgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#C97C8A"/>
                          <stop offset="100%" stopColor="#C9A040"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="font-serif" style={{ fontSize: 24, color: '#C97C8A', fontWeight: 600, lineHeight: 1 }}>{progressPct}%</span>
                      <span style={{ fontSize: 9, color: '#bbb', marginTop: 2 }}>complete</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  <div style={{ background: 'rgba(201,124,138,.05)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1a0a0f' }}>{bookedCount}</div>
                    <div style={{ fontSize: 10, color: '#7a5c65', marginTop: 2 }}>Booked</div>
                  </div>
                  <div style={{ background: 'rgba(201,124,138,.05)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1a0a0f' }}>{checklist.length - bookedCount}</div>
                    <div style={{ fontSize: 10, color: '#7a5c65', marginTop: 2 }}>Still Needed</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a0a0f', marginBottom: 8 }}>
                    {progressPct === 100 ? '🎉 All done!' : progressPct >= 50 ? 'Great progress!' : 'Just getting started!'}
                  </div>
                  {nextUnbooked && !eventPassed && (
                    <Link href={`/vendors?category=${nextUnbooked.slug}`}
                      style={{ display: 'inline-block', fontSize: 12, color: '#fff', fontWeight: 600, textDecoration: 'none', background: 'linear-gradient(135deg,#C97C8A,#b56a78)', padding: '8px 16px', borderRadius: 20, boxShadow: '0 2px 10px rgba(201,124,138,.25)' }}>
                      Next: Book your {nextUnbooked.label} →
                    </Link>
                  )}
                  {countdown && nextUnbooked && (
                    <div style={{ fontSize: 11, color: '#7a5c65', marginTop: 8 }}>
                      {countdown.months > 0 ? `${countdown.months}mo ` : ''}{countdown.weeks > 0 ? `${countdown.weeks}wk ` : ''}{countdown.days}d remaining
                    </div>
                  )}
                  {eventPassed && <div style={{ fontSize: 12, color: '#5DCAA5', fontWeight: 600 }}>🎉 Leave reviews for your vendors!</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── COMPARE TAB ── */}
        {activeTab === 'compare' && (
          <div>
            <h2 className="font-serif" style={{ fontSize: 22, color: '#1a0a0f', marginBottom: 16 }}>Compare &amp; Save Vendors</h2>
            {VENDOR_CATEGORIES.map(cat => {
              const item       = checklist.find(cl => cl.item_name?.toLowerCase().includes(cat.label.toLowerCase()))
              const isBooked   = item?.is_booked || false
              const vendorName = item?.vendor_name_override || (item?.vendors as any)?.business_name || ''
              return (
                <div key={cat.id} style={{ background: '#fff', border: `0.5px solid ${isBooked ? 'rgba(26,122,74,.2)' : 'rgba(201,124,138,.18)'}`, borderRadius: 12, marginBottom: 8, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isBooked ? '#1a7a4a' : '#C97C8A'}`, background: isBooked ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {isBooked && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#1a0a0f', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.label}</span>
                  {vendorName && <span style={{ fontSize: 12, color: '#1a7a4a', fontWeight: 500, flexShrink: 0 }}>✓ {vendorName}</span>}
                  <Link href={`/vendors?category=${cat.slug}`}
                    style={{ fontSize: 12, color: '#C97C8A', textDecoration: 'none', padding: '6px 12px', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap' }}>
                    Browse →
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
            <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 3 }}>Total paid</div>
                  <div className="font-serif" style={{ fontSize: 34, color: '#1a0a0f' }}>{fmt(totalPaid)}</div>
                </div>
                {budget > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 3 }}>Budget</div>
                    <div className="font-serif" style={{ fontSize: 26, color: '#C97C8A' }}>{fmt(budget)}</div>
                  </div>
                )}
              </div>
              {budget > 0 && (
                <>
                  <div style={{ height: 7, borderRadius: 4, background: 'rgba(201,124,138,.1)', overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ height: '100%', borderRadius: 4, background: totalPaid > budget ? '#E24B4A' : '#C97C8A', width: `${Math.min((totalPaid / budget) * 100, 100)}%` }} />
                  </div>
                  <div style={{ fontSize: 13, color: totalPaid > budget ? '#E24B4A' : '#1a7a4a', fontWeight: 500, marginBottom: 14 }}>
                    {totalPaid > budget ? `⚠ ${fmt(totalPaid - budget)} over budget` : `✓ ${fmt(budget - totalPaid)} remaining`}
                  </div>
                </>
              )}
              {VENDOR_CATEGORIES.map(cat => {
                const item       = checklist.find(cl => cl.item_name?.toLowerCase().includes(cat.label.toLowerCase()))
                const vendorName = item?.vendor_name_override || (item?.vendors as any)?.business_name || ''
                return (
                  <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '0.5px solid rgba(201,124,138,.08)', fontSize: 13, gap: 8 }}>
                    <span style={{ color: '#1a0a0f', fontWeight: 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.label}</span>
                    <span style={{ color: vendorName ? '#7a5c65' : '#ccc', flexShrink: 0 }}>{vendorName || '—'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── PAYMENTS TAB ── */}
        {activeTab === 'payments' && (
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12 }}>
              <h2 className="font-serif" style={{ fontSize: 22, color: '#1a0a0f' }}>Payment Tracker</h2>
              <button onClick={() => setAddPayment(true)}
                style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                + Add Payment
              </button>
            </div>
            {addPayment && (
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.25)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 14 }}>
                  {[
                    { key: 'vendor', label: 'Vendor Name',  placeholder: 'Bell Tower', type: 'text'   },
                    { key: 'label',  label: 'Payment Type', placeholder: 'Deposit',    type: 'text'   },
                    { key: 'amount', label: 'Amount ($)',    placeholder: '1500',       type: 'number' },
                    { key: 'due',    label: 'Due Date',      placeholder: '',           type: 'date'   },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 11, color: '#7a5c65', fontWeight: 500, marginBottom: 4 }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder}
                        value={payForm[f.key as keyof typeof payForm]}
                        onChange={e => setPayForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addPaymentDue} style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setAddPayment(false)} style={{ background: 'transparent', color: '#7a5c65', border: '0.5px solid rgba(201,124,138,.3)', padding: '9px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {payments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#7a5c65', fontSize: 14 }}>No payments added yet.</div>
              ) : [...payments].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()).map(p => {
                const overdue = !p.is_paid && new Date(p.due_date) < new Date()
                return (
                  <div key={p.id} style={{ background: '#fff', border: `0.5px solid ${overdue ? 'rgba(226,75,74,.4)' : p.is_paid ? 'rgba(26,122,74,.2)' : 'rgba(201,124,138,.2)'}`, borderRadius: 12, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                    <button onClick={() => togglePaid(p)}
                      style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${p.is_paid ? '#1a7a4a' : overdue ? '#E24B4A' : '#C97C8A'}`, background: p.is_paid ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', padding: 0 }}>
                      {p.is_paid && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: p.is_paid ? '#aaa' : '#1a0a0f', textDecoration: p.is_paid ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.vendor_name}</div>
                      <div style={{ fontSize: 12, color: '#7a5c65', marginTop: 1 }}>{p.payment_label}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: p.is_paid ? '#1a7a4a' : overdue ? '#E24B4A' : '#1a0a0f' }}>{fmt(p.amount_due ?? 0)}</div>
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
              const isPast     = monthsLeft !== null && t.months > monthsLeft
              const isCurrent  = monthsLeft !== null && monthsLeft <= t.months && monthsLeft > (TIMELINE_GROUPS[i + 1]?.months ?? -1)
              return (
                <div key={i} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 13, height: 13, borderRadius: '50%', background: isCurrent ? '#C9A040' : isPast ? '#1a7a4a' : 'rgba(201,124,138,.3)', marginTop: 3, boxShadow: isCurrent ? '0 0 0 4px rgba(201,160,64,.15)' : 'none' }} />
                    {i < TIMELINE_GROUPS.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(201,124,138,.15)', minHeight: 24, marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingBottom: 24, minWidth: 0 }}>
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
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </>
  )
}

// ─── EDIT PROFILE MODAL ─────────────────────────────────────────
function EditProfileModal({
  profile, onSave, onClose, supabase,
}: {
  profile: MomProfile
  supabase: ReturnType<typeof createClient>
  onSave: (updates: Partial<MomProfile>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState({
    daughter: profile.daughter_name || '',
    date:     profile.event_date    || '',
    budget:   profile.total_budget  ? String(profile.total_budget) : '',
    guests:   profile.guest_count   ? String(profile.guest_count)  : '',
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await onSave({
      daughter_name: form.daughter,
      event_date:    form.date,
      total_budget:  form.budget ? Number(form.budget) : null,
      guest_count:   form.guests ? Number(form.guests) : null,
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,10,15,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: '28px 24px', maxWidth: 460, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1a0a0f', marginBottom: 20, fontFamily: 'Georgia, serif' }}>Edit Your Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 20 }}>
          {[
            { key: 'daughter', label: "Daughter's Name", placeholder: 'Sofia',  type: 'text'   },
            { key: 'date',     label: 'Event Date',       placeholder: '',       type: 'date'   },
            { key: 'budget',   label: 'Budget ($)',        placeholder: '15000', type: 'number' },
            { key: 'guests',   label: 'Guest Count',       placeholder: '150',   type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#7a5c65', marginBottom: 6 }}>{f.label}</label>
              <input type={f.type} placeholder={f.placeholder}
                value={form[f.key as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 10, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={save} disabled={saving}
            style={{ flex: 1, background: 'linear-gradient(135deg,#C97C8A,#b56a78)', color: '#fff', border: 'none', padding: '12px 0', borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={onClose}
            style={{ background: 'transparent', color: '#7a5c65', border: '0.5px solid rgba(201,124,138,.3)', padding: '12px 18px', borderRadius: 24, fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
