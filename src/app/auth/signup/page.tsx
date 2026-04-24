'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export default function SignupPage() {
  const [accountType, setAccountType] = useState<'mom' | 'vendor'>('mom')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async () => {
    setError('')
    if (accountType === 'vendor') {
      router.push('/get-listed')
      return
    }
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.name, role: 'mom' } }
    })
    if (err) { setError(err.message); setLoading(false); return }
    setDone(true)
  }

  if (done) {
    return (
      <>
        <Nav />
        <div style={{ minHeight: '90vh', background: '#1a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(26,122,74,.2)', border: '0.5px solid rgba(93,202,165,.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5DCAA5" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
            </div>
            <h1 className="font-serif" style={{ fontSize: 34, color: '#fff', marginBottom: 10 }}>Check your email!</h1>
            <p style={{ fontSize: 14, color: 'rgba(250,216,233,.6)', lineHeight: 1.7, marginBottom: 28 }}>
              We sent a confirmation link to <strong style={{ color: '#FAD8E9' }}>{form.email}</strong>.<br />
              Click it to activate your account, then come back to start planning.
            </p>
            <button onClick={() => router.push('/planning')}
              style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '14px 40px', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Go to my planner →
            </button>
            <p style={{ fontSize: 12, color: 'rgba(250,216,233,.3)', marginTop: 16 }}>Didn't get the email? Check your spam folder.</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Nav />
      <div style={{ minHeight: '90vh', background: '#1a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 440 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
              <span className="font-serif" style={{ fontSize: 22, color: '#FAD8E9', fontWeight: 500 }}>My</span>
              <span className="font-serif" style={{ fontSize: 22, color: '#C9A040', fontWeight: 500 }}>Quince</span>
              <span className="font-serif" style={{ fontSize: 22, color: '#FAD8E9', fontWeight: 500 }}>Años</span>
            </div>
            <h1 className="font-serif" style={{ fontSize: 34, fontWeight: 600, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>Create your free account</h1>
            <p style={{ fontSize: 14, color: 'rgba(250,216,233,.55)', lineHeight: 1.6 }}>
              {accountType === 'mom' ? "Save vendors, track payments, plan your daughter's perfect quinceañera" : 'Get discovered by Houston families actively planning right now'}
            </p>
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,.06)', borderRadius: 14, padding: 4, marginBottom: 24, border: '0.5px solid rgba(250,216,233,.1)' }}>
            {([
              { key: 'mom', icon: '👩', label: "I'm a mom planning a quinceañera" },
              { key: 'vendor', icon: '💼', label: "I'm a vendor / business owner" },
            ] as const).map(t => (
              <button key={t.key} onClick={() => { setAccountType(t.key); setError('') }}
                style={{
                  flex: 1, padding: '11px 8px', borderRadius: 11, border: 'none', cursor: 'pointer',
                  background: accountType === t.key
                    ? t.key === 'vendor' ? 'rgba(201,160,64,.2)' : '#C97C8A'
                    : 'transparent',
                  color: accountType === t.key ? '#fff' : 'rgba(250,216,233,.45)',
                  fontSize: 12, fontWeight: 500, lineHeight: 1.3, transition: 'all 0.15s',
                  boxShadow: accountType === t.key ? '0 2px 8px rgba(0,0,0,.2)' : 'none',
                }}>
                <div style={{ fontSize: 16, marginBottom: 3 }}>{t.icon}</div>
                {t.label}
              </button>
            ))}
          </div>

          {/* Benefits */}
          {accountType === 'mom' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 24 }}>
              {[['📋', 'Planning checklist'], ['💰', 'Budget tracker'], ['⭐', 'Verified reviews']].map(([icon, label]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(250,216,233,.08)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 11, color: 'rgba(250,216,233,.5)', lineHeight: 1.3 }}>{label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 24 }}>
              {[['👁', '123+ families'], ['💵', 'No commissions'], ['📍', 'Houston only']].map(([icon, label]) => (
                <div key={label} style={{ background: 'rgba(201,160,64,.06)', border: '0.5px solid rgba(201,160,64,.15)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                  <div style={{ fontSize: 11, color: 'rgba(201,160,64,.7)', lineHeight: 1.3 }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,.04)', border: `0.5px solid ${accountType === 'vendor' ? 'rgba(201,160,64,.2)' : 'rgba(250,216,233,.12)'}`, borderRadius: 20, padding: 32 }}>

            {accountType === 'vendor' ? (
              /* Vendor path — redirect to get-listed */
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>💼</div>
                <h2 className="font-serif" style={{ fontSize: 24, color: '#fff', marginBottom: 10 }}>List your business</h2>
                <p style={{ fontSize: 13, color: 'rgba(250,216,233,.55)', lineHeight: 1.7, marginBottom: 24 }}>
                  Create your vendor profile, choose your plan, and start getting discovered by Houston families planning quinceañeras right now.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {['Free basic listing — live in 24 hours', 'Featured placement for $49/mo', 'Premier + homepage spotlight for $129/mo'].map(f => (
                    <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'rgba(250,216,233,.6)' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A040" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                      {f}
                    </div>
                  ))}
                </div>
                <button onClick={handleSignup}
                  style={{ background: 'linear-gradient(135deg,#C9A040,#e8c96a)', color: '#1a0a0f', border: 'none', padding: '14px 0', borderRadius: 30, fontSize: 14, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                  Set up my vendor profile →
                </button>
                <p style={{ fontSize: 11, color: 'rgba(250,216,233,.3)', marginTop: 12 }}>
                  Already listed?{' '}
                  <Link href="/vendors" style={{ color: 'rgba(201,160,64,.6)', textDecoration: 'none' }}>Find and claim your listing →</Link>
                </p>
              </div>
            ) : (
              /* Mom path — regular signup */
              <>
                {error && (
                  <div style={{ background: 'rgba(226,75,74,.1)', border: '0.5px solid rgba(226,75,74,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#f08080', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { key: 'name', label: 'Your Name', placeholder: 'Maria Rodriguez', type: 'text' },
                    { key: 'email', label: 'Email Address', placeholder: 'maria@email.com', type: 'email' },
                    { key: 'password', label: 'Password', placeholder: 'Min 8 characters', type: 'password' },
                    { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat password', type: 'password' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 8 }}>{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder}
                        value={form[f.key as keyof typeof form]}
                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleSignup()}
                        style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '0.5px solid rgba(250,216,233,.15)', borderRadius: 12, padding: '13px 16px', fontSize: 14, outline: 'none', color: '#fff', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <button onClick={handleSignup} disabled={loading}
                    style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '14px 0', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4, width: '100%' }}>
                    {loading ? 'Creating account...' : 'Create Free Account →'}
                  </button>
                  <p style={{ fontSize: 11, color: 'rgba(250,216,233,.3)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                    By creating an account you agree to our terms. Free forever — no credit card required.
                  </p>
                </div>
              </>
            )}

            <div style={{ height: 0.5, background: 'rgba(250,216,233,.1)', margin: '24px 0' }} />

            <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(250,216,233,.5)', margin: 0 }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: '#C97C8A', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
