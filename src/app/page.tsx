'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

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

const FEATURED_VENDORS = [
  { name: 'DreamLite Productions', cat: 'Photography & Video', rating: 5.0, reviews: 52, price: 2800, perk: 'Free 1-hr engagement session', bg: 'linear-gradient(155deg,#3d1520 0%,#7a3545 55%,#c07080 100%)' },
  { name: 'Bell Tower on 34th', cat: 'Venues', rating: 4.9, reviews: 53, price: 5500, perk: 'Free venue lighting upgrade', bg: 'linear-gradient(155deg,#1d1030 0%,#5a3575 55%,#9570a5 100%)' },
  { name: 'Cabrera Photography', cat: 'Photography', rating: 4.7, reviews: 31, price: 1500, perk: 'Free closing waltz highlight edit', bg: 'linear-gradient(155deg,#152025 0%,#355060 55%,#658090 100%)' },
  { name: 'Ikonik Dancers & DJ', cat: 'DJs & Entertainment', rating: 5.0, reviews: 28, price: 1200, perk: 'Free hora loca add-on', bg: 'linear-gradient(155deg,#252010 0%,#706030 55%,#a09060 100%)' },
  { name: "Goyita's Catering", cat: 'Catering', rating: 4.8, reviews: 41, price: 3200, perk: 'Complimentary tasting for 4', bg: 'linear-gradient(155deg,#1a2510 0%,#4a6030 55%,#7a9050 100%)' },
  { name: 'Bella Luxe Events', cat: 'Decor & Flowers', rating: 4.9, reviews: 37, price: 2100, perk: 'Free centerpiece upgrade', bg: 'linear-gradient(155deg,#301520 0%,#704050 55%,#b07080 100%)' },
]

const REVIEWS = [
  { initials: 'MR', name: 'Maria Rodriguez', vendor: 'DreamLite Productions', date: 'Nov 2024', rating: 5, body: '"They captured every emotional moment perfectly. From the waltz to the last dance — my daughter cried watching the highlight reel. Worth every penny."', color: 'rgba(201,124,138,.25)', textColor: '#FAD8E9' },
  { initials: 'LC', name: 'Laura Castillo', vendor: 'Bell Tower on 34th', date: 'Aug 2024', rating: 5, body: '"Absolutely stunning. Staff was professional, everything ran on time, and our guests are still talking about it 6 months later."', color: 'rgba(175,169,236,.25)', textColor: '#ccc8f0' },
  { initials: 'AP', name: 'Ana Perez', vendor: 'Ikonik Dancers', date: 'Jan 2025', rating: 5, body: '"The surprise dance had everyone on their feet. They worked so patiently with all 14 chambelanes. Best investment of the whole quince."', color: 'rgba(93,202,165,.2)', textColor: '#9fe1cb' },
  { initials: 'SG', name: 'Sofia Guerrero', vendor: "Goyita's Catering", date: 'Mar 2025', rating: 4, body: '"Food was delicious, presentation gorgeous, 200 guests fed on time. Setup was 20 min late but the quality made up for it."', color: 'rgba(239,159,39,.2)', textColor: '#fac775' },
]

const SLIDERS = [
  { key: 'venue', label: 'Venue', pct: 26, color: '#C97C8A' },
  { key: 'photo', label: 'Photo / Video', pct: 17, color: '#C9A040' },
  { key: 'cater', label: 'Catering', pct: 21, color: '#5DCAA5' },
  { key: 'dj', label: 'DJ / Music', pct: 10, color: '#AFA9EC' },
  { key: 'dress', label: 'Dress', pct: 9, color: '#F4C0D1' },
  { key: 'decor', label: 'Decor', pct: 7, color: '#FAC775' },
  { key: 'makeup', label: 'Makeup & Hair', pct: 5, color: '#F0997B' },
  { key: 'other', label: 'Other', pct: 5, color: '#B4B2A9' },
]

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
  const [total, setTotal] = useState(18500)
  const [pcts, setPcts] = useState<Record<string, number>>(
    Object.fromEntries(SLIDERS.map(s => [s.key, s.pct]))
  )
  const [carouselIdx, setCarouselIdx] = useState(0)
  const carouselRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-rotate carousel
  useEffect(() => {
    carouselRef.current = setInterval(() => {
      setCarouselIdx(i => (i + 2) % FEATURED_VENDORS.length)
    }, 4000)
    return () => { if (carouselRef.current) clearInterval(carouselRef.current) }
  }, [])

  const visibleVendors = [
    FEATURED_VENDORS[carouselIdx % FEATURED_VENDORS.length],
    FEATURED_VENDORS[(carouselIdx + 1) % FEATURED_VENDORS.length],
    FEATURED_VENDORS[(carouselIdx + 2) % FEATURED_VENDORS.length],
  ]

  const sumPct = Object.values(pcts).reduce((a, b) => a + b, 0)
  const amounts = Object.fromEntries(
    SLIDERS.map(s => [s.key, Math.round((pcts[s.key] / sumPct) * total)])
  )
  const allocated = Object.values(amounts).reduce((a, b) => a + b, 0)
  const remaining = total - allocated

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString()

  return (
    <>
      <Nav />

      {/* HERO */}
      <section style={{ background: '#1a0a0f', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', height: 340, gap: 3 }}>
          {['Bell Tower on 34th', 'DreamLite Productions', 'La Hacienda Grand Ballroom'].map((label, i) => (
            <div key={i} style={{
              background: `linear-gradient(160deg, ${['#3d1520,#7a3545,#c07080','#1a0a0f,#4a2030,#8a4060','#2a1018,#5a2535,#a06080'][i]})`,
              position: 'relative'
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,10,15,.5)' }} />
              <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(26,10,15,.72)', color: '#fff', fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20, border: '0.5px solid rgba(255,255,255,.15)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 2 }}>
          <div style={{ background: 'rgba(201,160,64,.18)', border: '0.5px solid rgba(201,160,64,.4)', color: '#C9A040', fontSize: 11, fontWeight: 500, padding: '5px 14px', borderRadius: 20, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 14 }}>
            Houston's Quinceañera Planning Platform
          </div>
          <h1 className="font-serif text-center" style={{ fontSize: 44, fontWeight: 600, color: '#fff', lineHeight: 1.15, marginBottom: 10, maxWidth: 560 }}>
            Plan Your Daughter's <em style={{ color: '#FAD8E9' }}>Perfect</em> Quinceañera
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, textAlign: 'center', marginBottom: 22, maxWidth: 440, lineHeight: 1.6 }}>
            Trusted vendors, verified reviews from real moms, free planning tools — all in one place.
          </p>
          <div style={{ background: 'rgba(255,255,255,.96)', borderRadius: 14, padding: '6px 6px 6px 16px', display: 'flex', gap: 8, alignItems: 'center', width: '100%', maxWidth: 520 }}>
            <select style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#555', flex: 1, outline: 'none', padding: '6px 0' }}>
              <option>All Categories</option>
              <option>Photographers</option><option>Venues</option><option>DJs</option>
              <option>Catering</option><option>Makeup & Hair</option><option>Dresses</option>
            </select>
            <div style={{ width: 0.5, height: 20, background: '#ddd' }} />
            <select style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#555', outline: 'none', padding: '6px 0', width: 130 }}>
              <option>Houston, TX</option><option>Katy, TX</option>
              <option>Pearland, TX</option><option>Sugar Land, TX</option>
            </select>
            <Link href="/vendors" style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{ background: '#C97C8A', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
        {[['127+','Houston Vendors'],['12','Categories'],['100%','Mom-Verified Reviews'],['Free','To Start Planning']].map(([n,l])=>(
          <div key={l} style={{ padding: '14px 8px', textAlign: 'center', borderRight: '0.5px solid rgba(255,255,255,.25)' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
          {[
            { label: 'Planning Timeline', sub: '12-Month Timeline', desc: 'Step-by-step checklist from booking your venue to the morning of the event. Never miss a deadline.', href: '/planning', color: 'linear-gradient(160deg,#2a1520 0%,#7a4055 60%,#c08090 100%)' },
            { label: 'Budget Calculator', sub: 'Live Budget Slider', desc: 'Drag the sliders below — watch your budget split across every category in real time.', href: '#calculator', color: 'linear-gradient(160deg,#152025 0%,#355060 55%,#6090a0 100%)' },
            { label: 'Saved Vendor List', sub: 'Save Your Favorites', desc: 'Bookmark vendors, add notes, compare quotes. Sign in to save and track everything.', href: '/planning#saved', color: 'linear-gradient(160deg,#251830 0%,#604575 60%,#9070a0 100%)' },
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

        {/* LIVE BUDGET CALCULATOR */}
        <div id="calculator" style={{ background: '#1a0a0f', borderRadius: 18, padding: 32, marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
            <div>
              <h3 className="font-serif" style={{ fontSize: 22, color: '#fff', marginBottom: 6 }}>Live Budget Calculator</h3>
              <p style={{ fontSize: 13, color: 'rgba(250,216,233,.55)' }}>Drag any slider — everything adjusts automatically</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'rgba(250,216,233,.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Total Budget</div>
              <div className="font-serif" style={{ fontSize: 38, color: '#C9A040', lineHeight: 1 }}>{fmt(total)}</div>
            </div>
          </div>

          {/* Total slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'rgba(250,216,233,.55)', width: 100, flexShrink: 0 }}>Total Budget</span>
            <input type="range" min={5000} max={50000} step={500} value={total}
              onChange={e => setTotal(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#C9A040', background: `linear-gradient(to right, #C9A040 ${((total-5000)/(50000-5000))*100}%, rgba(255,255,255,.1) 0%)` }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#fff', width: 56, textAlign: 'right' }}>{fmt(total)}</span>
          </div>

          <div style={{ height: 0.5, background: 'rgba(255,255,255,.08)', margin: '10px 0' }} />

          {/* Category sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SLIDERS.map(s => {
              const pct = pcts[s.key]
              const fillPct = (pct / 40) * 100
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: 'rgba(250,216,233,.55)', width: 100, flexShrink: 0 }}>{s.label}</span>
                  <input type="range" min={1} max={40} step={1} value={pct}
                    onChange={e => setPcts(p => ({ ...p, [s.key]: Number(e.target.value) }))}
                    style={{ flex: 1, accentColor: s.color, background: `linear-gradient(to right, ${s.color} ${fillPct}%, rgba(255,255,255,.1) 0%)` }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#fff', width: 56, textAlign: 'right' }}>{fmt(amounts[s.key])}</span>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 16, fontSize: 12, textAlign: 'center', color: remaining >= 0 ? '#5DCAA5' : '#F0997B' }}>
            {remaining >= 0
              ? `✓ ${fmt(remaining)} unallocated — you're within budget`
              : `⚠ ${fmt(Math.abs(remaining))} over budget — adjust your sliders`}
          </div>
        </div>
      </section>

      {/* FEATURED VENDORS — CAROUSEL */}
      <section style={{ padding: '48px 28px', background: '#FDF6F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 8 }}>Featured Vendors</div>
            <h2 className="font-serif" style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.15 }}>Houston vendors families love</h2>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => { setCarouselIdx(i => (i - 1 + FEATURED_VENDORS.length) % FEATURED_VENDORS.length); if(carouselRef.current) clearInterval(carouselRef.current) }}
              style={{ width: 36, height: 36, borderRadius: '50%', border: '0.5px solid rgba(201,124,138,.3)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" fill="none" stroke="#C97C8A" strokeWidth="2"><polyline points="9,2 4,7 9,12"/></svg>
            </button>
            <button onClick={() => { setCarouselIdx(i => (i + 1) % FEATURED_VENDORS.length); if(carouselRef.current) clearInterval(carouselRef.current) }}
              style={{ width: 36, height: 36, borderRadius: '50%', border: '0.5px solid rgba(201,124,138,.3)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" fill="none" stroke="#C97C8A" strokeWidth="2"><polyline points="5,2 10,7 5,12"/></svg>
            </button>
            <Link href="/vendors" style={{ fontSize: 13, color: '#C97C8A', fontWeight: 500, textDecoration: 'none' }}>View all 127 →</Link>
          </div>
        </div>

        {/* Carousel dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
          {FEATURED_VENDORS.map((_, i) => (
            <button key={i} onClick={() => setCarouselIdx(i)}
              style={{ width: i === carouselIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === carouselIdx ? '#C97C8A' : 'rgba(201,124,138,.3)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {visibleVendors.map((v, i) => (
            <div key={i} style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 16, overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ height: 200, background: v.bg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', top: 10, right: 10, background: '#C9A040', color: '#1a0a0f', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>Featured</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(201,160,64,.9)', padding: '7px 12px' }}>
                  <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(26,10,15,.6)', fontWeight: 600 }}>MyQuince Perk</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1a0a0f' }}>{v.perk}</div>
                </div>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 10.5, color: '#C97C8A', fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 3 }}>{v.cat}</div>
                <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 5 }}>{v.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 5 }}>
                  <Stars rating={v.rating} />
                  <span style={{ fontSize: 11.5, color: '#7a5c65', marginLeft: 4 }}>{v.rating} ({v.reviews} reviews)</span>
                </div>
                <div style={{ fontSize: 13, color: '#7a5c65' }}>Starting at <strong style={{ color: '#1a0a0f', fontWeight: 500 }}>${v.price.toLocaleString()}</strong></div>
                <div className="badge-verified" style={{ marginTop: 7 }}>
                  <div style={{ width: 5, height: 5, background: '#1a7a4a', borderRadius: '50%' }} />
                  Mom-verified reviews
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: '48px 28px', background: '#1a0a0f' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.6)', marginBottom: 8 }}>Browse by Category</div>
            <h2 className="font-serif" style={{ fontSize: 34, fontWeight: 600, color: '#fff', lineHeight: 1.15 }}>Find what you need most</h2>
          </div>
          <Link href="/vendors" style={{ fontSize: 13, color: '#C97C8A', fontWeight: 500, textDecoration: 'none' }}>All 12 categories →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {CATEGORIES.map((c, i) => (
            <Link key={c.slug} href={`/vendors?category=${c.slug}`}
              style={{ gridColumn: c.span2 ? 'span 2' : undefined, borderRadius: 14, overflow: 'hidden', position: 'relative', cursor: 'pointer', textDecoration: 'none', display: 'block' }}>
              <div style={{ height: c.span2 ? 190 : 160, background: CAT_COLORS[i], position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,10,15,.4)' }} />
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 1 }}>{c.count} vendors</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ background: '#fff', padding: '52px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#C97C8A', marginBottom: 8 }}>Verified Reviews</div>
            <h2 className="font-serif" style={{ fontSize: 34, fontWeight: 600, color: '#1a0a0f', lineHeight: 1.15 }}>What Houston moms are saying</h2>
          </div>
        </div>

        {/* Trust pills */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {['Every review requires a contract or receipt','No fake reviews. No pay-to-win ratings.','Only moms who booked can leave a review'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(201,124,138,.06)', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 20, padding: '8px 16px' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A040" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              <span style={{ fontSize: 12, color: '#7a5c65' }}>{t}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {REVIEWS.map(r => (
            <div key={r.name} style={{ background: 'rgba(26,10,15,.03)', border: '0.5px solid rgba(201,124,138,.15)', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', gap: 11, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500, color: r.textColor, flexShrink: 0 }}>{r.initials}</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: '#fff' }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(250,216,233,.45)', marginTop: 2 }}>{r.vendor} · {r.date}</div>
                </div>
              </div>
              <div style={{ marginBottom: 10 }}><Stars rating={r.rating} /></div>
              <p style={{ fontSize: 13.5, color: '#4a3040', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12, borderLeft: '2px solid #C97C8A', paddingLeft: 12 }}>{r.body}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#5DCAA5', fontWeight: 500 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                Verified — contract submitted
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{ marginTop: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 20 }}>How our review system works</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              ['01','Mom books a vendor','After booking through MyQuinceAños, she gets an invite to share her experience once the event is done.'],
              ['02','Submit proof of purchase','She uploads her contract or receipt. Our team verifies it\'s real before the review ever goes live.'],
              ['03','Honest reviews stay forever','Vendors can\'t buy, delete, or bury bad reviews. The truth stays visible for every mom who comes after.'],
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

      {/* MOM LOGIN / SAVE VENDORS */}
      <section style={{ background: '#FAD8E9', padding: '40px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <h2 className="font-serif" style={{ fontSize: 28, color: '#1a0a0f', marginBottom: 6 }}>Save your vendors. Track your dates.</h2>
          <p style={{ fontSize: 13.5, color: '#7a5c65', maxWidth: 400, lineHeight: 1.6, marginBottom: 16 }}>
            Create a free mom account — saved vendors, event countdown, payment due dates, planning checklist, all in one dashboard.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            {['Save & compare vendors','Track payment due dates','Planning checklist','Event countdown'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#7a5c65' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C97C8A" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                {f}
              </div>
            ))}
          </div>
          {/* Mini dashboard preview */}
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
          <p style={{ fontSize: 13, color: 'rgba(250,216,233,.55)', maxWidth: 400, lineHeight: 1.6 }}>No tickets. No admission. Houston's best vendors, live demos, Q&A panels, and a fashion show — all free. One weekend. All Houston families welcome.</p>
        </div>
        <Link href="/events" style={{ background: 'transparent', color: '#C9A040', border: '0.5px solid rgba(201,160,64,.5)', padding: '11px 24px', borderRadius: 20, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>Get Early Access →</Link>
      </div>

      {/* VENDOR CTA */}
      <div style={{ padding: '0 28px 48px' }}>
        <div style={{ background: '#C97C8A', borderRadius: 18, padding: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: 28, color: '#fff', marginBottom: 6 }}>Are you a quinceañera vendor in Houston?</h2>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.8)', maxWidth: 420, lineHeight: 1.6, marginBottom: 16 }}>Get in front of thousands of Houston moms actively planning right now. Free to list. Upgrade when ready. No contracts.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Free Listing','Verified · $49/mo'].map(t => (
                <div key={t} style={{ background: 'rgba(255,255,255,.18)', border: '0.5px solid rgba(255,255,255,.3)', borderRadius: 20, padding: '8px 18px', fontSize: 12.5, color: '#fff' }}>{t}</div>
              ))}
              <div style={{ background: '#C9A040', border: '0.5px solid #C9A040', borderRadius: 20, padding: '8px 18px', fontSize: 12.5, color: '#1a0a0f', fontWeight: 700 }}>Featured · $129/mo</div>
            </div>
          </div>
          <Link href="/get-listed" style={{ background: '#fff', color: '#C97C8A', border: 'none', padding: '13px 28px', borderRadius: 20, fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Claim Your Listing</Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
