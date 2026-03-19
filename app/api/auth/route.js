export async function POST(request) {
  try {
    const { email, password, action } = await request.json()
    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}