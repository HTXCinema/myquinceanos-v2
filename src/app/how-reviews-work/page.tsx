import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function HowReviewsWorkPage() {
  return (
    <>
      <Nav />
      <div style={{ background: '#1a0a0f', padding: '60px 28px 48px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 12 }}>Verified Reviews</div>
          <h1 className="font-serif" style={{ fontSize: 44, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>
            Every review is <em style={{ color: '#FAD8E9' }}>real</em>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(250,216,233,.6)', lineHeight: 1.8 }}>
            We built the strictest review system in the quinceañera industry. Here's exactly how it works.
          </p>
        </div>
      </div>

      <div style={{ background: '#FDF6F0', padding: '56px 28px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 56 }}>
            {[
              {
                num: '01',
                title: 'Mom books a vendor through MyQuinceAños',
                desc: 'When a mom finds a vendor she loves and books them, she gets an invitation to share her experience after the event. Only moms who have actually booked can leave a review.',
                color: 'rgba(201,124,138,.15)',
                border: 'rgba(201,124,138,.25)',
              },
              {
                num: '02',
                title: 'She submits proof of purchase',
                desc: 'To submit a review, the mom must upload one of the following: a signed vendor contract, a payment receipt, or a booking confirmation. Our team reviews every submission manually.',
                color: 'rgba(93,202,165,.1)',
                border: 'rgba(93,202,165,.25)',
              },
              {
                num: '03',
                title: 'Our team verifies it\'s real',
                desc: 'We check that the document matches the vendor being reviewed and that it\'s a genuine transaction. If something looks off, we follow up before publishing anything.',
                color: 'rgba(201,160,64,.1)',
                border: 'rgba(201,160,64,.25)',
              },
              {
                num: '04',
                title: 'The review goes live — and stays live',
                desc: 'Once verified, the review is published permanently. Vendors cannot pay to remove, hide, or bury reviews. What you read is the real experience of a real Houston mom.',
                color: 'rgba(175,169,236,.12)',
                border: 'rgba(175,169,236,.25)',
              },
            ].map((step, i) => (
              <div key={step.num} style={{ display: 'flex', gap: 24, paddingBottom: 32, position: 'relative' }}>
                {i < 3 && (
                  <div style={{ position: 'absolute', left: 19, top: 52, width: 2, height: 'calc(100% - 20px)', background: 'rgba(201,124,138,.15)', zIndex: 0 }} />
                )}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: step.color, border: `0.5px solid ${step.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                  <span className="font-serif" style={{ fontSize: 14, fontWeight: 600, color: '#1a0a0f' }}>{step.num}</span>
                </div>
                <div style={{ paddingTop: 8 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 500, color: '#1a0a0f', marginBottom: 8 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: '#7a5c65', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* What we don't allow */}
          <div style={{ background: '#1a0a0f', borderRadius: 20, padding: '36px 36px', marginBottom: 48 }}>
            <h2 className="font-serif" style={{ fontSize: 26, color: '#fff', marginBottom: 20 }}>What we never allow</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                'Vendors paying to remove bad reviews',
                'Anonymous reviews with no proof',
                'Vendors leaving reviews for themselves',
                'Incentivized 5-star review campaigns',
                'Reviews from people who didn\'t book',
                'Fake accounts or duplicate reviews',
              ].map(item => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'rgba(250,216,233,.65)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* For vendors */}
          <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 20, padding: '36px', marginBottom: 48 }}>
            <h2 className="font-serif" style={{ fontSize: 26, color: '#1a0a0f', marginBottom: 12 }}>For vendors</h2>
            <p style={{ fontSize: 14, color: '#7a5c65', lineHeight: 1.7, marginBottom: 16 }}>
              We know a fair review system benefits everyone — including vendors. When moms trust our reviews, they trust the vendors in our directory. That trust drives bookings.
            </p>
            <p style={{ fontSize: 14, color: '#7a5c65', lineHeight: 1.7, marginBottom: 20 }}>
              If you believe a review about your business was submitted fraudulently or contains false information, contact us at <a href="mailto:contact@myquinceanos.com" style={{ color: '#C97C8A' }}>contact@myquinceanos.com</a> and we'll investigate.
            </p>
            <Link href="/get-listed" style={{ background: '#C97C8A', color: '#fff', padding: '12px 24px', borderRadius: 24, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Get listed →</Link>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: '#7a5c65', marginBottom: 20 }}>Have questions about our review process?</p>
            <Link href="/contact" style={{ color: '#C97C8A', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>Contact us →</Link>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
