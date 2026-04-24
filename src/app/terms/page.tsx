import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export default function TermsPage() {
  return (
    <>
      <Nav />
      <div style={{ background: '#1a0a0f', padding: '60px 28px 48px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
          <h1 className="font-serif" style={{ fontSize: 44, color: '#fff', lineHeight: 1.2, marginBottom: 12 }}>Terms of Service</h1>
          <p style={{ fontSize: 13, color: 'rgba(250,216,233,.4)' }}>Last updated: April 2026</p>
        </div>
      </div>
      <div style={{ background: '#FDF6F0', padding: '56px 28px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          {[
            {
              title: 'Acceptance of terms',
              body: 'By using MyQuinceAños, you agree to these terms. If you do not agree, please do not use our platform. We may update these terms periodically and will notify users of significant changes.',
            },
            {
              title: 'For mom accounts',
              body: 'Mom accounts are free and allow you to browse vendors, save favorites, use planning tools, and submit verified reviews. You must provide accurate information when creating an account. You are responsible for maintaining the security of your password.',
            },
            {
              title: 'For vendor accounts',
              body: 'Vendor listings must represent real businesses operating in the Houston area that serve the quinceañera market. You must provide accurate business information. Fake or misleading listings will be removed without refund. Paid subscriptions are billed monthly and can be cancelled at any time.',
            },
            {
              title: 'Reviews and content',
              body: 'By submitting a review, you confirm that the review reflects your genuine experience and that you have provided valid proof of purchase. False reviews or fraudulent verification documents will result in account termination. Reviews become the property of MyQuinceAños and may be used in marketing materials.',
            },
            {
              title: 'Prohibited conduct',
              body: 'You may not use our platform to post false information, harass other users, attempt to manipulate reviews, scrape or copy our vendor database, or engage in any activity that could harm our platform or its users.',
            },
            {
              title: 'Payments and refunds',
              body: 'Vendor subscription payments are processed through Square. Monthly subscriptions can be cancelled at any time and will remain active until the end of the billing period. We do not offer refunds for partial months.',
            },
            {
              title: 'Limitation of liability',
              body: 'MyQuinceAños is a directory and planning platform. We do not guarantee the quality of any vendor listed on our platform. Transactions between families and vendors are solely between those parties. We are not responsible for disputes arising from vendor services.',
            },
            {
              title: 'Contact',
              body: 'Questions about these terms? Email us at contact@myquinceanos.com.',
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
