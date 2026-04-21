'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async () => {
    setError('')
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

          {/* Logo + heading */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
              <span className="font-serif" style={{ fontSize: 22, color: '#FAD8E9', fontWeight: 500 }}>My</span>
              <span className="font-serif" style={{ fontSize: 22, color: '#C9A040', fontWeight: 500 }}>Quince</span>
              <span className="font-serif" style={{ fontSize: 22, color: '#FAD8E9', fontWeight: 500 }}>Años</span>
            </div>
            <h1 className="font-serif" style={{ fontSize: 34, fontWeight: 600, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>Create your free account</h1>
            <p style={{ fontSize: 14, color: 'rgba(250,216,233,.55)', lineHeight: 1.6 }}>Save vendors, track payments, plan your daughter's perfect quinceañera</p>
          </div>

          {/* Benefits row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 24 }}>
            {[
              ['📋', 'Planning checklist'],
              ['💰', 'Budget tracker'],
              ['⭐', 'Verified reviews'],
            ].map(([icon, label]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(250,216,233,.08)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 11, color: 'rgba(250,216,233,.5)', lineHeight: 1.3 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(250,216,233,.12)', borderRadius: 20, padding: 32 }}>
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

            <div style={{ height: 0.5, background: 'rgba(250,216,233,.1)', margin: '24px 0' }} />

            <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(250,216,233,.5)', margin: 0 }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: '#C97C8A', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>

          {/* Vendor link */}
          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(250,216,233,.3)', marginTop: 16 }}>
            Are you a vendor?{' '}
            <Link href="/get-listed" style={{ color: 'rgba(201,160,64,.6)', textDecoration: 'none' }}>Get listed here →</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  )
}
