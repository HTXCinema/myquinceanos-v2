'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ClaimPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const supabase = createClient()

  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'verify' | 'auth' | 'done'>('verify')
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [alreadyClaimed, setAlreadyClaimed] = useState(false)

  useEffect(() => {
    async function loadVendor() {
      const { data } = await supabase
        .from('vendors')
        .select('id, business_name, tier, is_claimed, categories(name)')
        .eq('slug', slug)
        .single()

      if (!data) { router.push('/vendors'); return }
      if (data.is_claimed) setAlreadyClaimed(true)
      setVendor(data)
      setLoading(false)
    }
    if (slug) loadVendor()
  }, [slug])

  async function handleClaim() {
    setError('')
    setSubmitting(true)
    try {
      let userId = ''

      if (mode === 'signup') {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name, role: 'vendor' } }
        })
        if (authErr) throw authErr
        if (!authData.user) throw new Error('Signup failed — please try again')
        userId = authData.user.id
      } else {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (authErr) throw authErr
        if (!authData.user) throw new Error('Login failed — please try again')
        userId = authData.user.id

        // Check this user doesn't already own a different vendor
        const { data: existing } = await supabase
          .from('vendors')
          .select('id, business_name')
          .eq('owner_user_id', userId)
          .neq('id', vendor.id)
          .single()

        if (existing) {
          throw new Error(`Your account already owns "${existing.business_name}". Contact us if you need help.`)
        }
      }

      // Connect user to vendor listing
      const { error: updateErr } = await supabase
        .from('vendors')
        .update({
          owner_user_id: userId,
          is_claimed: true,
          email: form.email,
        })
        .eq('id', vendor.id)
        .eq('is_claimed', false) // safety: only claim if still unclaimed

      if (updateErr) throw updateErr

      setStep('done')
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    }
    setSubmitting(false)
  }

  if (loading) return (
    <><Nav />
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 14, color: '#7a5c65' }}>Loading...</div>
    </div><Footer /></>
  )

  if (step === 'done') return (
    <><Nav />
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#FDF6F0' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 64, height: 64, background: '#e8f7ef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
        </div>
        <h1 className="font-serif" style={{ fontSize: 34, color: '#1a0a0f', marginBottom: 10 }}>Listing claimed!</h1>
        <p style={{ fontSize: 14, color: '#7a5c65', lineHeight: 1.7, marginBottom: 28 }}>
          <strong>{vendor.business_name}</strong> is now connected to your account. You can now update your profile, photos, and pricing.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/vendor-dashboard" style={{ background: '#C97C8A', color: '#fff', padding: '13px 28px', borderRadius: 30, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Go to my dashboard →
          </Link>
          <Link href={`/vendors/${slug}`} style={{ background: 'transparent', color: '#7a5c65', border: '0.5px solid rgba(201,124,138,.3)', padding: '13px 28px', borderRadius: 30, fontSize: 14, textDecoration: 'none' }}>
            View my listing
          </Link>
        </div>
      </div>
    </div><Footer /></>
  )

  return (
    <><Nav />
    <div style={{ background: '#1a0a0f', padding: '40px 28px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 10 }}>
          Claim Your Listing
        </div>
        <h1 className="font-serif" style={{ fontSize: 36, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>
          {vendor.business_name}
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(250,216,233,.6)', marginBottom: 0 }}>
          {vendor.categories?.name} · {vendor.tier === 'free' ? 'Free listing' : vendor.tier}
        </p>
      </div>
    </div>

    <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 24px' }}>

      {alreadyClaimed ? (
        <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 16, padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <h2 className="font-serif" style={{ fontSize: 24, marginBottom: 8 }}>Already claimed</h2>
          <p style={{ fontSize: 14, color: '#7a5c65', marginBottom: 20 }}>
            This listing has already been claimed. If you own this business and need access, contact us at{' '}
            <a href="mailto:contact@myquinceanos.com" style={{ color: '#C97C8A' }}>contact@myquinceanos.com</a>
          </p>
          <Link href={`/vendors/${slug}`} style={{ color: '#C97C8A', fontSize: 14, fontWeight: 500 }}>← View listing</Link>
        </div>
      ) : (
        <>
          {/* What you get */}
          <div style={{ background: 'rgba(201,124,138,.06)', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#C97C8A', marginBottom: 10 }}>
              What you get after claiming
            </div>
            {[
              'Edit your business info, photos & pricing',
              'See leads from moms who view your profile',
              'Respond to reviews',
              'Upgrade to Featured or Premier anytime',
            ].map(f => (
              <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 7, fontSize: 13, color: '#4a3040', alignItems: 'flex-start' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C97C8A" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20,6 9,17 4,12"/></svg>
                {f}
              </div>
            ))}
          </div>

          {/* Auth toggle */}
          <div style={{ display: 'flex', background: 'rgba(201,124,138,.08)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {(['signup', 'login'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                background: mode === m ? '#fff' : 'transparent',
                color: mode === m ? '#1a0a0f' : '#7a5c65',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                transition: 'all 0.15s',
              }}>
                {m === 'signup' ? 'New account' : 'I have an account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 6 }}>Your name</label>
                <input type="text" placeholder="Jane Smith" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 6 }}>Business email</label>
              <input type="email" placeholder="hello@yourbusiness.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 6 }}>Password</label>
              <input type="password" placeholder="Min 8 characters" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(220,60,60,.08)', border: '0.5px solid rgba(220,60,60,.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#c0392b' }}>
              {error}
            </div>
          )}

          <button onClick={handleClaim} disabled={submitting || !form.email || !form.password}
            style={{ width: '100%', background: '#C97C8A', color: '#fff', border: 'none', padding: '14px 0', borderRadius: 30, fontSize: 15, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', opacity: submitting || !form.email || !form.password ? 0.6 : 1 }}>
            {submitting ? 'Claiming listing...' : `Claim ${vendor.business_name} →`}
          </button>

          <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
            By claiming this listing you confirm you are authorized to represent this business.
            <br />
            <Link href={`/vendors/${slug}`} style={{ color: '#C97C8A' }}>← Back to listing</Link>
          </p>
        </>
      )}
    </div>
    <Footer /></>
  )
}
