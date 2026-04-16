'use client'
import { useState } from 'react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

const CATEGORIES = [
  'Photographers','Venues','Catering','DJs & Music','Videography',
  'Makeup & Hair','Dresses & Boutiques','Choreographers',
  'Cakes & Bakeries','Decor & Flowers','Limos & Transport','Entertainment',
]

const TIERS = [
  { key: 'free', name: 'Free', price: '$0', desc: 'forever', color: 'rgba(255,255,255,.08)', border: 'rgba(250,216,233,.12)',
    features: ['Basic listing in directory','Appears in category searches','Business name & description','Claimable anytime'] },
  { key: 'verified', name: 'Verified', price: '$59', desc: '/month', color: 'rgba(255,255,255,.08)', border: 'rgba(250,216,233,.2)', popular: false,
    features: ['Everything in Free','Verified vendor badge','Photos & gallery (up to 10)','Website & contact links','Priority in search results'] },
  { key: 'featured', name: 'Featured', price: '$129', desc: '/month', color: 'rgba(201,160,64,.12)', border: '#C9A040', popular: true,
    features: ['Everything in Verified','Homepage featured placement','MyQuince Perk field','Monthly performance report','Free booth at MYQ Expo','Founding Vendor badge (first in category)'] },
]

export default function GetListedPage() {
  const [step, setStep] = useState(1)
  const [tier, setTier] = useState('free')
  const [form, setForm] = useState({ name: '', category: '', phone: '', email: '', password: '' })
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.phone || !form.email) {
      alert('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      // Create auth user
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password || Math.random().toString(36).slice(-10),
        options: { data: { full_name: form.name, role: 'vendor' } }
      })
      if (authErr) throw authErr

      // Create vendor record
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const catMap: Record<string, string> = {
        'Photographers': 'photographers', 'Venues': 'venues', 'Catering': 'catering',
        'DJs & Music': 'djs-music', 'Videography': 'videography', 'Makeup & Hair': 'makeup-hair',
        'Dresses & Boutiques': 'dresses-boutiques', 'Choreographers': 'choreographers',
        'Cakes & Bakeries': 'cakes-bakeries', 'Decor & Flowers': 'decor-flowers',
        'Limos & Transport': 'limos-transport', 'Entertainment': 'entertainment',
      }

      const { data: catData } = await supabase.from('categories').select('id').eq('slug', catMap[form.category]).single()

      await supabase.from('vendors').insert({
        owner_user_id: authData.user?.id,
        business_name: form.name,
        slug: slug + '-' + Date.now(),
        category_id: catData?.id,
        phone: form.phone,
        email: form.email,
        tier,
        is_claimed: true,
      })

      setDone(true)
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <>
        <Nav />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#FDF6F0' }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{ width: 64, height: 64, background: '#e8f7ef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
            </div>
            <h1 className="font-serif" style={{ fontSize: 36, color: '#1a0a0f', marginBottom: 10 }}>You're listed!</h1>
            <p style={{ fontSize: 14, color: '#7a5c65', lineHeight: 1.6, marginBottom: 24 }}>
              <strong>{form.name}</strong> is now live on MyQuinceAños. Houston moms can find you right now.
              Check your email to confirm your account and access your vendor dashboard.
            </p>
            <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 14, padding: 20, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#C97C8A', marginBottom: 12 }}>What's next</div>
              {['Check your email and confirm your account','Add photos to get 3x more views','Set your starting price to attract the right clients','Upgrade to Featured to appear on the homepage'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13, color: '#7a5c65' }}>
                  <span style={{ color: '#C9A040', fontWeight: 600 }}>{i+1}.</span> {t}
                </div>
              ))}
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
      {/* Hero */}
      <div style={{ background: '#1a0a0f', padding: '48px 28px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 10 }}>Houston's Quinceañera Directory</div>
          <h1 className="font-serif" style={{ fontSize: 42, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
            Get in front of moms<br /><em style={{ color: '#FAD8E9' }}>actively planning right now</em>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(250,216,233,.6)', lineHeight: 1.7, marginBottom: 24 }}>
            127 Houston families use MyQuinceAños to find and compare vendors.<br />
            List your business free — no commissions, no pay-per-lead fees.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Free basic listing','Live within 24 hours','No commissions ever','Houston families only'].map(t => (
              <div key={t} style={{ background: 'rgba(255,255,255,.08)', border: '0.5px solid rgba(250,216,233,.15)', color: 'rgba(250,216,233,.75)', fontSize: 12, padding: '6px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A040" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 28px' }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
          {[1,2].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= s ? '#C97C8A' : 'rgba(201,124,138,.2)', color: step >= s ? '#fff' : '#C97C8A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{s}</div>
              <span style={{ fontSize: 13, color: step >= s ? '#1a0a0f' : '#7a5c65' }}>{s === 1 ? 'Your business' : 'Choose plan'}</span>
              {s < 2 && <div style={{ width: 32, height: 1, background: 'rgba(201,124,138,.2)' }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <h2 className="font-serif" style={{ fontSize: 28, marginBottom: 24, textAlign: 'center' }}>Tell us about your business</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'name', label: 'Business Name', placeholder: 'DreamLite Productions', type: 'text' },
                { key: 'phone', label: 'Phone Number', placeholder: '(713) 555-0100', type: 'tel' },
                { key: 'email', label: 'Email Address', placeholder: 'hello@yourbusiness.com', type: 'email' },
                { key: 'password', label: 'Create Password', placeholder: 'Min 8 characters', type: 'password' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', background: '#fff' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 6 }}>Category</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', background: '#fff' }}>
                  <option value="">Select your category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={() => form.name && form.category && form.phone && form.email ? setStep(2) : alert('Please fill in all fields')}
                style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '14px 0', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-serif" style={{ fontSize: 28, marginBottom: 8, textAlign: 'center' }}>Choose your listing plan</h2>
            <p style={{ textAlign: 'center', fontSize: 14, color: '#7a5c65', marginBottom: 32 }}>Start free. Upgrade anytime. No contracts, cancel anytime.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
              {TIERS.map(t => (
                <div key={t.key} onClick={() => setTier(t.key)}
                  style={{ background: tier === t.key ? t.color : 'rgba(255,255,255,.03)', border: `${tier === t.key ? '2px' : '0.5px'} solid ${tier === t.key ? t.border : 'rgba(201,124,138,.15)'}`, borderRadius: 16, padding: 24, cursor: 'pointer', position: 'relative' }}>
                  {t.popular && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#C97C8A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>Most Popular</div>}
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#7a5c65', marginBottom: 6 }}>{t.name}</div>
                  <div>
                    <span className="font-serif" style={{ fontSize: 36, fontWeight: 600, color: '#1a0a0f' }}>{t.price}</span>
                    <span style={{ fontSize: 13, color: '#7a5c65' }}>{t.desc}</span>
                  </div>
                  <div style={{ height: 0.5, background: 'rgba(201,124,138,.15)', margin: '16px 0' }} />
                  {t.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: '#555' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C97C8A" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20,6 9,17 4,12"/></svg>
                      {f}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setStep(1)}
                style={{ background: 'transparent', color: '#7a5c65', border: '0.5px solid rgba(201,124,138,.3)', padding: '13px 28px', borderRadius: 30, fontSize: 14, cursor: 'pointer' }}>
                ← Back
              </button>
              <button onClick={handleSubmit} disabled={loading}
                style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '13px 40px', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating your listing...' : `Claim my ${TIERS.find(t2=>t2.key===tier)?.name} listing →`}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
