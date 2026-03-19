'use client'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

const GENRES = [
  { id:'essay', label:'에세이', icon:'✍️', desc:'일상·감성·생각' },
  { id:'novel', label:'소설', icon:'📖', desc:'픽션·스토리' },
  { id:'prose', label:'수필', icon:'🌿', desc:'짧은 산문·단상' },
  { id:'poetry', label:'시집', icon:'🎋', desc:'시·시조' },
  { id:'shortstory', label:'단편소설', icon:'📝', desc:'단편 픽션' },
  { id:'selfdev', label:'자기계발', icon:'🚀', desc:'성장·습관·동기' },
  { id:'business', label:'비즈니스', icon:'💼', desc:'경영·전략·리더십' },
  { id:'economy', label:'경제경영', icon:'📊', desc:'경제·투자·재테크' },
  { id:'thesis', label:'논문', icon:'🔬', desc:'학술 논문' },
  { id:'academic', label:'학술서', icon:'🎓', desc:'전문 학술서적' },
  { id:'textbook', label:'교재', icon:'📚', desc:'강의·교육 교재' },
  { id:'travel', label:'여행', icon:'✈️', desc:'여행기·탐방기' },
  { id:'memoir', label:'회고록', icon:'🕰️', desc:'자서전·회고' },
  { id:'interview', label:'인터뷰집', icon:'🎙️', desc:'대담·인터뷰' },
  { id:'lifestyle', label:'라이프스타일', icon:'🌱', desc:'요리·육아·건강' },
]

async function downloadPDF(pages, title, color) {
  const { default: jsPDF } = await import('jspdf')
  const { default: html2canvas } = await import('html2canvas')
  const pdf = new jsPDF('p', 'mm', 'a5')
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:148mm;background:#fff;'
  document.body.appendChild(container)
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]
    const div = document.createElement('div')
    div.style.cssText = 'width:148mm;min-height:210mm;background:#faf8f5;position:relative;padding:20px 18px 16px 22px;box-sizing:border-box;font-family:sans-serif;'
    if (page.type === 'chapter') {
      const chTitle = (page.title || '').split('\n').join('<br/>')
      const bodyHTML = (page.body || []).map(t => '<p style="font-size:10px;line-height:2;color:#444;margin-bottom:8px">' + t + '</p>').join('')
      div.innerHTML =
        '<div style="background:' + color + ';height:65mm;margin:-20px -18px 0 -22px;padding:20px 18px 30px 22px;position:relative;">' +
        '<div style="position:absolute;bottom:0;left:0;right:0;height:20px;background:#faf8f5;clip-path:ellipse(55% 100% at 50% 100%)"></div>' +
        '<div style="font-size:8px;font-weight:700;color:#c8963e;margin-bottom:8px">' + (page.num || '') + '</div>' +
        '<div style="font-size:20px;font-weight:900;color:#fff;line-height:1.3">' + chTitle + '</div>' +
        '</div><div style="margin-top:24px">' + bodyHTML + '</div>' +
        '<div style="position:absolute;bottom:12px;left:22px;right:18px;border-top:0.5px solid #e0ddd8;padding-top:6px;display:flex;justify-content:space-between;font-size:8px;color:#bbb">' +
        '<span>' + (page.pn || '') + '</span><span>' + (page.bookTitle || title) + '</span></div>'
    } else {
      const sHTML = (page.sections || []).map(s => {
        if (s.t === 'sec') return '<div style="font-size:12px;font-weight:700;color:#111;padding-left:8px;border-left:3px solid ' + color + ';margin-bottom:8px">' + s.c + '</div>'
        if (s.t === 'txt') return '<p style="font-size:10px;line-height:2;color:#444;margin-bottom:8px">' + s.c + '</p>'
        if (s.t === 'quote') return '<div style="border-left:3px solid ' + color + ';padding:8px 12px;margin-bottom:8px"><p style="font-size:10px;font-style:italic">' + s.c + '</p></div>'
        if (s.t === 'img' && s.src) return '<img src="' + s.src + '" style="width:100%;margin-bottom:8px"/>'
        return ''
      }).join('')
      div.innerHTML =
        '<div style="font-size:7px;color:#bbb;padding-bottom:7px;border-bottom:0.5px solid #e0ddd8;margin-bottom:12px">' + (page.rh || title) + '</div>' +
        sHTML +
        '<div style="position:absolute;bottom:12px;left:22px;right:18px;border-top:0.5px solid #e0ddd8;padding-top:6px;display:flex;justify-content:space-between;font-size:8px;color:#bbb">' +
        '<span>' + (page.pn || '') + '</span><span>' + (page.ct || '') + '</span></div>'
    }
    container.appendChild(div)
    const canvas = await html2canvas(div, { scale:2, useCORS:true, backgroundColor:'#faf8f5' })
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    if (i > 0) pdf.addPage()
    pdf.addImage(imgData, 'JPEG', 0, 0, 148, 210)
    container.removeChild(div)
  }
  document.body.removeChild(container)
  pdf.save(title + '.pdf')
}

const SAMPLE_BOOKS = [
  { color:'#2563eb', num:'CH 01', title:'습관이\n운명을\n바꾼다', tag:'자기계발' },
  { color:'#1a1a2e', num:'CH 01', title:'마케팅의\n본질', tag:'비즈니스' },
  { color:'#c8963e', num:'CH 01', title:'나는\n오늘도\n걷는다', tag:'에세이' },
  { color:'#16a34a', num:'CH 01', title:'숲이\n말하는\n것들', tag:'에세이' },
  { color:'#7c3aed', num:'CH 01', title:'데이터로\n세상\n읽기', tag:'비즈니스' },
  { color:'#dc2626', num:'CH 01', title:'불꽃처럼\n살아라', tag:'자기계발' },
  { color:'#0891b2', num:'CH 01', title:'바다의\n끝에서', tag:'소설' },
  { color:'#be185d', num:'CH 01', title:'당신의\n이름을\n부를게', tag:'소설' },
  { color:'#065f46', num:'CH 01', title:'논문\n작성법', tag:'학술' },
  { color:'#374151', num:'CH 01', title:'철학적\n인간학', tag:'학술' },
  { color:'#1e1b4b', num:'CH 01', title:'스타트업\n생존기', tag:'비즈니스' },
  { color:'#92400e', num:'CH 01', title:'커피와\n일상', tag:'에세이' },
  { color:'#2563eb', num:'CH 02', title:'복리의\n법칙', tag:'자기계발' },
  { color:'#c8963e', num:'CH 03', title:'여행의\n끝에서', tag:'에세이' },
  { color:'#dc2626', num:'CH 02', title:'열정을\n찾아서', tag:'자기계발' },
]

function MiniBookCard({ book }) {
  return (
    <div style={{ width:120, flexShrink:0, background:'#faf8f5', borderRadius:'2px 10px 10px 2px', boxShadow:'3px 0 12px rgba(0,0,0,0.12)', overflow:'hidden', position:'relative' }}>
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'linear-gradient(to right,#bbb,#f0ede8)', zIndex:1 }}></div>
      <div style={{ background:book.color, height:76, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', bottom:-1, left:0, right:0, height:14, background:'#faf8f5', clipPath:'ellipse(55% 100% at 50% 100%)' }}></div>
        <div style={{ position:'absolute', top:8, left:10, fontSize:5.5, fontWeight:700, letterSpacing:'0.15em', color:'rgba(255,255,255,0.7)', fontFamily:'Noto Sans KR,sans-serif' }}>{book.num}</div>
        <div style={{ position:'absolute', top:18, left:10, right:6, fontFamily:'Noto Serif KR,serif', fontSize:11, fontWeight:900, color:'#fff', lineHeight:1.25 }}>
          {book.title.split('\n').map((t,i) => <div key={i}>{t}</div>)}
        </div>
      </div>
      <div style={{ padding:'8px 8px 6px 12px' }}>
        <div style={{ fontSize:6, lineHeight:1.7, color:'#666', fontFamily:'Noto Sans KR,sans-serif' }}>매일 반복하는 작은 행동들이 쌓여 어느 순간 전혀 다른 사람을 만들어낸다.</div>
        <div style={{ marginTop:5 }}><span style={{ fontSize:6, fontWeight:700, padding:'1.5px 5px', borderRadius:8, background:book.color, color:'#fff', fontFamily:'Noto Sans KR,sans-serif' }}>{book.tag}</span></div>
      </div>
      <div style={{ padding:'4px 8px 6px 12px', borderTop:'0.5px solid #e8e4df', display:'flex', justifyContent:'space-between', fontFamily:'Noto Serif KR,serif', fontSize:6, color:'#bbb' }}>
        <span>1</span><span>북메이커</span>
      </div>
    </div>
  )
}

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Noto Sans KR,sans-serif', background:'#f7f5f2' }}>
      <div style={{ fontSize:14, color:'#aaa' }}>로딩 중...</div>
    </div>
  )

  if (user) return <AppPage user={user} />
  return <LandingPage />
}

function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const S = { bg:'#f7f5f2', white:'#fff', surface:'#f0ede8', border:'#e2ddd8', accent:'#1a1a2e', accent2:'#c8963e', accent3:'#2563eb', text:'#1a1a1a', textMid:'#666', textFaint:'#aaa' }

  async function handleAuth() {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'signup_button_click', {
        event_category: 'engagement',
        event_label: isSignup ? '회원가입' : '로그인'
      })
    }
    setAuthLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action: isSignup ? 'signup' : 'login', email, password, name })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (isSignup) {
        setError('회원가입 완료! 로그인해주세요.')
        setIsSignup(false)
      } else if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })
        window.location.reload()
      }
    } catch (err) {
      setError(err.message)
    }
    setAuthLoading(false)
  }

  return (
    <div style={{ fontFamily:'Noto Sans KR,sans-serif', background:S.bg, color:S.text, overflowX:'hidden' }}>
      <style>{`
        .badge-dot { animation:pulse 2s ease infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        .feat-card:hover { transform:translateY(-3px) !important; box-shadow:0 12px 32px rgba(0,0,0,0.07) !important; }
        @keyframes scrollRight { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes scrollLeft { 0%{transform:translateX(-50%)} 100%{transform:translateX(0)} }
        @media (max-width:768px) {
          .hero-title { font-size:clamp(32px,8vw,52px) !important; }
          .section-wrap { padding:56px 20px !important; }
          .steps-grid { grid-template-columns:1fr 1fr !important; }
          .feat-grid { grid-template-columns:1fr !important; }
          header nav { display:none !important; }
        }
      `}</style>

      <header style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:60, padding:'0 48px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(247,245,242,0.94)', backdropFilter:'blur(16px)', borderBottom:`1px solid ${S.border}` }}>
        <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:20, fontWeight:900, color:S.accent }}>
          북<em style={{ color:S.accent2, fontStyle:'normal' }}>메이커</em>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:24 }}>
          <nav style={{ display:'flex', gap:24 }}>
            <a href="#how" style={{ fontSize:13, color:S.textMid, textDecoration:'none', fontWeight:500 }}>작동방식</a>
            <a href="#features" style={{ fontSize:13, color:S.textMid, textDecoration:'none', fontWeight:500 }}>기능</a>
          </nav>
          <button onClick={() => setShowLogin(true)} style={{ padding:'9px 20px', background:S.accent, color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>
            무료로 시작하기
          </button>
        </div>
      </header>

      <div style={{ paddingTop:60 }}>
        <div style={{ textAlign:'center', padding:'88px 24px 64px', background:S.bg }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:S.white, border:`1px solid ${S.border}`, borderRadius:20, padding:'6px 14px', fontSize:12, color:S.accent2, fontWeight:700, letterSpacing:'0.05em', marginBottom:28 }}>
            <div className="badge-dot" style={{ width:6, height:6, background:S.accent2, borderRadius:'50%' }}></div>
            AI 책 내지 디자인 플랫폼
          </div>
          <h1 className="hero-title" style={{ fontFamily:'Noto Serif KR,serif', fontSize:'clamp(40px,5.5vw,76px)', fontWeight:900, lineHeight:1.15, letterSpacing:'-0.03em', color:S.accent, marginBottom:22, wordBreak:'keep-all' }}>
            워드 파일 하나로<br /><span style={{ color:S.accent2 }}>책 한 권</span>이 완성됩니다
          </h1>
          <p style={{ fontSize:17, color:S.textMid, lineHeight:1.85, fontWeight:300, marginBottom:44, wordBreak:'keep-all', maxWidth:540, margin:'0 auto 44px' }}>
            디자이너 없이, 30분 안에.<br />텍스트를 넣으면 AI가 레이아웃·폰트·여백을 자동으로 잡아줍니다.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', marginBottom:52 }}>
            <button onClick={() => setShowLogin(true)} style={{ padding:'15px 40px', background:S.accent, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>
              지금 무료로 시작하기 →
            </button>
          </div>
          <div style={{ display:'flex', gap:32, justifyContent:'center', alignItems:'center' }}>
            {[['30분','100페이지 완성'],['95%','비용 절감'],['9900원','책 한 권 완성']].map(([num,lbl],i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:32 }}>
                {i > 0 && <div style={{ width:1, height:32, background:S.border }}></div>}
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:26, fontWeight:900, color:S.accent, lineHeight:1, marginBottom:4 }}>{num}</div>
                  <div style={{ fontSize:11, color:S.textFaint }}>{lbl}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background:'#e8e4df', padding:'52px 0 60px', overflow:'hidden', position:'relative' }}>
          <div style={{ textAlign:'center', marginBottom:32, position:'relative', zIndex:1 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.2em', color:'#666', textTransform:'uppercase' }}>SAMPLE PAGES</div>
          </div>
          <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'flex', gap:14, animation:'scrollRight 35s linear infinite', width:'max-content' }}>
              {[...SAMPLE_BOOKS,...SAMPLE_BOOKS].map((b,i) => <MiniBookCard key={i} book={b} />)}
            </div>
            <div style={{ display:'flex', gap:14, animation:'scrollLeft 35s linear infinite', width:'max-content' }}>
              {[...SAMPLE_BOOKS.slice().reverse(),...SAMPLE_BOOKS.slice().reverse()].map((b,i) => <MiniBookCard key={i} book={b} />)}
            </div>
          </div>
          <div style={{ position:'absolute', left:0, top:0, bottom:0, width:120, background:'linear-gradient(to right,#e8e4df,transparent)', zIndex:2, pointerEvents:'none' }}></div>
          <div style={{ position:'absolute', right:0, top:0, bottom:0, width:120, background:'linear-gradient(to left,#e8e4df,transparent)', zIndex:2, pointerEvents:'none' }}></div>
        </div>
      </div>

      <div id="how" className="section-wrap" style={{ padding:'88px 80px', background:S.white }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.22em', color:S.accent2, textTransform:'uppercase', marginBottom:12 }}>HOW IT WORKS</div>
        <h2 style={{ fontFamily:'Noto Serif KR,serif', fontSize:'clamp(26px,3.5vw,40px)', fontWeight:900, color:S.accent, marginBottom:52 }}>딱 4단계면 책이 완성됩니다</h2>
        <div className="steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0, position:'relative' }}>
          <div style={{ position:'absolute', top:26, left:'12.5%', right:'12.5%', height:1.5, background:'linear-gradient(90deg,#1a1a2e,#c8963e,#2563eb,#111)', opacity:0.12 }}></div>
          {[
            { n:'1', bg:S.accent, title:'워드 업로드', desc:'이미 써놓은 워드 파일을 그대로 올리세요.' },
            { n:'2', bg:S.accent2, title:'장르 & 스타일', desc:'장르를 선택하고 원하는 디자인 이미지를 올리세요.' },
            { n:'3', bg:S.accent3, title:'자동 생성', desc:'AI가 챕터·본문·인용구를 구분해 자동으로 디자인합니다.' },
            { n:'4', bg:'#111', title:'PDF 다운로드', desc:'인쇄용 고해상도 PDF로 즉시 다운로드.' },
          ].map((s,i) => (
            <div key={i} style={{ padding:'0 16px' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:s.bg, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Noto Serif KR,serif', fontSize:20, fontWeight:900, marginBottom:18, position:'relative', zIndex:1 }}>{s.n}</div>
              <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:15, fontWeight:700, color:S.accent, marginBottom:8 }}>{s.title}</div>
              <div style={{ fontSize:13, color:S.textMid, lineHeight:1.75, wordBreak:'keep-all' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div id="features" className="section-wrap" style={{ padding:'88px 80px', background:S.bg }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.22em', color:S.accent2, textTransform:'uppercase', marginBottom:12 }}>FEATURES</div>
        <h2 style={{ fontFamily:'Noto Serif KR,serif', fontSize:'clamp(26px,3.5vw,40px)', fontWeight:900, color:S.accent, marginBottom:48 }}>필요한 건 텍스트뿐,<br />나머지는 AI가 합니다</h2>
        <div className="feat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {[
            { icon:'📄', title:'워드 파일 그대로 업로드', desc:'챕터와 본문을 AI가 자동으로 구분해 레이아웃을 잡아줍니다.' },
            { icon:'🎨', title:'스타일 자동 적용', desc:'폰트, 여백, 색상까지 한 번에 설정.' },
            { icon:'🖼️', title:'레퍼런스 이미지 반영', desc:'원하는 책 스타일 이미지를 올리면 85% 이상 유사하게 만들어드립니다.' },
            { icon:'📊', title:'데이터 → 그래프 자동 생성', desc:'숫자 데이터를 입력하면 그래프로 자동 변환됩니다.' },
            { icon:'👁️', title:'페이지 미리보기', desc:'생성된 페이지를 한 장씩 확인하고 수정할 수 있습니다.' },
            { icon:'⬇️', title:'인쇄용 PDF 다운로드', desc:'출판 규격 맞춤 고해상도 PDF로 즉시 다운로드.' },
          ].map((f,i) => (
            <div key={i} className="feat-card" style={{ background:S.white, border:`1px solid ${S.border}`, borderRadius:14, padding:24, transition:'all 0.2s' }}>
              <div style={{ fontSize:26, marginBottom:12 }}>{f.icon}</div>
              <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:15, fontWeight:700, color:S.accent, marginBottom:7 }}>{f.title}</div>
              <div style={{ fontSize:13, color:S.textMid, lineHeight:1.75, wordBreak:'keep-all' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:'100px 80px', background:S.white, textAlign:'center' }}>
        <h2 style={{ fontFamily:'Noto Serif KR,serif', fontSize:'clamp(30px,4vw,50px)', fontWeight:900, color:S.accent, lineHeight:1.2, marginBottom:14 }}>
          첫 5페이지는<br />무료입니다
        </h2>
        <p style={{ fontSize:15, color:S.textMid, marginBottom:32, fontWeight:300 }}>회원가입 후 바로 사용해보세요. 카드 정보 불필요.</p>
        <button onClick={() => setShowLogin(true)} style={{ padding:'15px 40px', background:S.accent, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>
          무료로 시작하기 →
        </button>
      </div>

      <footer style={{ padding:'24px 48px', background:S.bg, borderTop:`1px solid ${S.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:17, fontWeight:900, color:S.accent }}>북메이커</div>
        <div style={{ fontSize:11, color:S.textFaint }}>© 2025 북메이커. All rights reserved.</div>
      </footer>

      {showLogin && (
        <div onClick={() => setShowLogin(false)} style={{ position:'fixed', inset:0, background:'rgba(26,26,46,0.55)', backdropFilter:'blur(10px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:S.white, borderRadius:20, padding:40, width:'100%', maxWidth:400, boxShadow:'0 24px 80px rgba(0,0,0,0.14)' }}>
            <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:22, fontWeight:900, color:S.accent, marginBottom:6 }}>
              북<em style={{ color:S.accent2, fontStyle:'normal' }}>메이커</em>
            </div>
            <div style={{ fontSize:13, color:S.textMid, marginBottom:26, lineHeight:1.65 }}>로그인하고 AI 책 내지 디자인을 시작하세요.<br />첫 5페이지는 무료입니다.</div>
            <div style={{ display:'flex', background:S.bg, borderRadius:10, padding:3, marginBottom:22, border:`1px solid ${S.border}` }}>
              {['로그인','회원가입'].map((tab,i) => (
                <button key={tab} onClick={() => setIsSignup(i===1)} style={{ flex:1, padding:9, fontSize:13, fontWeight:600, border:'none', borderRadius:8, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif', background:(i===1)===isSignup?S.white:'transparent', color:(i===1)===isSignup?S.accent:S.textMid, transition:'all 0.15s' }}>{tab}</button>
              ))}
            </div>
            {isSignup && (
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, fontWeight:600, color:S.textMid, display:'block', marginBottom:7 }}>이름</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" style={{ width:'100%', background:S.bg, border:`1.5px solid ${S.border}`, borderRadius:10, padding:'12px 14px', fontSize:14, fontFamily:'Noto Sans KR,sans-serif', outline:'none', boxSizing:'border-box' }} />
              </div>
            )}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:S.textMid, display:'block', marginBottom:7 }}>이메일</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@email.com" style={{ width:'100%', background:S.bg, border:`1.5px solid ${S.border}`, borderRadius:10, padding:'12px 14px', fontSize:14, fontFamily:'Noto Sans KR,sans-serif', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, fontWeight:600, color:S.textMid, display:'block', marginBottom:7 }}>비밀번호</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width:'100%', background:S.bg, border:`1.5px solid ${S.border}`, borderRadius:10, padding:'12px 14px', fontSize:14, fontFamily:'Noto Sans KR,sans-serif', outline:'none', boxSizing:'border-box' }} />
            </div>
            {error && <div style={{ fontSize:12, color:error.includes('완료')?'#16a34a':'#dc2626', marginBottom:10 }}>{error}</div>}
            <button onClick={handleAuth} disabled={authLoading} style={{ width:'100%', padding:14, background:S.accent, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer', marginTop:4 }}>
              {authLoading ? '처리 중...' : isSignup ? '시작하기 →' : '로그인 →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AppPage({ user }) {
  const [step, setStep] = useState(0)
  const [file, setFile] = useState(null)
  const [rawText, setRawText] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState(null)
  const [refImage, setRefImage] = useState(null)
  const [proofread, setProofread] = useState(false)
  const [color, setColor] = useState('#2563eb')
  const [font, setFont] = useState('Noto Serif KR')
  const [fontSize, setFontSize] = useState(12)
  const [lineHeight, setLineHeight] = useState(2.1)
  const [previewPage, setPreviewPage] = useState(null)
  const [allPages, setAllPages] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [regenCount, setRegenCount] = useState(5)
  const [showDesign, setShowDesign] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [imagePageIdx, setImagePageIdx] = useState(null)
  const [proofResult, setProofResult] = useState(null) // 교정 결과

  const S = { bg:'#f7f5f2', white:'#fff', surface:'#f0ede8', border:'#e2ddd8', accent:'#1a1a2e', accent2:'#c8963e', accent3:'#2563eb', text:'#1a1a1a', textMid:'#666', textFaint:'#aaa' }
  const colors = ['#2563eb','#1a1a2e','#c8963e','#16a34a','#dc2626','#7c3aed','#0891b2','#be185d']
  const fonts = [['Noto Serif KR','나눔명조'],['Noto Sans KR','나눔고딕']]

  // 오탈자 선택 여부에 따라 스텝 동적 변경
  // step: 0=업로드, 1=장르&스타일, 1.5(=2)=교정확인, 2(=3)=1페이지, 3(=4)=전체미리보기
  // proofread 없으면: 0,1,2,3 / 있으면: 0,1,2,3,4
  const STEPS = proofread
    ? ['업로드','장르 & 스타일','교정 확인','1페이지 확인','전체 미리보기']
    : ['업로드','장르 & 스타일','1페이지 확인','전체 미리보기']

  // 실제 step 매핑 (proofread 없을 때: 1페이지=2, 전체=3 / 있을 때: 교정=2, 1페이지=3, 전체=4)
  const STEP_1PAGE = proofread ? 3 : 2
  const STEP_ALL = proofread ? 4 : 3
  const STEP_PROOF = 2 // 교정 확인 스텝 (proofread일 때만)

  async function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setTitle(f.name.replace(/\.[^.]+$/, ''))
    if (f.name.endsWith('.docx')) {
      const mammoth = (await import('mammoth')).default
      const arrayBuffer = await f.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      setRawText(result.value)
    } else {
      const text = await f.text()
      setRawText(text)
    }
  }

  function handleRefImage(e) {
    const f = e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = ev => setRefImage(ev.target.result)
    reader.readAsDataURL(f)
  }

  async function generateOnePage(isRegen) {
    if (isRegen && regenCount <= 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ text: rawText || '샘플 텍스트', title, author, color, genre: genre?.id, onePage: true })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setPreviewPage(data.pages[0])
      if (isRegen) setRegenCount(prev => prev - 1)
      setStep(STEP_1PAGE)
    } catch (err) {
      alert(err.message)
    }
    setLoading(false)
  }

  // 오탈자 교정 함수 (Claude API 연동 전 임시 로직)
  async function runProofread() {
    setLoading(true)
    try {
      // TODO: Claude API 연동 후 실제 교정
      // 임시로 간단한 규칙 기반 교정 시뮬레이션
      const corrections = []
      const text = rawText || ''
      const rules = [
        { wrong: /됬/g, right: '됐', example: '됬다 → 됐다' },
        { wrong: /않이/g, right: '아니', example: '않이 → 아니' },
        { wrong: /슴니다/g, right: '습니다', example: '슴니다 → 습니다' },
        { wrong: /할께요/g, right: '할게요', example: '할께요 → 할게요' },
        { wrong: /어떻해/g, right: '어떻게', example: '어떻해 → 어떻게' },
        { wrong: /왠지/g, right: '왠지', example: '' },
        { wrong: /로써/g, right: '로서', example: '로써 → 로서 (자격)' },
      ]
      let correctedText = text
      rules.forEach(r => {
        if (r.wrong.test(text) && r.example) {
          corrections.push(r.example)
          correctedText = correctedText.replace(r.wrong, r.right)
        }
      })
      if (corrections.length === 0) corrections.push('교정할 오탈자가 없어요! 원고가 깔끔하네요 ✨')
      setProofResult({ corrections, correctedText, count: corrections.filter(c => c.includes('→')).length })
      setRawText(correctedText)
      setStep(STEP_PROOF)
    } catch (err) {
      alert(err.message)
    }
    setLoading(false)
  }

  async function generateAllPages() {
    setLoading(true)
    try {
      const res = await fetch('/api/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ text: rawText || '샘플 텍스트', title, author, color, genre: genre?.id })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAllPages(data.pages)
      setStep(STEP_ALL)
    } catch (err) {
      alert(err.message)
    }
    setLoading(false)
  }

  function handleImageInsert(e) {
    const f = e.target.files[0]
    if (!f || imagePageIdx === null) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const updated = [...allPages]
      const page = { ...updated[imagePageIdx] }
      if (page.sections) {
        page.sections = page.sections.map(s => s.t === 'img' ? { ...s, src: ev.target.result } : s)
      }
      updated[imagePageIdx] = page
      setAllPages(updated)
      setShowImageUpload(false)
    }
    reader.readAsDataURL(f)
  }

  return (
    <div style={{ fontFamily:'Noto Sans KR,sans-serif', background:S.bg, minHeight:'100vh' }}>
      <header style={{ height:56, background:S.white, borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', padding:'0 24px', gap:16, position:'sticky', top:0, zIndex:50 }}>
        <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:17, fontWeight:900, color:S.accent }}>
          북<em style={{ color:S.accent2, fontStyle:'normal' }}>메이커</em>
        </div>
        <div style={{ width:1, height:20, background:S.border }}></div>
        <div style={{ display:'flex', alignItems:'center', gap:2 }}>
          {STEPS.map((lbl, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:2 }}>
              {i > 0 && <span style={{ color:S.border, fontSize:12, margin:'0 2px' }}>›</span>}
              <div
                onClick={()=>{
                  if (step === STEP_ALL) return
                  if (i === 0 && step > 0) setStep(0)
                  else if (i === 1 && step > 1) setStep(1)
                  else if (proofread && i === 2 && step > 2) setStep(STEP_PROOF)
                  else if (i === (proofread?3:2) && step > STEP_1PAGE && previewPage) setStep(STEP_1PAGE)
                }}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:6, background:step===i?'rgba(37,99,235,0.08)':'transparent', cursor:(i < step && step < STEP_ALL) ? 'pointer' : 'default', transition:'all 0.15s' }}
                onMouseOver={e=>{ if(i < step && step < STEP_ALL) e.currentTarget.style.background='rgba(0,0,0,0.04)' }}
                onMouseOut={e=>{ if(i < step && step < STEP_ALL) e.currentTarget.style.background=step===i?'rgba(37,99,235,0.08)':'transparent' }}
              >
                <div style={{ width:18, height:18, borderRadius:'50%', background:step>i?S.accent2:step===i?S.accent3:S.surface, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700 }}>
                  {step > i ? '✓' : i+1}
                </div>
                <span style={{ fontSize:11, fontWeight:600, color:step===i?S.accent3:step>i?S.accent2:S.textFaint }}>{lbl}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          {step === STEP_1PAGE && (
            <button onClick={() => setShowDesign(true)} style={{ padding:'7px 14px', background:S.white, color:S.accent, border:`1px solid ${S.border}`, borderRadius:8, fontSize:12, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>
              🎨 디자인 변경
            </button>
          )}
          {step === STEP_ALL && (
            <button onClick={() => downloadPDF(allPages, title, color)} style={{ padding:'7px 14px', background:S.accent2, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>
              ⬇ PDF 다운로드
            </button>
          )}
          <button onClick={() => supabase.auth.signOut()} style={{ padding:'7px 12px', background:'transparent', border:`1px solid ${S.border}`, borderRadius:8, fontSize:11, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif', color:S.textMid }}>
            로그아웃
          </button>
        </div>
      </header>

      <div style={{ maxWidth:800, margin:'0 auto', padding:'48px 24px' }}>

        {step === 0 && (
          <div>
            <h2 style={{ fontFamily:'Noto Serif KR,serif', fontSize:28, fontWeight:900, color:S.accent, marginBottom:8 }}>원고를 업로드하세요</h2>
            <p style={{ fontSize:14, color:S.textMid, marginBottom:32 }}>워드 파일을 올리면 AI가 자동으로 책 내지를 만들어드려요.</p>
            <label style={{ display:'block', border:`2px dashed ${S.border}`, borderRadius:16, padding:'48px 20px', textAlign:'center', cursor:'pointer', background:S.white, marginBottom:24 }}>
              <input type="file" accept=".docx,.txt" onChange={handleFile} style={{ display:'none' }} />
              <div style={{ fontSize:40, marginBottom:12 }}>📄</div>
              <div style={{ fontSize:15, fontWeight:700, color:S.accent2, marginBottom:6 }}>파일 선택하기</div>
              <div style={{ fontSize:13, color:S.textMid }}>클릭하거나 드래그해서 올려보세요</div>
              <div style={{ fontSize:11, color:S.textFaint, marginTop:6 }}>.docx · .txt 지원</div>
              {file && <div style={{ marginTop:12, fontSize:13, fontWeight:700, color:S.accent }}>✅ {file.name}</div>}
            </label>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:600, color:S.textMid, display:'block', marginBottom:7 }}>책 제목</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="제목 입력" style={{ width:'100%', background:S.white, border:`1.5px solid ${S.border}`, borderRadius:10, padding:'12px 14px', fontSize:14, fontFamily:'Noto Sans KR,sans-serif', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div style={{ marginBottom:32 }}>
              <label style={{ fontSize:12, fontWeight:600, color:S.textMid, display:'block', marginBottom:7 }}>저자명</label>
              <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="홍길동" style={{ width:'100%', background:S.white, border:`1.5px solid ${S.border}`, borderRadius:10, padding:'12px 14px', fontSize:14, fontFamily:'Noto Sans KR,sans-serif', outline:'none', boxSizing:'border-box' }} />
            </div>
            <button onClick={()=>{
              if (!file) { alert('워드 파일을 업로드해주세요!'); return }
              if (!title) { alert('책 제목을 입력해주세요!'); return }
              if (!author) { alert('저자명을 입력해주세요!'); return }
              setStep(1)
            }} style={{ width:'100%', padding:15, background:S.accent, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>
              다음 →
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <button onClick={()=>setStep(0)} style={{ background:'none', border:'none', color:S.textMid, cursor:'pointer', fontSize:13, fontFamily:'Noto Sans KR,sans-serif', marginBottom:20 }}>
              ← 뒤로
            </button>
            <h2 style={{ fontFamily:'Noto Serif KR,serif', fontSize:28, fontWeight:900, color:S.accent, marginBottom:8 }}>장르를 선택하세요</h2>
            <p style={{ fontSize:14, color:S.textMid, marginBottom:28 }}>책의 장르에 맞는 레이아웃으로 자동 설계됩니다.</p>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:36 }}>
              {GENRES.map(g => (
                <div key={g.id} onClick={()=>setGenre(g)} style={{ background:genre?.id===g.id?S.accent:S.white, border:`2px solid ${genre?.id===g.id?S.accent:S.border}`, borderRadius:12, padding:'14px 10px', textAlign:'center', cursor:'pointer', transition:'all 0.15s' }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{g.icon}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:genre?.id===g.id?'#fff':S.accent, marginBottom:2 }}>{g.label}</div>
                  <div style={{ fontSize:10, color:genre?.id===g.id?'rgba(255,255,255,0.7)':S.textFaint }}>{g.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ background:S.white, border:`1px solid ${S.border}`, borderRadius:16, padding:24, marginBottom:32 }}>
              <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:16, fontWeight:700, color:S.accent, marginBottom:4 }}>
                🖼 디자인 레퍼런스 이미지 <span style={{ fontSize:12, fontWeight:400, color:S.textFaint }}>(선택사항)</span>
              </div>
              <div style={{ fontSize:13, color:S.textMid, marginBottom:16, lineHeight:1.65 }}>
                원하는 책 내지 스타일의 이미지를 올려주세요.<br />AI가 분석해서 85% 이상 유사하게 만들어드립니다.
              </div>
              {refImage ? (
                <div style={{ position:'relative', display:'inline-block' }}>
                  <img src={refImage} alt="레퍼런스" style={{ maxHeight:180, maxWidth:'100%', borderRadius:10, objectFit:'contain', border:`1px solid ${S.border}` }} />
                  <button onClick={()=>setRefImage(null)} style={{ position:'absolute', top:-8, right:-8, width:24, height:24, background:'#dc2626', color:'#fff', border:'none', borderRadius:'50%', cursor:'pointer', fontSize:12 }}>✕</button>
                  <div style={{ marginTop:8, fontSize:12, color:'#16a34a', fontWeight:600 }}>✅ 레퍼런스 이미지 업로드 완료</div>
                </div>
              ) : (
                <label style={{ display:'flex', alignItems:'center', gap:12, border:`2px dashed ${S.border}`, borderRadius:12, padding:'20px 24px', cursor:'pointer', background:S.bg }}>
                  <input type="file" accept="image/*" onChange={handleRefImage} style={{ display:'none' }} />
                  <div style={{ fontSize:28 }}>📎</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:S.accent2 }}>이미지 선택하기</div>
                    <div style={{ fontSize:12, color:S.textFaint, marginTop:2 }}>JPG · PNG · WebP</div>
                  </div>
                </label>
              )}
            </div>

            {/* 오탈자 교정 옵션 */}
            <div onClick={()=>setProofread(!proofread)} style={{ background:proofread?'rgba(37,99,235,0.04)':S.white, border:`2px solid ${proofread?S.accent3:S.border}`, borderRadius:16, padding:20, marginBottom:16, cursor:'pointer', transition:'all 0.2s' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ width:24, height:24, borderRadius:6, background:proofread?S.accent3:S.surface, border:`2px solid ${proofread?S.accent3:S.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>
                  {proofread && <span style={{ color:'#fff', fontSize:14, fontWeight:700 }}>✓</span>}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:S.accent }}>✍️ 오탈자 교정 추가</span>
                    <span style={{ fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:20, background:proofread?S.accent3:'#f3f4f6', color:proofread?'#fff':S.textMid }}>+2,000원</span>
                  </div>
                  <div style={{ fontSize:12, color:S.textMid, lineHeight:1.6 }}>
                    AI가 맞춤법·문법·띄어쓰기를 교정한 후 책 내지를 생성합니다.
                  </div>
                </div>
              </div>
              {proofread && (
                <div style={{ marginTop:12, padding:'10px 14px', background:'rgba(37,99,235,0.06)', borderRadius:8, fontSize:12, color:S.accent3, lineHeight:1.6 }}>
                  📝 원고 전체를 Claude AI가 교정합니다. 교정 결과는 책 생성 전에 확인할 수 있어요.
                </div>
              )}
            </div>

            <button onClick={()=>{
              if(!genre){ alert('장르를 선택해주세요!'); return }
              if(proofread) runProofread()
              else generateOnePage(false)
            }} disabled={loading} style={{ width:'100%', padding:15, background:loading?S.surface:S.accent2, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:loading?'not-allowed':'pointer' }}>
              {loading ? (proofread ? '⏳ 오탈자 교정 중...' : '⏳ 1페이지 생성 중...') : proofread ? '✍️ 오탈자 교정 후 생성하기 →' : '✨ 1페이지 미리보기 생성하기 →'}
            </button>
          </div>
        )}

        {/* ── STEP 교정확인 (proofread일 때만) ── */}
        {step === STEP_PROOF && proofResult && (
          <div>
            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontFamily:'Noto Serif KR,serif', fontSize:22, fontWeight:900, color:S.accent, marginBottom:4 }}>✍️ 오탈자 교정 결과</h2>
              <div style={{ fontSize:13, color:S.textMid }}>교정 내용을 확인하고 책 만들기를 진행하세요.</div>
            </div>

            {/* 교정 요약 */}
            <div style={{ background:proofResult.count>0?'rgba(37,99,235,0.06)':'rgba(22,163,74,0.06)', border:`1.5px solid ${proofResult.count>0?S.accent3:'#16a34a'}`, borderRadius:14, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ fontSize:32 }}>{proofResult.count > 0 ? '✍️' : '✨'}</div>
              <div>
                <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:18, fontWeight:700, color:S.accent, marginBottom:2 }}>
                  {proofResult.count > 0 ? `총 ${proofResult.count}곳 교정됐어요` : '오탈자가 없어요!'}
                </div>
                <div style={{ fontSize:13, color:S.textMid }}>
                  {proofResult.count > 0 ? '아래 목록에서 교정 내용을 확인하세요.' : '원고가 깔끔하게 작성됐어요 ✨'}
                </div>
              </div>
            </div>

            {/* 교정 목록 */}
            {proofResult.count > 0 && (
              <div style={{ background:S.white, border:`1px solid ${S.border}`, borderRadius:14, overflow:'hidden', marginBottom:24 }}>
                <div style={{ padding:'12px 20px', background:'#f9fafb', borderBottom:`1px solid ${S.border}`, fontSize:11, fontWeight:700, color:S.textFaint, letterSpacing:'0.1em' }}>교정 목록</div>
                <div style={{ padding:'8px 0' }}>
                  {proofResult.corrections.map((c, i) => {
                    const parts = c.split(' → ')
                    return (
                      <div key={i} style={{ padding:'10px 20px', borderBottom:i<proofResult.corrections.length-1?`1px solid #f3f4f6`:'none', display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(37,99,235,0.1)', color:S.accent3, fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
                        {parts.length === 2 ? (
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:13, color:'#dc2626', textDecoration:'line-through', background:'#fee2e2', padding:'2px 8px', borderRadius:4 }}>{parts[0]}</span>
                            <span style={{ fontSize:12, color:S.textFaint }}>→</span>
                            <span style={{ fontSize:13, color:'#16a34a', background:'#dcfce7', padding:'2px 8px', borderRadius:4 }}>{parts[1]}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize:13, color:S.textMid }}>{c}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setStep(1)} style={{ flex:1, padding:13, background:S.white, color:S.accent, border:`1.5px solid ${S.border}`, borderRadius:12, fontSize:13, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>
                ← 다시 선택
              </button>
              <button onClick={()=>generateOnePage(false)} disabled={loading} style={{ flex:2, padding:13, background:loading?S.surface:S.accent2, color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:loading?'not-allowed':'pointer' }}>
                {loading ? '⏳ 생성 중...' : '✅ 이대로 책 만들기 →'}
              </button>
            </div>
          </div>
        )}

        {step === STEP_1PAGE && previewPage && (
          <div>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontFamily:'Noto Serif KR,serif', fontSize:22, fontWeight:900, color:S.accent, marginBottom:4 }}>1페이지 미리보기</h2>
              <div style={{ fontSize:13, color:S.textMid }}>디자인이 마음에 드시면 확정해주세요.</div>
            </div>

            <div style={{ background:S.white, borderRadius:'3px 16px 16px 3px', boxShadow:'0 4px 28px rgba(0,0,0,0.13)', overflow:'hidden', position:'relative', marginBottom:24 }}>
              <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:'linear-gradient(to right,#bbb,#f0ede8)', zIndex:1 }}></div>
              <PageRenderer page={previewPage} color={color} fontSize={fontSize} lineHeight={lineHeight} font={font} />
            </div>

            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              <button onClick={()=>setShowDesign(true)} style={{ flex:1, padding:13, background:S.white, color:S.accent, border:`1.5px solid ${S.accent}`, borderRadius:12, fontSize:13, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>
                🎨 디자인 변경
              </button>
              <button onClick={()=>setShowConfirm(true)} disabled={loading} style={{ flex:2, padding:13, background:loading?S.surface:S.accent2, color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:loading?'not-allowed':'pointer' }}>
                {loading ? '⏳ 생성 중...' : '✅ 이 디자인으로 확정 → 5페이지 생성'}
              </button>
            </div>
            <button onClick={()=>setStep(1)} style={{ background:'none', border:'none', color:S.textMid, cursor:'pointer', fontSize:13, fontFamily:'Noto Sans KR,sans-serif' }}>
              ← 장르 다시 선택
            </button>

            {/* 확인 팝업 */}
            {showConfirm && (
              <div style={{ position:'fixed', inset:0, background:'rgba(26,26,46,0.6)', backdropFilter:'blur(8px)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
                <div style={{ background:S.white, borderRadius:20, padding:36, width:'100%', maxWidth:400, boxShadow:'0 24px 80px rgba(0,0,0,0.18)', textAlign:'center' }}>
                  <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
                  <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:20, fontWeight:900, color:S.accent, marginBottom:10 }}>
                    5페이지를 생성할까요?
                  </div>
                  <div style={{ fontSize:13, color:S.textMid, lineHeight:1.85, marginBottom:28, wordBreak:'keep-all' }}>
                    지금 디자인으로 5페이지가 생성됩니다.<br />
                    <strong style={{ color:'#dc2626' }}>생성 후에는 이 단계로 돌아올 수 없어요.</strong><br />
                    계속 진행하시겠어요?
                  </div>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={()=>setShowConfirm(false)} style={{ flex:1, padding:13, background:S.surface, color:S.textMid, border:`1px solid ${S.border}`, borderRadius:12, fontSize:14, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>
                      취소
                    </button>
                    <button onClick={()=>{ setShowConfirm(false); generateAllPages() }} style={{ flex:2, padding:13, background:S.accent2, color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>
                      확인, 생성하기 →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === STEP_ALL && allPages.length > 0 && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <div>
                <h2 style={{ fontFamily:'Noto Serif KR,serif', fontSize:22, fontWeight:900, color:S.accent, marginBottom:4 }}>5페이지 미리보기</h2>
                <div style={{ fontSize:12, color:S.textFaint }}>{currentPage+1} / {allPages.length} 페이지</div>
              </div>
            </div>
            <div style={{ background:S.white, borderRadius:'3px 16px 16px 3px', boxShadow:'0 4px 28px rgba(0,0,0,0.13)', overflow:'hidden', position:'relative', marginBottom:24 }}>
              <div style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:'linear-gradient(to right,#bbb,#f0ede8)', zIndex:1 }}></div>
              <PageRenderer page={allPages[currentPage]} color={color} fontSize={fontSize} lineHeight={lineHeight} font={font} onImageClick={(idx)=>{ setImagePageIdx(idx); setShowImageUpload(true) }} />
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:12, marginBottom:32 }}>
              <button onClick={()=>setCurrentPage(Math.max(0,currentPage-1))} disabled={currentPage===0} style={{ width:44, height:44, background:S.white, border:`1.5px solid ${S.border}`, borderRadius:12, fontSize:20, cursor:'pointer', opacity:currentPage===0?0.3:1, display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                {allPages.map((_,i) => <div key={i} onClick={()=>setCurrentPage(i)} style={{ width:i===currentPage?18:6, height:6, borderRadius:3, background:i===currentPage?S.accent3:S.border, cursor:'pointer', transition:'all 0.2s' }}></div>)}
              </div>
              <button onClick={()=>setCurrentPage(Math.min(allPages.length-1,currentPage+1))} disabled={currentPage===allPages.length-1} style={{ width:44, height:44, background:S.white, border:`1.5px solid ${S.border}`, borderRadius:12, fontSize:20, cursor:'pointer', opacity:currentPage===allPages.length-1?0.3:1, display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
            </div>
            <div style={{ background:S.accent, borderRadius:20, padding:'32px 28px', textAlign:'center', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, background:'rgba(255,255,255,0.05)', borderRadius:'50%' }}></div>
              <div style={{ fontSize:36, marginBottom:12 }}>🔒</div>
              <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:20, fontWeight:900, color:'#fff', marginBottom:8 }}>전체 PDF를 받으시겠어요?</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:20, lineHeight:1.7 }}>지금 결제하면 전체 페이지를<br />고해상도 PDF로 즉시 다운로드할 수 있어요</div>

              {/* 가격 표시 */}
              <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'16px 20px', marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:proofread?8:0 }}>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>전자책 PDF</div>
                  <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>9,900원</div>
                </div>
                {proofread && (
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:8, borderTop:'1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.6)' }}>✍️ 오탈자 교정</div>
                    <div style={{ fontSize:16, fontWeight:700, color:'#fbbf24' }}>+2,000원</div>
                  </div>
                )}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, marginTop:8, borderTop:'1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.8)' }}>합계</div>
                  <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:32, fontWeight:900, color:'#fff' }}>
                    {proofread ? '11,900원' : '9,900원'}
                  </div>
                </div>
              </div>

              <div>
                <button style={{ width:'100%', padding:16, background:S.accent2, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>
                  💳 지금 결제하고 전체 받기
                </button>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:10 }}>포트원 · 카드 결제 가능</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showDesign && (
        <DesignPanel
          S={S} colors={colors} fonts={fonts}
          color={color} setColor={setColor}
          font={font} setFont={setFont}
          fontSize={fontSize} setFontSize={setFontSize}
          lineHeight={lineHeight} setLineHeight={setLineHeight}
          regenCount={regenCount} setRegenCount={setRegenCount}
          onRegen={()=>generateOnePage(true)}
          loading={loading}
          onClose={()=>setShowDesign(false)}
        />
      )}

      {showImageUpload && (
        <div onClick={()=>setShowImageUpload(false)} style={{ position:'fixed', inset:0, background:'rgba(26,26,46,0.5)', backdropFilter:'blur(8px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:S.white, borderRadius:20, padding:36, width:'100%', maxWidth:380, textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🖼</div>
            <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:20, fontWeight:900, color:S.accent, marginBottom:8 }}>이미지 삽입</div>
            <div style={{ fontSize:13, color:S.textMid, marginBottom:24 }}>이미지 자리에 넣을 사진을 선택하세요.</div>
            <label style={{ display:'block', border:`2px dashed ${S.border}`, borderRadius:12, padding:'32px 20px', cursor:'pointer', background:S.bg, marginBottom:16 }}>
              <input type="file" accept="image/*" onChange={handleImageInsert} style={{ display:'none' }} />
              <div style={{ fontSize:13, fontWeight:700, color:S.accent2 }}>파일 선택하기</div>
              <div style={{ fontSize:12, color:S.textFaint, marginTop:4 }}>JPG · PNG · WebP</div>
            </label>
            <button onClick={()=>setShowImageUpload(false)} style={{ width:'100%', padding:12, background:'transparent', border:`1px solid ${S.border}`, borderRadius:10, fontSize:13, color:S.textMid, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>취소</button>
          </div>
        </div>
      )}
    </div>
  )
}

function DesignPanel({ S, colors, fonts, color, setColor, font, setFont, fontSize, setFontSize, lineHeight, setLineHeight, regenCount, setRegenCount, onRegen, loading, onClose }) {
  const [pendingImage, setPendingImage] = useState(null)
  const [imageSaved, setImageSaved] = useState(true) // 이미지 없으면 true (적용완료 활성)

  function handleRefUpload(e) {
    const f = e.target.files[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = ev => {
      setPendingImage(ev.target.result)
      setImageSaved(false) // 이미지 올리면 저장 필요 → 적용완료 비활성
    }
    reader.readAsDataURL(f)
  }

  function handleSaveRegen() {
    if (regenCount <= 0) return
    setImageSaved(true)
    onRegen()
  }

  function removeImage() {
    setPendingImage(null)
    setImageSaved(true)
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex' }}>
      <div onClick={()=>{ if(imageSaved) onClose() }} style={{ flex:1, background:'rgba(0,0,0,0.2)' }}></div>
      <div style={{ width:320, background:S.white, boxShadow:'-8px 0 32px rgba(0,0,0,0.12)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* 헤더 */}
        <div style={{ padding:'18px 20px 14px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:17, fontWeight:900, color:S.accent }}>🎨 디자인 변경</div>
          <button onClick={()=>{ if(imageSaved) onClose() }} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:S.textFaint }}>✕</button>
        </div>

        {/* 스크롤 영역 */}
        <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:20 }}>

          {/* 색상 */}
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:S.textMid, marginBottom:10 }}>포인트 컬러</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {colors.map(c => (
                <div key={c} onClick={()=>setColor(c)} style={{ width:32, height:32, borderRadius:'50%', background:c, cursor:'pointer', border:color===c?`3px solid ${S.accent}`:'3px solid transparent', transform:color===c?'scale(1.15)':'scale(1)', transition:'all 0.15s' }} />
              ))}
            </div>
          </div>

          {/* 폰트 */}
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:S.textMid, marginBottom:8 }}>폰트</div>
            <div style={{ display:'flex', gap:8 }}>
              {fonts.map(([val,lbl]) => (
                <button key={val} onClick={()=>setFont(val)} style={{ flex:1, padding:'9px', background:font===val?S.accent:S.surface, color:font===val?'#fff':S.textMid, border:'none', borderRadius:8, fontSize:12, fontWeight:600, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer', transition:'all 0.15s' }}>{lbl}</button>
              ))}
            </div>
          </div>

          {/* 글씨 크기 */}
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:S.textMid, marginBottom:8, display:'flex', justifyContent:'space-between' }}>
              <span>글씨 크기</span><span style={{ color:S.accent2, fontWeight:700 }}>{fontSize}px</span>
            </div>
            <input type="range" min="10" max="15" value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} style={{ width:'100%', accentColor:S.accent2 }} />
          </div>

          {/* 줄 간격 */}
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:S.textMid, marginBottom:8, display:'flex', justifyContent:'space-between' }}>
              <span>줄 간격</span><span style={{ color:S.accent2, fontWeight:700 }}>{lineHeight.toFixed(1)}</span>
            </div>
            <input type="range" min="16" max="26" value={lineHeight*10} onChange={e=>setLineHeight(e.target.value/10)} style={{ width:'100%', accentColor:S.accent2 }} />
          </div>

          {/* 구분선 */}
          <div style={{ height:1, background:S.border }}></div>

          {/* 레퍼런스 이미지 재생성 */}
          <div>
            <div style={{ fontSize:12, fontWeight:600, color:S.textMid, marginBottom:4, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>🖼 레퍼런스 이미지로 재생성</span>
              <div style={{ display:'flex', gap:3 }}>
                {[...Array(5)].map((_,i) => (
                  <div key={i} style={{ width:8, height:8, borderRadius:'50%', background:i < regenCount ? '#2563eb' : S.border }} />
                ))}
              </div>
            </div>
            <div style={{ fontSize:11, color:S.textFaint, marginBottom:12, lineHeight:1.6 }}>
              원하는 스타일의 이미지를 올리면<br />AI가 분석해서 비슷하게 재생성해드려요.
            </div>

            {/* 이미지 업로드 영역 */}
            {!pendingImage ? (
              <label style={{ display:'flex', alignItems:'center', gap:10, border:`2px dashed ${S.border}`, borderRadius:10, padding:'14px 16px', cursor:regenCount<=0?'not-allowed':'pointer', background:regenCount<=0?S.surface:S.bg, opacity:regenCount<=0?0.5:1, transition:'all 0.2s' }}>
                <input type="file" accept="image/*" onChange={handleRefUpload} style={{ display:'none' }} disabled={regenCount<=0} />
                <div style={{ fontSize:22 }}>📎</div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:regenCount<=0?S.textFaint:S.accent2 }}>
                    {regenCount<=0 ? '재생성 횟수 소진' : '이미지 선택하기'}
                  </div>
                  <div style={{ fontSize:11, color:S.textFaint, marginTop:2 }}>JPG · PNG · WebP</div>
                </div>
              </label>
            ) : (
              <div>
                <div style={{ position:'relative', marginBottom:10 }}>
                  <img src={pendingImage} alt="레퍼런스" style={{ width:'100%', maxHeight:140, objectFit:'contain', borderRadius:10, border:`1px solid ${S.border}`, background:S.surface }} />
                  <button onClick={removeImage} style={{ position:'absolute', top:-8, right:-8, width:22, height:22, background:'#dc2626', color:'#fff', border:'none', borderRadius:'50%', cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                </div>
                {/* 저장 버튼 */}
                <button onClick={handleSaveRegen} disabled={loading || regenCount<=0} style={{ width:'100%', padding:'11px', background:loading||regenCount<=0?S.surface:'#2563eb', color:loading||regenCount<=0?S.textFaint:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:loading||regenCount<=0?'not-allowed':'pointer', transition:'all 0.2s' }}>
                  {loading ? '⏳ 재생성 중...' : `🔄 이 스타일로 재생성 (${regenCount}회 남음)`}
                </button>
                {!imageSaved && <div style={{ fontSize:11, color:'#dc2626', marginTop:6, textAlign:'center' }}>저장 후 적용완료 버튼이 활성화됩니다</div>}
              </div>
            )}
          </div>
        </div>

        {/* 하단 적용완료 */}
        <div style={{ padding:16, borderTop:`1px solid ${S.border}`, flexShrink:0 }}>
          <button
            onClick={()=>{ if(imageSaved) onClose() }}
            disabled={!imageSaved}
            style={{ width:'100%', padding:13, background:imageSaved?S.accent:S.border, color:imageSaved?'#fff':S.textFaint, border:'none', borderRadius:10, fontSize:14, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:imageSaved?'pointer':'not-allowed', transition:'all 0.2s' }}>
            {imageSaved ? '✅ 적용 완료' : '이미지 저장 후 적용 가능'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PageRenderer({ page, color, fontSize=12, lineHeight=2.1, font='Noto Serif KR', onImageClick }) {
  if (!page) return null
  if (page.type === 'chapter') {
    return (
      <div style={{ fontFamily:'Noto Sans KR,sans-serif' }}>
        <div style={{ background:color, height:200, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', bottom:-1, left:0, right:0, height:28, background:'#fff', clipPath:'ellipse(55% 100% at 50% 100%)' }}></div>
          <div style={{ position:'absolute', top:24, left:40, fontSize:10, fontWeight:700, letterSpacing:'0.25em', color:'#c8963e', fontFamily:'Noto Sans KR,sans-serif' }}>{page.num}</div>
          <div style={{ position:'absolute', top:46, left:40, right:32, fontFamily:`${font},serif`, fontSize:26, fontWeight:900, color:'#fff', lineHeight:1.3 }}>
            {(page.title||'').split('\n').map((t,i) => <div key={i}>{t}</div>)}
          </div>
        </div>
        <div style={{ padding:'24px 32px 20px 40px' }}>
          {(page.body||[]).map((t,i) => <p key={i} style={{ fontSize, lineHeight, color:'#444', marginBottom:10, wordBreak:'keep-all', fontFamily:`${font},sans-serif` }}>{t}</p>)}
        </div>
        <div style={{ padding:'10px 32px 16px 40px', borderTop:'0.5px solid #e0ddd8', display:'flex', justifyContent:'space-between', fontSize:10, color:'#bbb', fontFamily:'Noto Serif KR,serif' }}>
          <span>{page.pn}</span><span>{page.bookTitle}</span>
        </div>
      </div>
    )
  }
  return (
    <div style={{ padding:'24px 32px 20px 40px', fontFamily:'Noto Sans KR,sans-serif' }}>
      <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:9, borderBottom:'0.5px solid #e0ddd8', marginBottom:16, fontSize:8.5, letterSpacing:'0.12em', color:'#bbb' }}>
        <span>{page.rh}</span>
        <span style={{ width:5, height:5, borderRadius:'50%', background:color, display:'inline-block' }}></span>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {(page.sections||[]).map((s,i) => {
          if (s.t==='sec') return <div key={i} style={{ fontFamily:`${font},serif`, fontSize:15, fontWeight:700, color:'#111', paddingLeft:10, borderLeft:`3px solid ${color}`, lineHeight:1.4 }}>{s.c}</div>
          if (s.t==='txt') return <p key={i} style={{ fontSize, lineHeight, color:'#444', wordBreak:'keep-all', textAlign:'justify', fontFamily:`${font},sans-serif` }}>{s.c}</p>
          if (s.t==='quote') return <div key={i} style={{ borderLeft:`3px solid ${color}`, background:`${color}12`, padding:'10px 14px', borderRadius:'0 6px 6px 0' }}><p style={{ fontSize:11.5, lineHeight:1.85, color:'#333', fontStyle:'italic' }}>{s.c}</p>{s.src && <span style={{ fontSize:10, fontWeight:700, color, display:'block', marginTop:4 }}>{s.src}</span>}</div>
          if (s.t==='img') return (
            <div key={i} onClick={()=>onImageClick&&onImageClick(i)} style={{ background:'#f0ede8', border:`1.5px dashed ${s.src?'transparent':'#d4cfc9'}`, borderRadius:8, minHeight:100, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#aaa', cursor:'pointer' }}>
              {s.src ? <img src={s.src} alt="삽입된 이미지" style={{ width:'100%', display:'block' }} /> : <div style={{ textAlign:'center' }}><div style={{ fontSize:24, marginBottom:4 }}>🖼</div><div>클릭해서 이미지 삽입</div></div>}
            </div>
          )
          return null
        })}
      </div>
      <div style={{ marginTop:16, paddingTop:10, borderTop:'0.5px solid #e0ddd8', display:'flex', justifyContent:'space-between', fontSize:10, color:'#bbb', fontFamily:'Noto Serif KR,serif' }}>
        <span>{page.pn}</span><span>{page.ct}</span>
      </div>
    </div>
  )
}
