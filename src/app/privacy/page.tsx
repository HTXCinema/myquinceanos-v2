import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <div style={{ background: '#1a0a0f', padding: '60px 28px 48px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
          <h1 className="font-serif" style={{ fontSize: 44, color: '#fff', lineHeight: 1.2, marginBottom: 12 }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: 'rgba(250,216,233,.4)' }}>Last updated: April 2026</p>
        </div>
      </div>
      <div style={{ background: '#FDF6F0', padding: '56px 28px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {[
            {
              title: 'Information we collect',
              body: 'When you create an account, we collect your name, email address, and password. Vendors additionally provide business information including phone number, website, and business description. We also collect information you voluntarily provide such as reviews and saved vendors.',
            },
            {
              title: 'How we use your information',
              body: 'We use your information to provide and improve our services, send confirmation and notification emails, verify reviews submitted to our platform, and communicate with you about your account or listings. We do not sell your personal information to third parties.',
            },
            {
              title: 'Review verification',
              body: 'When you submit a review, you must provide a contract or receipt as proof of purchase. This document is used solely to verify the authenticity of your review and is not shared publicly or with the vendor being reviewed.',
            },
            {
              title: 'Cookies and analytics',
              body: 'We use cookies to keep you logged in and to understand how our site is used. We may use analytics tools to understand traffic patterns and improve the platform. You can disable cookies in your browser settings, though this may affect site functionality.',
            },
            {
              title: 'Data security',
              body: 'Your password is encrypted and never stored in plain text. We use Supabase for our database, which provides industry-standard security. We take reasonable measures to protect your information but cannot guarantee absolute security.',
            },
            {
              title: 'Your rights',
              body: 'You can update your account information at any time through your dashboard. You can request deletion of your account and associated data by emailing contact@myquinceanos.com. We will process deletion requests within 30 days.',
            },
            {
              title: 'Contact',
              body: 'If you have questions about this privacy policy or how we handle your data, email us at contact@myquinceanos.com.',
            },
          ].map(section => (
            <div key={section.title} style={{ marginBottom: 36, paddingBottom: 36, borderBottom: '0.5px solid rgba(201,124,138,.1)' }}>
              <h2 style={{ fontSize: 18, fontWeight: 500, color: '#1a0a0f', marginBottom: 10 }}>{section.title}</h2>
              <p style={{ fontSize: 14, color: '#7a5c65', lineHeight: 1.8 }}>{section.body}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}
