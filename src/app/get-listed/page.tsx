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
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    desc: 'forever',
    color: '#fff',
    border: 'rgba(201,124,138,.2)',
    squareUrl: null,
    features: [
      'Basic listing in directory',
      'Appears in category searches',
      'Business name & phone number',
      '1 cover photo',
      'Claimable anytime',
    ],
  },
  {
    key: 'verified',
    name: 'Verified',
    price: '$49',
    desc: '/month',
    color: '#fff',
    border: 'rgba(201,124,138,.4)',
    squareUrl: 'https://square.link/u/TedIpvsu',
    popular: false,
    features: [
      'Everything in Free',
      'Verified vendor badge',
      'Photo gallery (up to 10 photos)',
      'Website & contact links',
      'Full business description',
      'Priority in search results',
      'Direct contact form from moms',
    ],
  },
  {
    key: 'featured',
    name: 'Featured',
    price: '$129',
    desc: '/month',
    color: 'rgba(201,160,64,.06)',
    border: '#C9A040',
    squareUrl: 'https://square.link/u/9tAi4sdT',
    popular: true,
    features: [
      'Everything in Verified',
      'Homepage featured placement',
      'Video embed on profile',
      'MyQuince Perk field',
      'Monthly performance report',
      'Free booth at MYQ Expo',
      'Social media promotion (FB + IG)',
      'Founding Vendor badge (1st in category)',
    ],
  },
]

export default function GetListedPage() {
  const [step, setStep] = useState(1)
  const [tier, setTier] = useState('free')
  const [form, setForm] = useState({ name: '', category: '', phone: '', email: '', password: '' })
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const selectedTier = TIERS.find(t => t.key === tier)!

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.phone || !form.email) {
      alert('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password || Math.random().toString(36).slice(-10),
        options: { data: { full_name: form.name, role: 'vendor' } }
      })
      if (authErr) throw authErr

      const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now()
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
        slug,
        category_id: catData?.id,
        phone: form.phone,
        email: form.email,
        tier: 'free', // always starts free — Square upgrades handled separately
        is_claimed: true,
        is_active: true,
      })

      if (selectedTier.squareUrl) {
        // Redirect to Square with business name pre-filled in note
        const url = `${selectedTier.squareUrl}?note=${encodeURIComponent(form.name + ' - ' + form.email)}`
        window.location.href = url
      } else {
        setDone(true)
      }
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
              Check your email to confirm your account.
            </p>
            <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 14, padding: 20, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#C97C8A', marginBottom: 12 }}>What's next</div>
              {[
                'Check your email and confirm your account',
                'Add photos to get 3x more profile views',
                'Set your starting price to attract the right clients',
                'Upgrade to Featured to appear on the homepage',
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13, color: '#7a5c65' }}>
                  <span style={{ color: '#C9A040', fontWeight: 600 }}>{i + 1}.</span> {t}
                </div>
              ))}
            </div>
            <a href="/vendors" style={{ display: 'inline-block', background: '#C97C8A', color: '#fff', padding: '13px 32px', borderRadius: 30, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              View your listing →
            </a>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Nav />

      {/* HERO */}
      <div style={{ background: '#1a0a0f', padding: '48px 28px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 10 }}>Houston's Quinceañera Directory</div>
          <h1 className="font-serif" style={{ fontSize: 42, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>
            Get in front of moms<br /><em style={{ color: '#FAD8E9' }}>actively planning right now</em>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(250,216,233,.6)', lineHeight: 1.7, marginBottom: 24 }}>
            123+ Houston families use MyQuinceAños to find and compare vendors.<br />
            List your business free — no commissions, no pay-per-lead fees.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Free basic listing', 'Live within 24 hours', 'No commissions ever', 'Houston families only'].map(t => (
              <div key={t} style={{ background: 'rgba(255,255,255,.08)', border: '0.5px solid rgba(250,216,233,.15)', color: 'rgba(250,216,233,.75)', fontSize: 12, padding: '6px 14px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A040" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 28px' }}>

        {/* STEP INDICATOR */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 40 }}>
          {[{ n: 1, label: 'Your business' }, { n: 2, label: 'Choose plan' }].map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= s.n ? '#C97C8A' : 'rgba(201,124,138,.2)', color: step >= s.n ? '#fff' : '#C97C8A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>{s.n}</div>
              <span style={{ fontSize: 13, color: step >= s.n ? '#1a0a0f' : '#7a5c65' }}>{s.label}</span>
              {i < 1 && <div style={{ width: 32, height: 1, background: 'rgba(201,124,138,.2)', margin: '0 4px' }} />}
            </div>
          ))}
        </div>

        {/* STEP 1 — BUSINESS INFO */}
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
                    style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
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

        {/* STEP 2 — CHOOSE PLAN */}
        {step === 2 && (
          <div>
            <h2 className="font-serif" style={{ fontSize: 28, marginBottom: 8, textAlign: 'center' }}>Choose your listing plan</h2>
            <p style={{ textAlign: 'center', fontSize: 14, color: '#7a5c65', marginBottom: 32 }}>Start free. Upgrade anytime. No contracts, cancel anytime.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
              {TIERS.map(t => (
                <div key={t.key} onClick={() => setTier(t.key)}
                  style={{ background: tier === t.key ? t.color : '#fff', border: `${tier === t.key ? '2px' : '0.5px'} solid ${tier === t.key ? t.border : 'rgba(201,124,138,.15)'}`, borderRadius: 16, padding: 24, cursor: 'pointer', position: 'relative', transition: 'all 0.15s' }}>
                  {t.popular && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#C97C8A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 14px', borderRadius: 20, whiteSpace: 'nowrap' }}>⭐ Most Popular</div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: t.key === 'featured' ? '#C9A040' : '#7a5c65', marginBottom: 6 }}>{t.name}</div>
                  <div style={{ marginBottom: 4 }}>
                    <span className="font-serif" style={{ fontSize: 36, fontWeight: 600, color: '#1a0a0f' }}>{t.price}</span>
                    <span style={{ fontSize: 13, color: '#7a5c65' }}>{t.desc}</span>
                  </div>
                  {t.squareUrl && (
                    <div style={{ fontSize: 11, color: '#1a7a4a', fontWeight: 500, marginBottom: 8 }}>✓ Secure payment via Square</div>
                  )}
                  <div style={{ height: 0.5, background: 'rgba(201,124,138,.15)', margin: '14px 0' }} />
                  {t.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 12.5, color: '#555', alignItems: 'flex-start' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C97C8A" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20,6 9,17 4,12"/></svg>
                      {f}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* WHAT HAPPENS NEXT for paid tiers */}
            {selectedTier.squareUrl && (
              <div style={{ background: 'rgba(201,160,64,.08)', border: '0.5px solid rgba(201,160,64,.3)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A040" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p style={{ fontSize: 13, color: '#7a5c65', margin: 0 }}>
                  After submitting, you'll be redirected to Square to complete your <strong>{selectedTier.name}</strong> subscription at <strong>{selectedTier.price}/mo</strong>. Your listing goes live immediately — we'll manually upgrade your tier within 24 hours of payment confirmation.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setStep(1)}
                style={{ background: 'transparent', color: '#7a5c65', border: '0.5px solid rgba(201,124,138,.3)', padding: '13px 28px', borderRadius: 30, fontSize: 14, cursor: 'pointer' }}>
                ← Back
              </button>
              <button onClick={handleSubmit} disabled={loading}
                style={{ background: selectedTier.key === 'featured' ? '#C9A040' : '#C97C8A', color: selectedTier.key === 'featured' ? '#1a0a0f' : '#fff', border: 'none', padding: '13px 40px', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Setting up your listing...' : selectedTier.squareUrl ? `Claim listing + Pay ${selectedTier.price}/mo →` : 'Claim my free listing →'}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
