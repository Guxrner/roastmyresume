import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [cvText, setCvText] = useState('');
  const [level, setLevel] = useState('medium');
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [fileLoaded, setFileLoaded] = useState('');

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCvText(ev.target.result); setFileLoaded(file.name); };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const doRoast = async () => {
    if (!cvText.trim()) { setError(lang === 'en' ? 'Please add your CV text first!' : '¡Agrega el texto de tu CV primero!'); return; }
    setLoading(true); setResult(null); setError('');
    try {
      const res = await fetch('/api/roast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cvText, level, lang }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const t = {
    en: { sub: 'Upload your CV and get brutally honest feedback — free.', upload: 'Drop your CV here or click to upload', paste: 'Or paste your CV text below', medium: 'Honest but kind', savage: 'No mercy', btn: 'Roast my CV 🔥', loading: 'Roasting...', score: 'CV Score', roast: '🔥 The Roast', fixes: '✅ How to Fix It', upgrade: 'Want a full rewrite?', upgradeBtn: 'Get my rewritten CV — $4.99 USD' },
    es: { sub: 'Sube tu CV y recibe feedback brutalmente honesto — gratis.', upload: 'Arrastra tu CV aquí o haz clic', paste: 'O pega el texto de tu CV abajo', medium: 'Honesto pero amable', savage: 'Sin piedad', btn: 'Roastea mi CV 🔥', loading: 'Roasteando...', score: 'Puntuación', roast: '🔥 El Roast', fixes: '✅ Cómo Arreglarlo', upgrade: '¿Quieres la reescritura completa?', upgradeBtn: 'Obtener mi CV reescrito — $4.99 USD' }
  }[lang];

  const s = {
    wrap: { fontFamily: 'system-ui', maxWidth: 680, margin: '0 auto', padding: '2rem 1rem', color: '#ffffff' },
    langBtn: (active) => ({ padding: '8px 20px', borderRadius: 8, border: `2px solid ${active ? '#E05A2B' : '#555'}`, background: active ? '#E05A2B' : 'transparent', color: '#ffffff', cursor: 'pointer', fontWeight: 700, fontSize: 13, transition: 'all 0.2s' }),
    dropzone: { border: `2px dashed ${dragging ? '#E05A2B' : '#555'}`, borderRadius: 12, padding: '2rem', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(224,90,43,0.1)' : 'rgba(255,255,255,0.05)', transition: 'all 0.2s', marginBottom: 16 },
    textarea: { width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: '1px solid #555', fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical', background: 'rgba(255,255,255,0.08)', color: '#ffffff' },
    levelBtn: (active) => ({ border: `2px solid ${active ? '#E05A2B' : '#555'}`, borderRadius: 10, padding: '12px 16px', cursor: 'pointer', background: active ? 'rgba(224,90,43,0.15)' : 'rgba(255,255,255,0.05)', transition: 'all 0.15s' }),
    roastBtn: { width: '100%', padding: 14, background: loading ? '#555' : '#E05A2B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer' },
    scoreCard: { background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 },
    roastCard: { border: '1px solid #8B4513', borderRadius: 12, padding: '1.25rem', marginBottom: 12, background: 'rgba(224,90,43,0.08)' },
    fixCard: { border: '1px solid #1a6b45', borderRadius: 12, padding: '1.25rem', marginBottom: 20, background: 'rgba(16,185,129,0.08)' },
    ctaBox: { border: '2px solid #ffffff', borderRadius: 12, padding: '1.5rem', textAlign: 'center' },
    tag: (bg, color) => ({ background: bg, color: color, fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 700, display: 'inline-block', marginBottom: 12 }),
    gumBtn: { display: 'block', width: '100%', padding: '14px', background: '#E05A2B', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }
  };

  return (
    <>
      <Head><title>Roast My CV</title></Head>
      <div style={s.wrap}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button onClick={() => setLang('en')} style={s.langBtn(lang === 'en')}>🇺🇸 English</button>
          <button onClick={() => setLang('es')} style={s.langBtn(lang === 'es')}>🇲🇽 Español</button>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 800, marginBottom: 8, lineHeight: 1.1, color: '#ffffff' }}>
          Your CV is <span style={{ color: '#E05A2B' }}>getting roasted.</span>
        </h1>
        <p style={{ color: '#aaa', marginBottom: 32, fontSize: 16 }}>{t.sub}</p>

        <div
          style={s.dropzone}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}>
          <input id="fileInput" type="file" accept=".txt,.pdf" onChange={(e) => handleFile(e.target.files[0])} style={{ display: 'none' }} />
          <div style={{ fontSize: '2rem' }}>{fileLoaded ? '✅' : '📄'}</div>
          <p style={{ margin: '8px 0 0', fontWeight: 700, fontSize: 15, color: fileLoaded ? '#10B981' : '#ffffff' }}>
            {fileLoaded ? fileLoaded : t.upload}
          </p>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 12 }}>TXT • PDF</p>
        </div>

        <p style={{ textAlign: 'center', color: '#888', margin: '12px 0', fontSize: 13 }}>{t.paste}</p>
        <textarea value={cvText} onChange={e => setCvText(e.target.value)} placeholder={t.paste} style={s.textarea} />
        <p style={{ textAlign: 'right', fontSize: 11, color: '#888', marginTop: 4 }}>{cvText.length} chars</p>

        <p style={{ fontWeight: 700, margin: '16px 0 8px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#aaa' }}>Roast Level</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {['medium', 'savage'].map(l => (
            <div key={l} onClick={() => setLevel(l)} style={s.levelBtn(level === l)}>
              <p style={{ margin: 0, fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</p>
              <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: 14, color: '#ffffff' }}>{t[l]}</p>
            </div>
          ))}
        </div>

        <button onClick={doRoast} disabled={loading} style={s.roastBtn}>
          {loading ? t.loading : t.btn}
        </button>

        {error && <p style={{ color: '#ff6b6b', marginTop: 12, textAlign: 'center', fontSize: 14 }}>{error}</p>}

        {result && (
          <div style={{ marginTop: 28 }}>
            <div style={s.scoreCard}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: result.score < 40 ? '#E05A2B' : result.score < 70 ? '#F59E0B' : '#10B981', lineHeight: 1 }}>{result.score}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#ffffff' }}>{t.score}</p>
                <p style={{ margin: 0, fontSize: 13, color: '#aaa' }}>/ 100 — {result.score < 40 ? '💀 Needs serious work' : result.score < 70 ? '⚠️ Average' : '✅ Good'}</p>
              </div>
            </div>

            <div style={s.roastCard}>
              <span style={s.tag('rgba(224,90,43,0.2)', '#E05A2B')}>{t.roast}</span>
              <p style={{ margin: 0, lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap', color: '#ffffff' }}>{result.roast}</p>
            </div>

            <div style={s.fixCard}>
              <span style={s.tag('rgba(16,185,129,0.2)', '#10B981')}>{t.fixes}</span>
              <p style={{ margin: 0, lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap', color: '#ffffff' }}>{result.fixes}</p>
            </div>

            <div style={s.ctaBox}>
              <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 20, color: '#ffffff' }}>{t.upgrade}</p>
              <p style={{ margin: '0 0 16px', color: '#aaa', fontSize: 14 }}>Get a professionally rewritten CV ready to send — in 60 seconds.</p>
              <a href="aicarrerservices.gumroad.com/l/roast-my-cv" target="_blank" rel="noopener noreferrer" style={s.gumBtn}>
                {t.upgradeBtn}
              </a>
              <p style={{ margin: '10px 0 0', fontSize: 11, color: '#888' }}>One-time payment • Instant delivery • Money-back guarantee</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
