import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY
    )

    const { text, bookId, title, author, color, genre, onePage } = await request.json()

    // Claude API로 텍스트 분석 → 페이지 구조 생성
    const prompt = `당신은 책 내지 디자인 전문가입니다. 아래 원고를 분석해서 책 페이지 JSON을 만들어주세요.

원고:
"""
${text?.slice(0, 3000) || '샘플 텍스트'}
"""

책 정보:
- 제목: ${title || '제목 없음'}
- 저자: ${author || ''}
- 장르: ${genre || 'essay'}

규칙:
1. 챕터 제목처럼 보이는 짧은 줄(30자 미만) → chapter 타입
2. 소제목(20자 미만, 앞에 번호나 특수문자) → sec 타입
3. 인용문("" 또는 '' 포함) → quote 타입
4. 일반 본문 → txt 타입
5. ${onePage ? '1페이지만 생성' : '5페이지 생성'}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 JSON만:
{
  "pages": [
    {
      "type": "chapter",
      "num": "CHAPTER 01",
      "title": "챕터 제목",
      "body": ["본문 단락1", "본문 단락2"],
      "pn": 12,
      "bookTitle": "${title || '책 제목'}"
    },
    {
      "type": "body",
      "rh": "${title || '책 제목'}",
      "sections": [
        {"t": "sec", "c": "소제목"},
        {"t": "txt", "c": "본문 내용"},
        {"t": "quote", "c": "인용구 내용"}
      ],
      "pn": 13,
      "ct": "CH 01"
    }
  ]
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })

    let pages = []
    try {
      const responseText = message.content[0].text
      const clean = responseText.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      pages = parsed.pages || []
    } catch (e) {
      // 파싱 실패시 기본 파싱
      pages = parseText(text, title, author, color)
    }

    const freePages = onePage ? pages.slice(0, 1) : pages.slice(0, 5)

    // Supabase에 저장
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

// 폴백용 기본 파싱
function parseText(text, title, author, color) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const pages = []
  let pageNum = 12
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