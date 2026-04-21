'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Nav from '@/components/layout/Nav'

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
    if (err) { setError('Invalid email or password. Try again.'); setLoading(false); return }
    // Route based on role
    const role = data.user?.user_metadata?.role
    if (role === 'vendor') router.push('/vendor-dashboard')
    else router.push('/mom-dashboard')
  }

  return (
    <>
      <Nav />
      <div style={{ minHeight: '90vh', background: '#FDF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 className="font-serif" style={{ fontSize: 34, fontWeight: 600, color: '#1a0a0f', marginBottom: 6 }}>Welcome back</h1>
            <p style={{ fontSize: 14, color: '#7a5c65' }}>Sign in to your MyQuinceAños account</p>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 18, padding: 32 }}>
            {error && (
              <div style={{ background: '#fff0f0', border: '0.5px solid rgba(226,75,74,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#E24B4A' }}>{error}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'email', label: 'Email Address', placeholder: 'maria@email.com', type: 'email' },
                { key: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none' }} />
                </div>
              ))}
              <button onClick={handleLogin} disabled={loading}
                style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '14px 0', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#7a5c65', marginTop: 16 }}>
              Don't have an account?{' '}
              <Link href="/auth/signup" style={{ color: '#C97C8A', fontWeight: 500 }}>Create free account</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
