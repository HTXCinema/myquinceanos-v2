import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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
