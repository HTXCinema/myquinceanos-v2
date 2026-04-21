'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

type ReviewModalProps = {
  vendor: { id: string; name: string; category: string }
  momProfileId: string
  onClose: () => void
  onSubmitted: () => void
}

export default function ReviewModal({ vendor, momProfileId, onClose, onSubmitted }: ReviewModalProps) {
  const [step, setStep] = useState<'review' | 'proof' | 'done'>('review')
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [body, setBody] = useState('')
  const [proofType, setProofType] = useState<'contract' | 'receipt' | 'invoice' | ''>('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!rating || !body.trim()) { setError('Please add a rating and review'); return }
    if (!proofType) { setError('Please select your proof type'); return }
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      let proofUrl = ''
      if (proofFile) {
        const ext = proofFile.name.split('.').pop()
        const path = `review-proof/${user.id}/${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage.from('evidence').upload(path, proofFile)
        if (!upErr) {
          const { data } = supabase.storage.from('evidence').getPublicUrl(path)
          proofUrl = data.publicUrl
        }
      }

      const { data: review, error: revErr } = await supabase.from('reviews').insert({
        vendor_id: vendor.id,
        reviewer_user_id: user.id,
        rating,
        body: body.trim(),
        status: 'pending',
      }).select().single()

      if (revErr) throw revErr

      if (proofUrl || proofType) {
        await supabase.from('review_evidence').insert({
          review_id: review.id,
          evidence_type: proofType,
          file_url: proofUrl || null,
          submitted_by: user.id,
        })
      }

      setStep('done')
      setTimeout(() => { onSubmitted(); onClose() }, 2500)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,10,15,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 20, maxWidth: 480, width: '100%', overflow: 'hidden', boxShadow: '0 20px 60px rgba(26,10,15,.3)' }}>

        {/* Header */}
        <div style={{ background: '#1a0a0f', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(250,216,233,.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Leave a review</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{vendor.name}</div>
            <div style={{ fontSize: 12, color: '#C97C8A', marginTop: 2 }}>{vendor.category}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {step === 'done' ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: '#e8f7ef', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7a4a" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
            </div>
            <div className="font-serif" style={{ fontSize: 22, color: '#1a0a0f', marginBottom: 8 }}>Review submitted!</div>
            <p style={{ fontSize: 13, color: '#7a5c65', lineHeight: 1.6 }}>Your review is pending verification. Once we confirm your proof of service, it will go live and help other Houston moms.</p>
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              {[['1', 'Your review'], ['2', 'Proof of service']].map(([num, label], i) => {
                const active = (i === 0 && step === 'review') || (i === 1 && step === 'proof')
                const done = i === 0 && step === 'proof'
                return (
                  <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? '#1a7a4a' : active ? '#C97C8A' : 'rgba(201,124,138,.15)', color: done || active ? '#fff' : '#C97C8A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                      {done ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg> : num}
                    </div>
                    <span style={{ fontSize: 12, color: active ? '#1a0a0f' : '#7a5c65', fontWeight: active ? 500 : 400 }}>{label}</span>
                    {i < 1 && <div style={{ width: 24, height: 1, background: 'rgba(201,124,138,.2)' }} />}
                  </div>
                )
              })}
            </div>

            {step === 'review' && (
              <>
                {/* Star rating */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 10 }}>Overall rating</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1,2,3,4,5].map(star => (
                      <button key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill={(hover || rating) >= star ? '#C9A040' : 'none'} stroke={(hover || rating) >= star ? '#C9A040' : '#ddd'} strokeWidth="1.5">
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                        </svg>
                      </button>
                    ))}
                    {rating > 0 && (
                      <span style={{ fontSize: 13, color: '#C9A040', fontWeight: 500, alignSelf: 'center', marginLeft: 4 }}>
                        {['','Poor','Fair','Good','Great','Amazing!'][rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Review body */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 8 }}>Your review</div>
                  <textarea value={body} onChange={e => setBody(e.target.value)}
                    placeholder="Tell other Houston moms about your experience. What did they do well? What should others know before booking?"
                    rows={5}
                    style={{ width: '100%', border: '0.5px solid rgba(201,124,138,.3)', borderRadius: 12, padding: '12px 14px', fontSize: 13, outline: 'none', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  <div style={{ fontSize: 11, color: '#bbb', textAlign: 'right', marginTop: 4 }}>{body.length} / 500</div>
                </div>

                {error && <div style={{ fontSize: 12, color: '#E24B4A', marginBottom: 12 }}>{error}</div>}

                <button onClick={() => { if (!rating || !body.trim()) { setError('Please add a rating and review'); return } setError(''); setStep('proof') }}
                  style={{ width: '100%', background: '#C97C8A', color: '#fff', border: 'none', padding: '13px 0', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Continue → Add proof of service
                </button>
              </>
            )}

            {step === 'proof' && (
              <>
                <div style={{ background: 'rgba(201,160,64,.08)', border: '0.5px solid rgba(201,160,64,.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: '#7a5c65', lineHeight: 1.6 }}>
                  <strong style={{ color: '#C9A040' }}>Why we require proof:</strong> MyQuinceAños only publishes reviews from real clients. Uploading a contract, receipt, or invoice ensures your review goes live and helps protect Houston families from fake reviews.
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 10 }}>What proof do you have?</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {(['contract', 'receipt', 'invoice'] as const).map(type => (
                      <button key={type} onClick={() => setProofType(type)}
                        style={{ padding: '10px 8px', borderRadius: 10, border: `${proofType === type ? '2px' : '0.5px'} solid ${proofType === type ? '#C97C8A' : 'rgba(201,124,138,.25)'}`, background: proofType === type ? 'rgba(201,124,138,.08)' : '#fff', cursor: 'pointer', fontSize: 12, color: proofType === type ? '#C97C8A' : '#555', fontWeight: proofType === type ? 600 : 400, textTransform: 'capitalize' }}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#7a5c65', marginBottom: 8 }}>Upload your document <span style={{ fontWeight: 400, color: '#bbb' }}>(optional but recommended)</span></div>
                  <label style={{ display: 'block', border: '0.5px dashed rgba(201,124,138,.4)', borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer', background: proofFile ? 'rgba(201,124,138,.04)' : '#fff' }}>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => setProofFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                    {proofFile ? (
                      <div>
                        <div style={{ fontSize: 13, color: '#1a7a4a', fontWeight: 500 }}>✓ {proofFile.name}</div>
                        <div style={{ fontSize: 11, color: '#7a5c65', marginTop: 4 }}>Click to change</div>
                      </div>
                    ) : (
                      <div>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C97C8A" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 8px' }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <div style={{ fontSize: 13, color: '#7a5c65' }}>Click to upload PDF, JPG, or PNG</div>
                        <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>Max 10MB · Your document stays private</div>
                      </div>
                    )}
                  </label>
                </div>

                {error && <div style={{ fontSize: 12, color: '#E24B4A', marginBottom: 12 }}>{error}</div>}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep('review')}
                    style={{ flex: 1, background: 'transparent', color: '#7a5c65', border: '0.5px solid rgba(201,124,138,.3)', padding: '12px 0', borderRadius: 30, fontSize: 13, cursor: 'pointer' }}>
                    ← Back
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    style={{ flex: 2, background: '#C97C8A', color: '#fff', border: 'none', padding: '12px 0', borderRadius: 30, fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Submitting...' : 'Submit my review →'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
