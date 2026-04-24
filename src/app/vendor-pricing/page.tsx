import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const TIERS = [
  {
    key: 'free', name: 'Starter', price: '$0', period: 'forever',
    features: ['Basic listing in the directory', 'Appears in category searches', 'Business name & description', 'Cover photo upload', 'Claimable anytime', 'Upgrade whenever you\'re ready'],
    cta: 'Submit free listing', ctaHref: '/get-listed', dark: false,
  },
  {
    key: 'featured', name: 'Featured', price: '$49', period: '/month',
    features: ['Everything in Free', 'Featured badge on profile', 'Priority placement in category', 'Full photo gallery (up to 10)', 'Website & contact links displayed', 'MyQuince Perk field', 'Homepage featured placement', 'Free booth at MyQuinceAños Expo', 'Founding Vendor badge (first in category)'],
    cta: 'Go featured — $49/mo', ctaHref: '/get-listed?tier=featured', dark: true,
  },
  {
    key: 'premier', name: 'Premier', price: '$129', period: '/month', popular: true,
    features: ['Everything in Featured', 'Top of all search results', '"Premier" badge on profile', 'Social media shoutout', 'Monthly performance report', 'Priority support', 'Dedicated account manager'],
    cta: 'Go premier — $129/mo', ctaHref: '/get-listed?tier=premier', dark: true,
  },
]

export default function VendorPricingPage() {
  return (
    <>
      <Nav />

      {/* Hero */}
      <div style={{ background: '#1a0a0f', padding: '56px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.4)', marginBottom: 10 }}>For Houston Quinceañera Vendors</div>
          <h1 className="font-serif" style={{ fontSize: 'clamp(30px, 8vw, 46px)', color: '#fff', marginBottom: 14, lineHeight: 1.2 }}>
            Reach Houston families<br /><em style={{ color: '#FAD8E9' }}>actively planning right now</em>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(250,216,233,.6)', lineHeight: 1.7, marginBottom: 28 }}>
            MyQuinceAños is Houston's only free quinceañera planning platform. Moms use our tools to plan, budget, and find vendors — all in one place.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, maxWidth: 400, margin: '0 auto' }}>
            {[['123+', 'Houston vendors listed'], ['Free', 'For every Houston family'], ['0%', 'Commission on bookings'], ['365', 'Days a year, always on']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div className="font-serif" style={{ fontSize: 28, color: '#C9A040', fontWeight: 600 }}>{n}</div>
                <div style={{ fontSize: 12, color: 'rgba(250,216,233,.45)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Founding Vendor Banner */}
      <div style={{ background: 'rgba(201,160,64,.12)', border: '0.5px solid rgba(201,160,64,.3)', margin: '0 24px', borderRadius: 14, padding: '20px 24px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ width: 32, height: 32, background: 'rgba(201,160,64,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A040" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#C9A040', marginBottom: 4 }}>Founding Vendor Status — Limited Availability</div>
          <p style={{ fontSize: 13, color: '#7a5c65', lineHeight: 1.6 }}>
            The first Featured vendor in each category earns permanent Founding Vendor status, guaranteed expo booth placement, and the exclusive Founding Vendor badge. Once claimed per category, it's gone forever.
          </p>
        </div>
      </div>

      {/* Pricing tiers — stacked on mobile */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
        <h2 className="font-serif" style={{ fontSize: 'clamp(24px, 6vw, 34px)', textAlign: 'center', marginBottom: 8 }}>Choose your listing plan</h2>
        <p style={{ textAlign: 'center', fontSize: 14, color: '#7a5c65', marginBottom: 36 }}>Start free. Upgrade when you're ready. No contracts, cancel anytime.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {TIERS.map(t => (
            <div key={t.key} style={{ background: t.dark ? '#1a0a0f' : '#fff', border: `0.5px solid ${'popular' in t && t.popular ? '#C9A040' : t.dark ? 'rgba(250,216,233,.12)' : 'rgba(201,124,138,.2)'}`, borderRadius: 18, padding: '28px 24px', position: 'relative' }}>
              {'popular' in t && t.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#C97C8A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: .5 }}>Most Popular</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: t.dark ? 'rgba(250,216,233,.4)' : '#7a5c65', marginBottom: 6 }}>{t.name}</div>
                  <div>
                    <span className="font-serif" style={{ fontSize: 40, fontWeight: 600, color: t.dark ? '#fff' : '#1a0a0f' }}>{t.price}</span>
                    <span style={{ fontSize: 13, color: t.dark ? 'rgba(250,216,233,.4)' : '#7a5c65', marginLeft: 4 }}>{t.period}</span>
                  </div>
                </div>
              </div>
              <div style={{ height: 0.5, background: t.dark ? 'rgba(250,216,233,.1)' : 'rgba(201,124,138,.15)', marginBottom: 18 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px 16px', marginBottom: 20 }}>
                {t.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, fontSize: 13, color: t.dark ? 'rgba(250,216,233,.7)' : '#555' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C97C8A" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20,6 9,17 4,12"/></svg>
                    {f}
                  </div>
                ))}
              </div>
              <Link href={t.ctaHref} style={{ display: 'block', textAlign: 'center', background: 'popular' in t && t.popular ? '#C9A040' : t.dark ? 'rgba(201,124,138,.2)' : 'transparent', color: 'popular' in t && t.popular ? '#1a0a0f' : t.dark ? '#FAD8E9' : '#1a0a0f', border: `0.5px solid ${'popular' in t && t.popular ? '#C9A040' : t.dark ? 'rgba(201,124,138,.3)' : 'rgba(26,10,15,.2)'}`, padding: '14px 0', borderRadius: 24, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 680, margin: '0 auto 48px', padding: '0 24px' }}>
        <h2 className="font-serif" style={{ fontSize: 28, textAlign: 'center', marginBottom: 28 }}>Questions vendors ask</h2>
        {[
          ['Is the free listing actually free?', 'Yes, forever. No hidden fees, no trial period. Your listing stays free as long as you want.'],
          ['Can I cancel anytime?', 'Yes. No contracts. Cancel your Featured or Premier subscription anytime from your vendor dashboard.'],
          ['What is the Founding Vendor badge?', 'The first Featured vendor in each category gets a permanent Founding Vendor badge, guaranteed expo booth placement, and is named in all our marketing materials. Once claimed per category, it\'s gone.'],
          ['How does the free expo booth work?', 'Featured vendors get a free table at the MyQuinceAños Houston Quince Expo. You choose your spot before non-featured vendors.'],
          ['Do you charge commission on bookings?', 'Never. Zero percent. You and the family handle booking directly — we never touch the transaction.'],
        ].map(([q, a]) => (
          <div key={q} style={{ borderBottom: '0.5px solid rgba(201,124,138,.15)', padding: '18px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#1a0a0f', marginBottom: 8 }}>{q}</div>
            <p style={{ fontSize: 13.5, color: '#7a5c65', lineHeight: 1.65, margin: 0 }}>{a}</p>
          </div>
        ))}
      </div>

      <Footer />
    </>
  )
}
