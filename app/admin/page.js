
'use client'
import { useState, useEffect } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard')
  const [data, setData] = useState({ profiles:[], books:[], payments:[] })
  const [loading, setLoading] = useState(true)
  const [previewBook, setPreviewBook] = useState(null)
  const [previewPages, setPreviewPages] = useState([])
  const [maintenance, setMaintenance] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [now, setNow] = useState(new Date())

  const S = {
    bg:'#f0f2f5', white:'#fff', border:'#e5e7eb',
    accent:'#1a1a2e', accent2:'#c8963e', accent3:'#2563eb',
    green:'#16a34a', red:'#dc2626', text:'#111827', mid:'#6b7280', faint:'#9ca3af'
  }

  useEffect(() => {
    loadAll()
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  async function apiFetch(path) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    })
    return res.json()
  }

  async function loadAll() {
    setLoading(true)
    const [profiles, books, payments] = await Promise.all([
      apiFetch('profiles?select=*&order=created_at.desc'),
      apiFetch('books?select=*&order=created_at.desc'),
      apiFetch('payments?select=*&order=created_at.desc'),
    ])
    setData({ profiles: profiles||[], books: books||[], payments: payments||[] })
    setLoading(false)
  }

  async function loadBookPages(bookId) {
    const pages = await apiFetch(`pages?book_id=eq.${bookId}&order=page_number.asc`)
    setPreviewPages(pages||[])
  }

  async function regenBook(bookId, title) {
    if (!confirm(`"${title}" Ï±ÖÏùÑ ?¨ÏÉù?±Ìïò?úÍ≤†?¥Ïöî?\nÍ∏∞Ï°¥ ?òÏù¥ÏßÄÍ∞Ä ??†ú?©Îãà??`)) return
    await fetch(`${SUPABASE_URL}/rest/v1/pages?book_id=eq.${bookId}`, {
      method:'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
    alert('??Í∏∞Ï°¥ ?òÏù¥ÏßÄ ??†ú?êÏñ¥?? ?†Ï?Í∞Ä ?§Ïãú ?ùÏÑ±?òÎèÑÎ°??àÎÇ¥?¥Ï£º?∏Ïöî.')
    loadAll()
  }

  const fmtDate = (d) => {
    if (!d) return '-'
    const dt = new Date(d)
    return `${dt.getMonth()+1}/${dt.getDate()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`
  }
  const fmtMoney = (n) => Number(n||0).toLocaleString() + '??

  const paidPayments = data.payments.filter(p => p.status === 'paid')
  const totalRev = paidPayments.reduce((s,p) => s+(p.amount||0), 0)
  const today = new Date().toDateString()
  const todayUsers = data.profiles.filter(p => new Date(p.created_at).toDateString() === today).length
  const conv = data.profiles.length > 0 ? ((paidPayments.length/data.profiles.length)*100).toFixed(1) : 0
  const genreNames = { essay:'?êÏÑ∏??, novel:'?åÏÑ§', selfdev:'?êÍ∏∞Í≥ÑÎ∞ú', business:'ÎπÑÏ¶à?àÏä§', memoir:'?åÍ≥†Î°?, travel:'?¨Ìñâ', thesis:'?ºÎ¨∏', prose:'?òÌïÑ', poetry:'?úÏßë', economy:'Í≤ΩÏ†úÍ≤ΩÏòÅ', academic:'?ôÏà†??, textbook:'ÍµêÏû¨', interview:'?∏ÌÑ∞Î∑∞Ïßë', lifestyle:'?ºÏù¥?ÑÏä§?Ä??, shortstory:'?®Ìé∏?åÏÑ§' }

  const Badge = ({ color, children }) => (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:700, background:color+'20', color }}>{children}</span>
  )

  const Card = ({ children, style }) => (
    <div style={{ background:S.white, borderRadius:14, border:`1px solid ${S.border}`, overflow:'hidden', ...style }}>{children}</div>
  )

  const CardHeader = ({ title, sub }) => (
    <div style={{ padding:'16px 20px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div style={{ fontSize:14, fontWeight:700 }}>{title}</div>
      {sub && <div style={{ fontSize:12, color:S.faint }}>{sub}</div>}
    </div>
  )

  const StatCard = ({ color, icon, label, value, sub }) => (
    <div style={{ background:S.white, borderRadius:14, border:`1px solid ${S.border}`, padding:20, position:'relative', overflow:'hidden', borderTop:`3px solid ${color}` }}>
      <div style={{ position:'absolute', top:16, right:16, fontSize:28, opacity:0.15 }}>{icon}</div>
      <div style={{ fontSize:11, fontWeight:600, color:S.faint, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>{label}</div>
      <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:32, fontWeight:900, color:S.text, lineHeight:1, marginBottom:6 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:S.mid }}>{sub}</div>}
    </div>
  )

  const SIDEBAR_ITEMS = [
    { id:'dashboard', icon:'?ìä', label:'?Ä?úÎ≥¥?? },
    { id:'users', icon:'?ë•', label:'?åÏõê Í¥ÄÎ¶? },
    { id:'books', icon:'?ìö', label:'Ï±??ÑÎ°ú?ùÌä∏' },
    { id:'payments', icon:'?í≥', label:'Í≤∞Ï†ú ?¥Ïó≠' },
    null,
    { id:'settings', icon:'?ôÔ∏è', label:'?§Ï†ï' },
  ]

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'Noto Sans KR,sans-serif', background:S.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        table { width:100%; border-collapse:collapse; }
        th { padding:11px 16px; text-align:left; font-size:11px; font-weight:700; color:${S.faint}; letter-spacing:0.08em; text-transform:uppercase; background:#f9fafb; border-bottom:1px solid ${S.border}; }
        td { padding:13px 16px; font-size:13px; border-bottom:1px solid #f3f4f6; }
        tr:last-child td { border-bottom:none; }
        tr:hover td { background:#fafafa; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:#ddd; border-radius:2px; }
      `}</style>

      {/* ?¨Ïù¥?úÎ∞î */}
      <div style={{ width:220, background:S.accent, flexShrink:0, display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh' }}>
        <div style={{ padding:'24px 20px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:18, fontWeight:900, color:'#fff' }}>
            Î∂?em style={{ color:S.accent2, fontStyle:'normal' }}>Î©îÏù¥Ïª?/em>
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:3, letterSpacing:'0.1em' }}>ADMIN DASHBOARD</div>
        </div>
        <nav style={{ flex:1, padding:'12px 8px', display:'flex', flexDirection:'column', gap:2 }}>
          {SIDEBAR_ITEMS.map((item, i) => item === null
            ? <div key={i} style={{ height:1, background:'rgba(255,255,255,0.08)', margin:'8px 0' }} />
            : (
              <div key={item.id} onClick={() => { setTab(item.id); if(item.id==='books') loadAll() }} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:8, fontSize:13, fontWeight:600, color:tab===item.id?'#fff':'rgba(255,255,255,0.6)', background:tab===item.id?'rgba(255,255,255,0.12)':'transparent', cursor:'pointer', transition:'all 0.15s' }}>
                <span style={{ fontSize:16, width:20, textAlign:'center' }}>{item.icon}</span>
                {item.label}
              </div>
            )
          )}
        </nav>
        <div style={{ padding:16, borderTop:'1px solid rgba(255,255,255,0.1)', fontSize:12, color:'rgba(255,255,255,0.5)' }}>
          <strong style={{ color:'rgba(255,255,255,0.8)', display:'block', marginBottom:2 }}>Í¥ÄÎ¶¨Ïûê</strong>
          admin@bookmaker.kr
        </div>
      </div>

      {/* Î©îÏù∏ */}
      <div style={{ flex:1, overflow:'auto' }}>

        {/* ?ëÎ∞î */}
        <div style={{ height:56, background:S.white, borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', padding:'0 28px', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ fontSize:15, fontWeight:700 }}>
            {{ dashboard:'?Ä?úÎ≥¥??, users:'?åÏõê Í¥ÄÎ¶?, books:'Ï±??ÑÎ°ú?ùÌä∏', payments:'Í≤∞Ï†ú ?¥Ïó≠', settings:'?§Ï†ï' }[tab]}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:12, color:S.mid }}>{now.getFullYear()}??{now.getMonth()+1}??{now.getDate()}??/div>
            <button onClick={loadAll} style={{ padding:'7px 14px', background:S.bg, border:`1px solid ${S.border}`, borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif', color:S.mid }}>?îÑ ?àÎ°úÍ≥†Ïπ®</button>
          </div>
        </div>

        <div style={{ padding:28 }}>

          {/* ?Ä?Ä ?Ä?úÎ≥¥???Ä?Ä */}
          {tab === 'dashboard' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
                <StatCard color={S.accent3} icon="?ë•" label="Ï¥??åÏõê?? value={data.profiles.length} sub={`?§Îäò ${todayUsers}Î™?Í∞Ä??} />
                <StatCard color={S.accent2} icon="?í≥" label="Ï¥?Îß§Ï∂ú" value={fmtMoney(totalRev)} sub={`Í≤∞Ï†ú ${paidPayments.length}Í±?} />
                <StatCard color={S.green} icon="?ìö" label="?ùÏÑ±??Ï±? value={data.books.length} sub="?ÑÏ†Å" />
                <StatCard color={S.accent} icon="?îÑ" label="?ÑÌôò?? value={conv+'%'} sub="Í∞Ä????Í≤∞Ï†ú" />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
                <Card>
                  <CardHeader title="ÏµúÍ∑º Í∞Ä?ÖÏûê" sub={`Ï¥?${data.profiles.length}Î™?} />
                  <table>
                    <thead><tr><th>?¥Î©î??/th><th>Í∞Ä?ÖÏùº</th><th>?ÅÌÉú</th></tr></thead>
                    <tbody>
                      {data.profiles.slice(0,8).map((u,i) => (
                        <tr key={i}>
                          <td>{u.email||'-'}</td>
                          <td style={{ color:S.mid }}>{fmtDate(u.created_at)}</td>
                          <td><Badge color={S.accent3}>?úÏÑ±</Badge></td>
                        </tr>
                      ))}
                      {data.profiles.length===0 && <tr><td colSpan={3} style={{ textAlign:'center', padding:32, color:S.faint }}>?ë• ?ÑÏßÅ Í∞Ä?ÖÌïú ?†Ï?Í∞Ä ?ÜÏñ¥??/td></tr>}
                    </tbody>
                  </table>
                </Card>

                <Card>
                  <CardHeader title="ÏµúÍ∑º Í≤∞Ï†ú" sub={`Ï¥?${paidPayments.length}Í±?} />
                  <table>
                    <thead><tr><th>?†Ï?</th><th>Í∏àÏï°</th><th>?ÅÌÉú</th><th>?ºÏãú</th></tr></thead>
                    <tbody>
                      {data.payments.slice(0,8).map((p,i) => (
                        <tr key={i}>
                          <td style={{ fontSize:12 }}>{p.user_id?.slice(0,8)||'-'}...</td>
                          <td style={{ fontWeight:700 }}>{fmtMoney(p.amount)}</td>
                          <td><Badge color={p.status==='paid'?S.green:p.status==='pending'?'#d97706':S.red}>{p.status==='paid'?'?ÑÎ£å':p.status==='pending'?'?ÄÍ∏?:'?§Ìå®'}</Badge></td>
                          <td style={{ color:S.mid }}>{fmtDate(p.created_at)}</td>
                        </tr>
                      ))}
                      {data.payments.length===0 && <tr><td colSpan={4} style={{ textAlign:'center', padding:32, color:S.faint }}>?í≥ Í≤∞Ï†ú ?¥Ïó≠???ÜÏñ¥??/td></tr>}
                    </tbody>
                  </table>
                </Card>
              </div>

              {/* ?•Î•¥ ?µÍ≥Ñ */}
              <Card>
                <CardHeader title="?•Î•¥Î≥?Ï±??ùÏÑ± ?µÍ≥Ñ" />
                <div style={{ padding:'16px 20px' }}>
                  {(() => {
                    const gc = {}
                    data.books.forEach(b => { if(b.genre) gc[b.genre] = (gc[b.genre]||0)+1 })
                    const entries = Object.entries(gc).sort((a,b)=>b[1]-a[1])
                    const max = Math.max(...entries.map(e=>e[1]), 1)
                    const cls = ['#2563eb','#c8963e','#16a34a','#dc2626','#7c3aed','#0891b2']
                    if (!entries.length) return <div style={{ textAlign:'center', padding:24, color:S.faint }}>?ìä ?ÑÏßÅ ?ùÏÑ±??Ï±ÖÏù¥ ?ÜÏñ¥??/div>
                    return entries.map(([g,c],i) => (
                      <div key={g} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                        <div style={{ fontSize:12, color:S.mid, width:80, textAlign:'right', flexShrink:0 }}>{genreNames[g]||g}</div>
                        <div style={{ flex:1, height:8, background:'#f3f4f6', borderRadius:4, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${(c/max)*100}%`, background:cls[i%cls.length], borderRadius:4, transition:'width 0.8s' }}></div>
                        </div>
                        <div style={{ fontSize:12, fontWeight:700, width:36 }}>{c}Í±?/div>
                      </div>
                    ))
                  })()}
                </div>
              </Card>
            </div>
          )}

          {/* ?Ä?Ä ?åÏõê Í¥ÄÎ¶??Ä?Ä */}
          {tab === 'users' && (
            <Card>
              <CardHeader title="?ë• ?åÏõê Î™©Î°ù" sub={`Ï¥?${data.profiles.length}Î™?} />
              <div style={{ padding:'12px 20px', borderBottom:`1px solid ${S.border}`, display:'flex', gap:10 }}>
                <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="?¥Î©î?ºÎ°ú Í≤Ä??.." style={{ flex:1, padding:'9px 14px', border:`1px solid ${S.border}`, borderRadius:8, fontSize:13, fontFamily:'Noto Sans KR,sans-serif', outline:'none' }} />
              </div>
              <table>
                <thead><tr><th>?¥Î©î??/th><th>Í∞Ä?ÖÏùº</th><th>Ï±???/th><th>Í≤∞Ï†ú</th><th>?°ÏÖò</th></tr></thead>
                <tbody>
                  {data.profiles.filter(u=>(u.email||'').toLowerCase().includes(userSearch.toLowerCase())).map((u,i) => {
                    const userBooks = data.books.filter(b => b.user_id === u.id)
                    const userPaid = data.payments.find(p => p.user_id === u.id && p.status === 'paid')
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight:500 }}>{u.email||'-'}</td>
                        <td style={{ color:S.mid }}>{fmtDate(u.created_at)}</td>
                        <td>{userBooks.length}Í∂?/td>
                        <td><Badge color={userPaid?S.green:S.mid}>{userPaid?'Í≤∞Ï†ú?ÑÎ£å':'Î¨¥Î£å'}</Badge></td>
                        <td>
                          <button onClick={()=>alert('?†Ï? ??†ú??Supabase ?Ä?úÎ≥¥?úÏóê??ÏßÅÏ†ë ?¥Ï£º?∏Ïöî.')} style={{ padding:'5px 12px', background:'#fee2e2', color:S.red, border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>??†ú</button>
                        </td>
                      </tr>
                    )
                  })}
                  {data.profiles.length===0 && <tr><td colSpan={5} style={{ textAlign:'center', padding:32, color:S.faint }}>?ë• ?ÑÏßÅ Í∞Ä?ÖÌïú ?†Ï?Í∞Ä ?ÜÏñ¥??/td></tr>}
                </tbody>
              </table>
            </Card>
          )}

          {/* ?Ä?Ä Ï±??ÑÎ°ú?ùÌä∏ ?Ä?Ä */}
          {tab === 'books' && (
            <>
              <Card>
                <CardHeader title="?ìö Ï±??ÑÎ°ú?ùÌä∏ Î™©Î°ù" sub={`Ï¥?${data.books.length}Í±?} />
                <table>
                  <thead><tr><th>?úÎ™©</th><th>?Ä??/th><th>?•Î•¥</th><th>?ÅÌÉú</th><th>?ùÏÑ±??/th><th>?°ÏÖò</th></tr></thead>
                  <tbody>
                    {data.books.map((b,i) => (
                      <tr key={i}>
                        <td style={{ fontWeight:600 }}>{b.title||'-'}</td>
                        <td>{b.author||'-'}</td>
                        <td><Badge color={S.accent3}>{genreNames[b.genre]||b.genre||'-'}</Badge></td>
                        <td><Badge color={b.status==='paid'?S.green:S.mid}>{b.status==='paid'?'Í≤∞Ï†ú?ÑÎ£å':'ÎØ∏Î¶¨Î≥¥Í∏∞'}</Badge></td>
                        <td style={{ color:S.mid }}>{fmtDate(b.created_at)}</td>
                        <td style={{ display:'flex', gap:6 }}>
                          <button onClick={async()=>{ setPreviewBook(b); await loadBookPages(b.id) }} style={{ padding:'5px 10px', background:'#dbeafe', color:S.accent3, border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>?ëÅ Î≥¥Í∏∞</button>
                          <button onClick={()=>regenBook(b.id, b.title)} style={{ padding:'5px 10px', background:'#fee2e2', color:S.red, border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>?îÑ ?¨ÏÉù??/button>
                        </td>
                      </tr>
                    ))}
                    {data.books.length===0 && <tr><td colSpan={6} style={{ textAlign:'center', padding:32, color:S.faint }}>?ìö ?ùÏÑ±??Ï±ÖÏù¥ ?ÜÏñ¥??/td></tr>}
                  </tbody>
                </table>
              </Card>

              {/* Ï±?ÎØ∏Î¶¨Î≥¥Í∏∞ Î™®Îã¨ */}
              {previewBook && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
                  <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:700, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
                    <div style={{ padding:'18px 24px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ fontSize:16, fontWeight:700 }}>{previewBook.title}</div>
                        <div style={{ fontSize:12, color:S.mid }}>{previewBook.author} ¬∑ {previewPages.length}?òÏù¥ÏßÄ</div>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={()=>regenBook(previewBook.id, previewBook.title)} style={{ padding:'8px 16px', background:'#fee2e2', color:S.red, border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>?îÑ ?¨ÏÉù??/button>
                        <button onClick={()=>setPreviewBook(null)} style={{ padding:'8px 16px', background:S.bg, border:`1px solid ${S.border}`, borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>???´Í∏∞</button>
                      </div>
                    </div>
                    <div style={{ flex:1, overflowY:'auto', padding:24, background:'#e8e4df', display:'flex', flexDirection:'column', gap:20, alignItems:'center' }}>
                      {previewPages.length === 0
                        ? <div style={{ color:S.faint, textAlign:'center', padding:40 }}>?ùÏÑ±???òÏù¥ÏßÄÍ∞Ä ?ÜÏñ¥??/div>
                        : previewPages.map((p,i) => {
                          const c = p.content || {}
                          const color = '#2563eb'
                          if (c.type === 'chapter') return (
                            <div key={i} style={{ width:'100%', maxWidth:480, background:'#faf8f5', borderRadius:'3px 16px 16px 3px', boxShadow:'0 4px 20px rgba(0,0,0,0.12)', overflow:'hidden' }}>
                              <div style={{ background:color, height:160, position:'relative' }}>
                                <div style={{ position:'absolute', bottom:-1, left:0, right:0, height:24, background:'#faf8f5', clipPath:'ellipse(55% 100% at 50% 100%)' }}></div>
                                <div style={{ position:'absolute', top:20, left:32, fontSize:9, fontWeight:700, letterSpacing:'0.2em', color:'#c8963e' }}>{c.num||''}</div>
                                <div style={{ position:'absolute', top:38, left:32, right:24, fontFamily:'Noto Serif KR,serif', fontSize:22, fontWeight:900, color:'#fff', lineHeight:1.3 }} dangerouslySetInnerHTML={{ __html:(c.title||'').replace(/\n/g,'<br/>') }}></div>
                              </div>
                              <div style={{ padding:'20px 24px 16px 32px' }}>
                                {(c.body||[]).map((t,j) => <p key={j} style={{ fontSize:12, lineHeight:2, color:'#444', marginBottom:8 }}>{t}</p>)}
                              </div>
                              <div style={{ padding:'8px 24px 14px 32px', borderTop:'0.5px solid #e0ddd8', display:'flex', justifyContent:'space-between', fontSize:9, color:'#bbb' }}>
                                <span>{p.page_number}</span><span>{c.bookTitle||''}</span>
                              </div>
                            </div>
                          )
                          return (
                            <div key={i} style={{ width:'100%', maxWidth:480, background:'#faf8f5', borderRadius:'3px 16px 16px 3px', boxShadow:'0 4px 20px rgba(0,0,0,0.12)', padding:'20px 24px 16px 32px' }}>
                              <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:8, borderBottom:'0.5px solid #e0ddd8', marginBottom:12, fontSize:8, color:'#bbb' }}>
                                <span>{c.rh||''}</span>
                                <div style={{ width:5, height:5, borderRadius:'50%', background:color }}></div>
                              </div>
                              {(c.sections||[]).map((s,j) => {
                                if (s.t==='sec') return <div key={j} style={{ fontSize:14, fontWeight:700, color:'#111', paddingLeft:8, borderLeft:`3px solid ${color}`, marginBottom:8 }}>{s.c}</div>
                                if (s.t==='txt') return <p key={j} style={{ fontSize:12, lineHeight:2, color:'#444', marginBottom:8 }}>{s.c}</p>
                                if (s.t==='quote') return <div key={j} style={{ borderLeft:`3px solid ${color}`, background:`${color}12`, padding:'8px 12px', marginBottom:8, borderRadius:'0 6px 6px 0' }}><p style={{ fontSize:11, fontStyle:'italic', color:'#333' }}>{s.c}</p></div>
                                return null
                              })}
                              <div style={{ paddingTop:8, borderTop:'0.5px solid #e0ddd8', display:'flex', justifyContent:'space-between', fontSize:9, color:'#bbb' }}>
                                <span>{p.page_number}</span><span>{c.ct||''}</span>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ?Ä?Ä Í≤∞Ï†ú ?¥Ïó≠ ?Ä?Ä */}
          {tab === 'payments' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
                <StatCard color={S.accent2} icon="?í∞" label="Ï¥?Îß§Ï∂ú" value={fmtMoney(totalRev)} sub={`${paidPayments.length}Í±?Í≤∞Ï†ú`} />
                <StatCard color={S.green} icon="?? label="Í≤∞Ï†ú ?±Í≥µÎ•? value={data.payments.length>0?((paidPayments.length/data.payments.length)*100).toFixed(0)+'%':'0%'} sub="?ÑÏ≤¥ Ï§??ÑÎ£å" />
                <StatCard color={S.accent3} icon="?ìä" label="?âÍ∑† Í≤∞Ï†ú?? value={paidPayments.length>0?fmtMoney(Math.round(totalRev/paidPayments.length)):'0??} sub="Í±¥Îãπ ?âÍ∑†" />
              </div>
              <Card>
                <CardHeader title="?í≥ Í≤∞Ï†ú ?¥Ïó≠" sub={`Ï¥?${data.payments.length}Í±?} />
                <table>
                  <thead><tr><th>?†Ï?</th><th>Í∏àÏï°</th><th>?ÅÌÉú</th><th>Í≤∞Ï†ú??/th><th>?°ÏÖò</th></tr></thead>
                  <tbody>
                    {data.payments.map((p,i) => (
                      <tr key={i}>
                        <td style={{ fontSize:12 }}>{p.user_id?.slice(0,12)||'-'}...</td>
                        <td style={{ fontWeight:700 }}>{fmtMoney(p.amount)}</td>
                        <td><Badge color={p.status==='paid'?S.green:p.status==='pending'?'#d97706':S.red}>{p.status==='paid'?'?ÑÎ£å':p.status==='pending'?'?ÄÍ∏?:'?§Ìå®'}</Badge></td>
                        <td style={{ color:S.mid }}>{fmtDate(p.created_at)}</td>
                        <td><button onClick={()=>alert('?òÎ∂à Í∏∞Îä•?Ä ?¨Ìä∏???∞Îèô ???úÏÑ±?îÎê©?àÎã§.')} style={{ padding:'5px 12px', background:'#dbeafe', color:S.accent3, border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>?òÎ∂à</button></td>
                      </tr>
                    ))}
                    {data.payments.length===0 && <tr><td colSpan={5} style={{ textAlign:'center', padding:32, color:S.faint }}>?í≥ Í≤∞Ï†ú ?¥Ïó≠???ÜÏñ¥??/td></tr>}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ?Ä?Ä ?§Ï†ï ?Ä?Ä */}
          {tab === 'settings' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <Card>
                <CardHeader title="?ôÔ∏è ?úÎπÑ???§Ï†ï" />
                <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
                  {[
                    { label:'?ÑÏûêÏ±?Í∞ÄÍ≤?(??', id:'price', default:'9900' },
                    { label:'?§ÌÉà??ÍµêÏ†ï Ï∂îÍ? Í∞ÄÍ≤?(??', id:'proofPrice', default:'2000' },
                    { label:'Î¨¥Î£å ÎØ∏Î¶¨Î≥¥Í∏∞ ?òÏù¥ÏßÄ ??, id:'freePages', default:'5' },
                    { label:'?¨ÏÉù???àÏö© ?üÏàò', id:'regenCount', default:'5' },
                  ].map(f => (
                    <div key={f.id}>
                      <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:7 }}>{f.label}</label>
                      <input type="number" defaultValue={f.default} style={{ width:'100%', padding:'10px 14px', border:`1px solid ${S.border}`, borderRadius:8, fontSize:14, fontFamily:'Noto Sans KR,sans-serif', outline:'none' }} />
                    </div>
                  ))}
                  <button onClick={()=>alert('???§Ï†ï???Ä?•Îêê?¥Ïöî!')} style={{ padding:12, background:S.accent, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>?Ä?•ÌïòÍ∏?/button>
                </div>
              </Card>

              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* ?êÍ? Î™®Îìú */}
                <Card>
                  <div style={{ padding:20 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700 }}>?îß ?úÎπÑ???êÍ? Î™®Îìú</div>
                        <div style={{ fontSize:12, color:S.mid, marginTop:3 }}>?úÏÑ±?????†Ï? ?ëÍ∑º Ï∞®Îã®</div>
                      </div>
                      <div onClick={()=>setMaintenance(!maintenance)} style={{ width:44, height:24, borderRadius:12, background:maintenance?S.red:'#e5e7eb', cursor:'pointer', position:'relative', transition:'all 0.3s' }}>
                        <div style={{ position:'absolute', top:2, left:maintenance?22:2, width:20, height:20, background:'#fff', borderRadius:'50%', transition:'all 0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}></div>
                      </div>
                    </div>
                    {maintenance && (
                      <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:10, padding:'12px 14px' }}>
                        <div style={{ fontSize:12, fontWeight:700, color:S.red, marginBottom:4 }}>?†Ô∏è ?êÍ? Î™®Îìú ?úÏÑ±??Ï§?/div>
                        <div style={{ fontSize:11, color:'#b91c1c' }}>?†Ï?Í∞Ä ?úÎπÑ?§Ïóê ?ëÍ∑º?????ÜÏäµ?àÎã§.</div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Í≥µÏ? Î∞∞ÎÑà */}
                <Card>
                  <div style={{ padding:20 }}>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>?ì¢ Í≥µÏ? Î∞∞ÎÑà</div>
                    <div style={{ fontSize:12, color:S.mid, marginBottom:10 }}>?úÎπÑ???ÅÎã®??Í≥µÏ?Î•??úÏãú?©Îãà??/div>
                    <input type="text" placeholder="Í≥µÏ? ?¥Ïö© ?ÖÎ†• (ÎπÑÏõå?êÎ©¥ ÎπÑÌôú??" style={{ width:'100%', padding:'9px 12px', border:`1px solid ${S.border}`, borderRadius:8, fontSize:12, fontFamily:'Noto Sans KR,sans-serif', outline:'none', marginBottom:8, boxSizing:'border-box' }} />
                    <button onClick={()=>alert('??Í≥µÏ? Î∞∞ÎÑà ?Ä?•Îêê?¥Ïöî!')} style={{ width:'100%', padding:9, background:S.accent3, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>Î∞∞ÎÑà ?Ä??/button>
                  </div>
                </Card>

                {/* ?†Í∑ú Í∞Ä??*/}
                <Card>
                  <div style={{ padding:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700 }}>?ë• ?†Í∑ú Í∞Ä???àÏö©</div>
                      <div style={{ fontSize:12, color:S.mid, marginTop:3 }}>ÎπÑÌôú?±Ìôî ???†Í∑ú Í∞Ä??Î∂àÍ?</div>
                    </div>
                    <div style={{ width:44, height:24, borderRadius:12, background:S.green, cursor:'pointer', position:'relative' }}>
                      <div style={{ position:'absolute', top:2, left:22, width:20, height:20, background:'#fff', borderRadius:'50%', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
'use client'
import { useState, useEffect } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export default function AdminPage() {
  const [tab, setTab] = useState('dashboard')
  const [data, setData] = useState({ profiles:[], books:[], payments:[] })
  const [loading, setLoading] = useState(true)
  const [previewBook, setPreviewBook] = useState(null)
  const [previewPages, setPreviewPages] = useState([])
  const [maintenance, setMaintenance] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [now, setNow] = useState(new Date())

  const S = {
    bg:'#f0f2f5', white:'#fff', border:'#e5e7eb',
    accent:'#1a1a2e', accent2:'#c8963e', accent3:'#2563eb',
    green:'#16a34a', red:'#dc2626', text:'#111827', mid:'#6b7280', faint:'#9ca3af'
  }

  useEffect(() => {
    loadAll()
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  async function apiFetch(path) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    })
    return res.json()
  }

  async function loadAll() {
    setLoading(true)
    const [profiles, books, payments] = await Promise.all([
      apiFetch('profiles?select=*&order=created_at.desc'),
      apiFetch('books?select=*&order=created_at.desc'),
      apiFetch('payments?select=*&order=created_at.desc'),
    ])
    setData({ profiles: profiles||[], books: books||[], payments: payments||[] })
    setLoading(false)
  }

  async function loadBookPages(bookId) {
    const pages = await apiFetch(`pages?book_id=eq.${bookId}&order=page_number.asc`)
    setPreviewPages(pages||[])
  }

  async function regenBook(bookId, title) {
    if (!confirm(`"${title}" Ï±ÖÏùÑ ?¨ÏÉù?±Ìïò?úÍ≤†?¥Ïöî?\nÍ∏∞Ï°¥ ?òÏù¥ÏßÄÍ∞Ä ??†ú?©Îãà??`)) return
    await fetch(`${SUPABASE_URL}/rest/v1/pages?book_id=eq.${bookId}`, {
      method:'DELETE',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    })
    alert('??Í∏∞Ï°¥ ?òÏù¥ÏßÄ ??†ú?êÏñ¥?? ?†Ï?Í∞Ä ?§Ïãú ?ùÏÑ±?òÎèÑÎ°??àÎÇ¥?¥Ï£º?∏Ïöî.')
    loadAll()
  }

  const fmtDate = (d) => {
    if (!d) return '-'
    const dt = new Date(d)
    return `${dt.getMonth()+1}/${dt.getDate()} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`
  }
  const fmtMoney = (n) => Number(n||0).toLocaleString() + '??

  const paidPayments = data.payments.filter(p => p.status === 'paid')
  const totalRev = paidPayments.reduce((s,p) => s+(p.amount||0), 0)
  const today = new Date().toDateString()
  const todayUsers = data.profiles.filter(p => new Date(p.created_at).toDateString() === today).length
  const conv = data.profiles.length > 0 ? ((paidPayments.length/data.profiles.length)*100).toFixed(1) : 0
  const genreNames = { essay:'?êÏÑ∏??, novel:'?åÏÑ§', selfdev:'?êÍ∏∞Í≥ÑÎ∞ú', business:'ÎπÑÏ¶à?àÏä§', memoir:'?åÍ≥†Î°?, travel:'?¨Ìñâ', thesis:'?ºÎ¨∏', prose:'?òÌïÑ', poetry:'?úÏßë', economy:'Í≤ΩÏ†úÍ≤ΩÏòÅ', academic:'?ôÏà†??, textbook:'ÍµêÏû¨', interview:'?∏ÌÑ∞Î∑∞Ïßë', lifestyle:'?ºÏù¥?ÑÏä§?Ä??, shortstory:'?®Ìé∏?åÏÑ§' }

  const Badge = ({ color, children }) => (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:700, background:color+'20', color }}>{children}</span>
  )

  const Card = ({ children, style }) => (
    <div style={{ background:S.white, borderRadius:14, border:`1px solid ${S.border}`, overflow:'hidden', ...style }}>{children}</div>
  )

  const CardHeader = ({ title, sub }) => (
    <div style={{ padding:'16px 20px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
      <div style={{ fontSize:14, fontWeight:700 }}>{title}</div>
      {sub && <div style={{ fontSize:12, color:S.faint }}>{sub}</div>}
    </div>
  )

  const StatCard = ({ color, icon, label, value, sub }) => (
    <div style={{ background:S.white, borderRadius:14, border:`1px solid ${S.border}`, padding:20, position:'relative', overflow:'hidden', borderTop:`3px solid ${color}` }}>
      <div style={{ position:'absolute', top:16, right:16, fontSize:28, opacity:0.15 }}>{icon}</div>
      <div style={{ fontSize:11, fontWeight:600, color:S.faint, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>{label}</div>
      <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:32, fontWeight:900, color:S.text, lineHeight:1, marginBottom:6 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:S.mid }}>{sub}</div>}
    </div>
  )

  const SIDEBAR_ITEMS = [
    { id:'dashboard', icon:'?ìä', label:'?Ä?úÎ≥¥?? },
    { id:'users', icon:'?ë•', label:'?åÏõê Í¥ÄÎ¶? },
    { id:'books', icon:'?ìö', label:'Ï±??ÑÎ°ú?ùÌä∏' },
    { id:'payments', icon:'?í≥', label:'Í≤∞Ï†ú ?¥Ïó≠' },
    null,
    { id:'settings', icon:'?ôÔ∏è', label:'?§Ï†ï' },
  ]

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'Noto Sans KR,sans-serif', background:S.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        table { width:100%; border-collapse:collapse; }
        th { padding:11px 16px; text-align:left; font-size:11px; font-weight:700; color:${S.faint}; letter-spacing:0.08em; text-transform:uppercase; background:#f9fafb; border-bottom:1px solid ${S.border}; }
        td { padding:13px 16px; font-size:13px; border-bottom:1px solid #f3f4f6; }
        tr:last-child td { border-bottom:none; }
        tr:hover td { background:#fafafa; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-thumb { background:#ddd; border-radius:2px; }
      `}</style>

      {/* ?¨Ïù¥?úÎ∞î */}
      <div style={{ width:220, background:S.accent, flexShrink:0, display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh' }}>
        <div style={{ padding:'24px 20px', borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontFamily:'Noto Serif KR,serif', fontSize:18, fontWeight:900, color:'#fff' }}>
            Î∂?em style={{ color:S.accent2, fontStyle:'normal' }}>Î©îÏù¥Ïª?/em>
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:3, letterSpacing:'0.1em' }}>ADMIN DASHBOARD</div>
        </div>
        <nav style={{ flex:1, padding:'12px 8px', display:'flex', flexDirection:'column', gap:2 }}>
          {SIDEBAR_ITEMS.map((item, i) => item === null
            ? <div key={i} style={{ height:1, background:'rgba(255,255,255,0.08)', margin:'8px 0' }} />
            : (
              <div key={item.id} onClick={() => { setTab(item.id); if(item.id==='books') loadAll() }} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:8, fontSize:13, fontWeight:600, color:tab===item.id?'#fff':'rgba(255,255,255,0.6)', background:tab===item.id?'rgba(255,255,255,0.12)':'transparent', cursor:'pointer', transition:'all 0.15s' }}>
                <span style={{ fontSize:16, width:20, textAlign:'center' }}>{item.icon}</span>
                {item.label}
              </div>
            )
          )}
        </nav>
        <div style={{ padding:16, borderTop:'1px solid rgba(255,255,255,0.1)', fontSize:12, color:'rgba(255,255,255,0.5)' }}>
          <strong style={{ color:'rgba(255,255,255,0.8)', display:'block', marginBottom:2 }}>Í¥ÄÎ¶¨Ïûê</strong>
          admin@bookmaker.kr
        </div>
      </div>

      {/* Î©îÏù∏ */}
      <div style={{ flex:1, overflow:'auto' }}>

        {/* ?ëÎ∞î */}
        <div style={{ height:56, background:S.white, borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', padding:'0 28px', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
          <div style={{ fontSize:15, fontWeight:700 }}>
            {{ dashboard:'?Ä?úÎ≥¥??, users:'?åÏõê Í¥ÄÎ¶?, books:'Ï±??ÑÎ°ú?ùÌä∏', payments:'Í≤∞Ï†ú ?¥Ïó≠', settings:'?§Ï†ï' }[tab]}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ fontSize:12, color:S.mid }}>{now.getFullYear()}??{now.getMonth()+1}??{now.getDate()}??/div>
            <button onClick={loadAll} style={{ padding:'7px 14px', background:S.bg, border:`1px solid ${S.border}`, borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif', color:S.mid }}>?îÑ ?àÎ°úÍ≥†Ïπ®</button>
          </div>
        </div>

        <div style={{ padding:28 }}>

          {/* ?Ä?Ä ?Ä?úÎ≥¥???Ä?Ä */}
          {tab === 'dashboard' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
                <StatCard color={S.accent3} icon="?ë•" label="Ï¥??åÏõê?? value={data.profiles.length} sub={`?§Îäò ${todayUsers}Î™?Í∞Ä??} />
                <StatCard color={S.accent2} icon="?í≥" label="Ï¥?Îß§Ï∂ú" value={fmtMoney(totalRev)} sub={`Í≤∞Ï†ú ${paidPayments.length}Í±?} />
                <StatCard color={S.green} icon="?ìö" label="?ùÏÑ±??Ï±? value={data.books.length} sub="?ÑÏ†Å" />
                <StatCard color={S.accent} icon="?îÑ" label="?ÑÌôò?? value={conv+'%'} sub="Í∞Ä????Í≤∞Ï†ú" />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
                <Card>
                  <CardHeader title="ÏµúÍ∑º Í∞Ä?ÖÏûê" sub={`Ï¥?${data.profiles.length}Î™?} />
                  <table>
                    <thead><tr><th>?¥Î©î??/th><th>Í∞Ä?ÖÏùº</th><th>?ÅÌÉú</th></tr></thead>
                    <tbody>
                      {data.profiles.slice(0,8).map((u,i) => (
                        <tr key={i}>
                          <td>{u.email||'-'}</td>
                          <td style={{ color:S.mid }}>{fmtDate(u.created_at)}</td>
                          <td><Badge color={S.accent3}>?úÏÑ±</Badge></td>
                        </tr>
                      ))}
                      {data.profiles.length===0 && <tr><td colSpan={3} style={{ textAlign:'center', padding:32, color:S.faint }}>?ë• ?ÑÏßÅ Í∞Ä?ÖÌïú ?†Ï?Í∞Ä ?ÜÏñ¥??/td></tr>}
                    </tbody>
                  </table>
                </Card>

                <Card>
                  <CardHeader title="ÏµúÍ∑º Í≤∞Ï†ú" sub={`Ï¥?${paidPayments.length}Í±?} />
                  <table>
                    <thead><tr><th>?†Ï?</th><th>Í∏àÏï°</th><th>?ÅÌÉú</th><th>?ºÏãú</th></tr></thead>
                    <tbody>
                      {data.payments.slice(0,8).map((p,i) => (
                        <tr key={i}>
                          <td style={{ fontSize:12 }}>{p.user_id?.slice(0,8)||'-'}...</td>
                          <td style={{ fontWeight:700 }}>{fmtMoney(p.amount)}</td>
                          <td><Badge color={p.status==='paid'?S.green:p.status==='pending'?'#d97706':S.red}>{p.status==='paid'?'?ÑÎ£å':p.status==='pending'?'?ÄÍ∏?:'?§Ìå®'}</Badge></td>
                          <td style={{ color:S.mid }}>{fmtDate(p.created_at)}</td>
                        </tr>
                      ))}
                      {data.payments.length===0 && <tr><td colSpan={4} style={{ textAlign:'center', padding:32, color:S.faint }}>?í≥ Í≤∞Ï†ú ?¥Ïó≠???ÜÏñ¥??/td></tr>}
                    </tbody>
                  </table>
                </Card>
              </div>

              {/* ?•Î•¥ ?µÍ≥Ñ */}
              <Card>
                <CardHeader title="?•Î•¥Î≥?Ï±??ùÏÑ± ?µÍ≥Ñ" />
                <div style={{ padding:'16px 20px' }}>
                  {(() => {
                    const gc = {}
                    data.books.forEach(b => { if(b.genre) gc[b.genre] = (gc[b.genre]||0)+1 })
                    const entries = Object.entries(gc).sort((a,b)=>b[1]-a[1])
                    const max = Math.max(...entries.map(e=>e[1]), 1)
                    const cls = ['#2563eb','#c8963e','#16a34a','#dc2626','#7c3aed','#0891b2']
                    if (!entries.length) return <div style={{ textAlign:'center', padding:24, color:S.faint }}>?ìä ?ÑÏßÅ ?ùÏÑ±??Ï±ÖÏù¥ ?ÜÏñ¥??/div>
                    return entries.map(([g,c],i) => (
                      <div key={g} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                        <div style={{ fontSize:12, color:S.mid, width:80, textAlign:'right', flexShrink:0 }}>{genreNames[g]||g}</div>
                        <div style={{ flex:1, height:8, background:'#f3f4f6', borderRadius:4, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${(c/max)*100}%`, background:cls[i%cls.length], borderRadius:4, transition:'width 0.8s' }}></div>
                        </div>
                        <div style={{ fontSize:12, fontWeight:700, width:36 }}>{c}Í±?/div>
                      </div>
                    ))
                  })()}
                </div>
              </Card>
            </div>
          )}

          {/* ?Ä?Ä ?åÏõê Í¥ÄÎ¶??Ä?Ä */}
          {tab === 'users' && (
            <Card>
              <CardHeader title="?ë• ?åÏõê Î™©Î°ù" sub={`Ï¥?${data.profiles.length}Î™?} />
              <div style={{ padding:'12px 20px', borderBottom:`1px solid ${S.border}`, display:'flex', gap:10 }}>
                <input value={userSearch} onChange={e=>setUserSearch(e.target.value)} placeholder="?¥Î©î?ºÎ°ú Í≤Ä??.." style={{ flex:1, padding:'9px 14px', border:`1px solid ${S.border}`, borderRadius:8, fontSize:13, fontFamily:'Noto Sans KR,sans-serif', outline:'none' }} />
              </div>
              <table>
                <thead><tr><th>?¥Î©î??/th><th>Í∞Ä?ÖÏùº</th><th>Ï±???/th><th>Í≤∞Ï†ú</th><th>?°ÏÖò</th></tr></thead>
                <tbody>
                  {data.profiles.filter(u=>(u.email||'').toLowerCase().includes(userSearch.toLowerCase())).map((u,i) => {
                    const userBooks = data.books.filter(b => b.user_id === u.id)
                    const userPaid = data.payments.find(p => p.user_id === u.id && p.status === 'paid')
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight:500 }}>{u.email||'-'}</td>
                        <td style={{ color:S.mid }}>{fmtDate(u.created_at)}</td>
                        <td>{userBooks.length}Í∂?/td>
                        <td><Badge color={userPaid?S.green:S.mid}>{userPaid?'Í≤∞Ï†ú?ÑÎ£å':'Î¨¥Î£å'}</Badge></td>
                        <td>
                          <button onClick={()=>alert('?†Ï? ??†ú??Supabase ?Ä?úÎ≥¥?úÏóê??ÏßÅÏ†ë ?¥Ï£º?∏Ïöî.')} style={{ padding:'5px 12px', background:'#fee2e2', color:S.red, border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>??†ú</button>
                        </td>
                      </tr>
                    )
                  })}
                  {data.profiles.length===0 && <tr><td colSpan={5} style={{ textAlign:'center', padding:32, color:S.faint }}>?ë• ?ÑÏßÅ Í∞Ä?ÖÌïú ?†Ï?Í∞Ä ?ÜÏñ¥??/td></tr>}
                </tbody>
              </table>
            </Card>
          )}

          {/* ?Ä?Ä Ï±??ÑÎ°ú?ùÌä∏ ?Ä?Ä */}
          {tab === 'books' && (
            <>
              <Card>
                <CardHeader title="?ìö Ï±??ÑÎ°ú?ùÌä∏ Î™©Î°ù" sub={`Ï¥?${data.books.length}Í±?} />
                <table>
                  <thead><tr><th>?úÎ™©</th><th>?Ä??/th><th>?•Î•¥</th><th>?ÅÌÉú</th><th>?ùÏÑ±??/th><th>?°ÏÖò</th></tr></thead>
                  <tbody>
                    {data.books.map((b,i) => (
                      <tr key={i}>
                        <td style={{ fontWeight:600 }}>{b.title||'-'}</td>
                        <td>{b.author||'-'}</td>
                        <td><Badge color={S.accent3}>{genreNames[b.genre]||b.genre||'-'}</Badge></td>
                        <td><Badge color={b.status==='paid'?S.green:S.mid}>{b.status==='paid'?'Í≤∞Ï†ú?ÑÎ£å':'ÎØ∏Î¶¨Î≥¥Í∏∞'}</Badge></td>
                        <td style={{ color:S.mid }}>{fmtDate(b.created_at)}</td>
                        <td style={{ display:'flex', gap:6 }}>
                          <button onClick={async()=>{ setPreviewBook(b); await loadBookPages(b.id) }} style={{ padding:'5px 10px', background:'#dbeafe', color:S.accent3, border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>?ëÅ Î≥¥Í∏∞</button>
                          <button onClick={()=>regenBook(b.id, b.title)} style={{ padding:'5px 10px', background:'#fee2e2', color:S.red, border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>?îÑ ?¨ÏÉù??/button>
                        </td>
                      </tr>
                    ))}
                    {data.books.length===0 && <tr><td colSpan={6} style={{ textAlign:'center', padding:32, color:S.faint }}>?ìö ?ùÏÑ±??Ï±ÖÏù¥ ?ÜÏñ¥??/td></tr>}
                  </tbody>
                </table>
              </Card>

              {/* Ï±?ÎØ∏Î¶¨Î≥¥Í∏∞ Î™®Îã¨ */}
              {previewBook && (
                <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
                  <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:700, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column' }}>
                    <div style={{ padding:'18px 24px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ fontSize:16, fontWeight:700 }}>{previewBook.title}</div>
                        <div style={{ fontSize:12, color:S.mid }}>{previewBook.author} ¬∑ {previewPages.length}?òÏù¥ÏßÄ</div>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button onClick={()=>regenBook(previewBook.id, previewBook.title)} style={{ padding:'8px 16px', background:'#fee2e2', color:S.red, border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>?îÑ ?¨ÏÉù??/button>
                        <button onClick={()=>setPreviewBook(null)} style={{ padding:'8px 16px', background:S.bg, border:`1px solid ${S.border}`, borderRadius:8, fontSize:12, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>???´Í∏∞</button>
                      </div>
                    </div>
                    <div style={{ flex:1, overflowY:'auto', padding:24, background:'#e8e4df', display:'flex', flexDirection:'column', gap:20, alignItems:'center' }}>
                      {previewPages.length === 0
                        ? <div style={{ color:S.faint, textAlign:'center', padding:40 }}>?ùÏÑ±???òÏù¥ÏßÄÍ∞Ä ?ÜÏñ¥??/div>
                        : previewPages.map((p,i) => {
                          const c = p.content || {}
                          const color = '#2563eb'
                          if (c.type === 'chapter') return (
                            <div key={i} style={{ width:'100%', maxWidth:480, background:'#faf8f5', borderRadius:'3px 16px 16px 3px', boxShadow:'0 4px 20px rgba(0,0,0,0.12)', overflow:'hidden' }}>
                              <div style={{ background:color, height:160, position:'relative' }}>
                                <div style={{ position:'absolute', bottom:-1, left:0, right:0, height:24, background:'#faf8f5', clipPath:'ellipse(55% 100% at 50% 100%)' }}></div>
                                <div style={{ position:'absolute', top:20, left:32, fontSize:9, fontWeight:700, letterSpacing:'0.2em', color:'#c8963e' }}>{c.num||''}</div>
                                <div style={{ position:'absolute', top:38, left:32, right:24, fontFamily:'Noto Serif KR,serif', fontSize:22, fontWeight:900, color:'#fff', lineHeight:1.3 }} dangerouslySetInnerHTML={{ __html:(c.title||'').replace(/\n/g,'<br/>') }}></div>
                              </div>
                              <div style={{ padding:'20px 24px 16px 32px' }}>
                                {(c.body||[]).map((t,j) => <p key={j} style={{ fontSize:12, lineHeight:2, color:'#444', marginBottom:8 }}>{t}</p>)}
                              </div>
                              <div style={{ padding:'8px 24px 14px 32px', borderTop:'0.5px solid #e0ddd8', display:'flex', justifyContent:'space-between', fontSize:9, color:'#bbb' }}>
                                <span>{p.page_number}</span><span>{c.bookTitle||''}</span>
                              </div>
                            </div>
                          )
                          return (
                            <div key={i} style={{ width:'100%', maxWidth:480, background:'#faf8f5', borderRadius:'3px 16px 16px 3px', boxShadow:'0 4px 20px rgba(0,0,0,0.12)', padding:'20px 24px 16px 32px' }}>
                              <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:8, borderBottom:'0.5px solid #e0ddd8', marginBottom:12, fontSize:8, color:'#bbb' }}>
                                <span>{c.rh||''}</span>
                                <div style={{ width:5, height:5, borderRadius:'50%', background:color }}></div>
                              </div>
                              {(c.sections||[]).map((s,j) => {
                                if (s.t==='sec') return <div key={j} style={{ fontSize:14, fontWeight:700, color:'#111', paddingLeft:8, borderLeft:`3px solid ${color}`, marginBottom:8 }}>{s.c}</div>
                                if (s.t==='txt') return <p key={j} style={{ fontSize:12, lineHeight:2, color:'#444', marginBottom:8 }}>{s.c}</p>
                                if (s.t==='quote') return <div key={j} style={{ borderLeft:`3px solid ${color}`, background:`${color}12`, padding:'8px 12px', marginBottom:8, borderRadius:'0 6px 6px 0' }}><p style={{ fontSize:11, fontStyle:'italic', color:'#333' }}>{s.c}</p></div>
                                return null
                              })}
                              <div style={{ paddingTop:8, borderTop:'0.5px solid #e0ddd8', display:'flex', justifyContent:'space-between', fontSize:9, color:'#bbb' }}>
                                <span>{p.page_number}</span><span>{c.ct||''}</span>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ?Ä?Ä Í≤∞Ï†ú ?¥Ïó≠ ?Ä?Ä */}
          {tab === 'payments' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
                <StatCard color={S.accent2} icon="?í∞" label="Ï¥?Îß§Ï∂ú" value={fmtMoney(totalRev)} sub={`${paidPayments.length}Í±?Í≤∞Ï†ú`} />
                <StatCard color={S.green} icon="?? label="Í≤∞Ï†ú ?±Í≥µÎ•? value={data.payments.length>0?((paidPayments.length/data.payments.length)*100).toFixed(0)+'%':'0%'} sub="?ÑÏ≤¥ Ï§??ÑÎ£å" />
                <StatCard color={S.accent3} icon="?ìä" label="?âÍ∑† Í≤∞Ï†ú?? value={paidPayments.length>0?fmtMoney(Math.round(totalRev/paidPayments.length)):'0??} sub="Í±¥Îãπ ?âÍ∑†" />
              </div>
              <Card>
                <CardHeader title="?í≥ Í≤∞Ï†ú ?¥Ïó≠" sub={`Ï¥?${data.payments.length}Í±?} />
                <table>
                  <thead><tr><th>?†Ï?</th><th>Í∏àÏï°</th><th>?ÅÌÉú</th><th>Í≤∞Ï†ú??/th><th>?°ÏÖò</th></tr></thead>
                  <tbody>
                    {data.payments.map((p,i) => (
                      <tr key={i}>
                        <td style={{ fontSize:12 }}>{p.user_id?.slice(0,12)||'-'}...</td>
                        <td style={{ fontWeight:700 }}>{fmtMoney(p.amount)}</td>
                        <td><Badge color={p.status==='paid'?S.green:p.status==='pending'?'#d97706':S.red}>{p.status==='paid'?'?ÑÎ£å':p.status==='pending'?'?ÄÍ∏?:'?§Ìå®'}</Badge></td>
                        <td style={{ color:S.mid }}>{fmtDate(p.created_at)}</td>
                        <td><button onClick={()=>alert('?òÎ∂à Í∏∞Îä•?Ä ?¨Ìä∏???∞Îèô ???úÏÑ±?îÎê©?àÎã§.')} style={{ padding:'5px 12px', background:'#dbeafe', color:S.accent3, border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>?òÎ∂à</button></td>
                      </tr>
                    ))}
                    {data.payments.length===0 && <tr><td colSpan={5} style={{ textAlign:'center', padding:32, color:S.faint }}>?í≥ Í≤∞Ï†ú ?¥Ïó≠???ÜÏñ¥??/td></tr>}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {/* ?Ä?Ä ?§Ï†ï ?Ä?Ä */}
          {tab === 'settings' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <Card>
                <CardHeader title="?ôÔ∏è ?úÎπÑ???§Ï†ï" />
                <div style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
                  {[
                    { label:'?ÑÏûêÏ±?Í∞ÄÍ≤?(??', id:'price', default:'9900' },
                    { label:'?§ÌÉà??ÍµêÏ†ï Ï∂îÍ? Í∞ÄÍ≤?(??', id:'proofPrice', default:'2000' },
                    { label:'Î¨¥Î£å ÎØ∏Î¶¨Î≥¥Í∏∞ ?òÏù¥ÏßÄ ??, id:'freePages', default:'5' },
                    { label:'?¨ÏÉù???àÏö© ?üÏàò', id:'regenCount', default:'5' },
                  ].map(f => (
                    <div key={f.id}>
                      <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:7 }}>{f.label}</label>
                      <input type="number" defaultValue={f.default} style={{ width:'100%', padding:'10px 14px', border:`1px solid ${S.border}`, borderRadius:8, fontSize:14, fontFamily:'Noto Sans KR,sans-serif', outline:'none' }} />
                    </div>
                  ))}
                  <button onClick={()=>alert('???§Ï†ï???Ä?•Îêê?¥Ïöî!')} style={{ padding:12, background:S.accent, color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, fontFamily:'Noto Sans KR,sans-serif', cursor:'pointer' }}>?Ä?•ÌïòÍ∏?/button>
                </div>
              </Card>

              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* ?êÍ? Î™®Îìú */}
                <Card>
                  <div style={{ padding:20 }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700 }}>?îß ?úÎπÑ???êÍ? Î™®Îìú</div>
                        <div style={{ fontSize:12, color:S.mid, marginTop:3 }}>?úÏÑ±?????†Ï? ?ëÍ∑º Ï∞®Îã®</div>
                      </div>
                      <div onClick={()=>setMaintenance(!maintenance)} style={{ width:44, height:24, borderRadius:12, background:maintenance?S.red:'#e5e7eb', cursor:'pointer', position:'relative', transition:'all 0.3s' }}>
                        <div style={{ position:'absolute', top:2, left:maintenance?22:2, width:20, height:20, background:'#fff', borderRadius:'50%', transition:'all 0.3s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}></div>
                      </div>
                    </div>
                    {maintenance && (
                      <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:10, padding:'12px 14px' }}>
                        <div style={{ fontSize:12, fontWeight:700, color:S.red, marginBottom:4 }}>?†Ô∏è ?êÍ? Î™®Îìú ?úÏÑ±??Ï§?/div>
                        <div style={{ fontSize:11, color:'#b91c1c' }}>?†Ï?Í∞Ä ?úÎπÑ?§Ïóê ?ëÍ∑º?????ÜÏäµ?àÎã§.</div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Í≥µÏ? Î∞∞ÎÑà */}
                <Card>
                  <div style={{ padding:20 }}>
                    <div style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>?ì¢ Í≥µÏ? Î∞∞ÎÑà</div>
                    <div style={{ fontSize:12, color:S.mid, marginBottom:10 }}>?úÎπÑ???ÅÎã®??Í≥µÏ?Î•??úÏãú?©Îãà??/div>
                    <input type="text" placeholder="Í≥µÏ? ?¥Ïö© ?ÖÎ†• (ÎπÑÏõå?êÎ©¥ ÎπÑÌôú??" style={{ width:'100%', padding:'9px 12px', border:`1px solid ${S.border}`, borderRadius:8, fontSize:12, fontFamily:'Noto Sans KR,sans-serif', outline:'none', marginBottom:8, boxSizing:'border-box' }} />
                    <button onClick={()=>alert('??Í≥µÏ? Î∞∞ÎÑà ?Ä?•Îêê?¥Ïöî!')} style={{ width:'100%', padding:9, background:S.accent3, color:'#fff', border:'none', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Noto Sans KR,sans-serif' }}>Î∞∞ÎÑà ?Ä??/button>
                  </div>
                </Card>

                {/* ?†Í∑ú Í∞Ä??*/}
                <Card>
                  <div style={{ padding:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700 }}>?ë• ?†Í∑ú Í∞Ä???àÏö©</div>
                      <div style={{ fontSize:12, color:S.mid, marginTop:3 }}>ÎπÑÌôú?±Ìôî ???†Í∑ú Í∞Ä??Î∂àÍ?</div>
                    </div>
                    <div style={{ width:44, height:24, borderRadius:12, background:S.green, cursor:'pointer', position:'relative' }}>
                      <div style={{ position:'absolute', top:2, left:22, width:20, height:20, background:'#fff', borderRadius:'50%', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
