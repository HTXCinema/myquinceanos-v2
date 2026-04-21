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
        <span className="font-serif" style={{ fontSize: 16, color: '#FAD8E9', fontWeight: 600, letterSpacing: .5 }}>My</span>
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
  if (tier === 'featured') return (
    <div style={{ position: 'absolute', top: 10, right: 10, background: '#C9A040', color: '#1a0a0f', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>Featured</div>
  )
  if (tier === 'premier') return (
    <div style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg,#C9A040,#e8c96a)', color: '#1a0a0f', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>⭐ Premier</div>
  )
  if (tier === 'verified') return (
    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(26,122,74,.9)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20 }}>✓ Verified</div>
  )
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
    if (tierFilter === 'featured' && !['featured','premier'].includes(v.tier)) return false
    return true
  }).sort((a, b) => {
    if (sort === 'rating') return b.avg_rating - a.avg_rating
    if (sort === 'reviews') return b.review_count - a.review_count
    if (sort === 'price_asc') return (a.starting_price || 0) - (b.starting_price || 0)
    const tierOrder: Record<string,number> = { premier: 4, featured: 3, verified: 2, free: 1 }
    return (tierOrder[b.tier] || 0) - (tierOrder[a.tier] || 0)
  })

  return (
    <>
      <Nav />
      <div style={{ background: '#1a0a0f', padding: '36px 28px 28px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 8 }}>Browse Vendors</div>
          <h1 className="font-serif" style={{ fontSize: 40, color: '#fff', marginBottom: 10 }}>Find Your Houston Vendors</h1>
          <p style={{ fontSize: 14, color: 'rgba(250,216,233,.6)', marginBottom: 24 }}>{vendors.length}+ trusted vendors · All reviewed by real Houston moms</p>
          <div style={{ background: 'rgba(255,255,255,.96)', borderRadius: 14, padding: '6px 6px 6px 16px', display: 'flex', gap: 8, alignItems: 'center', maxWidth: 520, margin: '0 auto' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors by name..."
              style={{ border: 'none', background: 'transparent', fontSize: 13, flex: 1, outline: 'none', padding: '6px 0' }} />
            <button style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Search</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'start' }}>
        {/* SIDEBAR */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: 20, position: 'sticky', top: 72 }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1, color: '#7a5c65' }}>Filter By</h3>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#1a0a0f', marginBottom: 8 }}>Category</div>
            {[{ name: 'All Categories', slug: '' }, ...categories].map(c => (
              <button key={c.slug} onClick={() => setCat(c.slug)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px', borderRadius: 8, border: 'none', background: cat === c.slug ? 'rgba(201,124,138,.12)' : 'transparent', color: cat === c.slug ? '#C97C8A' : '#555', fontSize: 12.5, cursor: 'pointer', marginBottom: 2 }}>
                {c.name}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#1a0a0f', marginBottom: 8 }}>Rating</div>
            {([[0,'Any'],[4,'4+ ★'],[4.5,'4.5+ ★'],[5,'5 ★ only']] as [number,string][]).map(([v,l]) => (
              <button key={v} onClick={() => setMinRating(v)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px', borderRadius: 8, border: 'none', background: minRating===v?'rgba(201,124,138,.12)':'transparent', color: minRating===v?'#C97C8A':'#555', fontSize: 12.5, cursor: 'pointer', marginBottom: 2 }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#1a0a0f', marginBottom: 8 }}>Type</div>
            {([['','All'],['verified','Verified+'],['featured','Featured+']] as [string,string][]).map(([v,l]) => (
              <button key={v} onClick={() => setTierFilter(v)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px', borderRadius: 8, border: 'none', background: tierFilter===v?'rgba(201,124,138,.12)':'transparent', color: tierFilter===v?'#C97C8A':'#555', fontSize: 12.5, cursor: 'pointer', marginBottom: 2 }}>
                {l}
              </button>
            ))}
          </div>

          {/* UPGRADE CTA IN SIDEBAR */}
          <div style={{ background: 'linear-gradient(135deg,#1a0a0f,#3a1525)', borderRadius: 12, padding: 16, border: '0.5px solid rgba(201,160,64,.3)' }}>
            <div style={{ fontSize: 11, color: '#C9A040', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Are you a vendor?</div>
            <p style={{ fontSize: 12, color: 'rgba(250,216,233,.7)', lineHeight: 1.5, marginBottom: 12 }}>Get found by Houston moms. Free to list, upgrade anytime.</p>
            <Link href="/get-listed" style={{ display: 'block', background: '#C97C8A', color: '#fff', textAlign: 'center', padding: '9px 0', borderRadius: 20, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              Get Listed Free →
            </Link>
          </div>
        </div>

        {/* VENDOR GRID */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 14, color: '#7a5c65' }}>{loading ? 'Loading...' : `${filtered.length} vendors found`}</span>
            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ border: '0.5px solid rgba(201,124,138,.25)', borderRadius: 8, padding: '7px 12px', fontSize: 13, outline: 'none', color: '#555' }}>
              <option value="recommended">Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="price_asc">Price Low–High</option>
            </select>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {Array.from({length:9}).map((_,i) => <div key={i} style={{height:280,background:'rgba(201,124,138,.06)',borderRadius:16}}/>)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div className="font-serif" style={{ fontSize: 22, color: '#1a0a0f', marginBottom: 8 }}>No vendors found</div>
              <button onClick={() => {setCat('');setSearch('');setMinRating(0);setTierFilter('')}}
                style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 20, fontSize: 13, cursor: 'pointer' }}>
                Clear filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {filtered.map(v => {
                const catSlug = (v.categories as any)?.slug || ''
                const isClaimed = v.is_claimed
                return (
                  <Link key={v.id} href={`/vendors/${v.slug}`}
                    style={{ textDecoration: 'none', background: '#fff', border: `0.5px solid ${v.tier === 'premier' ? 'rgba(201,160,64,.5)' : v.tier === 'featured' ? 'rgba(201,160,64,.3)' : 'rgba(201,124,138,.18)'}`, borderRadius: 16, overflow: 'hidden', display: 'block' }}>
                    <div style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
                      {v.cover_photo_url ? (
                        <div style={{ width: '100%', height: '100%', backgroundImage: `url(${v.cover_photo_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      ) : (
                        <VendorPlaceholder catSlug={catSlug} />
                      )}
                      <TierBadge tier={v.tier} />
                      {!isClaimed && (
                        <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(26,10,15,.7)', color: 'rgba(250,216,233,.6)', fontSize: 9, fontWeight: 500, padding: '3px 8px', borderRadius: 20, border: '0.5px solid rgba(250,216,233,.2)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                          Unclaimed
                        </div>
                      )}
                      {v.myquince_perk && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(201,160,64,.9)', padding: '6px 12px' }}>
                          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(26,10,15,.6)', fontWeight: 600 }}>MyQuince Perk</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#1a0a0f' }}>{v.myquince_perk}</div>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 10.5, color: '#C97C8A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 3 }}>{(v.categories as any)?.name || 'Vendor'}</div>
                      <div style={{ fontSize: 15, fontWeight: 500, color: '#1a0a0f', marginBottom: 5 }}>{v.business_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 5 }}>
                        <Stars rating={v.avg_rating} />
                        <span style={{ fontSize: 11.5, color: '#7a5c65', marginLeft: 4 }}>{v.avg_rating > 0 ? `${v.avg_rating} (${v.review_count})` : 'No reviews yet'}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#7a5c65' }}>
                        {v.starting_price ? <>Starting at <strong style={{ color: '#1a0a0f', fontWeight: 500 }}>${Number(v.starting_price).toLocaleString()}</strong></> : 'Contact for pricing'}
                      </div>
                      {/* Tier-gated info */}
                      {['featured','premier'].includes(v.tier) && v.website_url && (
                        <div style={{ marginTop: 6, fontSize: 11, color: '#C97C8A', fontWeight: 500 }}>🌐 Website available</div>
                      )}
                      {v.is_verified && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#e8f7ef', color: '#1a7a4a', fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, marginTop: 7 }}>
                          <div style={{ width: 5, height: 5, background: '#1a7a4a', borderRadius: '50%' }} />Mom-verified
                        </div>
                      )}
                      {!isClaimed && (
                        <div style={{ marginTop: 8, fontSize: 11, color: '#C97C8A', fontWeight: 500 }}>
                          Is this your business? <span style={{ textDecoration: 'underline' }}>Claim free →</span>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
