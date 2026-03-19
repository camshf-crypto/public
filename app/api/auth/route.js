<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function POST(request) {
  try {
    const { action, email, password, name } = await request.json()

    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })
      if (error) throw error
      return Response.json({ success: true, user: data.user })
    }

    if (action === 'login') {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return Response.json({ 
    success: true, 
    session: data.session, 
    user: data.user,
    access_token: data.session?.access_token
  })
}

    if (action === 'logout') {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return Response.json({ success: true })
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
=======
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function POST(request) {
  try {
    const { action, email, password, name } = await request.json()

    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })
      if (error) throw error
      return Response.json({ success: true, user: data.user })
    }

    if (action === 'login') {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  return Response.json({ 
    success: true, 
    session: data.session, 
    user: data.user,
    access_token: data.session?.access_token
  })
}

    if (action === 'logout') {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return Response.json({ success: true })
    }

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
>>>>>>> e4f3418bf44a57a42ed3720fe7fd9a60da12fefa
}