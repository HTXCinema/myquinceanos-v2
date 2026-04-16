'use client'
import { useState } from 'react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const DEFAULT_CHECKLIST = [
  { id: '1', item: 'Venue', vendor: 'Bell Tower on 34th', booked: true, category: 'venues' },
  { id: '2', item: 'Photographer', vendor: 'DreamLite Productions', booked: true, category: 'photographers' },
  { id: '3', item: 'Catering', vendor: '', booked: false, category: 'catering' },
  { id: '4', item: 'DJ / Music', vendor: '', booked: false, category: 'djs-music' },
  { id: '5', item: 'Videography', vendor: '', booked: false, category: 'videography' },
  { id: '6', item: 'Makeup & Hair', vendor: '', booked: false, category: 'makeup-hair' },
  { id: '7', item: 'Dress & Boutique', vendor: '', booked: false, category: 'dresses-boutiques' },
  { id: '8', item: 'Choreographer', vendor: '', booked: false, category: 'choreographers' },
  { id: '9', item: 'Cake', vendor: '', booked: false, category: 'cakes-bakeries' },
  { id: '10', item: 'Decor & Flowers', vendor: '', booked: false, category: 'decor-flowers' },
  { id: '11', item: 'Limo / Transport', vendor: '', booked: false, category: 'limos-transport' },
  { id: '12', item: 'Entertainment', vendor: '', booked: false, category: 'entertainment' },
]

const DEFAULT_PAYMENTS = [
  { id: '1', vendor: 'Bell Tower on 34th', label: 'Deposit', amount: 1000, due: '2026-02-01', paid: true },
  { id: '2', vendor: 'Bell Tower on 34th', label: 'Final Payment', amount: 4500, due: '2026-10-15', paid: false },
  { id: '3', vendor: 'DreamLite Productions', label: 'Deposit', amount: 500, due: '2026-03-15', paid: true },
  { id: '4', vendor: 'DreamLite Productions', label: 'Final Balance', amount: 2300, due: '2026-11-01', paid: false },
]

const TIMELINE = [
  { months: '12 months out', tasks: ['Set your budget', 'Choose a date', 'Book your venue'] },
  { months: '9 months out', tasks: ['Book photographer & videographer', 'Start dress shopping', 'Book DJ or band'] },
  { months: '6 months out', tasks: ['Book catering', 'Choose court of honor', 'Start choreography'] },
  { months: '3 months out', tasks: ['Send invitations', 'Book makeup & hair', 'Confirm all vendors'] },
  { months: '1 month out', tasks: ['Final dress fitting', 'Confirm guest count', 'Create seating plan'] },
  { months: 'Week of', tasks: ['Confirm vendor arrival times', 'Prepare payments', 'Relax and enjoy!'] },
]

export default function PlanningPage() {
  const [step, setStep] = useState(0) // 0=form, 1=dashboard
  const [form, setForm] = useState({ daughter: '', date: '', budget: '', guests: '' })
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST)
  const [payments, setPayments] = useState(DEFAULT_PAYMENTS)
  const [addVendor, setAddVendor] = useState<string | null>(null)
  const [vendorInput, setVendorInput] = useState('')

  const eventDate = form.date ? new Date(form.date) : null
  const daysAway = eventDate ? Math.ceil((eventDate.getTime() - Date.now()) / 86400000) : null

  const bookedCount = checklist.filter(c => c.booked).length
  const totalPaid = payments.filter(p => p.paid).reduce((a, p) => a + p.amount, 0)
  const totalDue = payments.reduce((a, p) => a + p.amount, 0)

  const toggleBooked = (id: string) => {
    setChecklist(list => list.map(i => i.id === id ? { ...i, booked: !i.booked } : i))
  }

  const setVendor = (id: string, vendor: string) => {
    setChecklist(list => list.map(i => i.id === id ? { ...i, vendor, booked: true } : i))
    setAddVendor(null)
    setVendorInput('')
  }

  const togglePaid = (id: string) => {
    setPayments(list => list.map(p => p.id === id ? { ...p, paid: !p.paid } : p))
  }

  const isOverdue = (due: string, paid: boolean) => !paid && new Date(due) < new Date()

  if (step === 0) {
    return (
      <>
        <Nav />
        <div style={{ minHeight: '80vh', background: '#FDF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 560, width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 10 }}>Free Planning Hub</div>
              <h1 className="font-serif" style={{ fontSize: 38, fontWeight: 600, color: '#1a0a0f', marginBottom: 10, lineHeight: 1.2 }}>Your Free Quince Planning Hub</h1>
              <p style={{ fontSize: 14, color: '#7a5c65', lineHeight: 1.6 }}>Enter your daughter's name, event date and budget to get your personalized planning checklist, budget breakdown and vendor timeline — all in one place and completely free.</p>
            </div>

            <div style={{ background: '#1a0a0f', borderRadius: 16, padding: 32 }}>
              <h2 className="font-serif" style={{ fontSize: 20, color: '#fff', marginBottom: 20 }}>Set up your quince planner</h2>
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
                      style={{ width: '100%', background: 'rgba(255,255,255,.07)', border: '0.5px solid rgba(250,216,233,.15)', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none' }} />
                  </div>
                ))}
              </div>
              <button onClick={() => form.daughter && form.date ? setStep(1) : alert('Please enter your daughter\'s name and event date')}
                style={{ width: '100%', background: '#C97C8A', color: '#fff', border: 'none', padding: '13px 0', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Start my planner →
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(250,216,233,.35)', marginTop: 12 }}>No account needed to start planning</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Nav />
      <div style={{ background: '#1a0a0f', padding: '32px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(250,216,233,.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Planning Hub</div>
            <h1 className="font-serif" style={{ fontSize: 32, color: '#fff' }}>{form.daughter}'s Quinceañera</h1>
          </div>
          {daysAway !== null && (
            <div style={{ textAlign: 'center', background: 'rgba(201,160,64,.15)', border: '0.5px solid rgba(201,160,64,.3)', borderRadius: 14, padding: '16px 24px' }}>
              <div className="font-serif" style={{ fontSize: 48, color: '#C9A040', lineHeight: 1 }}>{daysAway}</div>
              <div style={{ fontSize: 12, color: 'rgba(250,216,233,.5)', marginTop: 2 }}>days until the big day</div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ maxWidth: 1100, margin: '20px auto 0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            ['Budget', form.budget ? `$${Number(form.budget).toLocaleString()}` : '—'],
            ['Guests', form.guests || '—'],
            ['Booked', `${bookedCount}/${checklist.length}`],
            ['Paid', `$${totalPaid.toLocaleString()} / $${totalDue.toLocaleString()}`],
          ].map(([l,v]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'rgba(250,216,233,.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* CHECKLIST */}
        <div>
          <h2 className="font-serif" style={{ fontSize: 24, color: '#1a0a0f', marginBottom: 16 }}>Vendor Checklist</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {checklist.map(item => (
              <div key={item.id} style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => toggleBooked(item.id)}
                  style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${item.booked ? '#1a7a4a' : '#C97C8A'}`, background: item.booked ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                  {item.booked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                </button>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, textDecoration: item.booked ? 'line-through' : 'none', color: item.booked ? '#aaa' : '#1a0a0f', transition: 'all 0.3s' }}>{item.item}</span>
                  {item.vendor && (
                    <span style={{ fontSize: 12, color: '#C97C8A', fontWeight: 500, marginLeft: 8 }}>{item.vendor}</span>
                  )}
                </div>
                {!item.vendor && addVendor !== item.id && (
                  <button onClick={() => setAddVendor(item.id)}
                    style={{ fontSize: 11, color: '#C97C8A', background: 'rgba(201,124,138,.1)', border: 'none', borderRadius: 20, padding: '3px 10px', cursor: 'pointer' }}>
                    + Add vendor
                  </button>
                )}
                {addVendor === item.id && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input value={vendorInput} onChange={e => setVendorInput(e.target.value)}
                      placeholder="Vendor name..." autoFocus
                      onKeyDown={e => e.key === 'Enter' && vendorInput && setVendor(item.id, vendorInput)}
                      style={{ fontSize: 12, border: '0.5px solid rgba(201,124,138,.4)', borderRadius: 8, padding: '4px 8px', outline: 'none', width: 140 }} />
                    <button onClick={() => vendorInput && setVendor(item.id, vendorInput)}
                      style={{ background: '#C97C8A', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>Save</button>
                    <button onClick={() => { setAddVendor(null); setVendorInput('') }}
                      style={{ background: 'transparent', color: '#999', border: 'none', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </div>
                )}
                <Link href={`/vendors?category=${item.category}`}
                  style={{ fontSize: 11, color: '#7a5c65', textDecoration: 'none', flexShrink: 0 }}>Browse →</Link>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* PAYMENT TRACKER */}
          <div>
            <h2 className="font-serif" style={{ fontSize: 24, color: '#1a0a0f', marginBottom: 16 }}>Payment Due Dates</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {payments.sort((a,b) => new Date(a.due).getTime() - new Date(b.due).getTime()).map(p => {
                const overdue = isOverdue(p.due, p.paid)
                return (
                  <div key={p.id} style={{ background: '#fff', border: `0.5px solid ${overdue ? 'rgba(226,75,74,.4)' : p.paid ? 'rgba(26,122,74,.2)' : 'rgba(201,124,138,.2)'}`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => togglePaid(p.id)}
                      style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${p.paid ? '#1a7a4a' : overdue ? '#E24B4A' : '#C97C8A'}`, background: p.paid ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                      {p.paid && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: p.paid ? '#aaa' : '#1a0a0f', textDecoration: p.paid ? 'line-through' : 'none' }}>{p.vendor}</div>
                      <div style={{ fontSize: 11, color: '#7a5c65', marginTop: 1 }}>{p.label}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: p.paid ? '#1a7a4a' : overdue ? '#E24B4A' : '#1a0a0f' }}>${p.amount.toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: overdue ? '#E24B4A' : '#7a5c65', marginTop: 1 }}>
                        {overdue ? '⚠ Overdue · ' : ''}{new Date(p.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* TIMELINE */}
          <div>
            <h2 className="font-serif" style={{ fontSize: 24, color: '#1a0a0f', marginBottom: 16 }}>Planning Timeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {TIMELINE.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#C97C8A', flexShrink: 0, marginTop: 4 }} />
                    {i < TIMELINE.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(201,124,138,.2)', minHeight: 20 }} />}
                  </div>
                  <div style={{ paddingBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#C97C8A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{t.months}</div>
                    {t.tasks.map(task => (
                      <div key={task} style={{ fontSize: 13, color: '#7a5c65', marginBottom: 2 }}>· {task}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
