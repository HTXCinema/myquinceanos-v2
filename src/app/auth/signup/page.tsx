'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Nav from '@/components/layout/Nav'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
    router.push('/planning')
  }

  return (
    <>
      <Nav />
      <div style={{ minHeight: '90vh', background: '#FDF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 className="font-serif" style={{ fontSize: 34, fontWeight: 600, color: '#1a0a0f', marginBottom: 6 }}>Create your free account</h1>
            <p style={{ fontSize: 14, color: '#7a5c65' }}>Save vendors, track payments, plan your daughter's quinceañera</p>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 18, padding: 32 }}>
            {error && (
              <div style={{ background: '#fff0f0', border: '0.5px solid rgba(226,75,74,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#E24B4A' }}>{error}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { key: 'name', label: 'Your Name', placeholder: 'Maria Rodriguez', type: 'text' },
                { key: 'email', label: 'Email Address', placeholder: 'maria@email.com', type: 'email' },
                { key: 'password', label: 'Password', placeholder: 'Min 8 characters', type: 'password' },
                { key: 'confirm', label: 'Confirm Password', placeholder: 'Repeat password', type: 'password' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleSignup()}
                    style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none' }} />
                </div>
              ))}
              <button onClick={handleSignup} disabled={loading}
                style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '14px 0', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
                {loading ? 'Creating account...' : 'Create Free Account'}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#7a5c65', marginTop: 16 }}>
              Already have an account?{' '}
              <Link href="/auth/login" style={{ color: '#C97C8A', fontWeight: 500 }}>Sign in</Link>
            </p>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 14 }}>Free forever. No credit card required.</p>
        </div>
      </div>
    </>
  )
}
