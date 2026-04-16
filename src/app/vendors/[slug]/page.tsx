import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

// In production this fetches from Supabase based on slug
export default function VendorPage({ params }: { params: { slug: string } }) {
  const slug = params.slug

  // Placeholder — replace with Supabase fetch
  const vendor = {
    name: 'DreamLite Productions',
    category: 'Photography & Video',
    description: 'Award-winning quinceañera photography and videography in Houston. We capture every emotional moment — from the first waltz to the last dance. Cinematic highlight reels, bilingual team (English & Spanish).',
    phone: '(713) 555-0100',
    email: 'hello@dreamliteproductions.com',
    website: 'dreamliteproductions.com',
    instagram: '@dreamliteproductions',
    rating: 5.0,
    reviews: 52,
    price: 2800,
    tier: 'featured',
    perk: 'Free 1-hr engagement session with any package',
    verified: true,
    founding: true,
    city: 'Houston, TX',
    bg: 'linear-gradient(155deg,#3d1520 0%,#7a3545 55%,#c07080 100%)',
    years: 15,
    languages: ['English', 'Spanish'],
  }

  return (
    <>
      <Nav />
      {/* Cover */}
      <div style={{height:280, background: vendor.bg, position:'relative'}}>
        <div style={{position:'absolute',inset:0,background:'rgba(26,10,15,.4)'}}/>
        <div style={{position:'absolute',bottom:20,left:28,display:'flex',gap:8}}>
          {vendor.tier==='featured' && <div style={{background:'#C9A040',color:'#1a0a0f',fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:20}}>Featured</div>}
          {vendor.founding && <div style={{background:'rgba(201,160,64,.2)',color:'#C9A040',border:'0.5px solid rgba(201,160,64,.5)',fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:20}}>Founding Vendor</div>}
          {vendor.verified && <div style={{background:'rgba(26,122,74,.9)',color:'#fff',fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:20}}>✓ Verified</div>}
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 28px',display:'grid',gridTemplateColumns:'1fr 320px',gap:32,alignItems:'start'}}>
        {/* Main content */}
        <div>
          <div style={{fontSize:12,color:'#C97C8A',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:6}}>{vendor.category}</div>
          <h1 className="font-serif" style={{fontSize:38,fontWeight:600,marginBottom:10}}>{vendor.name}</h1>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,flexWrap:'wrap'}}>
            <div style={{display:'flex',gap:2}}>
              {Array.from({length:5}).map((_,i)=><span key={i} style={{color:i<Math.round(vendor.rating)?'#C9A040':'#ddd',fontSize:16}}>★</span>)}
            </div>
            <span style={{fontSize:14,fontWeight:500}}>{vendor.rating}</span>
            <span style={{fontSize:14,color:'#7a5c65'}}>({vendor.reviews} reviews)</span>
            <span style={{fontSize:14,color:'#7a5c65'}}>·</span>
            <span style={{fontSize:14,color:'#7a5c65'}}>{vendor.city}</span>
            <span style={{fontSize:14,color:'#7a5c65'}}>·</span>
            <span style={{fontSize:14,color:'#7a5c65'}}>{vendor.years} years experience</span>
          </div>

          {/* MyQuince Perk */}
          {vendor.perk && (
            <div style={{background:'rgba(201,160,64,.1)',border:'0.5px solid rgba(201,160,64,.3)',borderRadius:12,padding:'14px 18px',marginBottom:24,display:'flex',gap:12,alignItems:'center'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A040" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
              <div>
                <div style={{fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'#C9A040',marginBottom:2}}>MyQuince Perk</div>
                <div style={{fontSize:14,color:'#1a0a0f',fontWeight:500}}>{vendor.perk}</div>
              </div>
            </div>
          )}

          <div style={{marginBottom:28}}>
            <h2 className="font-serif" style={{fontSize:22,marginBottom:12}}>About</h2>
            <p style={{fontSize:14,color:'#555',lineHeight:1.75}}>{vendor.description}</p>
          </div>

          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:28}}>
            {vendor.languages.map(l=>(
              <div key={l} style={{background:'rgba(201,124,138,.1)',color:'#C97C8A',fontSize:12,fontWeight:500,padding:'5px 12px',borderRadius:20}}>🗣 {l}</div>
            ))}
          </div>

          {/* Photo gallery placeholder */}
          <div style={{marginBottom:28}}>
            <h2 className="font-serif" style={{fontSize:22,marginBottom:14}}>Photos</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {['#3d1520,#7a3545,#c07080','#1d1030,#5a3575,#9570a5','#152025,#355060,#658090','#252010,#706030,#a09060','#1a2510,#4a6030,#7a9050','#301520,#704050,#b07080'].map((bg,i)=>(
                <div key={i} style={{height:140,background:`linear-gradient(155deg,${bg})`,borderRadius:10}}/>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="font-serif" style={{fontSize:22,marginBottom:6}}>Reviews</h2>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
              <div style={{background:'rgba(201,124,138,.1)',color:'#C97C8A',fontSize:12,fontWeight:500,padding:'4px 10px',borderRadius:20,display:'inline-flex',alignItems:'center',gap:5}}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                Every review verified by contract or receipt
              </div>
            </div>
            <p style={{fontSize:13,color:'#7a5c65',marginBottom:20}}>Only moms who have booked this vendor can leave a review.</p>
            {[
              {initials:'MR',name:'Maria Rodriguez',date:'Nov 2024',rating:5,body:'"They captured every emotional moment perfectly. From the waltz to the last dance — my daughter cried watching the highlight reel."'},
              {initials:'JP',name:'Jessica Perez',date:'Sep 2024',rating:5,body:'"Absolutely professional. They made my daughter feel like a celebrity all day. The photos were delivered in 2 weeks — stunning quality."'},
            ].map(r=>(
              <div key={r.name} style={{background:'#fff',border:'0.5px solid rgba(201,124,138,.15)',borderRadius:14,padding:20,marginBottom:12}}>
                <div style={{display:'flex',gap:11,alignItems:'center',marginBottom:12}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'rgba(201,124,138,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:500,color:'#C97C8A',flexShrink:0}}>{r.initials}</div>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:500,color:'#1a0a0f'}}>{r.name}</div>
                    <div style={{fontSize:11,color:'#7a5c65',marginTop:1}}>{r.date}</div>
                  </div>
                </div>
                <div style={{marginBottom:10}}>{Array.from({length:5}).map((_,i)=><span key={i} style={{color:i<r.rating?'#C9A040':'#ddd',fontSize:13}}>★</span>)}</div>
                <p style={{fontSize:13.5,color:'#555',lineHeight:1.7,fontStyle:'italic',borderLeft:'2px solid #C97C8A',paddingLeft:12,margin:0}}>{r.body}</p>
                <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#1a7a4a',fontWeight:500,marginTop:10}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                  Verified — contract submitted
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{position:'sticky',top:72,display:'flex',flexDirection:'column',gap:14}}>
          {/* Contact card */}
          <div style={{background:'#fff',border:'0.5px solid rgba(201,124,138,.2)',borderRadius:16,padding:22}}>
            <div style={{fontSize:22,fontWeight:600,color:'#1a0a0f',marginBottom:4}} className="font-serif">Starting at ${vendor.price.toLocaleString()}</div>
            <div style={{fontSize:13,color:'#7a5c65',marginBottom:20}}>Contact for exact pricing</div>
            <button style={{width:'100%',background:'#C97C8A',color:'#fff',border:'none',padding:'13px 0',borderRadius:24,fontSize:14,fontWeight:600,cursor:'pointer',marginBottom:10}}>Message Now</button>
            <button style={{width:'100%',background:'transparent',color:'#1a0a0f',border:'0.5px solid rgba(26,10,15,.2)',padding:'11px 0',borderRadius:24,fontSize:13,cursor:'pointer'}}>Save to List</button>
          </div>

          {/* Contact info */}
          <div style={{background:'#FDF6F0',border:'0.5px solid rgba(201,124,138,.15)',borderRadius:14,padding:18}}>
            <div style={{fontSize:12,fontWeight:600,textTransform:'uppercase',letterSpacing:1,color:'#C97C8A',marginBottom:12}}>About Us</div>
            {[
              ['Award-winning quinceañera photography', true],
              [`${vendor.years}+ years of experience`, true],
              ['Bilingual team (English & Spanish)', true],
            ].map(([t]) => (
              <div key={String(t)} style={{display:'flex',gap:8,marginBottom:8,fontSize:13,color:'#555'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C97C8A" strokeWidth="2.5" style={{flexShrink:0,marginTop:1}}><polyline points="20,6 9,17 4,12"/></svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}
