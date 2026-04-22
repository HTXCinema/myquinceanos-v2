import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )

  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, business_name, tier, is_claimed, is_active, is_verified, founding_vendor, created_at')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, created_at, role')

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, status, created_at')

  return NextResponse.json({ vendors, profiles, reviews })
}
