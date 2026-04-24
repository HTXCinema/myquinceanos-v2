import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#1a0a0f', borderTop: '0.5px solid rgba(250,216,233,0.07)' }}
      className="px-7 pt-10 pb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8"
        style={{ borderBottom: '0.5px solid rgba(250,216,233,0.07)', marginBottom: 20 }}>
        <div>
          <div className="font-serif text-lg mb-2" style={{ color: '#FAD8E9' }}>
            My<span style={{ color: '#C9A040' }}>Quince</span>Años
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(250,216,233,0.35)', maxWidth: 200 }}>
            Houston's trusted quinceañera planning platform. Built for moms, by people who care.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'rgba(250,216,233,0.3)' }}>For Moms</h4>
          {[
            ['Find Vendors', '/vendors'],
            ['Budget Calculator', '/#calculator'],
            ['Planning Hub', '/planning'],
            ['Events', '/events'],
          ].map(([l, h]) => (
            <Link key={h} href={h} className="block text-xs mb-2"
              style={{ color: 'rgba(250,216,233,0.5)' }}>{l}</Link>
          ))}
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'rgba(250,216,233,0.3)' }}>For Vendors</h4>
          {[
            ['Get Listed', '/get-listed'],
            ['Vendor Pricing', '/vendor-pricing'],
            ['Vendor Dashboard', '/vendor-dashboard'],
          ].map(([l, h]) => (
            <Link key={h} href={h} className="block text-xs mb-2"
              style={{ color: 'rgba(250,216,233,0.5)' }}>{l}</Link>
          ))}
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'rgba(250,216,233,0.3)' }}>Company</h4>
          {[
            ['About Us', '/about'],
            ['How Reviews Work', '/how-reviews-work'],
            ['Contact', '/contact'],
            ['Español', '/?lang=es'],
          ].map(([l, h]) => (
            <Link key={h} href={h} className="block text-xs mb-2"
              style={{ color: 'rgba(250,216,233,0.5)' }}>{l}</Link>
          ))}
        </div>
      </div>
      <div className="flex justify-between text-xs flex-wrap gap-2" style={{ color: 'rgba(250,216,233,0.22)' }}>
        <span>© 2026 MyQuinceAños · Houston, TX</span>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/privacy" style={{ color: 'rgba(250,216,233,0.22)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/terms" style={{ color: 'rgba(250,216,233,0.22)', textDecoration: 'none' }}>Terms</Link>
          <Link href="/sitemap" style={{ color: 'rgba(250,216,233,0.22)', textDecoration: 'none' }}>Sitemap</Link>
        </div>
      </div>
    </footer>
  )
}
