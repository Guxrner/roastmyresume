import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [cvText, setCvText] = useState('');
  const [level, setLevel] = useState('medium');
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    setCvText(text);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { const reader = new FileReader(); reader.onload = (ev) => setCvText(ev.target.result); reader.readAsText(file); }
  };

  const [dragging, setDragging] = useState(false);

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
    en: { title: 'RoastMyResume', sub: 'Upload your CV and get brutally honest feedback — free.', upload: 'Drop your CV here or click to upload', paste: 'Or paste your CV text', medium: 'Honest but kind', savage: 'No mercy', btn: 'Roast my CV 🔥', loading: 'Roasting...', score: 'CV Score', roast: '🔥 The Roast', fixes: '✅ How to Fix It', upgrade: 'Want a full rewrite?', upgradeBtn: 'Get my rewritten CV — $4.99 USD' },
    es: { title: 'RoastMyCV', sub: 'Sube tu CV y recibe feedback brutalmente honesto — gratis.', upload: 'Arrastra tu CV aquí o haz clic', paste: 'O pega el texto de tu CV', medium: 'Honesto pero amable', savage: 'Sin piedad', btn: 'Roastea mi CV 🔥', loading: 'Roasteando...', score: 'Puntuación', roast: '🔥 El Roast', fixes: '✅ Cómo Arreglarlo', upgrade: '¿Quieres la reescritura completa?', upgradeBtn: 'Obtener mi CV reescrito — $4.99 USD' }
  }[lang];

  return (
    <>
      <Head><title>Roast My CV</title></Head>
      <div style={{ fontFamily: 'system-ui', maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button onClick={() => setLang('en')} style={{ padding: '8px 20px', borderRadius: 8, border: '2px solid', borderColor: lang === 'en' ? '#E05A2B' : '#ddd', background: lang === 'en' ? '#E05A2B' : 'transparent', color: lang === 'en' ? '#fff' : '#666', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>🇺🇸 English</button>
          <button onClick={() => setLang('es')} style={{ padding: '8px 20px', borderRadius: 8, border: '2px solid', borderColor: lang === 'es' ? '#E05A2B' : '#ddd', background: lang === 'es' ? '#E05A2B' : 'transparent', color: lang === 'es' ? '#fff' : '#666', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>🇲🇽 Español</button>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 800, marginBottom: 8, lineHeight: 1.1 }}>Your CV is <span style={{ color: '#E05A2B' }}>getting roasted.</span></h1>
        <p style={{ color: '#666', marginBottom: 32, fontSize: 16 }}>{t.sub}</p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
          style={{ border: `2px dashed ${dragging ? '#E05A2B' : '#ccc'}`, borderRadius: 12, padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: 16, background: dragging ? '#FEF0EB' : 'transparent', transition: 'all 0.2s' }}>
          <input id="fileInput" type="file" accept=".txt,.pdf" onChange={handleFile} style={{ display: 'none' }} />
          <div style={{ fontSize: '2rem' }}>📄</div>
          <p style={{ margin: '8px 0 0', fontWeight: 700, fontSize: 15 }}>{t.upload}</p>
          <p style={{ margin: '4px 0 0', color: '#999', fontSize: 12 }}>TXT • PDF</p>
        </div>

        <p style={{ textAlign: 'center', color: '#999', margin: '12px 0', fontSize: 13 }}>{t.paste}</p>
        <textarea value={cvText} onChange={e => setCvText(e.target.value)} placeholder={t.paste} style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical' }} />
        <p style={{ textAlign: 'right', fontSize: 11, color: '#999', marginTop: 4 }}>{cvText.length} chars</p>

        <p style={{ fontWeight: 700, margin: '16px 0 8px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#666' }}>Roast Level</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {['medium', 'savage'].map(l => (
            <div key={l} onClick={() => setLevel(l)} style={{ border: `2px solid ${level === l ? '#E05A2B' : '#ddd'}`, borderRadius: 10, padding: '12px 16px', cursor: 'pointer', background: level === l ? '#FEF0EB' : 'transparent', transition: 'all 0.15s' }}>
              <p style={{ margin: 0, fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</p>
              <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: 14 }}>{t[l]}</p>
            </div>
          ))}
        </div>

        <button onClick={doRoast} disabled={loading} style={{ width: '100%', padding: 14, background: loading ? '#ccc' : '#E05A2B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
          {loading ? t.loading : t.btn}
        </button>

        {error && <p style={{ color: 'red', marginTop: 12, textAlign: 'center', fontSize: 14 }}>{error}</p>}

        {result && (
          <div style={{ marginTop: 28 }}>
            <div style={{ background: '#f8f8f8', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: result.score < 40 ? '#E05A2B' : result.score < 70 ? '#F59E0B' : '#10B981', lineHeight: 1 }}>{result.score}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{t.score}</p>
                <p style={{ margin: 0, fontSize: 13, color: '#999' }}>/ 100 — {result.score < 40 ? '💀 Needs serious work' : result.score < 70 ? '⚠️ Average' : '✅ Good'}</p>
              </div>
            </div>

            <div style={{ border: '1px solid #FBBF9A', borderRadius: 12, padding: '1.25rem', marginBottom: 12, background: '#fff' }}>
              <span style={{ background: '#FEF0EB', color: '#993C1D', fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 700, display: 'inline-block', marginBottom: 12 }}>{t.roast}</span>
              <p style={{ margin: 0, lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap' }}>{result.roast}</p>
            </div>

            <div style={{ border: '1px solid #6EE7B7', borderRadius: 12, padding: '1.25rem', marginBottom: 20, background: '#fff' }}>
              <span style={{ background: '#ECFDF5', color: '#065F46', fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 700, display: 'inline-block', marginBottom: 12 }}>{t.fixes}</span>
              <p style={{ margin: 0, lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap' }}>{result.fixes}</p>
            </div>

            <div style={{ border: '2px solid #000', borderRadius: 12, padding: '1.5rem', textAlign: 'center', background: '#fff' }}>
              <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 20 }}>{t.upgrade}</p>
              <p style={{ margin: '0 0 16px', color: '#666', fontSize: 14 }}>Get a professionally rewritten CV ready to send — in 60 seconds.</p>
              <a href="https://joseguitar51.gumroad.com/l/roast-my-cv" target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', padding: '14px', background: '#000', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                {t.upgradeBtn}
              </a>
              <p style={{ margin: '10px 0 0', fontSize: 11, color: '#999' }}>One-time payment • Instant delivery • Money-back guarantee</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

Guarda con **Ctrl+S** y luego en la terminal:
```
git add .
git commit -m "improve UI and add gumroad link"
git push