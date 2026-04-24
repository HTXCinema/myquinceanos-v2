import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export default function ContactPage() {
  return (
    <>
      <Nav />
      <div style={{ background: '#1a0a0f', padding: '60px 28px 48px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 12 }}>Get in Touch</div>
          <h1 className="font-serif" style={{ fontSize: 44, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>Contact Us</h1>
          <p style={{ fontSize: 15, color: 'rgba(250,216,233,.6)', lineHeight: 1.8 }}>
            Questions, feedback, or need help? We're a small team and we actually read every message.
          </p>
        </div>
      </div>

      <div style={{ background: '#FDF6F0', padding: '56px 28px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>

          {/* Contact options */}
          <div>
            <h2 className="font-serif" style={{ fontSize: 26, color: '#1a0a0f', marginBottom: 24 }}>How to reach us</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  icon: '📧',
                  title: 'Email us',
                  desc: 'For general questions, vendor support, or feedback',
                  action: 'contact@myquinceanos.com',
                  href: 'mailto:contact@myquinceanos.com',
                },
                {
                  icon: '🏢',
                  title: 'Vendor support',
                  desc: 'Questions about listings, claims, or upgrading your plan',
                  action: 'contact@myquinceanos.com',
                  href: 'mailto:contact@myquinceanos.com',
                },
                {
                  icon: '⚠️',
                  title: 'Report a problem',
                  desc: 'Incorrect listing info, review disputes, or technical issues',
                  action: 'contact@myquinceanos.com',
                  href: 'mailto:contact@myquinceanos.com',
                },
              ].map(c => (
                <div key={c.title} style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.15)', borderRadius: 14, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 22, flexShrink: 0 }}>{c.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#1a0a0f', marginBottom: 3 }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 8, lineHeight: 1.5 }}>{c.desc}</div>
                      <a href={c.href} style={{ fontSize: 13, color: '#C97C8A', fontWeight: 500, textDecoration: 'none' }}>{c.action} →</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(201,124,138,.06)', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: '#7a5c65', lineHeight: 1.6 }}>
                <strong style={{ color: '#1a0a0f' }}>Response time:</strong> We typically respond within 1 business day. For urgent vendor issues, email us directly and include your business name in the subject line.
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-serif" style={{ fontSize: 26, color: '#1a0a0f', marginBottom: 24 }}>Common questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                {
                  q: 'How do I claim my vendor listing?',
                  a: 'Find your business in our vendor directory, click "Claim this listing" and create an account. You\'ll be connected to your existing listing immediately.',
                },
                {
                  q: 'Is MyQuinceAños really free for moms?',
                  a: 'Yes, completely free. Browse vendors, use planning tools, save favorites, and read reviews — all at no cost.',
                },
                {
                  q: 'How do I upgrade my vendor listing?',
                  a: 'Log in to your vendor dashboard and click "Upgrade Plan". Featured listings start at $49/mo, Premier at $129/mo.',
                },
                {
                  q: 'My business information is wrong. How do I fix it?',
                  a: 'Claim your listing through the vendor profile page, then update your info in the dashboard. Or email us and we\'ll fix it manually.',
                },
                {
                  q: 'How do I submit a review?',
                  a: 'After your event, log in with your mom account, find your vendor, and click "Leave a Review". You\'ll need to upload a contract or receipt as verification.',
                },
              ].map(faq => (
                <div key={faq.q} style={{ paddingBottom: 16, borderBottom: '0.5px solid rgba(201,124,138,.1)' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#1a0a0f', marginBottom: 6 }}>{faq.q}</div>
                  <div style={{ fontSize: 13, color: '#7a5c65', lineHeight: 1.6 }}>{faq.a}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
