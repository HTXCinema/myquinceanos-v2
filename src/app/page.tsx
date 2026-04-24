'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

// ─────────────────────────────────────────────────────────────
// STEP 1: Add this hook at the top of your homepage file,
// right after your imports:
// ─────────────────────────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

const CATEGORIES = [
  { name: 'Venues & Ballrooms', count: 18, slug: 'venues', span2: true },
  { name: 'Photographers', count: 24, slug: 'photographers', span2: true },
  { name: 'Catering', count: 15, slug: 'catering' },
  { name: 'DJs & Music', count: 21, slug: 'djs-music' },
  { name: 'Videography', count: 12, slug: 'videography' },
  { name: 'Makeup & Hair', count: 19, slug: 'makeup-hair' },
  { name: 'Dresses & Boutiques', count: 16, slug: 'dresses-boutiques' },
  { name: 'Choreographers', count: 9, slug: 'choreographers' },
]

const CAT_COLORS = [
  'linear-gradient(145deg,#5c2535 0%,#a05060 100%)',
  'linear-gradient(145deg,#2a1535 0%,#7a5090 100%)',
  'linear-gradient(145deg,#1a3025 0%,#3a7055 100%)',
  'linear-gradient(145deg,#352510 0%,#907040 100%)',
  'linear-gradient(145deg,#1a2535 0%,#4a6080 100%)',
  'linear-gradient(145deg,#352515 0%,#805535 100%)',
  'linear-gradient(145deg,#251535 0%,#705080 100%)',
  'linear-gradient(145deg,#152530 0%,#356070 100%)',
]

const CAT_BG_COLORS = [
  'linear-gradient(155deg,#3d1520 0%,#7a3545 55%,#c07080 100%)',
  'linear-gradient(155deg,#1d1030 0%,#5a3575 55%,#9570a5 100%)',
  'linear-gradient(155deg,#152025 0%,#355060 55%,#658090 100%)',
  'linear-gradient(155deg,#252010 0%,#706030 55%,#a09060 100%)',
  'linear-gradient(155deg,#1a2510 0%,#4a6030 55%,#7a9050 100%)',
  'linear-gradient(155deg,#301520 0%,#704050 55%,#b07080 100%)',
]

const FALLBACK_VENDORS = [
  { id: '', slug: '', business_name: 'DreamLite Productions', categories: { name: 'Photography & Video' }, avg_rating: 5.0, review_count: 52, starting_price: 2800, myquince_perk: 'Free 1-hr engagement session', cover_photo_url: '', tier: 'featured' },
  { id: '', slug: '', business_name: 'Bell Tower on 34th', categories: { name: 'Venues' }, avg_rating: 4.9, review_count: 53, starting_price: 5500, myquince_perk: 'Free venue lighting upgrade', cover_photo_url: '', tier: 'featured' },
  { id: '', slug: '', business_name: 'Cabrera Photography', categories: { name: 'Photography' }, avg_rating: 4.7, review_count: 31, starting_price: 1500, myquince_perk: 'Free closing waltz highlight edit', cover_photo_url: '', tier: 'featured' },
  { id: '', slug: '', business_name: 'Ikonik Dancers & DJ', categories: { name: 'DJs & Entertainment' }, avg_rating: 5.0, review_count: 28, starting_price: 1200, myquince_perk: 'Free hora loca add-on', cover_photo_url: '', tier: 'featured' },
  { id: '', slug: '', business_name: "Goyita's Catering", categories: { name: 'Catering' }, avg_rating: 4.8, review_count: 41, starting_price: 3200, myquince_perk: 'Complimentary tasting for 4', cover_photo_url: '', tier: 'featured' },
  { id: '', slug: '', business_name: 'Bella Luxe Events', categories: { name: 'Decor & Flowers' }, avg_rating: 4.9, review_count: 37, starting_price: 2100, myquince_perk: 'Free centerpiece upgrade', cover_photo_url: '', tier: 'featured' },
]

const REVIEWS = [
  { initials: 'MR', name: 'Maria Rodriguez', vendor: 'DreamLite Productions', date: 'Nov 2024', rating: 5, body: '"They captured every emotional moment perfectly. From the waltz to the last dance — my daughter cried watching the highlight reel. Worth every penny."', color: 'rgba(201,124,138,.25)', textColor: '#FAD8E9' },
  { initials: 'LC', name: 'Laura Castillo', vendor: 'Bell Tower on 34th', date: 'Aug 2024', rating: 5, body: '"Absolutely stunning. Staff was professional, everything ran on time, and our guests are still talking about it 6 months later."', color: 'rgba(175,169,236,.25)', textColor: '#ccc8f0' },
  { initials: 'AP', name: 'Ana Perez', vendor: 'Ikonik Dancers', date: 'Jan 2025', rating: 5, body: '"The surprise dance had everyone on their feet. They worked so patiently with all 14 chambelanes. Best investment of the whole quince."', color: 'rgba(93,202,165,.2)', textColor: '#9fe1cb' },
  { initials: 'SG', name: 'Sofia Guerrero', vendor: "Goyita's Catering", date: 'Mar 2025', rating: 4, body: '"Food was delicious, presentation gorgeous, 200 guests fed on time. Setup was 20 min late but the quality made up for it."', color: 'rgba(239,159,39,.2)', textColor: '#fac775' },
]

const SLIDER_DEFS = [
  { key: 'venue',  label: 'Venue',         color: '#C97C8A', pct: 0.26 },
  { key: 'photo',  label: 'Photo / Video', color: '#C9A040', pct: 0.17 },
  { key: 'cater',  label: 'Catering',      color: '#5DCAA5', pct: 0.21 },
  { key: 'dj',     label: 'DJ / Music',    color: '#AFA9EC', pct: 0.10 },
  { key: 'dress',  label: 'Dress',         color: '#F4C0D1', pct: 0.09 },
  { key: 'decor',  label: 'Decor',         color: '#FAC775', pct: 0.07 },
  { key: 'makeup', label: 'Makeup & Hair', color: '#F0997B', pct: 0.05 },
  { key: 'other',  label: 'Other',         color: '#B4B2A9', pct: 0.05 },
]

const PRESETS = [8000, 12000, 18500, 25000, 35000]
const fmt = (n: number) => '$' + Math.round(n).toLocaleString()

// ── BUDGET CALCULATOR — pure React state, no DOM manipulation ──
function BudgetCalculator() {
  const DEFAULT_TOTAL = 18500
  const [total, setTotal] = useState(DEFAULT_TOTAL)
  const [amts, setAmts] = useState<Record<string, number>>(
    Object.fromEntries(SLIDER_DEFS.map(s => [s.key, Math.round(DEFAULT_TOTAL * s.pct)]))
  )

  const sliderBg = (color: string, value: number, min: number, max: number) => {
    const pct = max > min ? ((value - min) / (max - min)) * 100 : 0
    return `linear-gradient(to right, ${color} ${pct.toFixed(1)}%, rgba(255,255,255,.12) ${pct.toFixed(1)}%)`
  }

  const handleTotal = (newTotal: number) => {
    setTotal(newTotal)
    setAmts(prev => {
      const prevTotal = Object.values(prev).reduce((a, b) => a + b, 0)
      if (prevTotal === 0) return Object.fromEntries(SLIDER_DEFS.map(s => [s.key, Math.round(newTotal * s.pct)]))
      const ratio = newTotal / prevTotal
      return Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, Math.round(v * ratio)]))
    })
  }

  const handleCat = (key: string, val: number) => {
    setAmts(prev => {
      const diff = val - prev[key]
      const others = SLIDER_DEFS.map(s => s.key).filter(k => k !== key)
      const otherSum = others.reduce((a, k) => a + prev[k], 0)
      const next = { ...prev, [key]: val }
      others.forEach(k => {
        const share = otherSum > 0 ? prev[k] / otherSum : 1 / others.length
        next[k] = Math.max(0, Math.round(prev[k] - diff * share))
      })
      return next
    })
  }

  const catMax = Math.round(total * 0.65)

  return (
    <div id="calculator" style={{ background: '#1a0a0f', borderRadius: 18, padding: 32, marginTop: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
        <div>
          <h3 className="font-serif" style={{ fontSize: 22, color: '#fff', marginBottom: 6 }}>Live Budget Calculator</h3>
          <p style={{ fontSize: 13, color: 'rgba(250,216,233,.55)' }}>Set your total — every category scales automatically</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'rgba(250,216,233,.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Total Budget</div>
          <div className="font-serif" style={{ fontSize: 38, color: '#C9A040', lineHeight: 1 }}>{fmt(total)}</div>
        </div>
      </div>

      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {PRESETS.map(p => (
          <button key={p} onClick={() => handleTotal(p)}
            style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `0.5px solid ${total === p ? '#C9A040' : 'rgba(255,255,255,.18)'}`, background: total === p ? 'rgba(201,160,64,.18)' : 'transparent', color: total === p ? '#C9A040' : 'rgba(250,216,233,.5)', transition: 'all 0.15s' }}>
            {fmt(p)}
          </button>
        ))}
      </div>

      {/* Total slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: 'rgba(250,216,233,.55)', width: 110, flexShrink: 0 }}>Total Budget</span>
        <input type="range" min={5000} max={50000} step={500} value={total}
          onChange={e => handleTotal(Number(e.target.value))}
          style={{ flex: 1, height: 4, borderRadius: 2, cursor: 'pointer', WebkitAppearance: 'none', appearance: 'none', outline: 'none', accentColor: '#C9A040', background: sliderBg('#C9A040', total, 5000, 50000) }} />
        <span style={{ fontSize: 12, fontWeight: 500, color: '#fff', width: 70, textAlign: 'right' }}>{fmt(total)}</span>
      </div>

      <div style={{ height: 0.5, background: 'rgba(255,255,255,.08)', margin: '14px 0' }} />

    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {SLIDER_DEFS.map(s => {
          const val = amts[s.key] ?? 0
          const pct = total > 0 ? Math.round((val / total) * 100) : 0
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'rgba(250,216,233,.55)', width: 110, flexShrink: 0 }}>{s.label}</span>
              <input type="range" min={0} max={catMax} step={50} value={Math.min(val, catMax)}
                onChange={e => handleCat(s.key, Number(e.target.value))}
                style={{ flex: 1, height: 4, borderRadius: 2, cursor: 'pointer', WebkitAppearance: 'none', appearance: 'none', outline: 'none', accentColor: s.color, background: sliderBg(s.color, Math.min(val, catMax), 0, catMax) }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#fff', width: 70, textAlign: 'right' }}>{fmt(val)}</span>
              <span style={{ fontSize: 11, color: 'rgba(250,216,233,.35)', width: 38, textAlign: 'right' }}>{pct}%</span>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 16, fontSize: 12, textAlign: 'center', padding: '8px', borderRadius: 8, background: 'rgba(93,202,165,.1)', color: '#5DCAA5' }}>
        Drag any category slider to customize — or tap a preset above
      </div>
    </div>
  )
}

function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <span>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ color: i < Math.round(rating) ? '#C9A040' : '#444', fontSize: 13 }}>★</span>
      ))}
    </span>
  )
}

export default function HomePage() {
  const [featuredVendors, setFeaturedVendors] = useState<any[]>(FALLBACK_VENDORS)
  const [carouselIdx, setCarouselIdx] = useState(0)
  const carouselRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()
  const isMobile = useIsMobile()

  useEffect(() => {
    async function loadFeatured() {
      const { data } = await supabase
        .from('vendors')
        .select('id, slug, business_name, categories(name), avg_rating, review_count, starting_price, myquince_perk, cover_photo_url, tier')
        .in('tier', ['featured', 'premier'])
        .eq('is_active', true)
        .order('tier', { ascending: false })
        .limit(9)
      if (data && data.length > 0) setFeaturedVendors(data)
    }
    loadFeatured()
  }, [])

  useEffect(() => {
    carouselRef.current = setInterval(() => {
      setCarouselIdx(i => (i + 1) % featuredVendors.length)
    }, 4000)
    return () => { if (carouselRef.current) clearInterval(carouselRef.current) }
  }, [featuredVendors.length])

  const visibleVendors = featuredVendors.length >= 3 ? [
    featuredVendors[carouselIdx % featuredVendors.length],
    featuredVendors[(carouselIdx + 1) % featuredVendors.length],
    featuredVendors[(carouselIdx + 2) % featuredVendors.length],
  ] : featuredVendors

  return (
    <>
      <Nav />

      {/* HERO */}
      <section style={{ background: '#1a0a0f', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', height: isMobile ? 280 : 340, gap: 3 }}>
  {['Bell Tower on 34th', 'DreamLite Productions', 'La Hacienda Grand Ballroom'].map((label, i) => (
    <div key={i} style={{ background: `linear-gradient(160deg, ${['#3d1520,#7a3545,#c07080','#1a0a0f,#4a2030,#8a4060','#2a1018,#5a2535,#a06080'][i]})`, position: 'relative', display: isMobile && i > 0 ? 'none' : 'block' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,10,15,.5)' }} />
      <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(26,10,15,.72)', color: '#fff', fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20, border: '0.5px solid rgba(255,255,255,.15)' }}>{label}</div>
    </div>
  ))}
</div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 2 }}>
          <div style={{ background: 'rgba(201,160,64,.18)', border: '0.5px solid rgba(201,160,64,.4)', color: '#C9A040', fontSize: 11, fontWeight: 500, padding: '5px 14px', borderRadius: 20, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 14 }}>Houston's Quinceañera Planning Platform</div>
          <h1 className="font-serif text-center" style={{ fontSize: isMobile ? 28 : 44, fontWeight: 600, color: '#fff', lineHeight: 1.15, marginBottom: 10, maxWidth: 560 }}>
            Plan Your Daughter's <em style={{ color: '#FAD8E9' }}>Perfect</em> Quinceañera
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, textAlign: 'center', marginBottom: 22, maxWidth: 440, lineHeight: 1.6 }}>Trusted vendors, verified reviews from real moms, free planning tools — all in one place.</p>
         <div style={{ background: 'rgba(255,255,255,.96)', borderRadius: 14, padding: '6px 6px 6px 16px', display: 'flex', gap: 8, alignItems: 'center', width: '100%', maxWidth: 520 }}>
  <select style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#555', flex: 1, outline: 'none', padding: '6px 0', minWidth: 0 }}>
    <option>All Categories</option>
    <option>Photographers</option><option>Venues</option><option>DJs</option>
    <option>Catering</option><option>Makeup & Hair</option><option>Dresses</option>
  </select>
  {!isMobile && <>
    <div style={{ width: 0.5, height: 20, background: '#ddd' }} />
    <select style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#555', outline: 'none', padding: '6px 0', width: 130 }}>
      <option>Houston, TX</option><option>Katy, TX</option><option>Pearland, TX</option><option>Sugar Land, TX</option>
    </select>
  </>}
  <Link href="/vendors" style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>Search</Link>
</div>
        </div>
      </section>

   {/* STATS */}
<div style={{ background: '#C97C8A', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)' }}>
  {[['127+','Houston Vendors'],['12','Categories'],['100%','Mom-Verified Reviews'],['Free','To Start Planning']].map(([n,l], idx) => (
    <div key={l} style={{ padding: '14px 8px', textAlign: 'center', borderRight: isMobile ? (idx % 2 === 0 ? '0.5px solid rgba(255,255,255,.25)' : 'none') : '0.5px solid rgba(255,255,255,.25)', borderBottom: isMobile && idx < 2 ? '0.5px solid rgba(255,255,255,.25)' : 'none' }}>
      <span className="font-serif block" style={{ fontSize: 24, fontWeight: 600, color: '#fff' }}>{n}</span>
      <span className="block" style={{ fontSize: 11, color: 'rgba(255,255,255,.75)', marginTop: 1 }}>{l}</span>
    </div>
  ))}
</div>

      {/* PLANNING TOOLS */}
      <section style={{ padding: '48px 28px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 8 }}>Free Planning Tools</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <h2 className="font-serif" style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.15 }}>Built for Houston moms, not just browsers</h2>
          <span style={{ fontSize: 13, color: '#7a5c65' }}>No account needed</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14 }}>
          {[
            { label: 'Planning Timeline', sub: '12-Month Timeline', desc: 'Step-by-step checklist from booking your venue to the morning of the event. Never miss a deadline.', href: '/planning', color: 'linear-gradient(160deg,#2a1520 0%,#7a4055 60%,#c08090 100%)' },
            { label: 'Budget Calculator', sub: 'Live Budget Slider', desc: 'Drag the sliders below — watch your budget split across every category in real time.', href: '#calculator', color: 'linear-gradient(160deg,#152025 0%,#355060 55%,#6090a0 100%)' },
            { label: 'Saved Vendor List', sub: 'Save Your Favorites', desc: 'Bookmark vendors, add notes, compare quotes. Sign in to save and track everything.', href: '/planning', color: 'linear-gradient(160deg,#251830 0%,#604575 60%,#9070a0 100%)' },
          ].map(t => (
            <Link key={t.label} href={t.href} style={{ borderRadius: 16, overflow: 'hidden', border: '0.5px solid rgba(201,124,138,.18)', textDecoration: 'none', display: 'block' }}>
              <div style={{ height: 160, background: t.color, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: 14 }}>
                <span style={{ background: 'rgba(26,10,15,.65)', color: '#fff', fontSize: 11, fontWeight: 500, padding: '4px 12px', borderRadius: 20, border: '0.5px solid rgba(255,255,255,.2)' }}>{t.sub}</span>
              </div>
              <div style={{ background: '#fff', padding: 16 }}>
                <h3 style={{ fontSize: 14.5, fontWeight: 500, color: '#1a0a0f', marginBottom: 4 }}>{t.label}</h3>
                <p style={{ fontSize: 12.5, color: '#7a5c65', lineHeight: 1.55, marginBottom: 8 }}>{t.desc}</p>
                <span style={{ fontSize: 12, color: '#C97C8A', fontWeight: 500 }}>Open →</span>
              </div>
            </Link>
          ))}
        </div>
        <BudgetCalculator />
      </section>

    

      {/* CATEGORIES */}
   <section style={{ padding: isMobile ? '32px 16px' : '48px 28px', background: '#FDF6F0' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 8 }}>Featured Vendors</div>
      <h2 className="font-serif" style={{ fontSize: isMobile ? 26 : 34, fontWeight: 600, lineHeight: 1.15 }}>Houston vendors families love</h2>
    </div>
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <button onClick={() => { setCarouselIdx(i => (i - 1 + featuredVendors.length) % featuredVendors.length); if (carouselRef.current) clearInterval(carouselRef.current) }}
        style={{ width: 36, height: 36, borderRadius: '50%', border: '0.5px solid rgba(201,124,138,.3)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="14" height="14" fill="none" stroke="#C97C8A" strokeWidth="2"><polyline points="9,2 4,7 9,12"/></svg>
      </button>
      <button onClick={() => { setCarouselIdx(i => (i + 1) % featuredVendors.length); if (carouselRef.current) clearInterval(carouselRef.current) }}
        style={{ width: 36, height: 36, borderRadius: '50%', border: '0.5px solid rgba(201,124,138,.3)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="14" height="14" fill="none" stroke="#C97C8A" strokeWidth="2"><polyline points="5,2 10,7 5,12"/></svg>
      </button>
      {!isMobile && <Link href="/vendors?tier=featured" style={{ fontSize: 13, color: '#C97C8A', fontWeight: 500, textDecoration: 'none' }}>View all featured →</Link>}
    </div>
  </div>
  {featuredVendors.length > 0 && <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
    {featuredVendors.map((_, i) => (
      <button key={i} onClick={() => setCarouselIdx(i)}
        style={{ width: i === carouselIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === carouselIdx ? '#C97C8A' : 'rgba(201,124,138,.3)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
    ))}
  </div>}
  {/* On mobile show 1 card, on desktop show 3 */}
  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16 }}>
    {(isMobile ? [featuredVendors[carouselIdx % featuredVendors.length]] : visibleVendors).filter(Boolean).map((v, i) => {
      const catName = (v.categories as any)?.name || ''
      const bg = v.cover_photo_url ? undefined : CAT_BG_COLORS[i % CAT_BG_COLORS.length]
      const profileLink = v.slug ? `/vendors/${v.slug}` : '/vendors'
      return (
        <Link key={v.id || i} href={profileLink} style={{ textDecoration: 'none', background: '#fff', border: `0.5px solid ${v.tier === 'premier' ? 'rgba(201,160,64,.4)' : 'rgba(201,124,138,.18)'}`, borderRadius: 16, overflow: 'hidden', display: 'block' }}>
          <div style={{ height: isMobile ? 220 : 200, background: bg, backgroundImage: v.cover_photo_url ? `url(${v.cover_photo_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 10, right: 10, background: v.tier === 'premier' ? 'linear-gradient(135deg,#C9A040,#e8c96a)' : '#C9A040', color: '#1a0a0f', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>
              {v.tier === 'premier' ? '⭐ Premier' : 'Featured'}
            </div>
            {v.myquince_perk && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(201,160,64,.9)', padding: '7px 12px' }}>
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(26,10,15,.6)', fontWeight: 600 }}>MyQuince Perk</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#1a0a0f' }}>{v.myquince_perk}</div>
              </div>
            )}
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 10.5, color: '#C97C8A', fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 3 }}>{catName}</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#1a0a0f', marginBottom: 5 }}>{v.business_name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 5 }}>
              <Stars rating={v.avg_rating || 0} />
              <span style={{ fontSize: 11.5, color: '#7a5c65', marginLeft: 4 }}>
                {v.avg_rating > 0 ? `${v.avg_rating} (${v.review_count} reviews)` : 'No reviews yet'}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#7a5c65' }}>
              {v.starting_price ? <>Starting at <strong style={{ color: '#1a0a0f', fontWeight: 500 }}>${Number(v.starting_price).toLocaleString()}</strong></> : 'Contact for pricing'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7, fontSize: 11, color: '#1a7a4a', fontWeight: 500 }}>
              <div style={{ width: 5, height: 5, background: '#1a7a4a', borderRadius: '50%' }} />
              Mom-verified reviews
            </div>
          </div>
        </Link>
      )
    })}
  </div>
  {isMobile && (
    <Link href="/vendors?tier=featured" style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#C97C8A', fontWeight: 500, textDecoration: 'none', marginTop: 16 }}>View all featured vendors →</Link>
  )}
</section>

      {/* REVIEWS */}
      <section style={{ background: '#1a0a0f', padding: '52px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 8 }}>Verified Reviews</div>
            <h2 className="font-serif" style={{ fontSize: 34, fontWeight: 600, color: '#fff', lineHeight: 1.15 }}>What Houston moms are saying</h2>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {['Every review requires a contract or receipt','No fake reviews. No pay-to-win ratings.','Only moms who booked can leave a review'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.06)', border: '0.5px solid rgba(250,216,233,.15)', borderRadius: 20, padding: '8px 16px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A040" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              <span style={{ fontSize: 12, color: 'rgba(250,216,233,.75)' }}>{t}</span>
            </div>
          ))}
        </div>
       <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,1fr)', gap: 14 }}>
          {REVIEWS.map(r => (
            <div key={r.name} style={{ background: 'rgba(255,255,255,.06)', border: '0.5px solid rgba(250,216,233,.12)', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', gap: 11, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: r.textColor, flexShrink: 0 }}>{r.initials}</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: '#fff' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(250,216,233,.45)', marginTop: 2 }}>{r.vendor} · {r.date}</div>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}><Stars rating={r.rating} /></div>
              <p style={{ fontSize: 13.5, color: 'rgba(250,216,233,.8)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12, borderLeft: '2px solid #C97C8A', paddingLeft: 12 }}>{r.body}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#5DCAA5', fontWeight: 500 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                Verified — contract submitted
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 20 }}>How our review system works</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 16 }}>
            {[
              ['01','Mom books a vendor',"After booking through MyQuinceAños, she gets an invite to share her experience once the event is done."],
              ['02','Submit proof of purchase',"She uploads her contract or receipt. Our team verifies it's real before the review ever goes live."],
              ['03','Honest reviews stay forever',"Vendors can't buy, delete, or bury bad reviews. The truth stays visible for every mom who comes after."],
            ].map(([n,t,d]) => (
              <div key={n} style={{ background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(250,216,233,.1)', borderRadius: 14, padding: 26 }}>
                <div className="font-serif" style={{ fontSize: 44, color: '#C9A040', lineHeight: 1, marginBottom: 10 }}>{n}</div>
                <h3 style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 6 }}>{t}</h3>
                <p style={{ fontSize: 12.5, color: 'rgba(250,216,233,.5)', lineHeight: 1.6 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOM CTA */}
      <section style={{ background: '#FAD8E9', padding: isMobile ? '32px 20px' : '40px 28px', display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: 28, color: '#1a0a0f', marginBottom: 6 }}>Save your vendors. Track your dates.</h2>
          <p style={{ fontSize: 13.5, color: '#7a5c65', maxWidth: 400, lineHeight: 1.6, marginBottom: 16 }}>Create a free mom account — saved vendors, event countdown, payment due dates, planning checklist, all in one dashboard.</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            {['Save & compare vendors','Track payment due dates','Planning checklist','Event countdown'].map(f2 => (
              <div key={f2} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#7a5c65' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C97C8A" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                {f2}
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: 14, padding: 16, maxWidth: 380, border: '0.5px solid rgba(201,124,138,.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#C97C8A', marginBottom: 10 }}>Sofia's Quince Dashboard</div>
            {[
              { item: 'Photographer', vendor: 'DreamLite Productions', booked: true },
              { item: 'Venue', vendor: 'Bell Tower on 34th', booked: true },
              { item: 'Catering', vendor: '', booked: false },
              { item: 'DJ', vendor: '', booked: false },
            ].map(row => (
              <div key={row.item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '0.5px solid rgba(201,124,138,.1)' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${row.booked ? '#1a7a4a' : '#C97C8A'}`, background: row.booked ? '#1a7a4a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {row.booked && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                </div>
                <span style={{ fontSize: 13, textDecoration: row.booked ? 'line-through' : 'none', color: row.booked ? '#aaa' : '#1a0a0f', flex: 1 }}>{row.item}</span>
                {row.vendor && <span style={{ fontSize: 11, color: '#C97C8A', fontWeight: 500 }}>{row.vendor}</span>}
                {!row.vendor && <span style={{ fontSize: 11, color: '#ccc' }}>+ Add vendor</span>}
              </div>
            ))}
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: '#7a5c65' }}>Event date</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#C9A040' }}>247 days away</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
          <Link href="/auth/signup" style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '13px 28px', borderRadius: 24, fontSize: 14, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>Create Free Account</Link>
          <Link href="/auth/login" style={{ background: 'transparent', color: '#C97C8A', border: '0.5px solid #C97C8A', padding: '11px 24px', borderRadius: 24, fontSize: 13, textDecoration: 'none' }}>Sign In</Link>
        </div>
      </section>

      {/* EXPO BANNER */}
      <div style={{ margin: '0 28px 48px', background: '#1a0a0f', border: '0.5px solid rgba(201,160,64,.3)', borderRadius: 16, padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ background: 'rgba(201,160,64,.15)', border: '0.5px solid rgba(201,160,64,.35)', color: '#C9A040', fontSize: 10, fontWeight: 600, padding: '4px 12px', borderRadius: 20, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 10, display: 'inline-block' }}>Coming Soon · Always Free for Families</div>
          <h3 className="font-serif" style={{ fontSize: 22, color: '#fff', marginBottom: 6 }}>Houston's First Completely Free Quinceañera Expo</h3>
          <p style={{ fontSize: 13, color: 'rgba(250,216,233,.55)', maxWidth: 400, lineHeight: 1.6 }}>No tickets. No admission. Houston's best vendors, live demos, Q&A panels, and a fashion show — all free.</p>
        </div>
        <Link href="/events" style={{ background: 'transparent', color: '#C9A040', border: '0.5px solid rgba(201,160,64,.5)', padding: '11px 24px', borderRadius: 20, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>Get Early Access →</Link>
      </div>

      {/* VENDOR CTA */}
      <div style={{ padding: '0 28px 48px' }}>
        <div style={{ background: '#C97C8A', borderRadius: 18, padding: isMobile ? '28px 20px' : 40, display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: 24, flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: 28, color: '#fff', marginBottom: 6 }}>Are you a quinceañera vendor in Houston?</h2>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.8)', maxWidth: 420, lineHeight: 1.6, marginBottom: 16 }}>Get in front of thousands of Houston moms actively planning right now. Free to list. Upgrade when ready. No contracts.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Free Listing','Verified · $49/mo'].map(t => (
                <div key={t} style={{ background: 'rgba(255,255,255,.18)', border: '0.5px solid rgba(255,255,255,.3)', borderRadius: 20, padding: '8px 18px', fontSize: 12.5, color: '#fff' }}>{t}</div>
              ))}
              <div style={{ background: '#C9A040', borderRadius: 20, padding: '8px 18px', fontSize: 12.5, color: '#1a0a0f', fontWeight: 700 }}>Featured · $129/mo</div>
            </div>
          </div>
          <Link href="/get-listed" style={{ background: '#fff', color: '#C97C8A', border: 'none', padding: '13px 28px', borderRadius: 20, fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Claim Your Listing</Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
