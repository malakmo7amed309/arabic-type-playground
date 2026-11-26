import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { FONTS, SAMPLES, fontsUrl } from './fonts.js'

const LS_KEY = 'mihbar-state-v1'

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(LS_KEY) || 'null')
    if (s && s.fontA && s.fontB) return s
  } catch {}
  return null
}

function clampWeight(font, w) {
  if (font.weights.includes(w)) return w
  return font.weights.reduce((a, b) => (Math.abs(b - w) < Math.abs(a - w) ? b : a))
}

export default function App() {
  const saved = loadState()
  const [fontA, setFontA] = useState(saved?.fontA || 'Cairo')
  const [fontB, setFontB] = useState(saved?.fontB || 'Amiri')
  const [sampleId, setSampleId] = useState(saved?.sampleId || 'pangram')
  const [custom, setCustom] = useState(saved?.custom || '')
  const [size, setSize] = useState(saved?.size ?? 56)
  const [weight, setWeight] = useState(saved?.weight ?? 400)
  const [leading, setLeading] = useState(saved?.leading ?? 1.9)
  const [tracking, setTracking] = useState(saved?.tracking ?? 0)
  const [night, setNight] = useState(saved?.night ?? false)
  const [split, setSplit] = useState(50)
  const [dragging, setDragging] = useState(false)
  const stageRef = useRef(null)

  const fa = FONTS.find((f) => f.id === fontA)
  const fb = FONTS.find((f) => f.id === fontB)
  const wA = clampWeight(fa, weight)
  const wB = clampWeight(fb, weight)

  const text = sampleId === 'custom' ? (custom.trim() ? custom : 'اكتب نصَّك هنا…') : SAMPLES.find((s) => s.id === sampleId).text

  // Load every font once at weight 400 so the picker swatches render in
  // their own face, then exactly the two fonts in play at full weights.
  useEffect(() => {
    const id = 'mihbar-fonts-all'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = fontsUrl(FONTS.map((f) => f.id), true)
      document.head.appendChild(link)
    }
  }, [])
  useEffect(() => {
    const id = 'mihbar-fonts'
    let link = document.getElementById(id)
    if (!link) {
      link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    link.href = fontsUrl([fontA, fontB])
  }, [fontA, fontB])

  // Persist.
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ fontA, fontB, sampleId, custom, size, weight, leading, tracking, night }))
  }, [fontA, fontB, sampleId, custom, size, weight, leading, tracking, night])

  // Curtain drag (pointer events, works for mouse + touch).
  const onMove = useCallback((e) => {
    const el = stageRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    setSplit(Math.min(96, Math.max(4, x * 100)))
  }, [])
  useEffect(() => {
    if (!dragging) return
    const up = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', up)
    }
  }, [dragging, onMove])

  const previewStyle = (f, w) => ({
    fontFamily: `"${f.css}", serif`,
    fontWeight: w,
    fontSize: `${size}px`,
    lineHeight: leading,
    letterSpacing: `${tracking}px`,
  })

  const cssSnippet = useMemo(
    () => `font-family: "${fa.css}", serif;\nfont-weight: ${wA};\nfont-size: ${size}px;\nline-height: ${leading};${tracking ? `\nletter-spacing: ${tracking}px; /* يفكّك اتصال الحروف */` : ''}`,
    [fa, wA, size, leading, tracking]
  )

  return (
    <div dir="rtl" className={`min-h-screen transition-colors ${night ? 'bg-night text-paper' : 'bg-paper text-ink'}`}>
      {/* Header */}
      <header className="max-w-6xl mx-auto px-5 pt-8 pb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}>
            مِحبَر
          </h1>
          <p className={`mt-2 text-sm md:text-base ${night ? 'text-sand' : 'text-ink-soft'}`}>
            ملعب الخطوط العربية — اسحب الستارة وقارن خطّين على نفس الحبر.
          </p>
        </div>
        <button
          onClick={() => setNight(!night)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${night ? 'border-sand/40 hover:bg-paper/10' : 'border-sand hover:bg-paper-deep'}`}
        >
          {night ? <><svg viewBox="0 0 24 24" className="ms-1 inline h-4 w-4 align-[-3px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400" /></svg> نهاري</> : <><svg viewBox="0 0 24 24" className="ms-1 inline h-4 w-4 align-[-3px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true"><path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500z" /></svg> ورق داكن</>}
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-5 pb-16 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Font pickers */}
        <aside className="space-y-6 order-2 lg:order-1">
          <FontList title="الخط الأيمن" value={fontA} onChange={setFontA} accent night={night} />
          <FontList title="الخط الأيسر" value={fontB} onChange={setFontB} night={night} />
          <p className={`text-xs leading-relaxed ${night ? 'text-sand/70' : 'text-ink-soft'}`}>
            الخط الأيمن يظهر يمين الستارة، والأيسر يسارها. اسحب المقبض لمقارنة الحرف نفسه في الخطّين.
          </p>
        </aside>

        {/* Stage + controls */}
        <section className="order-1 lg:order-2 space-y-5">
          {/* Controls */}
          <div className={`rounded-2xl border p-4 md:p-5 grid gap-4 md:grid-cols-4 ${night ? 'border-sand/25 bg-white/5' : 'border-sand bg-white/50'}`}>
            <Control label={`الحجم ${size}px`}>
              <input type="range" min="24" max="120" value={size} onChange={(e) => setSize(+e.target.value)} className="w-full" />
            </Control>
            <Control label={`الوزن ${weight}`}>
              <input type="range" min="100" max="1000" step="100" value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full" />
            </Control>
            <Control label={`تباعد الأسطر ${leading.toFixed(1)}`}>
              <input type="range" min="1.2" max="2.6" step="0.1" value={leading} onChange={(e) => setLeading(+e.target.value)} className="w-full" />
            </Control>
            <Control label={`تباعد الحروف ${tracking}px`} hint={tracking > 0 ? 'يفكّك اتصال الحروف' : ''}>
              <input type="range" min="0" max="12" value={tracking} onChange={(e) => setTracking(+e.target.value)} className="w-full" />
            </Control>
          </div>

          {/* Sample picker */}
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSampleId(s.id)}
                className={`rounded-full px-4 py-1.5 text-sm border transition ${
                  sampleId === s.id
                    ? 'bg-rubric text-white border-rubric'
                    : night
                      ? 'border-sand/40 hover:bg-paper/10'
                      : 'border-sand hover:bg-paper-deep'
                }`}
              >
                {s.label}
              </button>
            ))}
            <button
              onClick={() => setSampleId('custom')}
              className={`rounded-full px-4 py-1.5 text-sm border transition ${
                sampleId === 'custom'
                  ? 'bg-rubric text-white border-rubric'
                  : night
                    ? 'border-sand/40 hover:bg-paper/10'
                    : 'border-sand hover:bg-paper-deep'
              }`}
            >
              نصّي الخاص
            </button>
          </div>

          {sampleId === 'custom' && (
            <textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              rows={2}
              placeholder="اكتب هنا ويظهر في المعاينة فورًا…"
              className={`w-full rounded-2xl border p-4 text-lg outline-none focus:ring-2 ring-rubric/50 ${night ? 'border-sand/30 bg-white/5' : 'border-sand bg-white/70'}`}
            />
          )}

          {/* The curtain stage */}
          <div
            ref={stageRef}
            dir="rtl"
            className={`relative overflow-hidden rounded-3xl border select-none ${night ? 'border-sand/25 bg-[#100e0a]' : 'border-sand bg-[#fbf8f1]'}`}
            style={{ minHeight: 300 }}
            onPointerDown={(e) => {
              setDragging(true)
              onMove(e)
            }}
          >
            {/* Base layer: font B (left side in RTL curtain terms = after split) */}
            <div className="p-8 md:p-12 cursor-ew-resize" style={previewStyle(fb, wB)}>
              {text}
            </div>
            {/* Overlay: font A clipped from the right (start in RTL) */}
            <div
              className={`absolute inset-0 ${night ? 'bg-[#1c1912]' : 'bg-[#f3ecdd]'}`}
              style={{ clipPath: `inset(0 0 0 ${100 - split}%)` }}
            >
              <div className="p-8 md:p-12" style={previewStyle(fa, wA)}>
                {text}
              </div>
            </div>
            {/* Handle */}
            <div className="absolute inset-y-0 z-10" style={{ left: `calc(${split}% - 1px)` }}>
              <div className="absolute inset-y-0 w-0.5 bg-rubric" />
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-11 w-11 rounded-full bg-rubric text-white flex items-center justify-center shadow-lg cursor-ew-resize">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4" /></svg>
              </div>
            </div>
            {/* Corner labels */}
            <span className="absolute top-3 right-4 z-20 rounded-full bg-rubric text-white text-xs px-3 py-1 shadow">{fa.label}</span>
            <span className={`absolute top-3 left-4 z-20 rounded-full text-xs px-3 py-1 border ${night ? 'border-sand/50 bg-night/70' : 'border-sand bg-paper/80'}`}>
              {fb.label}
            </span>
          </div>

          {/* Meta + CSS */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className={`rounded-2xl border p-4 text-sm leading-relaxed ${night ? 'border-sand/25' : 'border-sand'}`}>
              <p>
                <span className="font-semibold">{fa.label}</span> · {fa.kind} · {fa.weights.length} أوزان
              </p>
              <p>
                <span className="font-semibold">{fb.label}</span> · {fb.kind} · {fb.weights.length} أوزان
              </p>
              <p className={`mt-2 text-xs ${night ? 'text-sand/70' : 'text-ink-soft'}`}>
                جرّب «اختبار التشكيل»: الحركات فوق وتحت الحروف ولام-ألف بأشكالها تكشف سريعًا أي الخطوط صُنعت بعناية.
              </p>
            </div>
            <div className={`rounded-2xl border p-4 ${night ? 'border-sand/25' : 'border-sand'}`} dir="ltr">
              <pre className="text-xs md:text-sm overflow-x-auto" style={{ fontFamily: 'ui-monospace, monospace' }}>{cssSnippet}</pre>
            </div>
          </div>
        </section>
      </main>

      <footer className={`border-t py-6 text-center text-xs ${night ? 'border-sand/20 text-sand/60' : 'border-sand text-ink-soft'}`}>
        مِحبَر — خطوط من Google Fonts، كل شيء يعمل في متصفحك ولا يُحفظ شيء على خادم.
      </footer>
    </div>
  )
}

function Control({ label, hint, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium flex items-center justify-between">
        {label}
        {hint && <span className="text-rubric text-[10px]">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

function FontList({ title, value, onChange, accent, night }) {
  return (
    <div className={`rounded-2xl border p-3 ${night ? 'border-sand/25 bg-white/5' : 'border-sand bg-white/50'}`}>
      <h2 className={`text-xs font-semibold mb-2 px-1 ${accent ? 'text-rubric' : night ? 'text-sand' : 'text-ink-soft'}`}>{title}</h2>
      <ul className="max-h-64 overflow-y-auto space-y-1 pl-1">
        {FONTS.map((f) => (
          <li key={f.id}>
            <button
              onClick={() => onChange(f.id)}
              className={`w-full rounded-xl px-3 py-2 flex items-center justify-between gap-2 text-right transition ${
                value === f.id
                  ? accent
                    ? 'bg-rubric text-white'
                    : night
                      ? 'bg-paper text-ink'
                      : 'bg-ink text-paper'
                  : night
                    ? 'hover:bg-paper/10'
                    : 'hover:bg-paper-deep'
              }`}
            >
              <span className="text-sm">{f.label}</span>
              <span className="text-2xl leading-none" style={{ fontFamily: `"${f.css}"` }} aria-hidden>
                عَب
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
