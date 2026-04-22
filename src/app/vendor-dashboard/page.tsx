'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Nav from '@/components/layout/Nav'
import Link from 'next/link'
import type { Vendor } from '@/types'
import VendorPhotoUpload from '@/components/vendor/VendorPhotoUpload'

const TIER_FEATURES = {
  free: ['Basic listing in directory', 'Appears in category searches', 'Business name & description'],
  verified: ['Everything in Free', 'Verified badge', 'Photos & gallery', 'Website & contact links', 'Priority in search'],
  featured: ['Everything in Verified', 'Homepage placement', 'MyQuince Perk field', 'Monthly reports', 'Free expo booth', 'Founding Vendor badge'],
}

export default function VendorDashboard() {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Vendor>>({})
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'leads' | 'upgrade'>('overview')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: vendorData } = await supabase
      .from('vendors')
      .select('*, categories(name)')
      .eq('owner_user_id', user.id)
      .single()

    if (!vendorData) { router.push('/get-listed'); return }
    setVendor(vendorData)
    setEditForm(vendorData)

    const { data: leadsData } = await supabase
      .from('leads')
      .select('*')
      .eq('vendor_id', vendorData.id)
      .order('created_at', { ascending: false })
    setLeads(leadsData || [])
    setLoading(false)
  }

  async function saveProfile() {
    if (!vendor) return
    setSaving(true)
    await supabase.from('vendors').update({
      description: editForm.description,
      phone: editForm.phone,
      email: editForm.email,
      website_url: editForm.website_url,
      instagram_url: editForm.instagram_url,
      starting_price: editForm.starting_price,
      myquince_perk: editForm.myquince_perk,
    }).eq('id', vendor.id)
    setVendor(v => v ? { ...v, ...editForm } : v)
    setSaving(false)
    setEditing(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <><Nav />
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 14, color: '#7a5c65' }}>Loading your dashboard...</div>
    </div></>
  )

  const tier = vendor?.tier || 'free'
  const newLeads = leads.filter(l => l.status === 'new').length

  return (
    <>
      <Nav />
      {/* Header */}
      <div style={{ background: '#1a0a0f', padding: '28px 28px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(250,216,233,.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Vendor Dashboard</div>
            <h1 className="font-serif" style={{ fontSize: 28, color: '#fff', marginBottom: 6 }}>{vendor?.business_name}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: tier === 'featured' ? '#C9A040' : tier === 'verified' ? 'rgba(26,122,74,.9)' : 'rgba(255,255,255,.1)', color: tier === 'featured' ? '#1a0a0f' : '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: .5 }}>
                {tier}
              </span>
              {vendor?.founding_vendor && <span style={{ background: 'rgba(201,160,64,.2)', color: '#C9A040', border: '0.5px solid rgba(201,160,64,.4)', fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>Founding Vendor</span>}
              {newLeads > 0 && <span style={{ background: '#C97C8A', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{newLeads} new leads</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link href={`/vendors/${vendor?.slug}`} style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(250,216,233,.7)', border: '0.5px solid rgba(250,216,233,.15)', padding: '8px 16px', borderRadius: 20, fontSize: 12, textDecoration: 'none' }}>View Listing</Link>
            <button onClick={signOut} style={{ background: 'transparent', color: 'rgba(250,216,233,.4)', border: '0.5px solid rgba(250,216,233,.15)', padding: '8px 16px', borderRadius: 20, fontSize: 12, cursor: 'pointer' }}>Sign Out</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ maxWidth: 1100, margin: '16px auto 0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[
            ['Rating', vendor?.avg_rating ? `${vendor.avg_rating} ★` : 'No reviews'],
            ['Reviews', String(vendor?.review_count || 0)],
            ['Total Leads', String(leads.length)],
            ['Plan', tier.charAt(0).toUpperCase() + tier.slice(1)],
          ].map(([l, v]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,.05)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, color: 'rgba(250,216,233,.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 28px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '0.5px solid rgba(201,124,138,.15)' }}>
          {(['overview', 'profile', 'leads', 'upgrade'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: activeTab === tab ? 500 : 400, color: activeTab === tab ? '#C97C8A' : '#7a5c65', borderBottom: activeTab === tab ? '2px solid #C97C8A' : '2px solid transparent', marginBottom: -1, textTransform: 'capitalize' }}>
              {tab === 'overview' ? 'Overview' : tab === 'profile' ? 'Edit Profile' : tab === 'leads' ? `Leads ${newLeads > 0 ? `(${newLeads})` : ''}` : 'Upgrade Plan'}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>Your current plan</h3>
              <div style={{ fontSize: 13, color: '#7a5c65', marginBottom: 12 }}>
                <strong style={{ color: '#1a0a0f' }}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</strong>
                {tier === 'free' && ' — Free forever'}
                {tier === 'verified' && ' — $59/month'}
                {tier === 'featured' && ' — $129/month'}
              </div>
              {TIER_FEATURES[tier as keyof typeof TIER_FEATURES].map(f => (
                <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: '#555' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20,6 9,17 4,12"/></svg>
                  {f}
                </div>
              ))}
              {tier !== 'featured' && (
                <button onClick={() => setActiveTab('upgrade')}
                  style={{ marginTop: 14, background: '#C97C8A', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
                  Upgrade for more visibility →
                </button>
              )}
            </div>
            <div style={{ background: '#fff', border: '0.5px solid rgba(201,124,138,.18)', borderRadius: 14, padding: 22 }}>
              <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>Quick tips to get more leads</h3>
              {[
                tier === 'free' && '📸 Add photos to get 3x more profile views',
                !vendor?.starting_price && '💰 Add a starting price — moms filter by budget',
                !vendor?.description && '✍️ Write a description — tell moms why you\'re different',
                !vendor?.website_url && '🌐 Add your website link',
                tier !== 'featured' && '⭐ Upgrade to Featured to appear on the homepage',
              ].filter(Boolean).map((tip, i) => (
                <div key={i} style={{ fontSize: 13, color: '#555', marginBottom: 10, lineHeight: 1.5 }}>{tip}</div>
              ))}
            </div>
          </div>
        )}

        {/* EDIT PROFILE */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: 680 }}>
{vendor && <VendorPhotoUpload
  vendorId={vendor.id}
  vendorSlug={vendor.slug || ''}
  currentCoverUrl={vendor.cover_photo_url || ''}
  tier={vendor.tier || 'free'}
  onUpdate={(url) => setVendor(v => v ? { ...v, cover_photo_url: url } : v)}
/>}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              {[
                { key: 'phone', label: 'Phone', placeholder: '(713) 555-0100', type: 'tel' },
                { key: 'email', label: 'Email', placeholder: 'hello@yourbusiness.com', type: 'email' },
                { key: 'website_url', label: 'Website URL', placeholder: 'https://yourbusiness.com', type: 'text' },
                { key: 'instagram_url', label: 'Instagram', placeholder: '@yourbusiness', type: 'text' },
                { key: 'starting_price', label: 'Starting Price ($)', placeholder: '1500', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={String(editForm[f.key as keyof typeof editForm] || '')}
                    onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none' }} />
                </div>
              ))}
              {tier === 'featured' && (
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 6 }}>MyQuince Perk <span style={{ color: '#C9A040' }}>(Featured only)</span></label>
                  <input type="text" placeholder="e.g. Free 1-hr engagement session included"
                    value={String(editForm.myquince_perk || '')}
                    onChange={e => setEditForm(p => ({ ...p, myquince_perk: e.target.value }))}
                    style={{ width: '100%', border: '0.5px solid rgba(201,160,64,.4)', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none' }} />
                </div>
              )}
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 6 }}>About Your Business</label>
              <textarea rows={4} placeholder="Tell moms what makes you different..."
                value={String(editForm.description || '')}
                onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))}
                style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif' }} />
            </div>
            <button onClick={saveProfile} disabled={saving}
              style={{ background: '#C97C8A', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 24, fontSize: 14, fontWeight: 600, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* LEADS */}
        {activeTab === 'leads' && (
          <div>
            {leads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div className="font-serif" style={{ fontSize: 24, color: '#1a0a0f', marginBottom: 8 }}>No leads yet</div>
                <p style={{ fontSize: 14, color: '#7a5c65', marginBottom: 20 }}>Leads from moms will appear here once they contact you through your listing.</p>
                {tier === 'free' && <p style={{ fontSize: 13, color: '#C97C8A' }}>Upgrade to Verified to unlock the contact form on your profile.</p>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {leads.map(lead => (
                  <div key={lead.id} style={{ background: '#fff', border: `0.5px solid ${lead.status === 'new' ? 'rgba(201,124,138,.4)' : 'rgba(201,124,138,.15)'}`, borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: '#1a0a0f' }}>{lead.mom_name || 'Anonymous'}</span>
                        <span style={{ fontSize: 12, color: '#7a5c65', marginLeft: 10 }}>{lead.mom_email}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {lead.status === 'new' && <span style={{ background: '#C97C8A', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>NEW</span>}
                        <span style={{ fontSize: 11, color: '#7a5c65' }}>{new Date(lead.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 10 }}>{lead.message}</p>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      {lead.event_date && <span style={{ fontSize: 12, color: '#7a5c65' }}>📅 Event: {new Date(lead.event_date).toLocaleDateString()}</span>}
                      {lead.budget_range && <span style={{ fontSize: 12, color: '#7a5c65' }}>💰 Budget: {lead.budget_range}</span>}
                      {lead.guest_count && <span style={{ fontSize: 12, color: '#7a5c65' }}>👥 {lead.guest_count} guests</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* UPGRADE */}
        {activeTab === 'upgrade' && (
          <div style={{ maxWidth: 700 }}>
            <h2 className="font-serif" style={{ fontSize: 28, marginBottom: 8 }}>Upgrade your listing</h2>
            <p style={{ fontSize: 14, color: '#7a5c65', marginBottom: 28 }}>Get in front of more Houston moms. Upgrade anytime, cancel anytime.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
               { key: 'featured', name: 'Featured', price: '$49/mo', payLink: 'https://square.link/u/TedIpvsu' },
{ key: 'premier', name: 'Premier', price: '$129/mo', payLink: 'https://square.link/u/9tAi4sdT' },
              ].filter(t => t.key !== tier).map(t => (
                <div key={t.key} style={{ background: t.key === 'featured' ? 'rgba(201,160,64,.08)' : '#fff', border: `0.5px solid ${t.key === 'featured' ? 'rgba(201,160,64,.3)' : 'rgba(201,124,138,.2)'}`, borderRadius: 16, padding: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: '#7a5c65', marginBottom: 6 }}>{t.name}</div>
                  <div className="font-serif" style={{ fontSize: 32, fontWeight: 600, marginBottom: 16 }}>{t.price}</div>
                  {TIER_FEATURES[t.key as keyof typeof TIER_FEATURES].map(f => (
                    <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: '#555' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C97C8A" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20,6 9,17 4,12"/></svg>
                      {f}
                    </div>
                  ))}
                  <a href={t.payLink} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'block', textAlign: 'center', background: t.key === 'featured' ? '#C9A040' : '#C97C8A', color: t.key === 'featured' ? '#1a0a0f' : '#fff', padding: '12px 0', borderRadius: 24, fontSize: 13, fontWeight: 600, textDecoration: 'none', marginTop: 18 }}>
                    Upgrade to {t.name} →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
