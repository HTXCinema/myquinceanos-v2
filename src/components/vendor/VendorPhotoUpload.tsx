'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'

type Props = {
  vendorId: string
  vendorSlug: string
  currentCoverUrl?: string
  tier: string
  onUpdate: (coverUrl: string) => void
}

export default function VendorPhotoUpload({ vendorId, vendorSlug, currentCoverUrl, tier, onUpdate }: Props) {
  const supabase = createClient()
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(currentCoverUrl || '')

  const isPaid = ['featured', 'premier', 'verified'].includes(tier)

  async function uploadCover(file: File) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be under 5MB')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setUploading(true)
    setError('')

    try {
      const ext = file.name.split('.').pop()
      const path = `${vendorSlug}/cover.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('event-covers')
        .upload(path, file, { upsert: true })

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from('event-covers')
        .getPublicUrl(path)

      // Update vendor record
      const { error: updateErr } = await supabase
        .from('vendors')
        .update({ cover_photo_url: publicUrl })
        .eq('id', vendorId)

      if (updateErr) throw updateErr

      setPreview(publicUrl)
      onUpdate(publicUrl)
    } catch (e: any) {
      setError(e.message || 'Upload failed. Please try again.')
    }
    setUploading(false)
  }

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1a0a0f', marginBottom: 4 }}>
        Cover Photo
      </div>
      <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 14 }}>
        This is the main photo moms see on your listing. Use a high-quality photo of your work.
      </div>

      {/* Current cover preview */}
      <div
        onClick={() => coverInputRef.current?.click()}
        style={{
          width: '100%', height: 180, borderRadius: 14, overflow: 'hidden',
          background: preview ? undefined : 'linear-gradient(155deg,#2a1520 0%,#6a3545 100%)',
          backgroundImage: preview ? `url(${preview})` : undefined,
          backgroundSize: 'cover', backgroundPosition: 'center',
          border: '0.5px dashed rgba(201,124,138,.4)',
          cursor: 'pointer', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(26,10,15,0.4)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 8, opacity: uploading ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => !uploading && (e.currentTarget.style.opacity = '0')}
        >
          {uploading ? (
            <div style={{ fontSize: 13, color: '#fff' }}>Uploading...</div>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>
                {preview ? 'Change photo' : 'Upload cover photo'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>JPG, PNG · Max 5MB</div>
            </>
          )}
        </div>

        {!preview && !uploading && (
          <div style={{ textAlign: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(250,216,233,0.4)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
            <div style={{ fontSize: 13, color: 'rgba(250,216,233,0.5)', marginTop: 8 }}>Click to upload cover photo</div>
          </div>
        )}
      </div>

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) uploadCover(file)
        }}
      />

      {error && (
        <div style={{ fontSize: 12, color: '#c0392b', marginTop: 8 }}>{error}</div>
      )}

      {/* Gallery — paid tiers only */}
      {isPaid ? (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a0a0f', marginBottom: 4 }}>
            Photo Gallery
          </div>
          <div style={{ fontSize: 12, color: '#7a5c65', marginBottom: 14 }}>
            Add up to 10 photos to showcase your work.
          </div>
          <GalleryUpload vendorId={vendorId} vendorSlug={vendorSlug} />
        </div>
      ) : (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(201,124,138,.06)', borderRadius: 10, border: '0.5px solid rgba(201,124,138,.2)' }}>
          <div style={{ fontSize: 12, color: '#7a5c65' }}>
            📸 <strong>Upgrade to Featured ($49/mo)</strong> to add a full photo gallery — vendors with photos get 3x more profile views.
          </div>
        </div>
      )}
    </div>
  )
}

function GalleryUpload({ vendorId, vendorSlug }: { vendorId: string; vendorSlug: string }) {
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function uploadPhoto(file: File) {
    if (photos.length >= 10) { setError('Maximum 10 photos allowed'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Each photo must be under 10MB'); return }

    setUploading(true)
    setError('')
    try {
      const path = `${vendorSlug}/${Date.now()}-${file.name.replace(/\s/g, '-')}`

      const { error: uploadErr } = await supabase.storage
        .from('vendor-photos')
        .upload(path, file)

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from('vendor-photos')
        .getPublicUrl(path)

      // Save to vendor_photos table
      await supabase.from('vendor_photos').insert({
        vendor_id: vendorId,
        photo_url: publicUrl,
        sort_order: photos.length,
      })

      setPhotos(p => [...p, publicUrl])
    } catch (e: any) {
      setError(e.message || 'Upload failed')
    }
    setUploading(false)
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 12 }}>
        {photos.map((url, i) => (
          <div key={i} style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: '#f5f5f5' }}>
            <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
        {photos.length < 10 && (
          <div
            onClick={() => inputRef.current?.click()}
            style={{
              aspectRatio: '1', borderRadius: 10, border: '0.5px dashed rgba(201,124,138,.4)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', background: 'rgba(201,124,138,.03)', gap: 6,
            }}
          >
            {uploading ? (
              <div style={{ fontSize: 11, color: '#7a5c65' }}>Uploading...</div>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C97C8A" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <div style={{ fontSize: 11, color: '#C97C8A', fontWeight: 500 }}>Add photo</div>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f) }}
      />

      {error && <div style={{ fontSize: 12, color: '#c0392b' }}>{error}</div>}
      <div style={{ fontSize: 11, color: '#aaa' }}>{photos.length}/10 photos uploaded</div>
    </div>
  )
}
