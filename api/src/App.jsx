import { useState, useRef, useEffect } from 'react'

const CITIES = [
  { name: 'طرابزون', img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', desc: 'عروس الشمال، بحيرة أوزنجول والمرتفعات' },
  { name: 'ريزا', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', desc: 'جبال ووديان وشلالات' },
  { name: 'آيدر', img: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800', desc: 'منتجع الينابيع الساخنة' },
  { name: 'أوزنجول', img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', desc: 'البحيرة الساحرة وسط الجبال' },
]

export default function App(){
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'أهلاً يا هلا! 👋 أنا مساعد العسول الذكي لشمال تركيا. اسألني عن أي مدينة، رحلة، مواقيت، طرق، أو أسعار و أرد عليك بلمح البصر!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages])
  const send = async (text) => {
    const q = (text || input).trim()
    if(!q || loading) return
    setInput('')
    const newMsgs = [...messages, { role: 'user', content: q }]
    setMessages(newMsgs)
    setLoading(true)
    try{
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs })
      })
      if(!res.ok) throw new Error('api error')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''
      setMessages(prev=>[...prev, { role:'assistant', content: '' }])
      while(true){
        const { done, value } = await reader.read()
        if(done) break
        const chunk = decoder.decode(value, {stream:true})
        assistantText += chunk
        setMessages(prev=>{
          const copy = [...prev]
          copy[copy.length-1] = { role:'assistant', content: assistantText }
          return copy
        })
      }
    }catch(e){
      setMessages(prev=>[...prev, { role:'assistant', content: 'صار خلل بسيط في الاتصال، جرب مرة ثانية 🙏' }])
    }finally{
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen">
      <header className="relative h-[420px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2000" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0a2e1f]/80" />
        <nav className="relative z-10 flex justify-between items-center p-6 text-white max-w-7xl mx-auto">
          <div className="font-black text-xl">ALASSAUL.AI</div>
          <div className="flex gap-6 text-sm"> <span>الرئيسية</span><span>الوجهات</span><span>القنوات</span><span>الكاميرات</span> </div>
        </nav>
        <div className="relative z-10 max-w-7xl mx-auto px-6 mt-16 text-white">
          <h1 className="text-5xl font-extrabold leading-[1.2]">اكتشف شمال<br/>تركيا بطريقة<br/>أذكى.</h1>
          <p className="mt-4 text-white/80 max-w-md">خريطة ذكية، ومساعد يفهم لهجتك، ويجهز لك الرحلة بثواني.</p>
        </div>
      </header>
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">الوجهات</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CITIES.map(c=>(
            <div key={c.name} className="rounded-2xl overflow-hidden shadow bg-white">
              <img src={c.img} className="h-36 w-full object-cover" />
              <div className="p-3"><div className="font-bold">{c.name}</div><div className="text-xs text-gray-500">{c.desc}</div></div>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-6 pb-6 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow"><h3 className="font-bold">القنوات السياحية</h3><p className="text-sm text-gray-500 mt-2">قنوات البث المباشر تعمل ✅</p><div className="mt-3 h-24 bg-black/10 rounded-xl flex items-center justify-center">Live Channels Placeholder</div></div>
        <div className="bg-white rounded-2xl p-5 shadow"><h3 className="font-bold">كاميرات مباشرة</h3><p className="text-sm text-gray-500 mt-2">الكاميرات شغالة ✅</p><div className="mt-3 h-24 bg-black/10 rounded-xl flex items-center justify-center">Live Cams Placeholder</div></div>
      </section>
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <div className="bg-white rounded-[24px] shadow-xl border border-[#e8e0c8] overflow-hidden">
          <div className="bg-[#fdf6e3] px-5 py-3 flex justify-between items-center border-b">
            <div className="font-bold">اسألني عن مدينة، رحلة، مواقيت، أو طريق.</div>
            <div className="flex items-center gap-2 text-xs text-green-700"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> جاهز للرد</div>
          </div>
          <div className="h-[420px] overflow-y-auto p-4 space-y-3 bg-[#fefcf7]">
            {messages.map((m,i)=>(
              <div key={i} className={`max-w-[85%] rounded-[18px] px-4 py-3 text-[15px] leading-7 ${m.role==='user'? 'bg-[#0a4a33] text-white mr-auto' : 'bg-white border shadow-sm'}`}>{m.content}</div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 flex gap-2 bg-white border-t">
            <button onClick={()=>send()} disabled={loading} className="w-12 h-12 rounded-full bg-[#0a4a33] text-white flex items-center justify-center">➤</button>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && send()} placeholder="اكتب سؤالك هنا..." className="flex-1 bg-[#f6f1e6] rounded-full px-5 outline-none" />
          </div>
        </div>
      </section>
    </div>
  )
}
