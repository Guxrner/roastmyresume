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

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setFileLoaded('⏳ Reading PDF...');
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');
        pdfjsLib.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/legacy/build/pdf.worker.entry');
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(item => item.str).join(' ') + '\n';
        }
        setCvText(fullText.trim());
        setFileLoaded('✅ ' + file.name);
      } catch (err) {
        setFileLoaded('❌ Error — paste your CV text below');
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => { setCvText(ev.target.result); setFileLoaded('✅ ' + file.name); };
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
    en: { sub: 'Upload your CV and get brutally honest feedback — free.', upload: 'Click to upload your CV (PDF or TXT)', paste: 'Or paste your CV text below', medium: 'Honest but kind', savage: 'No mercy', btn: 'Roast my CV 🔥', loading: 'Roasting...', score: 'CV Score', roast: '🔥 The Roast', fixes: '✅ How to Fix It', upgrade: 'Want a full rewrite?', upgradeBtn: 'Get my rewritten CV — $4.99 USD' },
    es: { sub: 'Sube tu CV y recibe feedback brutalmente honesto — gratis.', upload: 'Haz clic para subir tu CV (PDF o TXT)', paste: 'O pega el texto de tu CV abajo', medium: 'Honesto pero amable', savage: 'Sin piedad', btn: 'Roastea mi CV 🔥', loading: 'Roasteando...', score: 'Puntuación', roast: '🔥 El Roast', fixes: '✅ Cómo Arreglarlo', upgrade: '¿Quieres la reescritura completa?', upgradeBtn: 'Obtener mi CV reescrito — $4.99 USD' }
  }[lang];

  const bg = '#0D0D0D';
  const card = 'rgba(255,255,255,0.06)';
  const border = 'rgba(255,255,255,0.12)';
  const text = '#ffffff';
  const muted = '#aaaaaa';
  const accent = '#E05A2B';

  return (
    <>
      <Head>
        <title>Roast My CV</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`body { background: ${bg}; margin: 0; padding: 0; }`}</style>
      </Head>
      <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: 680, margin: '0 auto', padding: '2rem 1rem', backgroundColor: bg, minHeight: '100vh', color: text }}>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button onClick={() => setLang('en')} style={{ padding: '8px 20px', borderRadius: 8, border: `2px solid ${lang === 'en' ? accent : border}`, background: lang === 'en' ? accent : 'transparent', color: text, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>🇺🇸 English</button>
          <button onClick={() => setLang('es')} style={{ padding: '8px 20px', borderRadius: 8, border: `2px solid ${lang === 'es' ? accent : border}`, background: lang === 'es' ? accent : 'transparent', color: text, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>🇲🇽 Español</button>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem,6vw,3rem)', fontWeight: 800, marginBottom: 8, lineHeight: 1.1, color: text }}>
          Your CV is <span style={{ color: accent }}>getting roasted.</span>
        </h1>
        <p style={{ color: muted, marginBottom: 32, fontSize: 16 }}>{t.sub}</p>

        <div
          style={{ border: `2px dashed ${dragging ? accent : border}`, borderRadius: 12, padding: '2rem', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(224,90,43,0.1)' : card, transition: 'all 0.2s', marginBottom: 16 }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}>
          <input id="fileInput" type="file" accept=".txt,.pdf" onChange={(e) => handleFile(e.target.files[0])} style={{ display: 'none' }} />
          <div style={{ fontSize: '2rem' }}>
            {fileLoaded.includes('⏳') ? '⏳' : fileLoaded.includes('✅') ? '✅' : fileLoaded.includes('❌') ? '❌' : '⬆️'}
          </div>
          <p style={{ margin: '8px 0 0', fontWeight: 700, fontSize: 15, color: fileLoaded.includes('✅') ? '#10B981' : fileLoaded.includes('❌') ? '#ff6b6b' : fileLoaded.includes('⏳') ? '#F59E0B' : text }}>
            {fileLoaded || t.upload}
          </p>
          <p style={{ margin: '4px 0 0', color: muted, fontSize: 12 }}>PDF • TXT</p>
        </div>

        <p style={{ textAlign: 'center', color: muted, margin: '12px 0', fontSize: 13 }}>{t.paste}</p>
        <textarea value={cvText} onChange={e => setCvText(e.target.value)} placeholder={t.paste} style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: `1px solid ${border}`, fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box', resize: 'vertical', background: card, color: text }} />
        <p style={{ textAlign: 'right', fontSize: 11, color: muted, marginTop: 4 }}>{cvText.length} chars</p>

        <p style={{ fontWeight: 700, margin: '16px 0 8px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: muted }}>Roast Level</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {['medium', 'savage'].map(l => (
            <div key={l} onClick={() => setLevel(l)} style={{ border: `2px solid ${level === l ? accent : border}`, borderRadius: 10, padding: '12px 16px', cursor: 'pointer', background: level === l ? 'rgba(224,90,43,0.15)' : card }}>
              <p style={{ margin: 0, fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</p>
              <p style={{ margin: '4px 0 0', fontWeight: 700, fontSize: 14, color: text }}>{t[l]}</p>
            </div>
          ))}
        </div>

        <button onClick={doRoast} disabled={loading} style={{ width: '100%', padding: 14, background: loading ? '#555' : accent, color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? t.loading : t.btn}
        </button>

        {error && <p style={{ color: '#ff6b6b', marginTop: 12, textAlign: 'center', fontSize: 14 }}>{error}</p>}

        {result && (
          <div style={{ marginTop: 28 }}>
            <div style={{ background: card, borderRadius: 10, padding: '1rem 1.25rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: '3rem', fontWeight: 800, color: result.score < 40 ? accent : result.score < 70 ? '#F59E0B' : '#10B981', lineHeight: 1 }}>{result.score}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: text }}>{t.score}</p>
                <p style={{ margin: 0, fontSize: 13, color: muted }}>/ 100 — {result.score < 40 ? '💀 Needs serious work' : result.score < 70 ? '⚠️ Average' : '✅ Good'}</p>
              </div>
            </div>

            <div style={{ border: '1px solid rgba(224,90,43,0.4)', borderRadius: 12, padding: '1.25rem', marginBottom: 12, background: 'rgba(224,90,43,0.08)' }}>
              <span style={{ background: 'rgba(224,90,43,0.2)', color: '#FF8C5A', fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 700, display: 'inline-block', marginBottom: 12 }}>{t.roast}</span>
              <p style={{ margin: 0, lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap', color: text }}>{result.roast}</p>
            </div>

            <div style={{ border: '1px solid rgba(16,185,129,0.4)', borderRadius: 12, padding: '1.25rem', marginBottom: 20, background: 'rgba(16,185,129,0.08)' }}>
              <span style={{ background: 'rgba(16,185,129,0.2)', color: '#34D399', fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 700, display: 'inline-block', marginBottom: 12 }}>{t.fixes}</span>
              <p style={{ margin: 0, lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-wrap', color: text }}>{result.fixes}</p>
            </div>

            <div style={{ border: `2px solid ${border}`, borderRadius: 12, padding: '1.5rem', textAlign: 'center', background: card }}>
              <p style={{ margin: '0 0 6px', fontWeight: 800, fontSize: 20, color: text }}>{t.upgrade}</p>
              <p style={{ margin: '0 0 16px', color: muted, fontSize: 14 }}>Get a professionally rewritten CV ready to send — in 60 seconds.</p>
              <a href="https://aicarrerservices.gumroad.com/l/roast-my-cv" target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', padding: '14px', background: accent, color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                {t.upgradeBtn}
              </a>
              <p style={{ margin: '10px 0 0', fontSize: 11, color: muted }}>One-time payment • Instant delivery • Money-back guarantee</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}