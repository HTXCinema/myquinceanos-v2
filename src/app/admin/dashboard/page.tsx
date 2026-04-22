import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const FEATURED_PRICE = 49
const PREMIER_PRICE = 129
const MRR_GOAL = 3000

type Vendor = {
  id: string
  business_name: string
  tier: string
  is_claimed: boolean
  is_active: boolean
  is_verified: boolean
  founding_vendor: boolean
  created_at: string
}

type Profile = {
  id: string
  email: string
  created_at: string
  role: string
}

type Review = {
  id: string
  status: string
  created_at: string
}

type Stats = {
  vendors: {
    total: number
    free: number
    featured: number
    premier: number
    claimed: number
    verified: number
    founding: number
    new_this_week: number
    new_this_month: number
  }
  moms: {
    total: number
    new_this_week: number
    new_this_month: number
    new_today: number
  }
  reviews: {
    total: number
    pending: number
    this_month: number
  }
  revenue: {
    mrr: number
    goal_pct: number
  }
  recent_vendors: Vendor[]
  recent_profiles: Profile[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'vendors' | 'moms' | 'reviews'>('vendors')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/stats')
      if (res.status === 401) { router.push('/auth/login'); return }
      if (res.status === 403) { router.push('/'); return }
      if (!res.ok) throw new Error('Failed to load stats')
      const { vendors: vendorData, profiles: profileData, reviews: reviewData } = await res.json()

      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

      const vendors: Vendor[] = vendorData || []
      const featured = vendors.filter(v => v.tier === 'featured').length
      const premier = vendors.filter(v => v.tier === 'premier').length
      const free = vendors.length - featured - premier
      const claimed = vendors.filter(v => v.is_claimed).length
      const verified = vendors.filter(v => v.is_verified).length
      const founding = vendors.filter(v => v.founding_vendor).length
      const newThisWeek = vendors.filter(v => v.created_at >= weekAgo).length
      const newThisMonth = vendors.filter(v => v.created_at >= monthAgo).length
      const recentVendors = [...vendors]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8)

      const profiles: Profile[] = (profileData || []).filter((p: Profile) => p.role !== 'admin')
      const momsTotal = profiles.length
      const momsThisWeek = profiles.filter(p => p.created_at >= weekAgo).length
      const momsThisMonth = profiles.filter(p => p.created_at >= monthAgo).length
      const momsToday = profiles.filter(p => p.created_at >= todayStart).length
      const recentProfiles = [...profiles]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8)

      const reviews: Review[] = reviewData || []
      const reviewsTotal = reviews.length
      const reviewsPending = reviews.filter(r => r.status === 'pending' || r.status === 'held').length
      const reviewsThisMonth = reviews.filter(r => r.created_at >= monthAgo).length

      const mrr = (featured * FEATURED_PRICE) + (premier * PREMIER_PRICE)
      const goalPct = Math.round((mrr / MRR_GOAL) * 100)

      setStats({
        vendors: { total: vendors.length, free, featured, premier, claimed, verified, founding, new_this_week: newThisWeek, new_this_month: newThisMonth },
        moms: { total: momsTotal, new_this_week: momsThisWeek, new_this_month: momsThisMonth, new_today: momsToday },
        reviews: { total: reviewsTotal, pending: reviewsPending, this_month: reviewsThisMonth },
        revenue: { mrr, goal_pct: goalPct },
        recent_vendors: recentVendors,
        recent_profiles: recentProfiles,
      })
      setLastRefresh(new Date())
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchStats() }, [fetchStats])
  useEffect(() => {
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchStats])

useEffect(() => {
  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || profile.role !== 'admin') router.push('/')
  }
  checkAdmin()
}, [router])
  
  const projections = stats ? (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const now = new Date()
    let f = stats.vendors.featured
    let p = stats.vendors.premier
    return Array.from({ length: 6 }, (_, i) => {
      f = Math.round(f * 1.12) + 2
      p = Math.round(p * 1.10) + 1
      const mrr = f * FEATURED_PRICE + p * PREMIER_PRICE
      return { month: months[(now.getMonth() + i) % 12], mrr, hitGoal: mrr >= MRR_GOAL }
    })
  })() : []

  const maxProj = projections.length ? Math.max(...projections.map(p => p.mrr), MRR_GOAL) : MRR_GOAL

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  const tierColor = (tier: string) => tier === 'premier' ? '#C97C8A' : tier === 'featured' ? '#5DCAA5' : '#555'
  const tierLabel = (tier: string) => tier === 'premier' ? 'Premier' : tier === 'featured' ? 'Featured' : 'Free'

  if (loading) return (
    <div style={s.loadWrap}>
      <div style={s.spinner} />
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading dashboard…</p>
    </div>
  )

  if (error) return (
    <div style={s.loadWrap}>
      <p style={{ color: '#C97C8A', fontSize: 14, maxWidth: 400, textAlign: 'center' }}>{error}</p>
      <button onClick={fetchStats} style={s.retryBtn}>Retry</button>
    </div>
  )

  if (!stats) return null

  const { vendors, moms, reviews, revenue } = stats

  return (
    <div style={s.page}>

      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C97C8A' }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>MyQuinceAños</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'rgba(201,124,138,0.15)', padding: '2px 10px', borderRadius: 20 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            Updated {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button onClick={fetchStats} style={s.refreshBtn}>↻ Refresh</button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={s.metricGrid}>
        {[
          { label: 'Total vendors', value: vendors.total, sub: `+${vendors.new_this_week} this week` },
          { label: 'Claimed profiles', value: vendors.claimed, sub: `${Math.round((vendors.claimed / Math.max(vendors.total, 1)) * 100)}% of total` },
          { label: 'Featured', value: vendors.featured, sub: `$${vendors.featured * FEATURED_PRICE}/mo`, color: '#5DCAA5' },
          { label: 'Premier', value: vendors.premier, sub: `$${vendors.premier * PREMIER_PRICE}/mo`, color: '#C97C8A' },
          { label: 'Monthly revenue', value: `$${revenue.mrr.toLocaleString()}`, sub: `${revenue.goal_pct}% of $${MRR_GOAL.toLocaleString()} goal` },
          { label: 'Mom signups', value: moms.total, sub: `+${moms.new_this_week} this week` },
        ].map((m, i) => (
          <div key={i} style={s.metricCard}>
            <div style={s.metricLabel}>{m.label}</div>
            <div style={{ ...s.metricValue, ...(m.color ? { color: m.color } : {}) }}>{m.value}</div>
            <div style={s.metricSub}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* MRR Progress */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={s.cardTitle}>Revenue goal — ${MRR_GOAL.toLocaleString()}/mo</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: revenue.goal_pct >= 100 ? '#5DCAA5' : '#C97C8A' }}>
            {revenue.goal_pct}% {revenue.goal_pct >= 100 ? '✓ Achieved' : 'of goal'}
          </span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#C97C8A,#FAD8E9)', borderRadius: 4, width: `${Math.min(revenue.goal_pct, 100)}%`, transition: 'width 0.6s' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { label: 'Free', count: vendors.free, color: '#555', price: 0 },
            { label: 'Featured', count: vendors.featured, color: '#5DCAA5', price: FEATURED_PRICE },
            { label: 'Premier', count: vendors.premier, color: '#C97C8A', price: PREMIER_PRICE },
          ].map(t => (
            <div key={t.label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t.label}</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', background: t.color, borderRadius: 4, width: `${Math.min((t.count / Math.max(vendors.total, 1)) * 100, 100)}%` }} />
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                {t.count} vendors{t.price > 0 ? ` · $${t.count * t.price}/mo` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two col */}
      <div style={s.twoCol}>

        {/* Projection */}
        <div style={s.card}>
          <div style={s.cardTitle}>6-month projection</div>
          <div style={{ marginTop: 16 }}>
            {projections.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', width: 30, flexShrink: 0 }}>{p.month}</span>
                <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: p.hitGoal ? '#5DCAA5' : '#C97C8A', width: `${Math.round((p.mrr / maxProj) * 100)}%` }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, width: 72, textAlign: 'right', color: p.hitGoal ? '#5DCAA5' : 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
                  ${p.mrr.toLocaleString()}
                </span>
                {p.hitGoal && <span style={{ fontSize: 11, color: '#5DCAA5', flexShrink: 0 }}>✓</span>}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(201,124,138,0.5)', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            Goal: ${MRR_GOAL.toLocaleString()}/mo
          </div>
        </div>

        {/* Vendor breakdown */}
        <div style={s.card}>
          <div style={s.cardTitle}>Vendor breakdown</div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Total vendors', value: vendors.total },
              { label: 'Free listings', value: vendors.free },
              { label: 'Claimed profiles', value: vendors.claimed },
              { label: 'Verified vendors', value: vendors.verified },
              { label: 'Founding vendors', value: vendors.founding },
              { label: 'New this month', value: vendors.new_this_month },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'rgba(255,255,255,0.55)' }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Activity Feed */}
      <div style={s.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <span style={s.cardTitle}>Recent activity</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['vendors', 'moms', 'reviews'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                fontSize: 12, padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
                background: activeTab === t ? 'rgba(201,124,138,0.2)' : 'transparent',
                color: activeTab === t ? '#C97C8A' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${activeTab === t ? 'rgba(201,124,138,0.3)' : 'rgba(255,255,255,0.1)'}`,
              }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'vendors' && stats.recent_vendors.map((v, i) => (
          <div key={i} style={s.actRow}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: tierColor(v.tier), flexShrink: 0, marginTop: 5 }} />
            <div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
                <strong>{v.business_name}</strong>
                <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 10, background: tierColor(v.tier) + '22', color: tierColor(v.tier) }}>
                  {tierLabel(v.tier)}
                </span>
                {v.is_verified && <span style={{ marginLeft: 6, fontSize: 11, color: '#5DCAA5' }}>✓ Verified</span>}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                {v.is_claimed ? 'Claimed' : 'Unclaimed'} · {timeAgo(v.created_at)}
              </div>
            </div>
          </div>
        ))}

        {activeTab === 'moms' && stats.recent_profiles.map((p, i) => (
          <div key={i} style={s.actRow}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C97C8A', flexShrink: 0, marginTop: 5 }} />
            <div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{p.email || 'No email'}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{p.role || 'mom'} · {timeAgo(p.created_at)}</div>
            </div>
          </div>
        ))}

        {activeTab === 'reviews' && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.35)', fontSize: 14 }}>
            {reviews.total === 0
              ? 'No reviews yet — first one coming soon.'
              : `${reviews.total} total · ${reviews.pending} pending verification`}
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div style={s.quickGrid}>
        {[
          { label: 'Premier slots open', value: `${Math.max(0, 36 - vendors.premier)} / 36`, sub: '3 per category × 12 cats' },
          { label: 'New moms today', value: moms.new_today, sub: `${moms.new_this_month} this month` },
          { label: 'Reviews pending', value: reviews.pending, sub: 'Need your approval' },
          { label: 'Founding vendors', value: vendors.founding, sub: 'Early adopters' },
        ].map((q, i) => (
          <div key={i} style={s.quickCard}>
            <div style={s.metricLabel}>{q.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#fff', margin: '4px 0' }}>{q.value}</div>
            <div style={s.metricSub}>{q.sub}</div>
          </div>
        ))}
      </div>

    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { background: '#1a0a0f', minHeight: '100vh', padding: '24px 20px', fontFamily: 'DM Sans, sans-serif', color: '#fff', maxWidth: 1100, margin: '0 auto' },
  loadWrap: { background: '#1a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 },
  spinner: { width: 32, height: 32, border: '2px solid rgba(201,124,138,0.2)', borderTop: '2px solid #C97C8A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  retryBtn: { background: '#C97C8A', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  refreshBtn: { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13 },
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 },
  metricCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px' },
  metricLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.6px' },
  metricValue: { fontSize: 28, fontWeight: 600, lineHeight: 1, marginBottom: 5 },
  metricSub: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 },
  cardTitle: { fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 500 },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 },
  actRow: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 },
  quickCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px 18px' },
}
