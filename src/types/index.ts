export type UserRole = 'mom' | 'vendor' | 'admin'
export type VendorTier = 'free' | 'verified' | 'featured' | 'premier'
export type ReviewStatus = 'pending' | 'published' | 'rejected' | 'flagged'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  locale: 'en' | 'es'
  created_at: string
}

export interface MomProfile {
  id: string
  user_id: string
  daughter_name: string | null
  event_date: string | null
  total_budget: number
  guest_count: number
  venue_city: string
  notes: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  name_es: string | null
  slug: string
  icon_key: string | null
  sort_order: number
}

export interface Vendor {
  id: string
  owner_user_id: string | null
  business_name: string
  slug: string
  category_id: string | null
  description: string | null
  phone: string | null
  email: string | null
  website_url: string | null
  instagram_url: string | null
  address: string | null
  city: string
  price_range: '$' | '$$' | '$$$' | '$$$$' | null
  starting_price: number | null
  logo_url: string | null
  cover_photo_url: string | null
  tier: VendorTier
  is_claimed: boolean
  is_verified: boolean
  founding_vendor: boolean
  myquince_perk: string | null
  avg_rating: number
  review_count: number
  created_at: string
  // joined
  categories?: Category
  vendor_photos?: VendorPhoto[]
}

export interface VendorPhoto {
  id: string
  vendor_id: string
  url: string
  caption: string | null
  sort_order: number
}

export interface Review {
  id: string
  vendor_id: string
  reviewer_user_id: string
  rating: number
  title: string | null
  body: string
  event_date: string | null
  is_verified: boolean
  verification_method: 'contract' | 'receipt' | 'invoice' | null
  status: ReviewStatus
  vendor_reply: string | null
  created_at: string
  // joined
  profiles?: Profile
}

export interface ChecklistItem {
  id: string
  mom_profile_id: string
  category_id: string | null
  item_name: string
  vendor_id: string | null
  vendor_name_override: string | null
  is_booked: boolean
  is_paid_in_full: boolean
  notes: string | null
  sort_order: number
  // joined
  vendors?: Vendor | null
  categories?: Category | null
}

export interface VendorPayment {
  id: string
  mom_profile_id: string
  checklist_id: string | null
  vendor_id: string | null
  vendor_name: string
  payment_label: string
  amount_due: number | null
  amount_paid: number
  due_date: string
  is_paid: boolean
  paid_at: string | null
  notes: string | null
}

export interface MQEvent {
  id: string
  title: string
  slug: string
  description: string | null
  event_type: 'expo' | 'open_house' | 'fashion_show' | 'workshop' | 'other'
  is_free: boolean
  ticket_price: number | null
  venue_name: string | null
  address: string | null
  city: string
  start_date: string
  end_date: string | null
  cover_image_url: string | null
  is_myq_event: boolean
  status: 'upcoming' | 'ongoing' | 'past' | 'cancelled'
}
