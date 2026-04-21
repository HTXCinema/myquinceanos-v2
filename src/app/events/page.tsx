import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const EVENTS = [
  { title: 'The MyQuinceAnos Free Expo', type: 'expo', date: '2026 - Date TBA', location: 'Houston, TX - Venue TBA', description: "Houston's first completely free quinceañera expo. No tickets. No admission. Just Houston families meeting Houston's best vendors - free, forever.", free: true, myq: true, status: 'coming_soon', ctaLabel: 'Get Notified', ctaHref: '/events/myq-expo', bg: 'linear-gradient(155deg,#2a0a15 0%,#6a2535 55%,#c97c8a 100%)' },
  { title: '2026 Houston Quinceañera Expo', type: 'expo', date: 'Sun, Feb 22, 2026 - 12-5 PM', location: 'George R. Brown Convention Center, Houston TX', description: 'The biggest quinceañera expo in Texas with 100+ vendors under one roof - venues, photographers, DJs, cakes, dresses, decor and more. Four fashion shows included.', free: false, price: '$12 presale - $15 door', status: 'upcoming', ctaLabel: 'Get Tickets', ctaHref: '#', bg: 'linear-gradient(155deg,#151525 0%,#354070 55%,#6070a0 100%)' },
  { title: 'My 15 Expo - Houston', type: 'expo', date: 'Sun, Jan 18, 2026 - 12-5 PM', location: 'NRG Center Exhibit Hall A1-A3, Houston TX', description: '22 years running - the largest quinceañera trade show in the country. Get access to the best vendors, planning resources, and inspiration all in one place.', free: true, status: 'upcoming', ctaLabel: 'Learn More', ctaHref: '#', bg: 'linear-gradient(155deg,#201525 0%,#604070 55%,#9060a0 100%)' },
  { title: 'Quince Extravaganza Expo', type: 'expo', date: 'Sun, Oct 5, 2026 - 12-5 PM', location: 'George R. Brown Convention Center, Houston TX', description: "Houston's fall quinceañera expo featuring fashion shows, live entertainment, and top-rated local vendors. Perfect for families in the early planning stages.", free: true, status: 'upcoming', ctaLabel: 'View Details', ctaHref: '#', bg: 'linear-gradient(155deg,#152020 0%,#355555 55%,#508080 100%)' },
  { title: 'Venue Open Houses - Houston Area', type: 'open_house', date: 'Ongoing - Various Dates', location: 'Various Houston venues', description: 'Many Houston venues host monthly open houses where you can tour the space, meet their team, and see pricing in person. Check individual venue pages for dates.', free: true, status: 'ongoing', ctaLabel: 'Browse Venues', ctaHref: '/vendors?category=venues', bg: 'linear-gradient(155deg,#201510 0%,#604030 55%,#a07050 100%)' },
]

const TYPE_LABELS: Record<string, string> = {
  expo: 'Expo', open_house: 'Open House', fashion_show: 'Fashion Show', workshop: 'Workshop',
}

export default function EventsPage() {
  return (
    <>
      <Nav />
      <div style={{ background: '#1a0a0f', padding: '40px 28px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.8px', textTransform: 'uppercase', color: 'rgba(250,216,233,.5)', marginBottom: 10 }}>Events</div>
          <h1 className="font-serif" style={{ fontSize: 42, color: '#fff', marginBottom: 10 }}>Houston Quinceañera Events</h1>
          <p style={{ fontSize: 14, color: 'rgba(250,216,233,.6)', lineHeight: 1.6 }}>Expos, open houses, and vendor events happening near you</p>
        </div>
      </div>
      <div style={{ background: '#fff', borderBottom: '0.5px solid rgba(201,124,138,.15)', padding: '12px 28px', display: 'flex', gap: 10 }}>
        {['All', 'Free', 'Expos', 'Open Houses', 'Coming Soon'].map((f, i) => (
          <button key={f} style={{ background: i === 0 ? '#C97C8A' : 'transparent', color: i === 0 ? '#fff' : '#7a5c65', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 20, padding: '7px 16px', fontSize: 13, cursor: 'pointer' }}>{f}</button>
        ))}
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 28px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {EVENTS.map((ev, i) => (
          <div key={i} style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.15)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 180, background: ev.bg, position: 'relative', display: 'flex', alignItems: 'flex-start', padding: 14, gap: 8 }}>
              {ev.free && <div style={{ background: '#1a7a4a', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase' }}>Free Entry</div>}
              {!ev.free && <div style={{ background: '#1a0a0f', color: '#FAD8E9', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase' }}>Paid Entry</div>}
              {ev.status === 'coming_soon' && <div style={{ background: '#C9A040', color: '#1a0a0f', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase' }}>Coming Soon</div>}
              {ev.myq && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(201,160,64,.9)', padding: '6px 14px', fontSize: 11, fontWeight: 600, color: '#1a0a0f' }}>MyQuinceAnos Official Event</div>}
            </div>
            <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{ background: 'rgba(201,124,138,.1)', color: '#C97C8A', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, textTransform: 'uppercase', display: 'inline-block', marginBottom: 8 }}>{TYPE_LABELS[ev.type]}</span>
              <h3 className="font-serif" style={{ fontSize: 17, fontWeight: 600, color: '#1a0a0f', marginBottom: 6 }}>{ev.title}</h3>
              <div style={{ fontSize: 12, color: '#C97C8A', fontWeight: 500, marginBottom: 4 }}>{ev.date}</div>
              <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 10 }}>{ev.location}</div>
              <p style={{ fontSize: 13, color: '#7a5c65', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{ev.description}</p>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Link href={ev.ctaHref} style={{ background: ev.myq ? '#C9A040' : '#C97C8A', color: ev.myq ? '#1a0a0f' : '#fff', padding: '9px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>{ev.ctaLabel}</Link>
                {ev.free && <span style={{ fontSize: 12, color: '#1a7a4a', fontWeight: 500 }}>Always Free</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 1100, margin: '0 auto 48px', padding: '0 28px' }}>
        <div style={{ background: '#FDF6F0', border: '0.5px solid rgba(201,124,138,.2)', borderRadius: 16, padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 className="font-serif" style={{ fontSize: 20, color: '#1a0a0f', marginBottom: 4 }}>Have a quinceañera event to list?</h3>
            <p style={{ fontSize: 13, color: '#7a5c65' }}>Venue open houses, bridal shows, expos - list it free for Houston families.</p>
          </div>
          <Link href="/contact" style={{ background: '#1a0a0f', color: '#FAD8E9', padding: '11px 24px', borderRadius: 20, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Submit Your Event</Link>
        </div>
      </div>
      <Footer />
    </>
  )
}
