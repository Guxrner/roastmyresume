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

  const doRoast = async () => {
    if (!cvText.trim()) { setError(lang === 'en' ? 'Please add your CV text first!' : '¡Agrega el texto de tu CV primero!'); return; }
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText, level, lang })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const t = {
    en: { title: 'RoastMyResume', sub: 'Upload your CV and get brutally honest feedback — free.', upload: 'Drop your CV here or click to upload', paste: 'Or paste your CV text', medium: 'Honest but kind', savage: 'No mercy', btn: 'Roast my CV 🔥', loading: 'Roasting...', score: 'CV Score', roast: '🔥 The Roast', fixes: '✅ How to Fix It', upgrade: 'Want a full rewrite? → $4.99 USD' },
    es: { title: 'RoastMyResume', sub: 'Sube tu CV y recibe feedback brutalmente honesto — gratis.', upload: 'Arrastra tu CV aquí o haz clic', paste: 'O pega el texto de tu CV', medium: 'Honesto pero amable', savage: 'Sin piedad', btn: 'Roastea mi CV 🔥', loading: 'Roasteando...', score: 'Puntuación', roast: '🔥 El Roast', fixes: '✅ Cómo Arreglarlo', upgrade: '¿Quieres la reescritura completa? → $4.99 USD' }
  }[lang];

  return (
    <>
      <Head><title>RoastMyResume</title></Head>
      <div style={{ fontFamily: 'system-ui', maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button onClick={() => setLang('en')} style={{ padding: '6px 16px', borderRadius: 20, border: '1px solid #ccc', background: lang === 'en' ? '#000' : 'transparent', color: lang === 'en' ? '#fff' : '#000', cursor: 'pointer' }}>🇺🇸 English</button>
          <button onClick={() => setLang('es')} style={{ padding: '6px 16px', borderRadius: 20, border: '1px solid #ccc', background: lang === 'es' ? '#000' : 'transparent', color: lang === 'es' ? '#fff' : '#000', cursor: 'pointer' }}>🇲🇽 Español</button>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 8 }}>Your CV is <span style={{ color: '#E05A2B' }}>getting roasted.</span></h1>
        <p style={{ color: '#666', marginBottom: 32 }}>{t.sub}</p>

        <label style={{ display: 'block', border: '2px dashed #ccc', borderRadius: 12, padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: 16 }}>
          <input type="file" accept=".txt,.pdf" onChange={handleFile} style={{ display: 'none' }} />
          <div style={{ fontSize: '2rem' }}>📄</div>
          <p style={{ margin: '8px 0 0', fontWeight: 600 }}>{t.upload}</p>
          <p style={{ margin: '4px 0 0', color: '#999', fontSize: 13 }}>TXT • PDF</p>
        </label>

        <p style={{ textAlign: 'center', color: '#999', margin: '12px 0' }}>{t.paste}</p>

        <textarea
          value={cvText}
          onChange={e => setCvText(e.target.value)}
          placeholder={t.paste}
          style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: '1px solid #ddd', fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical' }}
        />
        <p style={{ textAlign: 'right', fontSize: 11, color: '#999' }}>{cvText.length} chars</p>

        <p style={{ fontWeight: 600, margin: '16px 0 8px' }}>Roast Level</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {['medium', 'savage'].map(l => (
            <div key={l} onClick={() => setLevel(l)} style={{ border: `2px solid ${level === l ? '#E05A2B' : '#ddd'}`, borderRadius: 8, padding: '10px 14px', cursor: 'pointer', background: level === l ? '#FEF0EB' : 'transparent' }}>
              <p style={{ margin: 0, fontSize: 10, color: '#999', textTransform: 'uppercase' }}>{l}</p>
              <p style={{ margin: '2px 0 0', fontWeight: 700 }}>{t[l]}</p>
            </div>
          ))}
        </div>

        <button onClick={doRoast} disabled={loading} style={{ width: '100%', padding: 14, background: '#E05A2B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? t.loading : t.btn}
        </button>

        {error && <p style={{ color: 'red', marginTop: 12, textAlign: 'center' }}>{error}</p>}

        {result && (
          <div style={{ marginTop: 24 }}>
            <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '1rem 1.25rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: result.score < 40 ? '#E05A2B' : result.score < 70 ? '#F59E0B' : '#10B981' }}>{result.score}</span>
              <div><p style={{ margin: 0, fontWeight: 700 }}>{t.score}</p><p style={{ margin: 0, fontSize: 12, color: '#666' }}>/ 100</p></div>
            </div>
            <div style={{ border: '1px solid #FBBF9A', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 12 }}>
              <p style={{ margin: '0 0 8px', background: '#FEF0EB', color: '#993C1D', fontSize: 11, padding: '3px 8px', borderRadius: 4, display: 'inline-block' }}>{t.roast}</p>
              <p style={{ margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{result.roast}</p>
            </div>
            <div style={{ border: '1px solid #6EE7B7', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', background: '#ECFDF5', color: '#065F46', fontSize: 11, padding: '3px 8px', borderRadius: 4, display: 'inline-block' }}>{t.fixes}</p>
              <p style={{ margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{result.fixes}</p>
            </div>
            <div style={{ border: '2px solid #000', borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
              <p style={{ margin: '0 0 12px', fontWeight: 800, fontSize: 18 }}>{t.upgrade}</p>
              <button style={{ width: '100%', padding: 12, background: '#000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Get my rewritten CV — $4.99 USD
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}