import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

export async function POST(request) {
  try {
    const { text, bookId, title, author, color, font } = await request.json()

    // 텍스트 구조 분석 (API 없을 때는 기본 파싱)
    const pages = parseText(text, title, author, color)

    // 5페이지만 무료로 저장
    const freePages = pages.slice(0, 5)

    // DB에 페이지 저장
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

    return Response.json({ 
      success: true, 
      pages: freePages,
      totalPages: pages.length
    })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

function parseText(text, title, author, color) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const pages = []
  let pageNum = 1
  let chapterNum = 0
  let currentSections = []
  let sectionCount = 0
  const MAX_SECTIONS = 5
  const CHARS_PER_PAGE = 350

  const CHAPTER_PATTERNS = [
    /^chapter\s*\d+/i,
    /^제\s*\d+\s*장/,
    /^챕터\s*\d+/,
    /^CHAPTER/i,
    /^Part\s*\d+/i
  ]

  const QUOTE_PATTERNS = [/^[""]/, /^"/, /^『/, /^「/]
  const IMAGE_PATTERNS = [/^\[이미지\]/i, /^\[image\]/i, /^\[그림\]/i, /^\[그래프\]/i]

  function flushPage() {
    if (currentSections.length === 0) return
    pages.push({
      type: 'body',
      sections: [...currentSections],
      pn: pageNum++,
      rh: title,
      ct: chapterNum > 0 ? `제${chapterNum}장` : title
    })
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
    if (CHAPTER_PATTERNS.some(p => p.test(line))) {
      flushBuffer()
      flushPage()
      chapterNum++
      pages.push({
        type: 'chapter',
        num: `CHAPTER ${String(chapterNum).padStart(2, '0')}`,
        title: line,
        body: [],
        pn: pageNum++,
        bookTitle: title
      })
      return
    }

    if (IMAGE_PATTERNS.some(p => p.test(line))) {
      flushBuffer()
      currentSections.push({ t: 'img', c: '+ 이미지 / 그래프 삽입' })
      sectionCount++
      return
    }

    if (QUOTE_PATTERNS.some(p => p.test(line)) && line.length < 200) {
      flushBuffer()
      currentSections.push({ t: 'quote', c: line, src: '' })
      sectionCount++
      return
    }

    if (line.length < 30 && !line.endsWith('.') && !line.endsWith(',') && line.length > 4) {
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