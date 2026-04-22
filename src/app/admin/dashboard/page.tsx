'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const FEATURED_PRICE = 49
const PREMIER_PRICE = 129
const MRR_GOAL = 3000

type Stats = {
  vendors: {
    total: number
    free: number
    featured: number
    premier: number
    verified: number
    new_this_week: number
    new_this_month: number
    by_category: { category: string; count: number }[]
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
  recent_vendors: { id: string; business_name: string; tier: string; created_at: string; category: string }[]
  recent_users: { id: string; email: string; created_at: string; role: string }[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('week')
  const [activeTab, setActiveTab] = useState<'vendors' | 'moms' | 'reviews'>('vendors')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const checkAdmin = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return false }
    // Check admin role — adjust this query to match your users table structure
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || profile.role !== 'admin') {
      router.push('/')
      return false
    }
    return true
  }, [router])

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const today = new Date(now.setHours(0, 0, 0, 0)).toISOString()

      // All vendor counts
      const { data: vendors } = await supabase
        .from('vendors')
        .select('id, tier, category, created_at, is_verified, business_name, slug')
      
      const allVendors = vendors || []
      const featured = allVendors.filter(v => v.tier === 'featured').length
      const premier = allVendors.filter(v => v.tier === 'premier').length
      const free = allVendors.length - featured - premier
      const verified = allVendors.filter(v => v.is_verified).length
      const newThisWeek = allVendors.filter(v => v.created_at >= weekAgo).length
      const newThisMonth = allVendors.filter(v => v.created_at >= monthAgo).length

      // Category breakdown
      const catMap: Record<string, number> = {}
      allVendors.forEach(v => {
        const cat = v.category || 'Uncategorized'
        catMap[cat] = (catMap[cat] || 0) + 1
      })
      const byCategory = Object.entries(catMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)

      // Recent vendors
      const recentVendors = allVendors
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8)
        .map(v => ({ id: v.id, business_name: v.business_name, tier: v.tier || 'free', created_at: v.created_at, category: v.category || '' }))

      // Mom/user counts — adjust table name if yours is different
      const { data: users } = await supabase
        .from('users')
        .select('id, email, created_at, role')
        .neq('role', 'admin')

      const allUsers = users || []
      const momsTotal = allUsers.length
      const momsThisWeek = allUsers.filter(u => u.created_at >= weekAgo).length
      const momsThisMonth = allUsers.filter(u => u.created_at >= monthAgo).length
      const momsToday = allUsers.filter(u => u.created_at >= today).length

      const recentUsers = allUsers
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8)
        .map(u => ({ id: u.id, email: u.email, created_at: u.created_at, role: u.role || 'mom' }))

      // Reviews — adjust table name if needed
      const { data: reviews } = await supabase
        .from('reviews')
        .select('id, status, created_at')

      const allReviews = reviews || []
      const reviewsTotal = allReviews.length
      const reviewsPending = allReviews.filter(r => r.status === 'pending' || r.status === 'held').length
      const reviewsThisMonth = allReviews.filter(r => r.created_at >= monthAgo).length

      const mrr = (featured * FEATURED_PRICE) + (premier * PREMIER_PRICE)
      const goalPct = Math.round((mrr / MRR_GOAL) * 100)

      setStats({
        vendors: { total: allVendors.length, free, featured, premier, verified, new_this_week: newThisWeek, new_this_month: newThisMonth, by_category: byCategory },
        moms: { total: momsTotal, new_this_week: momsThisWeek, new_this_month: momsThisMonth, new_today: momsToday },
        reviews: { total: reviewsTotal, pending: reviewsPending, this_month: reviewsThisMonth },
        revenue: { mrr, goal_pct: goalPct },
        recent_vendors: recentVendors,
        recent_users: recentUsers,
      })
      setLastRefresh(new Date())
    } catch (e) {
      setError('Failed to load stats. Check your Supabase connection.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAdmin().then(ok => { if (ok) fetchStats() })
  }, [checkAdmin, fetchStats])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchStats])

  const projections = stats ? (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const now = new Date()
    let f = stats.vendors.featured
    let p = stats.vendors.premier
    return Array.from({ length: 6 }, (_, i) => {
      f = Math.round(f + f * 0.12) + 1
      p = Math.round(p + p * 0.10) + 1
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

  const tierColor = (tier: string) => {
    if (tier === 'premier') return '#C97C8A'
    if (tier === 'featured') return '#5DCAA5'
    return '#888'
  }

  const tierLabel = (tier: string) => {
    if (tier === 'premier') return 'Premier'
    if (tier === 'featured') return 'Featured'
    return 'Free'
  }

  if (loading) return (
    <div style={styles.loadWrap}>
      <div style={styles.loadSpinner} />
      <p style={styles.loadText}>Loading dashboard…</p>
    </div>
  )

  if (error) return (
    <div style={styles.loadWrap}>
      <p style={{ color: '#C97C8A', fontSize: 15 }}>{error}</p>
      <button onClick={fetchStats} style={styles.retryBtn}>Retry</button>
    </div>
  )

  if (!stats) return null

  const { vendors, moms, reviews, revenue } = stats

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoDot} />
          <span style={styles.logoText}>MyQuinceAños</span>
          <span style={styles.logoSub}>Admin</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.refreshTime}>Updated {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          <button onClick={fetchStats} style={styles.refreshBtn}>↻ Refresh</button>
        </div>
      </div>

      {/* Period Selector */}
      <div style={styles.periodRow}>
        {(['today', 'week', 'month', 'all'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)} style={{ ...styles.periodBtn, ...(period === p ? styles.periodBtnActive : {}) }}>
            {p === 'today' ? 'Today' : p === 'week' ? 'This week' : p === 'month' ? 'This month' : 'All time'}
          </button>
        ))}
      </div>

      {/* Top Metric Cards */}
      <div style={styles.metricGrid}>
        {[
          { label: 'Total vendors', value: vendors.total, sub: `+${vendors.new_this_week} this week` },
          { label: 'Mom signups', value: moms.total, sub: `+${moms.new_this_week} this week` },
          { label: 'Featured', value: vendors.featured, sub: `$${vendors.featured * FEATURED_PRICE}/mo`, color: '#5DCAA5' },
          { label: 'Premier', value: vendors.premier, sub: `$${vendors.premier * PREMIER_PRICE}/mo`, color: '#C97C8A' },
          { label: 'Monthly revenue', value: `$${revenue.mrr.toLocaleString()}`, sub: `${revenue.goal_pct}% of $${MRR_GOAL.toLocaleString()} goal` },
          { label: 'Verified reviews', value: reviews.total, sub: `${reviews.pending} pending` },
        ].map((m, i) => (
          <div key={i} style={styles.metricCard}>
            <div style={styles.metricLabel}>{m.label}</div>
            <div style={{ ...styles.metricValue, ...(m.color ? { color: m.color } : {}) }}>{m.value}</div>
            <div style={styles.metricSub}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* MRR Progress */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Revenue goal — ${MRR_GOAL.toLocaleString()}/mo</span>
          <span style={{ fontSize: 13, color: revenue.goal_pct >= 100 ? '#5DCAA5' : '#C97C8A', fontWeight: 600 }}>
            {revenue.goal_pct}% {revenue.goal_pct >= 100 ? '✓ Achieved' : 'of goal'}
          </span>
        </div>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${Math.min(revenue.goal_pct, 100)}%` }} />
        </div>
        <div style={styles.tierBreakRow}>
          {[
            { label: 'Free', count: vendors.free, color: '#888', price: 0 },
            { label: 'Featured', count: vendors.featured, color: '#5DCAA5', price: FEATURED_PRICE },
            { label: 'Premier', count: vendors.premier, color: '#C97C8A', price: PREMIER_PRICE },
          ].map(t => (
            <div key={t.label} style={styles.tierBreakItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} />
                <span style={styles.tierBreakLabel}>{t.label}</span>
              </div>
              <div style={{ ...styles.tierBreakBar, background: 'rgba(255,255,255,0.08)' }}>
                <div style={{ height: '100%', borderRadius: 4, background: t.color, width: `${Math.min((t.count / Math.max(vendors.total, 1)) * 100, 100)}%`, transition: 'width 0.6s ease' }} />
              </div>
              <div style={styles.tierBreakCount}>{t.count} vendors{t.price > 0 ? ` · $${t.count * t.price}/mo` : ''}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column: Projection + Categories */}
      <div style={styles.twoCol}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>6-month projection</div>
          <div style={{ marginTop: 16 }}>
            {projections.map((p, i) => (
              <div key={i} style={styles.projRow}>
                <span style={styles.projMonth}>{p.month}</span>
                <div style={styles.projTrack}>
                  <div style={{ height: '100%', borderRadius: 4, background: p.hitGoal ? '#5DCAA5' : '#C97C8A', width: `${Math.round((p.mrr / maxProj) * 100)}%`, transition: 'width 0.4s ease' }} />
                </div>
                <span style={{ ...styles.projRev, color: p.hitGoal ? '#5DCAA5' : 'rgba(255,255,255,0.8)' }}>${p.mrr.toLocaleString()}</span>
                {p.hitGoal && <span style={styles.goalBadge}>✓</span>}
              </div>
            ))}
          </div>
          <div style={styles.goalLine}>Goal: ${MRR_GOAL.toLocaleString()}/mo</div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Vendors by category</div>
          <div style={{ marginTop: 16 }}>
            {vendors.by_category.slice(0, 10).map((c, i) => (
              <div key={i} style={styles.catRow}>
                <span style={styles.catName}>{c.category}</span>
                <div style={styles.catBarWrap}>
                  <div style={{ height: '100%', borderRadius: 3, background: '#C97C8A', opacity: 0.7, width: `${Math.round((c.count / Math.max(...vendors.by_category.map(x => x.count))) * 100)}%` }} />
                </div>
                <span style={styles.catCount}>{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.cardTitle}>Recent activity</span>
          <div style={styles.tabRow}>
            {(['vendors', 'moms', 'reviews'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          {activeTab === 'vendors' && stats.recent_vendors.map((v, i) => (
            <div key={i} style={styles.activityRow}>
              <div style={{ ...styles.activityDot, background: tierColor(v.tier) }} />
              <div style={{ flex: 1 }}>
                <div style={styles.activityText}><strong>{v.business_name}</strong> — {tierLabel(v.tier)} listing</div>
                <div style={styles.activityMeta}>{v.category} · {timeAgo(v.created_at)}</div>
              </div>
            </div>
          ))}
          {activeTab === 'moms' && stats.recent_users.map((u, i) => (
            <div key={i} style={styles.activityRow}>
              <div style={{ ...styles.activityDot, background: '#C97C8A' }} />
              <div style={{ flex: 1 }}>
                <div style={styles.activityText}>{u.email}</div>
                <div style={styles.activityMeta}>{u.role} · {timeAgo(u.created_at)}</div>
              </div>
            </div>
          ))}
          {activeTab === 'reviews' && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
              {reviews.total === 0 ? 'No reviews yet — first one incoming soon.' : `${reviews.total} total reviews · ${reviews.pending} pending verification`}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={styles.quickGrid}>
        {[
          { label: 'Premier slots open', value: `${Math.max(0, 36 - vendors.premier)} / 36`, sub: '3 per category × 12 cats' },
          { label: 'Verified vendors', value: vendors.verified, sub: `${Math.round((vendors.verified / Math.max(vendors.total, 1)) * 100)}% of total` },
          { label: 'New moms today', value: moms.new_today, sub: `${moms.new_this_month} this month` },
          { label: 'Reviews pending', value: reviews.pending, sub: 'Need your approval' },
        ].map((q, i) => (
          <div key={i} style={styles.quickCard}>
            <div style={styles.quickLabel}>{q.label}</div>
            <div style={styles.quickValue}>{q.value}</div>
            <div style={styles.quickSub}>{q.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { background: '#1a0a0f', minHeight: '100vh', padding: '24px 16px', fontFamily: 'DM Sans, sans-serif', color: '#fff', maxWidth: 1100, margin: '0 auto' },
  loadWrap: { background: '#1a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadSpinner: { width: 32, height: 32, border: '2px solid rgba(201,124,138,0.3)', borderTop: '2px solid #C97C8A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  retryBtn: { background: '#C97C8A', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  logoDot: { width: 10, height: 10, borderRadius: '50%', background: '#C97C8A' },
  logoText: { fontSize: 18, fontWeight: 600, letterSpacing: '-0.3px' },
  logoSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'rgba(201,124,138,0.15)', padding: '2px 10px', borderRadius: 20, marginLeft: 4 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  refreshTime: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  refreshBtn: { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13 },
  periodRow: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  periodBtn: { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13, transition: 'all 0.2s' },
  periodBtnActive: { background: 'rgba(201,124,138,0.2)', color: '#C97C8A', borderColor: 'rgba(201,124,138,0.4)' },
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 },
  metricCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px' },
  metricLabel: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' },
  metricValue: { fontSize: 28, fontWeight: 600, lineHeight: 1, marginBottom: 6 },
  metricSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  cardTitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 500 },
  progressTrack: { height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden', marginTop: 14, marginBottom: 20 },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #C97C8A, #FAD8E9)', borderRadius: 4, transition: 'width 0.6s ease' },
  tierBreakRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  tierBreakItem: {},
  tierBreakLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  tierBreakBar: { height: 6, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  tierBreakCount: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 },
  projRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  projMonth: { fontSize: 13, color: 'rgba(255,255,255,0.5)', width: 30, flexShrink: 0 },
  projTrack: { flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' },
  projRev: { fontSize: 13, fontWeight: 500, width: 72, textAlign: 'right', flexShrink: 0 },
  goalBadge: { fontSize: 12, color: '#5DCAA5', flexShrink: 0 },
  goalLine: { fontSize: 12, color: 'rgba(201,124,138,0.6)', marginTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 },
  catRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 },
  catName: { fontSize: 13, color: 'rgba(255,255,255,0.7)', width: 120, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  catBarWrap: { flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  catCount: { fontSize: 13, color: 'rgba(255,255,255,0.4)', width: 24, textAlign: 'right' },
  tabRow: { display: 'flex', gap: 4 },
  tab: { fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' },
  tabActive: { background: 'rgba(201,124,138,0.2)', color: '#C97C8A', borderColor: 'rgba(201,124,138,0.3)' },
  activityRow: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  activityDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6 },
  activityText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 },
  activityMeta: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginTop: 0 },
  quickCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px' },
  quickLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' },
  quickValue: { fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 4 },
  quickSub: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
}
