'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { Vendor, Category } from '@/types'

const CAT_COLORS: Record<string, string> = {
  photographers: 'linear-gradient(155deg,#3d1520 0%,#7a3545 100%)',
  venues: 'linear-gradient(155deg,#1d1030 0%,#5a3575 100%)',
  catering: 'linear-gradient(155deg,#1a3025 0%,#3a7055 100%)',
  'djs-music': 'linear-gradient(155deg,#352510 0%,#907040 100%)',
  videography: 'linear-gradient(155deg,#1a2535 0%,#4a6080 100%)',
  'makeup-hair': 'linear-gradient(155deg,#352515 0%,#805535 100%)',
  'dresses-boutiques': 'linear-gradient(155deg,#251535 0%,#705080 100%)',
  choreographers: 'linear-gradient(155deg,#152530 0%,#356070 100%)',
  'cakes-bakeries': 'linear-gradient(155deg,#302010 0%,#806040 100%)',
  'decor-flowers': 'linear-gradient(155deg,#301520 0%,#704050 100%)',
  'limos-transport': 'linear-gradient(155deg,#152020 0%,#355555 100%)',
  entertainment: 'linear-gradient(155deg,#201525 0%,#604070 100%)',
}

function Stars({ rating }: { rating: number }) {
  return <span>{Array.from({ length: 5 }).map((_, i) => (
    <span key={i} style={{ color: i < Math.round(rating) ? '#C9A040' : '#ddd', fontSize: 12 }}>★</span>
  ))}</span>
}

function VendorPlaceholder({ catSlug }: { catSlug: string }) {
  const bg = CAT_COLORS[catSlug] || 'linear-gradient(155deg,#2a1520 0%,#6a3545 100%)'
  return (
    <div style={{ width: '100%', height: '100%', background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="font-serif" style={{ fontSize: 16, color: '#FAD8E9', fontWeight: 600 }}>My</span>
        <span className="font-serif" style={{ fontSize: 16, color: '#C9A040', fontWeight: 600 }}>Quince</span>
        <span className="font-serif" style={{ fontSize: 16, color: '#FAD8E9', fontWeight: 600 }}>Años</span>
      </div>
      <div style={{ background: 'rgba(201,124,138,.25)', border: '0.5px solid rgba(201,124,138,.4)', color: 'rgba(250,216,233,.7)', fontSize: 9, fontWeight: 600, padding: '3px 10px', borderRadius: 20, letterSpacing: '1.2px', textTransform: 'uppercase' }}>
        Unclaimed Listing
      </div>
    </div>
  )
}

function TierBadge({ tier }: { tier: string }) {
  if (tier === 'featured') return <div style={{ position: 'absolute', top: 10, right: 10, background: '#C9A040', color: '#1a0a0f', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>Featured</div>
  if (tier === 'premier') return <div style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg,#C9A040,#e8c96a)', color: '#1a0a0f', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>⭐ Premier</div>
  return null
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('')
  const [search, setSearch] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [tierFilter, setTierFilter] = useState('')
  const [sort, setSort] = useState('recommended')
  const [showFilters, setShowFilters] = useState(false)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: vData }, { data: cData }] = await Promise.all([
      supabase.from('vendors').select('*, categories(name, slug)').eq('is_active', true),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    setVendors(vData || [])
    setCategories(cData || [])
    setLoading(false)
  }

  const filtered = vendors.filter(v => {
    if (cat && (v.categories as any)?.slug !== cat) return false
    if (search && !v.business_name.toLowerCase().includes(search.toLowerCase())) return false
    if (minRating && v.avg_rating < minRating) return false
    if (tierFilter === 'verified' && v.tier === 'free') return false
    if (tierFilter === 'featured' && !['featured', 'premier'].includes(v.tier)) return false
    return true
  }).sort((a, b) => {
    if (sort === 'rating') return b.avg_rating - a.avg_rating
    if (sort === 'reviews') return b.review_count - a.review_count
    if (sort === 'price_asc') return (a.starting_price || 0) - (b.starting_price || 0)
    const tierOrder: Record<string, number> = { premier: 4, featured: 3, verified: 2, free: 1 }
    return (tierOrder[b.tier] || 0) - (tierOrder[a.tier] || 0)
  })

  const activeFilterCount = [cat, minRating > 0, tierFilter].filter(Boolean).length

  return (
    <>
      <Nav />

      {/* Hero */}
      <div style={{ background: '#1a0a0f', padding: '36px 24px 28px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 8 }}>Browse Vendors</div>
          <h1 className="font-serif" style={{ fontSize: 'clamp(28px, 7vw, 40px)', color: '#fff', marginBottom: 10 }}>Find Your Houston Vendors</h1>
          <p style={{ fontSize: 14, color: 'rgba(250,216,233,.6)', marginBottom: 20 }}>{vendors.length}+ trusted vendors · All reviewed by real Houston moms</p>
          <div style={{ background: 'rgba(255,255,255,.96)', borderRadius: 14, padding: '6px 6px 6px 16px', display: 'flex', gap: 8, alignItems: 'center', maxWidth: 520, margin: '0 auto' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors by name..."
              style={{ border: 'none', background: 'transparent', fontSize: 13, flex: 1, outline: 'none', padding: '6px 0', minWidth: 0 }} />
            <button style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>Search</button>
          </div>
        </div>
      </div>

      {/* Mobile category pills — horizontal scroll */}
      <div style={{ background: '#fff', borderBottom: '0.5px solid rgba(201,124,138,.12)', padding: '12px 16px', overflowX: 'auto', display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
        {[{ name: 'All', slug: '' }, ...categories].map(c => (
          <button key={c.slug} onClick={() => setCat(c.slug)}
            style={{ whiteSpace: 'nowrap', padding: '7px 14px', borderRadius: 20, border: `0.5px solid ${cat === c.slug ? '#C97C8A' : 'rgba(201,124,138,.25)'}`, background: cat === c.slug ? '#C97C8A' : 'transparent', color: cat === c.slug ? '#fff' : '#7a5c65', fontSize: 12, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
            {c.name}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px' }}>

        {/* Mobile filter bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowFilters(f => !f)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '0.5px solid rgba(201,124,138,.3)', background: showFilters ? 'rgba(201,124,138,.1)' : '#fff', color: '#555', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
              Filters {activeFilterCount > 0 && <span style={{ background: '#C97C8A', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{activeFilterCount}</span>}
            </button>
            <span style={{ fontSize: 13, color: '#7a5c65', alignSelf: 'center' }}>{loading ? '...' : `${filtered.length} vendors`}</span>
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ border: '0.5px solid rgba(201,124,138,.25)', borderRadius: 8, padding: '7px 10px', fontSize: 13, outline: 'none', color: '#555', background: '#fff' }}>
            <option value="recommended">Recommended</option>
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviews</option>
            <option value="price_asc">Price Low–High</option>
          </select>
        </div>

        {/* Collapsible filter panel */}
        {showFilters && (
          <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 20 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1a0a0f', marginBottom: 8 }}>Rating</div>
                {([[0, 'Any'], [4, '4+ ★'], [4.5, '4.5+ ★'], [5, '5 ★ only']] as [number, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => setMinRating(v)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px', borderRadius: 8, border: 'none', background: minRating === v ? 'rgba(201,124,138,.12)' : 'transparent', color: minRating === v ? '#C97C8A' : '#555', fontSize: 13, cursor: 'pointer', marginBottom: 2 }}>
                    {l}
                  </button>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#1a0a0f', marginBottom: 8 }}>Type</div>
                {([['', 'All'], ['verified', 'Verified+'], ['featured', 'Featured+']] as [string, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => setTierFilter(v)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px', borderRadius: 8, border: 'none', background: tierFilter === v ? 'rgba(201,124,138,.12)' : 'transparent', color: tierFilter === v ? '#C97C8A' : '#555', fontSize: 13, cursor: 'pointer', marginBottom: 2 }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={() => { setCat(''); setMinRating(0); setTierFilter('') }}
                style={{ marginTop: 12, fontSize: 12, color: '#C97C8A', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Vendor grid — 2 columns on mobile, 3 on desktop */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} style={{ height: 260, background: 'rgba(201,124,138,.06)', borderRadius: 16 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div className="font-serif" style={{ fontSize: 22, color: '#1a0a0f', marginBottom: 8 }}>No vendors found</div>
            <button onClick={() => { setCat(''); setSearch(''); setMinRating(0); setTierFilter('') }}
              style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
            {filtered.map(v => {
              const catSlug = (v.categories as any)?.slug || ''
              return (
                <Link key={v.id} href={`/vendors/${v.slug}`}
                  style={{ textDecoration: 'none', background: '#fff', border: `0.5px solid ${v.tier === 'premier' ? 'rgba(201,160,64,.5)' : v.tier === 'featured' ? 'rgba(201,160,64,.3)' : 'rgba(201,124,138,.18)'}`, borderRadius: 16, overflow: 'hidden', display: 'block' }}>
                  <div style={{ height: 150, position: 'relative', overflow: 'hidden' }}>
                    {v.cover_photo_url ? (
                      <div style={{ width: '100%', height: '100%', backgroundImage: `url(${v.cover_photo_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    ) : (
                      <VendorPlaceholder catSlug={catSlug} />
                    )}
                    <TierBadge tier={v.tier} />
                    {!v.is_claimed && (
                      <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(26,10,15,.7)', color: 'rgba(250,216,233,.6)', fontSize: 8, fontWeight: 500, padding: '2px 7px', borderRadius: 20, border: '0.5px solid rgba(250,216,233,.2)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        Unclaimed
                      </div>
                    )}
                    {v.myquince_perk && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(201,160,64,.9)', padding: '5px 10px' }}>
                        <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(26,10,15,.6)', fontWeight: 600 }}>Perk</div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#1a0a0f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.myquince_perk}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px 12px' }}>
                    <div style={{ fontSize: 10, color: '#C97C8A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 2 }}>{(v.categories as any)?.name || 'Vendor'}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1a0a0f', marginBottom: 4, lineHeight: 1.3 }}>{v.business_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 4 }}>
                      <Stars rating={v.avg_rating} />
                    </div>
                    <div style={{ fontSize: 12, color: '#7a5c65' }}>
                      {v.starting_price ? <>From <strong style={{ color: '#1a0a0f', fontWeight: 500 }}>${Number(v.starting_price).toLocaleString()}</strong></> : 'Contact for pricing'}
                    </div>
                    {!v.is_claimed && (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#C97C8A', fontWeight: 500 }}>
                        Claim free →
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Vendor CTA at bottom */}
        <div style={{ marginTop: 40, background: 'linear-gradient(135deg,#1a0a0f,#3a1525)', borderRadius: 16, padding: '24px 20px', border: '0.5px solid rgba(201,160,64,.3)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#C9A040', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Are you a vendor?</div>
          <p style={{ fontSize: 14, color: 'rgba(250,216,233,.7)', lineHeight: 1.5, marginBottom: 16 }}>Get found by Houston moms. Free to list, upgrade anytime.</p>
          <Link href="/get-listed" style={{ display: 'inline-block', background: '#C97C8A', color: '#fff', textAlign: 'center', padding: '12px 28px', borderRadius: 24, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Get Listed Free →
          </Link>
        </div>

      </div>
      <Footer />
    </>
  )
}
