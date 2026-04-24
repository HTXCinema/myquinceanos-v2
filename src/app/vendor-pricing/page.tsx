import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const FEATURES = [
  { label: 'Directory listing', free: true, featured: true, premier: true },
  { label: 'Cover photo', free: true, featured: true, premier: true },
  { label: 'Category search', free: true, featured: true, premier: true },
  { label: 'Claimable profile', free: true, featured: true, premier: true },
  { label: 'Full photo gallery', free: false, featured: true, premier: true },
  { label: 'Website & contact links', free: false, featured: true, premier: true },
  { label: 'MyQuince Perk field', free: false, featured: true, premier: true },
  { label: 'Homepage placement', free: false, featured: true, premier: true },
  { label: 'Free expo booth', free: false, featured: true, premier: true },
  { label: 'Founding Vendor badge', free: false, featured: true, premier: true },
  { label: 'Top search placement', free: false, featured: false, premier: true },
  { label: 'Social media shoutout', free: false, featured: false, premier: true },
  { label: 'Monthly report', free: false, featured: false, premier: true },
  { label: 'Priority support', free: false, featured: false, premier: true },
]

const check = (val: boolean, highlight?: boolean) => val
  ? <span style={{ color: highlight ? '#C9A040' : '#1a7a4a', fontSize: 16, fontWeight: 700 }}>✓</span>
  : <span style={{ color: '#ddd', fontSize: 16 }}>–</span>

export default function VendorPricingPage() {
  return (
    <>
      <Nav />

      {/* Hero */}
      <div style={{ background: '#1a0a0f', padding: '56px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.4)', marginBottom: 10 }}>For Houston Quinceañera Vendors</div>
          <h1 className="font-serif" style={{ fontSize: 'clamp(28px,8vw,46px)', color: '#fff', marginBottom: 14, lineHeight: 1.2 }}>
            Reach Houston families<br /><em style={{ color: '#FAD8E9' }}>actively planning right now</em>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(250,216,233,.6)', lineHeight: 1.7, marginBottom: 28 }}>
            MyQuinceAños is Houston's only free quinceañera planning platform. Moms use our tools to plan, budget, and find vendors — all in one place.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, maxWidth: 360, margin: '0 auto' }}>
            {[['123+', 'Houston vendors'], ['Free', 'For families'], ['0%', 'Commission'], ['365', 'Days a year']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div className="font-serif" style={{ fontSize: 26, color: '#C9A040', fontWeight: 600 }}>{n}</div>
                <div style={{ fontSize: 12, color: 'rgba(250,216,233,.45)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Founding Vendor Banner */}
      <div style={{ background: 'rgba(201,160,64,.08)', border: '0.5px solid rgba(201,160,64,.25)', margin: '24px 16px 0', borderRadius: 14, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>⭐</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#C9A040', marginBottom: 4 }}>Founding Vendor — Limited per category</div>
          <p style={{ fontSize: 13, color: '#7a5c65', lineHeight: 1.5, margin: 0 }}>
            First Featured vendor in each category gets a permanent badge, guaranteed expo booth, and marketing inclusion. Once claimed, it's gone.
          </p>
        </div>
      </div>

      {/* PRICING — compact comparison that fits on one screen */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 0' }}>
        <h2 className="font-serif" style={{ fontSize: 'clamp(22px,6vw,32px)', textAlign: 'center', marginBottom: 6 }}>Choose your plan</h2>
        <p style={{ textAlign: 'center', fontSize: 14, color: '#7a5c65', marginBottom: 24 }}>Start free. Upgrade when ready. No contracts.</p>

        {/* Desktop: 3 column cards */}
        <div className="pricing-desktop" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 48 }}>
          {[
            { name: 'Starter', price: '$0', period: 'forever', dark: false, popular: false, href: '/get-listed', cta: 'Submit free listing' },
            { name: 'Featured', price: '$49', period: '/month', dark: true, popular: false, href: '/get-listed?tier=featured', cta: 'Go featured — $49/mo' },
            { name: 'Premier', price: '$129', period: '/month', dark: true, popular: true, href: '/get-listed?tier=premier', cta: 'Go premier — $129/mo' },
          ].map((t, ti) => {
            const feats = FEATURES.filter(f => ti === 0 ? f.free : ti === 1 ? f.featured : f.premier)
            return (
              <div key={t.name} style={{ background: t.dark ? '#1a0a0f' : '#fff', border: `0.5px solid ${t.popular ? '#C9A040' : t.dark ? 'rgba(250,216,233,.12)' : 'rgba(201,124,138,.2)'}`, borderRadius: 18, padding: 24, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {t.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#C97C8A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap' }}>Most Popular</div>}
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: t.dark ? 'rgba(250,216,233,.4)' : '#7a5c65', marginBottom: 8 }}>{t.name}</div>
                <div style={{ marginBottom: 16 }}>
                  <span className="font-serif" style={{ fontSize: 38, fontWeight: 600, color: t.dark ? '#fff' : '#1a0a0f' }}>{t.price}</span>
                  <span style={{ fontSize: 13, color: t.dark ? 'rgba(250,216,233,.4)' : '#7a5c65' }}>{t.period}</span>
                </div>
                <div style={{ height: 0.5, background: t.dark ? 'rgba(250,216,233,.1)' : 'rgba(201,124,138,.15)', marginBottom: 16 }} />
                <div style={{ flex: 1 }}>
                  {feats.map(f => (
                    <div key={f.label} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: t.dark ? 'rgba(250,216,233,.7)' : '#555' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C97C8A" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20,6 9,17 4,12"/></svg>
                      {f.label}
                    </div>
                  ))}
                </div>
                <Link href={t.href} style={{ display: 'block', textAlign: 'center', background: t.popular ? '#C9A040' : t.dark ? 'rgba(201,124,138,.2)' : 'transparent', color: t.popular ? '#1a0a0f' : t.dark ? '#FAD8E9' : '#1a0a0f', border: `0.5px solid ${t.popular ? '#C9A040' : t.dark ? 'rgba(201,124,138,.3)' : 'rgba(26,10,15,.2)'}`, padding: '12px 0', borderRadius: 24, fontSize: 13, fontWeight: 600, textDecoration: 'none', marginTop: 20 }}>
                  {t.cta}
                </Link>
              </div>
            )
          })}
        </div>

        {/* Mobile: compact comparison table — all 3 visible at once */}
        <div className="pricing-mobile" style={{ marginBottom: 48 }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', background: '#1a0a0f', borderRadius: '14px 14px 0 0', padding: '14px 8px' }}>
            <div style={{ fontSize: 11, color: 'rgba(250,216,233,.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Features</div>
            {[
              { name: 'Free', price: '$0' },
              { name: 'Featured', price: '$49/mo' },
              { name: 'Premier', price: '$129/mo', gold: true },
            ].map(t => (
              <div key={t.name} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.gold ? '#C9A040' : 'rgba(250,216,233,.7)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.name}</div>
                <div className="font-serif" style={{ fontSize: 15, fontWeight: 600, color: t.gold ? '#C9A040' : '#fff', marginTop: 2 }}>{t.price}</div>
              </div>
            ))}
          </div>

          {/* Feature rows */}
          {FEATURES.map((f, i) => (
            <div key={f.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '10px 8px', background: i % 2 === 0 ? '#fff' : '#fdf6f0', borderLeft: '0.5px solid rgba(201,124,138,.12)', borderRight: '0.5px solid rgba(201,124,138,.12)', borderBottom: '0.5px solid rgba(201,124,138,.08)' }}>
              <div style={{ fontSize: 12, color: '#4a3040', lineHeight: 1.3, paddingRight: 6 }}>{f.label}</div>
              <div style={{ textAlign: 'center' }}>{check(f.free)}</div>
              <div style={{ textAlign: 'center' }}>{check(f.featured)}</div>
              <div style={{ textAlign: 'center' }}>{check(f.premier, true)}</div>
            </div>
          ))}

          {/* CTA row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, padding: '14px 8px', background: '#fff', borderRadius: '0 0 14px 14px', border: '0.5px solid rgba(201,124,138,.15)', borderTop: 'none' }}>
            <div />
            <div style={{ textAlign: 'center' }}>
              <Link href="/get-listed" style={{ display: 'block', background: 'transparent', color: '#1a0a0f', border: '0.5px solid rgba(26,10,15,.2)', padding: '8px 4px', borderRadius: 20, fontSize: 11, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>Start free</Link>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link href="/get-listed?tier=featured" style={{ display: 'block', background: 'rgba(201,124,138,.15)', color: '#C97C8A', border: '0.5px solid rgba(201,124,138,.3)', padding: '8px 4px', borderRadius: 20, fontSize: 11, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>$49/mo</Link>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link href="/get-listed?tier=premier" style={{ display: 'block', background: '#C9A040', color: '#1a0a0f', border: 'none', padding: '8px 4px', borderRadius: 20, fontSize: 11, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>$129/mo</Link>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 680, margin: '0 auto 48px', padding: '0 16px' }}>
        <h2 className="font-serif" style={{ fontSize: 26, textAlign: 'center', marginBottom: 24 }}>Questions vendors ask</h2>
        {[
          ['Is the free listing actually free?', 'Yes, forever. No hidden fees, no trial period. Your listing stays free as long as you want.'],
          ['Can I cancel anytime?', 'Yes. No contracts. Cancel your Featured or Premier subscription anytime from your vendor dashboard.'],
          ['What is the Founding Vendor badge?', 'The first Featured vendor in each category gets a permanent badge, guaranteed expo booth placement, and is named in all our marketing. Once claimed per category, it\'s gone.'],
          ['How does the free expo booth work?', 'Featured vendors get a free table at the MyQuinceAños Houston Quince Expo. You choose your spot before non-featured vendors.'],
          ['Do you charge commission on bookings?', 'Never. Zero percent. You and the family handle booking directly — we never touch the transaction.'],
        ].map(([q, a]) => (
          <div key={q} style={{ borderBottom: '0.5px solid rgba(201,124,138,.15)', padding: '16px 0' }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#1a0a0f', marginBottom: 8 }}>{q}</div>
            <p style={{ fontSize: 13, color: '#7a5c65', lineHeight: 1.65, margin: 0 }}>{a}</p>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .pricing-desktop { display: none !important; }
          .pricing-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .pricing-desktop { display: grid !important; }
          .pricing-mobile { display: none !important; }
        }
      `}</style>

      <Footer />
    </>
  )
}
