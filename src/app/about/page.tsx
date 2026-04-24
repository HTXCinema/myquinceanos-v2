import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <>
      <Nav />
      <div style={{ background: '#1a0a0f', padding: '60px 28px 48px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 12 }}>Our Story</div>
          <h1 className="font-serif" style={{ fontSize: 44, color: '#fff', lineHeight: 1.2, marginBottom: 16 }}>
            Built for Houston moms,<br /><em style={{ color: '#FAD8E9' }}>by people who care</em>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(250,216,233,.6)', lineHeight: 1.8, maxWidth: 540, margin: '0 auto' }}>
            MyQuinceAños was born out of frustration — watching families get burned by vendors who ghosted, overcharged, or simply weren't who they claimed to be online.
          </p>
        </div>
      </div>

      <div style={{ background: '#FDF6F0', padding: '56px 28px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 56, alignItems: 'center' }}>
            <div>
              <h2 className="font-serif" style={{ fontSize: 30, color: '#1a0a0f', marginBottom: 16 }}>Why we built this</h2>
              <p style={{ fontSize: 14, color: '#7a5c65', lineHeight: 1.8, marginBottom: 14 }}>
                A quinceañera is one of the most important days in a family's life. Moms spend months planning, saving, and coordinating dozens of vendors — and too often, they do it completely alone with nothing but Google and hope.
              </p>
              <p style={{ fontSize: 14, color: '#7a5c65', lineHeight: 1.8 }}>
                We built MyQuinceAños to change that. A free, trusted, Houston-specific platform where every vendor is verified and every review is real.
              </p>
            </div>
            <div style={{ background: 'linear-gradient(155deg,#3d1520,#7a3545,#c07080)', borderRadius: 20, height: 280 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 56 }}>
            {[
              { num: '123+', label: 'Verified vendors', sub: 'and growing every week' },
              { num: '100%', label: 'Mom-verified reviews', sub: 'every review requires proof' },
              { num: 'Free', label: 'For Houston families', sub: 'always free to plan and browse' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '28px 16px', background: '#fff', borderRadius: 16, border: '0.5px solid rgba(201,124,138,.15)' }}>
                <div className="font-serif" style={{ fontSize: 38, color: '#C97C8A', lineHeight: 1, marginBottom: 6 }}>{s.num}</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#1a0a0f', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: '#7a5c65' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#1a0a0f', borderRadius: 20, padding: '40px 36px', marginBottom: 48 }}>
            <h2 className="font-serif" style={{ fontSize: 28, color: '#fff', marginBottom: 20 }}>Our commitment to you</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                ['Free forever for moms', 'You will never pay to browse vendors, use planning tools, or read reviews on MyQuinceAños.'],
                ['Verified reviews only', 'Every review on our platform requires a contract, receipt, or booking confirmation. No fake reviews, ever.'],
                ['Houston-focused', 'We\'re not a national directory with a Houston filter. We\'re a Houston platform, built by Houstonians, for Houston families.'],
                ['No vendor pay-to-win', 'A vendor\'s star rating is determined by real reviews — not by how much they pay us. Period.'],
              ].map(([title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: 14, paddingBottom: 16, borderBottom: '0.5px solid rgba(250,216,233,.08)' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(201,124,138,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C97C8A" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 13, color: 'rgba(250,216,233,.5)', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2 className="font-serif" style={{ fontSize: 28, color: '#1a0a0f', marginBottom: 12 }}>Ready to start planning?</h2>
            <p style={{ fontSize: 14, color: '#7a5c65', marginBottom: 24 }}>Join hundreds of Houston moms already using MyQuinceAños.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/signup" style={{ background: '#C97C8A', color: '#fff', padding: '13px 28px', borderRadius: 24, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Create free account</Link>
              <Link href="/vendors" style={{ background: 'transparent', color: '#C97C8A', border: '0.5px solid #C97C8A', padding: '13px 28px', borderRadius: 24, fontSize: 14, textDecoration: 'none' }}>Browse vendors</Link>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
