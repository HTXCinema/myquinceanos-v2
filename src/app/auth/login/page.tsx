'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async () => {
    setError('')
    if (!form.email || !form.password) { setError('Please enter your email and password'); return }
    setLoading(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (err) { setError('Invalid email or password. Please try again.'); setLoading(false); return }
    const role = data.user?.user_metadata?.role
    if (role === 'vendor') router.push('/vendor-dashboard')
    else router.push('/planning')
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
            <h1 className="font-serif" style={{ fontSize: 34, fontWeight: 600, color: '#fff', marginBottom: 8, lineHeight: 1.2 }}>Welcome back</h1>
            <p style={{ fontSize: 14, color: 'rgba(250,216,233,.55)', lineHeight: 1.6 }}>Sign in to your planning hub and pick up right where you left off</p>
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
                { key: 'email', label: 'Email Address', placeholder: 'maria@email.com', type: 'email' },
                { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 8 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '0.5px solid rgba(250,216,233,.15)', borderRadius: 12, padding: '13px 16px', fontSize: 14, outline: 'none', color: '#fff', boxSizing: 'border-box' }} />
                </div>
              ))}

              <div style={{ textAlign: 'right', marginTop: -8 }}>
                <Link href="/auth/forgot-password" style={{ fontSize: 12, color: 'rgba(250,216,233,.45)', textDecoration: 'none' }}>Forgot password?</Link>
              </div>

              <button onClick={handleLogin} disabled={loading}
                style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '14px 0', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4, width: '100%' }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </div>

            <div style={{ height: 0.5, background: 'rgba(250,216,233,.1)', margin: '24px 0' }} />

            <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(250,216,233,.5)', margin: 0 }}>
              Don't have an account?{' '}
              <Link href="/auth/signup" style={{ color: '#C97C8A', fontWeight: 600, textDecoration: 'none' }}>Create free account</Link>
            </p>
          </div>

          {/* Trust line */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24, flexWrap: 'wrap' }}>
            {['Free forever', 'No credit card', 'Houston moms only'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'rgba(250,216,233,.35)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C9A040" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                {t}
              </div>
            ))}
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
