'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Nav from '@/components/layout/Nav'
import Link from 'next/link'
import type { MomProfile, ChecklistItem, VendorPayment } from '@/types'

export default function MomDashboard() {
  const [profile, setProfile] = useState<MomProfile | null>(null)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [payments, setPayments] = useState<VendorPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [addVendor, setAddVendor] = useState<string | null>(null)
  const [vendorInput, setVendorInput] = useState('')
  const [addPayment, setAddPayment] = useState(false)
  const [payForm, setPayForm] = useState({ vendor: '', label: 'Deposit', amount: '', due: '' })
  const [activeTab, setActiveTab] = useState<'checklist' | 'payments' | 'timeline'>('checklist')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    // Load mom profile
    const { data: momData } = await supabase
      .from('mom_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let activeProfile = momData
if (!momData) {
  const { data: newProfile } = await supabase
    .from('mom_profiles')
    .insert({ user_id: user.id })
    .select()
    .single()
  activeProfile = newProfile

  // Seed default checklist for new users
  const DEFAULT_ITEMS = [
    'Venue', 'Photographer', 'Videographer', 'DJ / Music',
    'Catering', 'Dress', 'Makeup & Hair', 'Choreography', 'Decor & Flowers'
  ]
  await supabase.from('mom_checklist').insert(
    DEFAULT_ITEMS.map((name, i) => ({
      mom_profile_id: newProfile!.id,
      item_name: name,
      sort_order: i,
      is_booked: false,
    }))
  )
}
}
setProfile(activeProfile)

const { data: checklistData } = await supabase
  .from('mom_checklist')
  .select('*, vendors(business_name, tier, avg_rating)')
  .eq('mom_profile_id', activeProfile?.id || '')
  .order('sort_order')
setChecklist(checklistData || [])

const { data: paymentData } = await supabase
  .from('vendor_payments')
  .select('*')
  .eq('mom_profile_id', activeProfile?.id || '')
  .order('due_date')
setPayments(paymentData || [])

setLoading(false)


  }

  async function toggleBooked(item: ChecklistItem) {
    const newBooked = !item.is_booked
    await supabase.from('mom_checklist').update({ is_booked: newBooked }).eq('id', item.id)
    setChecklist(list => list.map(i => i.id === item.id ? { ...i, is_booked: newBooked } : i))
  }

  async function setVendorOnItem(itemId: string, vendorName: string) {
    await supabase.from('mom_checklist').update({
      vendor_name_override: vendorName,
      is_booked: true
    }).eq('id', itemId)
    setChecklist(list => list.map(i => i.id === itemId ? { ...i, vendor_name_override: vendorName, is_booked: true } : i))
    setAddVendor(null)
    setVendorInput('')
  }

  async function togglePaid(payment: VendorPayment) {
    const newPaid = !payment.is_paid
    await supabase.from('vendor_payments').update({ is_paid: newPaid, paid_at: newPaid ? new Date().toISOString().split('T')[0] : null }).eq('id', payment.id)
    setPayments(list => list.map(p => p.id === payment.id ? { ...p, is_paid: newPaid } : p))
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

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const daysAway = profile?.event_date
    ? Math.ceil((new Date(profile.event_date).getTime() - Date.now()) / 86400000)
    : null

  const bookedCount = checklist.filter(c => c.is_booked).length
  const totalPaid = payments.filter(p => p.is_paid).reduce((a, p) => a + (p.amount_paid || 0), 0)
  const totalDue = payments.reduce((a, p) => a + (p.amount_due || 0), 0)
  const upcomingPayments = payments.filter(p => !p.is_paid).slice(0, 3)

  const TIMELINE = [
    { months: '12 months out', tasks: ['Set your budget', 'Choose a date', 'Book your venue'] },
    { months: '9 months out', tasks: ['Book photographer & videographer', 'Start dress shopping', 'Book DJ or band'] },
    { months: '6 months out', tasks: ['Book catering', 'Choose court of honor', 'Start choreography'] },
    { months: '3 months out', tasks: ['Send invitations', 'Book makeup & hair', 'Confirm all vendors'] },
    { months: '1 month out', tasks: ['Final dress fitting', 'Confirm guest count', 'Create seating plan'] },
    { months: 'Week of', tasks: ['Confirm vendor arrival times', 'Prepare payments', 'Relax and enjoy!'] },
  ]

  if (loading) return (
    <><Nav />
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 14, color: '#7a5c65' }}>Loading your dashboard...</div>
    </div></>
  )

  return (
    <>
      <Nav />
      {/* Header */}
      <div style={{ background: '#1a0a0f', padding: '28px 28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(250,216,233,.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Your Planning Hub</div>
              <h1 className="font-serif" style={{ fontSize: 30, color: '#fff', marginBottom: 4 }}>
                {profile?.daughter_name ? `${profile.daughter_name}'s Quinceañera` : 'My Quinceañera Planner'}
              </h1>
              {profile?.event_date && (
                <div style={{ fontSize: 13, color: 'rgba(250,216,233,.5)' }}>
                  {new Date(profile.event_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {daysAway !== null && (
                <div style={{ textAlign: 'center', background: 'rgba(201,160,64,.15)', border: '0.5px solid rgba(201,160,64,.3)', borderRadius: 14, padding: '12px 20px' }}>
                  <div className="font-serif" style={{ fontSize: 40, color: '#C9A040', lineHeight: 1 }}>{daysAway}</div>
                  <div style={{ fontSize: 11, color: 'rgba(250,216,233,.45)', marginTop: 2 }}>days to go</div>
                </div>
              )}
              <button onClick={signOut} style={{ background: 'transparent', color: 'rgba(250,216,233,.4)', border: '0.5px solid rgba(250,216,233,.15)', padding: '8px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer' }}>Sign Out</button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 20 }}>
            {[
              ['Budget', profile?.total_budget ? `$${Number(profile.total_budget).toLocaleString()}` : 'Not set'],
              ['Guests', profile?.guest_count ? String(profile.guest_count) : 'Not set'],
              ['Vendors Booked', `${bookedCount} / ${checklist.length}`],
              ['Payments', `$${totalPaid.toLocaleString()} / $${totalDue.toLocaleString()}`],
            ].map(([l, v]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: 'rgba(250,216,233,.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming payments alert */}
      {upcomingPayments.length > 0 && (
        <div style={{ background: 'rgba(201,160,64,.08)', borderBottom: '0.5px solid rgba(201,160,64,.2)', padding: '12px 28px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#C9A040', textTransform: 'uppercase', letterSpacing: 1 }}>Upcoming payments</span>
            {upcomingPayments.map(p => (
              <div key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(201,160,64,.12)', border: '0.5px solid rgba(201,160,64,.25)', borderRadius: 20, padding: '5px 12px' }}>
                <span style={{ fontSize: 12, color: '#1a0a0f', fontWeight: 500 }}>{p.vendor_name}</span>
                <span style={{ fontSize: 11, color: '#7a5c65' }}>{p.payment_label} · ${Number(p.amount_due).toLocaleString()}</span>
                <span style={{ fontSize: 11, color: new Date(p.due_date) < new Date() ? '#E24B4A' : '#7a5c65' }}>
                  {new Date(p.due_date) < new Date() ? '⚠ Overdue' : new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 28px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '0.5px solid rgba(201,124,138,.15)', paddingBottom: 0 }}>
          {(['checklist', 'payments', 'timeline'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: activeTab === tab ? 500 : 400, color: activeTab === tab ? '#C97C8A' : '#7a5c65', borderBottom: activeTab === tab ? '2px solid #C97C8A' : '2px solid transparent', marginBottom: -1, textTransform: 'capitalize' }}>
              {tab === 'checklist' ? 'Vendor Checklist' : tab === 'payments' ? 'Payment Tracker' : 'Timeline'}
            </button>
          ))}
        </div>

        {/* CHECKLIST TAB */}
        {activeTab === 'checklist' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {checklist.map(item => {
              const vendorName = item.vendor_name_override || (item.vendors as any)?.business_name || ''
              return (
                <div key={item.id} style={{ background: '#fff', border: `0.5px solid ${item.is_booked ? 'rgba(26,122,74,.25)' : 'rgba(201,124,138,.2)'}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button onClick={() => toggleBooked(item)}
                    style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${item.is_booked ? '#1a7a4a' : '#C97C8A'}`, background: item.is_booked ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                    {item.is_booked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 500, textDecoration: item.is_booked ? 'line-through' : 'none', color: item.is_booked ? '#aaa' : '#1a0a0f', transition: 'all 0.3s', display: 'block' }}>{item.item_name}</span>
                    {vendorName && <span style={{ fontSize: 12, color: '#C97C8A', fontWeight: 500 }}>{vendorName}</span>}
                  </div>
                  {!vendorName && addVendor !== item.id && (
                    <button onClick={() => setAddVendor(item.id)}
                      style={{ fontSize: 11, color: '#C97C8A', background: 'rgba(201,124,138,.1)', border: 'none', borderRadius: 20, padding: '3px 10px', cursor: 'pointer', flexShrink: 0 }}>
                      + Add vendor
                    </button>
                  )}
                  {addVendor === item.id && (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <input value={vendorInput} onChange={e => setVendorInput(e.target.value)} placeholder="Vendor name..." autoFocus
                        onKeyDown={e => e.key === 'Enter' && vendorInput && setVendorOnItem(item.id, vendorInput)}
                        style={{ fontSize: 12, border: '0.5px solid rgba(201,124,138,.4)', borderRadius: 8, padding: '4px 8px', outline: 'none', width: 130 }} />
                      <button onClick={() => vendorInput && setVendorOnItem(item.id, vendorInput)}
                        style={{ background: '#C97C8A', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>✓</button>
                      <button onClick={() => { setAddVendor(null); setVendorInput('') }}
                        style={{ background: 'transparent', color: '#999', border: 'none', cursor: 'pointer', fontSize: 13, padding: '0 4px' }}>✕</button>
                    </div>
                  )}
                  <Link href={`/vendors`} style={{ fontSize: 11, color: '#bbb', textDecoration: 'none', flexShrink: 0 }}>Browse</Link>
                </div>
              )
            })}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 14, color: '#7a5c65' }}>Total paid: </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1a7a4a' }}>${totalPaid.toLocaleString()}</span>
                <span style={{ fontSize: 14, color: '#7a5c65' }}> of </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1a0a0f' }}>${totalDue.toLocaleString()}</span>
              </div>
              <button onClick={() => setAddPayment(true)}
                style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                + Add Payment
              </button>
            </div>

            {addPayment && (
              <div style={{ background: '#FDF6F0', border: '0.5px solid rgba(201,124,138,.25)', borderRadius: 14, padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>Add Payment Due Date</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#7a5c65', fontWeight: 500, marginBottom: 5 }}>Vendor Name</label>
                    <input value={payForm.vendor} onChange={e => setPayForm(p => ({ ...p, vendor: e.target.value }))} placeholder="DreamLite Productions"
                      style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#7a5c65', fontWeight: 500, marginBottom: 5 }}>Payment Type</label>
                    <select value={payForm.label} onChange={e => setPayForm(p => ({ ...p, label: e.target.value }))}
                      style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none' }}>
                      <option>Deposit</option><option>Mid-payment</option><option>Final Balance</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#7a5c65', fontWeight: 500, marginBottom: 5 }}>Amount ($)</label>
                    <input type="number" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))} placeholder="500"
                      style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#7a5c65', fontWeight: 500, marginBottom: 5 }}>Due Date</label>
                    <input type="date" value={payForm.due} onChange={e => setPayForm(p => ({ ...p, due: e.target.value }))}
                      style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 8, padding: '8px 10px', fontSize: 13, outline: 'none' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={addPaymentDue} style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Save Payment</button>
                  <button onClick={() => setAddPayment(false)} style={{ background: 'transparent', color: '#7a5c65', border: '0.5px solid rgba(201,124,138,.3)', padding: '9px 20px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {payments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#7a5c65', fontSize: 14 }}>
                  No payments added yet. Click "+ Add Payment" to track a vendor payment due date.
                </div>
              )}
              {payments.map(p => {
                const overdue = !p.is_paid && new Date(p.due_date) < new Date()
                return (
                  <div key={p.id} style={{ background: '#fff', border: `0.5px solid ${overdue ? 'rgba(226,75,74,.4)' : p.is_paid ? 'rgba(26,122,74,.2)' : 'rgba(201,124,138,.2)'}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <button onClick={() => togglePaid(p)}
                      style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${p.is_paid ? '#1a7a4a' : overdue ? '#E24B4A' : '#C97C8A'}`, background: p.is_paid ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                      {p.is_paid && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: p.is_paid ? '#aaa' : '#1a0a0f', textDecoration: p.is_paid ? 'line-through' : 'none' }}>{p.vendor_name}</div>
                      <div style={{ fontSize: 12, color: '#7a5c65', marginTop: 1 }}>{p.payment_label}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: p.is_paid ? '#1a7a4a' : overdue ? '#E24B4A' : '#1a0a0f' }}>${Number(p.amount_due).toLocaleString()}</div>
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

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div style={{ maxWidth: 600 }}>
            {TIMELINE.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#C97C8A', marginTop: 3 }} />
                  {i < TIMELINE.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(201,124,138,.2)', minHeight: 24 }} />}
                </div>
                <div style={{ paddingBottom: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#C97C8A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.months}</div>
                  {t.tasks.map(task => (
                    <div key={task} style={{ fontSize: 13.5, color: '#555', marginBottom: 4, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: '#C97C8A', marginTop: 1 }}>·</span> {task}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
