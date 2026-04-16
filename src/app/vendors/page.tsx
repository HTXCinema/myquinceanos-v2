'use client'
import { useState } from 'react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

const CATEGORIES = [
  { name: 'All Categories', slug: '' },
  { name: 'Photographers', slug: 'photographers' },
  { name: 'Venues', slug: 'venues' },
  { name: 'Catering', slug: 'catering' },
  { name: 'DJs & Music', slug: 'djs-music' },
  { name: 'Videography', slug: 'videography' },
  { name: 'Makeup & Hair', slug: 'makeup-hair' },
  { name: 'Dresses & Boutiques', slug: 'dresses-boutiques' },
  { name: 'Choreographers', slug: 'choreographers' },
  { name: 'Cakes & Bakeries', slug: 'cakes-bakeries' },
  { name: 'Decor & Flowers', slug: 'decor-flowers' },
  { name: 'Limos & Transport', slug: 'limos-transport' },
  { name: 'Entertainment', slug: 'entertainment' },
]

const MOCK_VENDORS = [
  { id: '1', name: 'DreamLite Productions', category: 'Photographers', slug: 'dreamlite-productions', rating: 5.0, reviews: 52, price: 2800, tier: 'featured', perk: 'Free 1-hr engagement session', verified: true, bg: 'linear-gradient(155deg,#3d1520 0%,#7a3545 55%,#c07080 100%)' },
  { id: '2', name: 'Bell Tower on 34th', category: 'Venues', slug: 'bell-tower-34th', rating: 4.9, reviews: 53, price: 5500, tier: 'featured', perk: 'Free venue lighting upgrade', verified: true, bg: 'linear-gradient(155deg,#1d1030 0%,#5a3575 55%,#9570a5 100%)' },
  { id: '3', name: 'Cabrera Photography', category: 'Photographers', slug: 'cabrera-photography', rating: 4.7, reviews: 31, price: 1500, tier: 'verified', verified: true, bg: 'linear-gradient(155deg,#152025 0%,#355060 55%,#658090 100%)' },
  { id: '4', name: "Ikonik Dancers & DJ", category: 'DJs & Music', slug: 'ikonik-dancers-dj', rating: 5.0, reviews: 28, price: 1200, tier: 'featured', perk: 'Free hora loca add-on', verified: true, bg: 'linear-gradient(155deg,#252010 0%,#706030 55%,#a09060 100%)' },
  { id: '5', name: "Goyita's Catering", category: 'Catering', slug: 'goyitas-catering', rating: 4.8, reviews: 41, price: 3200, tier: 'verified', verified: true, bg: 'linear-gradient(155deg,#1a2510 0%,#4a6030 55%,#7a9050 100%)' },
  { id: '6', name: 'Bella Luxe Events', category: 'Decor & Flowers', slug: 'bella-luxe-events', rating: 4.9, reviews: 37, price: 2100, tier: 'featured', perk: 'Free centerpiece upgrade', verified: true, bg: 'linear-gradient(155deg,#301520 0%,#704050 55%,#b07080 100%)' },
  { id: '7', name: 'Estilo Isabella', category: 'Dresses & Boutiques', slug: 'estilo-isabella', rating: 4.6, reviews: 19, price: 800, tier: 'free', verified: false, bg: 'linear-gradient(155deg,#251530 0%,#604575 55%,#9070a0 100%)' },
  { id: '8', name: 'Houston Quince Cakes', category: 'Cakes & Bakeries', slug: 'houston-quince-cakes', rating: 4.8, reviews: 22, price: 450, tier: 'verified', verified: true, bg: 'linear-gradient(155deg,#302010 0%,#806040 55%,#b09060 100%)' },
  { id: '9', name: 'Glamour by Maria', category: 'Makeup & Hair', slug: 'glamour-by-maria', rating: 5.0, reviews: 15, price: 350, tier: 'verified', verified: true, bg: 'linear-gradient(155deg,#351525 0%,#804060 55%,#c08090 100%)' },
]

function Stars({ rating }: { rating: number }) {
  return <span>{Array.from({length:5}).map((_,i)=><span key={i} style={{color: i < Math.round(rating) ? '#C9A040' : '#ddd', fontSize:12}}>★</span>)}</span>
}

export default function VendorsPage() {
  const [cat, setCat] = useState('')
  const [search, setSearch] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [tierFilter, setTierFilter] = useState('')

  const filtered = MOCK_VENDORS.filter(v => {
    if (cat && !v.category.toLowerCase().includes(cat.replace(/-/g,' '))) return false
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false
    if (minRating && v.rating < minRating) return false
    if (tierFilter === 'verified' && v.tier === 'free') return false
    if (tierFilter === 'featured' && v.tier !== 'featured') return false
    return true
  })

  return (
    <>
      <Nav />
      <div style={{background:'#1a0a0f', padding:'36px 28px 28px'}}>
        <div style={{maxWidth:800, margin:'0 auto', textAlign:'center'}}>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:'1.8px',textTransform:'uppercase',color:'rgba(250,216,233,.5)',marginBottom:8}}>Browse Vendors</div>
          <h1 className="font-serif" style={{fontSize:40,color:'#fff',marginBottom:10}}>Find Your Houston Vendors</h1>
          <p style={{fontSize:14,color:'rgba(250,216,233,.6)',marginBottom:24}}>127+ trusted vendors · All reviewed by real Houston moms</p>
          <div style={{background:'rgba(255,255,255,.96)',borderRadius:14,padding:'6px 6px 6px 16px',display:'flex',gap:8,alignItems:'center',maxWidth:520,margin:'0 auto'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vendors..."
              style={{border:'none',background:'transparent',fontSize:13,flex:1,outline:'none',padding:'6px 0'}} />
            <button style={{background:'#C97C8A',color:'#fff',border:'none',padding:'10px 20px',borderRadius:10,fontSize:13,fontWeight:500,cursor:'pointer'}}>Search</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'32px 28px',display:'grid',gridTemplateColumns:'220px 1fr',gap:28,alignItems:'start'}}>
        {/* Sidebar filters */}
        <div style={{background:'#fff',border:'0.5px solid rgba(201,124,138,.18)',borderRadius:14,padding:20,position:'sticky',top:72}}>
          <h3 style={{fontSize:13,fontWeight:600,marginBottom:16,textTransform:'uppercase',letterSpacing:1,color:'#7a5c65'}}>Filter By</h3>
          
          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:500,color:'#1a0a0f',marginBottom:10}}>Category</div>
            {CATEGORIES.map(c=>(
              <button key={c.slug} onClick={()=>setCat(c.slug)}
                style={{display:'block',width:'100%',textAlign:'left',padding:'6px 10px',borderRadius:8,border:'none',background:cat===c.slug?'rgba(201,124,138,.12)':'transparent',color:cat===c.slug?'#C97C8A':'#555',fontSize:13,cursor:'pointer',marginBottom:2}}>
                {c.name}
              </button>
            ))}
          </div>

          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:500,color:'#1a0a0f',marginBottom:10}}>Minimum Rating</div>
            {[[0,'Any rating'],[4,'4+ stars'],[4.5,'4.5+ stars'],[5,'5 stars only']].map(([v,l])=>(
              <button key={v} onClick={()=>setMinRating(Number(v))}
                style={{display:'block',width:'100%',textAlign:'left',padding:'6px 10px',borderRadius:8,border:'none',background:minRating===Number(v)?'rgba(201,124,138,.12)':'transparent',color:minRating===Number(v)?'#C97C8A':'#555',fontSize:13,cursor:'pointer',marginBottom:2}}>
                {l}
              </button>
            ))}
          </div>

          <div>
            <div style={{fontSize:12,fontWeight:500,color:'#1a0a0f',marginBottom:10}}>Listing Type</div>
            {[['','All vendors'],['verified','Verified+'],['featured','Featured only']].map(([v,l])=>(
              <button key={v} onClick={()=>setTierFilter(String(v))}
                style={{display:'block',width:'100%',textAlign:'left',padding:'6px 10px',borderRadius:8,border:'none',background:tierFilter===v?'rgba(201,124,138,.12)':'transparent',color:tierFilter===v?'#C97C8A':'#555',fontSize:13,cursor:'pointer',marginBottom:2}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Vendor grid */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <span style={{fontSize:14,color:'#7a5c65'}}>{filtered.length} vendors found</span>
            <select style={{border:'0.5px solid rgba(201,124,138,.25)',borderRadius:8,padding:'7px 12px',fontSize:13,outline:'none',color:'#555'}}>
              <option>Sort: Recommended</option>
              <option>Sort: Highest Rated</option>
              <option>Sort: Most Reviews</option>
              <option>Sort: Price Low–High</option>
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {filtered.map(v=>(
              <Link key={v.id} href={`/vendors/${v.slug}`} style={{textDecoration:'none',display:'block',background:'#fff',border:'0.5px solid rgba(201,124,138,.18)',borderRadius:16,overflow:'hidden',cursor:'pointer'}}>
                <div style={{height:180,background:v.bg,position:'relative'}}>
                  {v.tier==='featured' && <div style={{position:'absolute',top:10,right:10,background:'#C9A040',color:'#1a0a0f',fontSize:10,fontWeight:700,padding:'4px 10px',borderRadius:20}}>Featured</div>}
                  {v.tier==='verified' && <div style={{position:'absolute',top:10,right:10,background:'rgba(26,122,74,.9)',color:'#fff',fontSize:10,fontWeight:700,padding:'4px 10px',borderRadius:20}}>Verified</div>}
                  {v.perk && (
                    <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(201,160,64,.9)',padding:'6px 12px'}}>
                      <div style={{fontSize:9,textTransform:'uppercase',letterSpacing:1,color:'rgba(26,10,15,.6)',fontWeight:600}}>MyQuince Perk</div>
                      <div style={{fontSize:11,fontWeight:600,color:'#1a0a0f'}}>{v.perk}</div>
                    </div>
                  )}
                </div>
                <div style={{padding:'14px 16px'}}>
                  <div style={{fontSize:10.5,color:'#C97C8A',fontWeight:600,textTransform:'uppercase',letterSpacing:.5,marginBottom:3}}>{v.category}</div>
                  <div style={{fontSize:15,fontWeight:500,color:'#1a0a0f',marginBottom:5}}>{v.name}</div>
                  <div style={{display:'flex',alignItems:'center',gap:3,marginBottom:5}}>
                    <Stars rating={v.rating}/>
                    <span style={{fontSize:11.5,color:'#7a5c65',marginLeft:4}}>{v.rating} ({v.reviews})</span>
                  </div>
                  <div style={{fontSize:13,color:'#7a5c65'}}>Starting at <strong style={{color:'#1a0a0f',fontWeight:500}}>${v.price.toLocaleString()}</strong></div>
                  {v.verified && (
                    <div style={{display:'inline-flex',alignItems:'center',gap:5,background:'#e8f7ef',color:'#1a7a4a',fontSize:11,fontWeight:500,padding:'3px 9px',borderRadius:20,marginTop:7}}>
                      <div style={{width:5,height:5,background:'#1a7a4a',borderRadius:'50%'}}/>Mom-verified
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer/>
    </>
  )
}
