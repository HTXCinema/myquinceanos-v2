'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

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

export default function VendorPage({ params }: { params: { slug: string } }) {
  const [vendor, setVendor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('vendors')
        .select('*, categories(name, slug)')
        .eq('slug', params.slug)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setVendor(data)
      }
      setLoading(false)
    }
    load()
  }, [params.slug])

  if (loading) {
    return (
      <>
        <Nav />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 14, color: '#7a5c65' }}>Loading vendor...</div>
        </div>
        <Footer />
      </>
    )
  }

  if (notFound || !vendor) {
    return (
      <>
        <Nav />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div className="font-serif" style={{ fontSize: 28, color: '#1a0a0f' }}>Vendor not found</div>
          <Link href="/vendors" style={{ color: '#C97C8A', fontSize: 14 }}>← Back to all vendors</Link>
        </div>
        <Footer />
      </>
    )
  }

  const catSlug = vendor.categories?.slug || ''
  const catName = vendor.categories?.name || 'Vendor'
  const bg = vendor.cover_photo_url
    ? undefined
    : (CAT_COLORS[catSlug] || 'linear-gradient(155deg,#2a1520 0%,#6a3545 100%)')
  const isPaid = ['verified', 'featured', 'premier'].includes(vendor.tier)
  const isFeatured = ['featured', 'premier'].includes(vendor.tier)

  return (
    <>
      <Nav />

      {/* COVER */}
      <div style={{ height: 280, background: bg, backgroundImage: vendor.cover_photo_url ? `url(${vendor.cover_photo_url})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,10,15,.45)' }} />
        <div style={{ position: 'absolute', bottom: 20, left: 28, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {vendor.tier === 'premier' && <div style={{ background: 'linear-gradient(135deg,#C9A040,#e8c96a)', color: '#1a0a0f', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20 }}>⭐ Premier</div>}
          {vendor.tier === 'featured' && <div style={{ background: '#C9A040', color: '#1a0a0f', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20 }}>Featured</div>}
          {vendor.tier === 'verified' && <div style={{ background: 'rgba(26,122,74,.9)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20 }}>✓ Verified</div>}
          {vendor.founding_vendor && <div style={{ background: 'rgba(201,160,64,.2)', color: '#C9A040', border: '0.5px solid rgba(201,160,64,.5)', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20 }}>Founding Vendor</div>}
          {!vendor.is_claimed && <div style={{ background: 'rgba(26,10,15,.7)', color: 'rgba(250,216,233,.7)', fontSize: 11, padding: '5px 12px', borderRadius: 20, border: '0.5px solid rgba(250,216,233,.2)' }}>Unclaimed</div>}
        </div>
        <Link href="/vendors" style={{ position: 'absolute', top: 20, left: 28, background: 'rgba(26,10,15,.6)', color: '#fff', fontSize: 12, padding: '6px 14px', borderRadius: 20, textDecoration: 'none', border: '0.5px solid rgba(255,255,255,.15)' }}>
          ← All vendors
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 28px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>

        {/* MAIN */}
        <div>
          <div style={{ fontSize: 12, color: '#C97C8A', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>{catName}</div>
          <h1 className="font-serif" style={{ fontSize: 38, fontWeight: 600, marginBottom: 10 }}>{vendor.business_name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ color: i < Math.round(vendor.avg_rating) ? '#C9A040' : '#ddd', fontSize: 16 }}>★</span>)}
            </div>
            {vendor.avg_rating > 0
              ? <><span style={{ fontSize: 14, fontWeight: 500 }}>{vendor.avg_rating}</span><span style={{ fontSize: 14, color: '#7a5c65' }}>({vendor.review_count} reviews)</span></>
              : <span style={{ fontSize: 14, color: '#7a5c65' }}>No reviews yet</span>
            }
            {vendor.city && <><span style={{ color: '#ddd' }}>·</span><span style={{ fontSize: 14, color: '#7a5c65' }}>{vendor.city}, {vendor.state}</span></>}
          </div>

          {/* MyQuince Perk — featured/premier only */}
          {vendor.myquince_perk && isFeatured && (
            <div style={{ background: 'rgba(201,160,64,.1)', border: '0.5px solid rgba(201,160,64,.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A040" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#C9A040', marginBottom: 2 }}>MyQuince Perk</div>
                <div style={{ fontSize: 14, color: '#1a0a0f', fontWeight: 500 }}>{vendor.myquince_perk}</div>
              </div>
            </div>
          )}

          {/* About — paid only */}
          {isPaid && vendor.description && (
            <div style={{ marginBottom: 28 }}>
              <h2 className="font-serif" style={{ fontSize: 22, marginBottom: 12 }}>About</h2>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.75 }}>{vendor.description}</p>
            </div>
          )}

          {/* Upgrade prompt for free/unclaimed */}
          {!isPaid && (
            <div style={{ background: 'linear-gradient(135deg,#1a0a0f,#3a1525)', borderRadius: 14, padding: 24, marginBottom: 28, border: '0.5px solid rgba(201,160,64,.25)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#C9A040', marginBottom: 6 }}>Is this your business?</div>
              <p style={{ fontSize: 13, color: 'rgba(250,216,233,.7)', lineHeight: 1.6, marginBottom: 14 }}>
                Claim this listing to add photos, your full description, website link, and respond to reviews. Free to claim.
              </p>
              <Link href="/get-listed" style={{ display: 'inline-block', background: '#C97C8A', color: '#fff', padding: '10px 24px', borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                Claim this listing →
              </Link>
            </div>
          )}

          {/* Photos — verified/featured/premier only */}
          {isPaid ? (
            <div style={{ marginBottom: 28 }}>
              <h2 className="font-serif" style={{ fontSize: 22, marginBottom: 14 }}>Photos</h2>
              {vendor.logo_url ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  <img src={vendor.logo_url} alt={vendor.business_name} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10 }} />
                </div>
              ) : (
                <div style={{ background: 'rgba(201,124,138,.06)', border: '0.5px dashed rgba(201,124,138,.3)', borderRadius: 12, padding: '32px 0', textAlign: 'center', color: '#7a5c65', fontSize: 13 }}>
                  No photos uploaded yet
                  {vendor.is_claimed && <div style={{ marginTop: 8, fontSize: 12, color: '#C97C8A' }}>Log in to add photos →</div>}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: 28 }}>
              <h2 className="font-serif" style={{ fontSize: 22, marginBottom: 14 }}>Photos</h2>
              <div style={{ background: 'rgba(201,124,138,.04)', border: '0.5px dashed rgba(201,124,138,.25)', borderRadius: 12, padding: '32px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#7a5c65', marginBottom: 8 }}>Photos available on Verified listings</div>
                <Link href="/get-listed" style={{ fontSize: 12, color: '#C97C8A', fontWeight: 500, textDecoration: 'none' }}>Upgrade to Verified ($49/mo) →</Link>
              </div>
            </div>
          )}

          {/* Video — premier/featured only */}
          {isFeatured && vendor.video_url && (
            <div style={{ marginBottom: 28 }}>
              <h2 className="font-serif" style={{ fontSize: 22, marginBottom: 14 }}>Video</h2>
              <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9' }}>
                <iframe src={vendor.video_url} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="font-serif" style={{ fontSize: 22, marginBottom: 6 }}>Reviews</h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(201,124,138,.1)', color: '#C97C8A', fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 20, marginBottom: 8 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12" /></svg>
              Every review verified by contract or receipt
            </div>
            <p style={{ fontSize: 13, color: '#7a5c65', marginBottom: 20 }}>Only moms who have booked this vendor can leave a review.</p>
            {vendor.review_count > 0 ? (
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.15)', borderRadius: 14, padding: 20 }}>
                <p style={{ fontSize: 14, color: '#7a5c65' }}>Reviews coming soon...</p>
              </div>
            ) : (
              <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.15)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#7a5c65', marginBottom: 6 }}>No reviews yet</div>
                <div style={{ fontSize: 12, color: '#aaa' }}>Be the first mom to review this vendor after your event</div>
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ position: 'sticky', top: 72, display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Contact card */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 16, padding: 22 }}>
            <div className="font-serif" style={{ fontSize: 22, fontWeight: 600, color: '#1a0a0f', marginBottom: 4 }}>
              {vendor.starting_price ? `Starting at $${Number(vendor.starting_price).toLocaleString()}` : 'Contact for pricing'}
            </div>
            <div style={{ fontSize: 13, color: '#7a5c65', marginBottom: 20 }}>
              {vendor.price_range || 'Pricing varies by package'}
            </div>

            {/* Phone — always visible */}
            {vendor.phone && (
              <a href={`tel:${vendor.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#C97C8A', color: '#fff', padding: '13px 16px', borderRadius: 24, fontSize: 14, fontWeight: 600, textDecoration: 'none', marginBottom: 10, justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
                Call {vendor.phone}
              </a>
            )}

            {/* Email — verified+ only */}
            {isPaid && vendor.email && (
              <a href={`mailto:${vendor.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', color: '#1a0a0f', border: '0.5px solid rgba(26,10,15,.2)', padding: '11px 16px', borderRadius: 24, fontSize: 13, textDecoration: 'none', marginBottom: 10, justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                Email vendor
              </a>
            )}

            {/* Website — verified+ only */}
            {isPaid && vendor.website_url && (
              <a href={vendor.website_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', color: '#C97C8A', border: '0.5px solid rgba(201,124,138,.3)', padding: '11px 16px', borderRadius: 24, fontSize: 13, textDecoration: 'none', marginBottom: 10, justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
                Visit website
              </a>
            )}

            {/* Instagram — featured+ only */}
            {isFeatured && vendor.instagram_url && (
              <a href={vendor.instagram_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', color: '#555', border: '0.5px solid rgba(26,10,15,.12)', padding: '11px 16px', borderRadius: 24, fontSize: 13, textDecoration: 'none', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                Instagram
              </a>
            )}

            {/* Upgrade prompt if free */}
            {!isPaid && (
              <div style={{ marginTop: 12, padding: '12px 14px', background: 'rgba(201,124,138,.06)', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 6 }}>Want email & website links?</div>
                <Link href="/get-listed" style={{ fontSize: 12, color: '#C97C8A', fontWeight: 600, textDecoration: 'none' }}>Upgrade to Verified →</Link>
              </div>
            )}
          </div>

          {/* Response time */}
          <div style={{ background: '#FDF6F0', border: '0.5px solid rgba(201,124,138,.15)', borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#C97C8A', marginBottom: 12 }}>Vendor Info</div>
            {[
              vendor.city && `📍 ${vendor.city}, ${vendor.state}`,
              vendor.response_time_hrs && `⚡ Responds within ${vendor.response_time_hrs}hrs`,
              vendor.is_verified && '✓ Mom-verified reviews',
              vendor.founding_vendor && '🏅 Founding vendor',
            ].filter(Boolean).map(item => (
              <div key={String(item)} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: '#555' }}>
                {item}
              </div>
            ))}
          </div>

          {/* Share / save */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.15)', borderRadius: 14, padding: 18, display: 'flex', gap: 10 }}>
            <button onClick={() => navigator.share?.({ title: vendor.business_name, url: window.location.href })}
              style={{ flex: 1, background: 'transparent', border: '0.5px solid rgba(201,124,138,.25)', borderRadius: 20, padding: '9px 0', fontSize: 12, color: '#7a5c65', cursor: 'pointer' }}>
              Share
            </button>
            <Link href="/auth/signup" style={{ flex: 1, background: 'rgba(201,124,138,.1)', border: 'none', borderRadius: 20, padding: '9px 0', fontSize: 12, color: '#C97C8A', fontWeight: 500, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
              Save to List
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
