import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function POST(request) {
  try {
    const { email, password, action } = await request.json()
    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return Response.json({ error: error.message }, { status: 400 })
      return Response.json({ success: true, user: data.user })
    }
    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return Response.json({ error: error.message }, { status: 400 })
      return Response.json({ success: true, session: data.session })
    }
    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
