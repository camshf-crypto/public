import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY
    )

    const { text, bookId, title, author, color } = await request.json()
    const pages = parseText(text, title, author, color)
    const freePages = pages.slice(0, 5)
    if (bookId) {
      for (const page of freePages) {
        await supabase.from('pages').insert({
          book_id: bookId,
          page_number: page.pn,
          page_type: page.type,
          content: page,
          is_free: true
        })
      }
    }
    return Response.json({ success: true, pages: freePages, totalPages: pages.length })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

function parseText(text, title, author, color) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const pages = []
  let pageNum = 1
  let currentSections = []
  let sectionCount = 0
  const MAX_SECTIONS = 5
  const CHARS_PER_PAGE = 350

  function flushPage() {
    if (currentSections.length === 0) return
    pages.push({ type: 'body', sections: [...currentSections], pn: pageNum++, rh: title, ct: title })
    currentSections = []
    sectionCount = 0
  }

  let buffer = []

  function flushBuffer() {
    if (buffer.length === 0) return
    let chunk = ''
    buffer.forEach(line => {
      if ((chunk + line).length > CHARS_PER_PAGE && chunk.length > 0) {
        currentSections.push({ t: 'txt', c: chunk.trim() })
        sectionCount++
        chunk = line + ' '
      } else {
        chunk += line + ' '
      }
    })
    if (chunk.trim()) {
      currentSections.push({ t: 'txt', c: chunk.trim() })
      sectionCount++
    }
    buffer = []
  }

  lines.forEach(line => {
    if (line.length < 30 && line.length > 4) {
      flushBuffer()
      currentSections.push({ t: 'sec', c: line })
      sectionCount++
      return
    }
    buffer.push(line)
    if (sectionCount >= MAX_SECTIONS) {
      flushBuffer()
      flushPage()
    }
  })

  flushBuffer()
  flushPage()
  return pages
}
