import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const TIERS = [
  {
    key: 'free', name: 'Starter', price: '$0', period: 'forever',
    features: ['Basic listing in the directory','Appears in category searches','Business name & description','Claimable anytime','Upgrade whenever you\'re ready'],
    cta: 'Submit free listing', ctaHref: '/get-listed', dark: false,
  },
  {
    key: 'verified', name: 'Verified', price: '$59', period: '/month', popular: false,
    features: ['Everything in Free','Verified vendor badge on profile','Priority placement in your category','Photos & gallery (up to 10 photos)','Website & contact links displayed','Highlighted card in search results','Contact form from your profile'],
    cta: 'Get verified — $59/mo', ctaHref: '/get-listed?tier=verified', dark: true,
  },
  {
    key: 'featured', name: 'Featured', price: '$129', period: '/month', popular: true,
    features: ['Everything in Verified','Top of category search results','"Recommended" badge on profile','Homepage featured placement','MyQuince Perk field (exclusive offer)','Social media shoutout on listing','Monthly performance report','Free booth at MyQuinceAños Expo','Founding Vendor badge (first in category, permanent)'],
    cta: 'Go featured — $129/mo', ctaHref: '/get-listed?tier=featured', dark: true,
  },
]

export default function VendorPricingPage() {
  return (
    <>
      <Nav />

      {/* Hero */}
      <div style={{ background: '#1a0a0f', padding: '56px 28px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.4)', marginBottom: 10 }}>For Houston Quinceañera Vendors</div>
          <h1 className="font-serif" style={{ fontSize: 46, color: '#fff', marginBottom: 14, lineHeight: 1.2 }}>
            Reach Houston families<br /><em style={{ color: '#FAD8E9' }}>actively planning right now</em>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(250,216,233,.6)', lineHeight: 1.7, marginBottom: 28 }}>
            MyQuinceAños is Houston's only free quinceañera planning platform. Moms use our tools to plan, budget, and find vendors — all in one place. Your listing puts you in front of them at the exact moment they're ready to book.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['127+','Houston vendors listed'],['Free','For every Houston family'],['0%','Commission on bookings'],['365','Days a year, always on']].map(([n,l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div className="font-serif" style={{ fontSize: 28, color: '#C9A040', fontWeight: 600 }}>{n}</div>
                <div style={{ fontSize: 12, color: 'rgba(250,216,233,.45)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Founding Vendor Banner */}
      <div style={{ background: 'rgba(201,160,64,.12)', border: '0.5px solid rgba(201,160,64,.3)', margin: '0 28px', borderRadius: 14, padding: '20px 28px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ width: 36, height: 36, background: 'rgba(201,160,64,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A040" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#C9A040', marginBottom: 4 }}>Founding Vendor Status — Limited Availability</div>
          <p style={{ fontSize: 13, color: '#7a5c65', lineHeight: 1.6, maxWidth: 680 }}>
            The first vendor in each category to go <strong>Featured</strong> earns Founding Vendor status permanently. Your name appears in all expo marketing materials, you receive guaranteed first booth placement at every Houston Quinceañera Expo, and your profile carries the exclusive <strong>Founding Vendor badge</strong>. Once the spot is claimed in your category, it's gone forever.
          </p>
        </div>
      </div>

      {/* Pricing tiers */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 28px' }}>
        <h2 className="font-serif" style={{ fontSize: 34, textAlign: 'center', marginBottom: 8 }}>Choose your listing plan</h2>
        <p style={{ textAlign: 'center', fontSize: 14, color: '#7a5c65', marginBottom: 36 }}>Start free. Upgrade when you're ready. No contracts, cancel anytime.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {TIERS.map(t => (
            <div key={t.key} style={{ background: t.dark ? '#1a0a0f' : '#fff', border: `0.5px solid ${t.popular ? '#C9A040' : t.dark ? 'rgba(250,216,233,.12)' : 'rgba(201,124,138,.2)'}`, borderRadius: 18, padding: 28, position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {t.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#C97C8A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: .5 }}>Most Popular</div>}
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: t.dark ? 'rgba(250,216,233,.4)' : '#7a5c65', marginBottom: 8 }}>{t.name}</div>
              <div style={{ marginBottom: 20 }}>
                <span className="font-serif" style={{ fontSize: 40, fontWeight: 600, color: t.dark ? '#fff' : '#1a0a0f' }}>{t.price}</span>
                <span style={{ fontSize: 13, color: t.dark ? 'rgba(250,216,233,.4)' : '#7a5c65' }}>{t.period}</span>
              </div>
              <div style={{ height: 0.5, background: t.dark ? 'rgba(250,216,233,.1)' : 'rgba(201,124,138,.15)', marginBottom: 20 }} />
              <div style={{ flex: 1 }}>
                {t.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 10, fontSize: 13, color: t.dark ? 'rgba(250,216,233,.7)' : '#555' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C97C8A" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20,6 9,17 4,12"/></svg>
                    {f}
                  </div>
                ))}
              </div>
              <Link href={t.ctaHref} style={{ display: 'block', textAlign: 'center', background: t.popular ? '#C9A040' : t.dark ? 'rgba(201,124,138,.2)' : 'transparent', color: t.popular ? '#1a0a0f' : t.dark ? '#FAD8E9' : '#1a0a0f', border: `0.5px solid ${t.popular ? '#C9A040' : t.dark ? 'rgba(201,124,138,.3)' : 'rgba(26,10,15,.2)'}`, padding: '12px 0', borderRadius: 24, fontSize: 13, fontWeight: 600, textDecoration: 'none', marginTop: 24 }}>
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 680, margin: '0 auto 48px', padding: '0 28px' }}>
        <h2 className="font-serif" style={{ fontSize: 28, textAlign: 'center', marginBottom: 28 }}>Questions vendors ask</h2>
        {[
          ['Is the free listing actually free?', 'Yes, forever. No hidden fees, no trial period. Your listing stays free as long as you want.'],
          ['Can I cancel anytime?', 'Yes. No contracts. Cancel your Verified or Featured subscription anytime from your vendor dashboard.'],
          ['What is the Founding Vendor badge?', 'The first Featured vendor in each category gets a permanent Founding Vendor badge, guaranteed expo booth placement, and is named in all our marketing materials. Once claimed per category, it\'s gone.'],
          ['How does the free expo booth work?', 'Featured vendors get a free table at the MyQuinceAños Houston Quince Expo (Houston\'s first completely free quinceañera expo). You choose your spot before non-featured vendors.'],
          ['Do you charge commission on bookings?', 'Never. Zero percent. You and the family handle booking directly — we never touch the transaction.'],
        ].map(([q, a]) => (
          <div key={q} style={{ borderBottom: '0.5px solid rgba(201,124,138,.15)', padding: '18px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#1a0a0f', marginBottom: 8 }}>{q}</div>
            <p style={{ fontSize: 13.5, color: '#7a5c65', lineHeight: 1.65 }}>{a}</p>
          </div>
        ))}
      </div>

      <Footer />
    </>
  )
}
