'use client';

import { useState, useRef, useCallback } from 'react';

interface AnalysisResult {
  topic: string;
  keywords: string[];
  summary: string;
  emotion: {
    overall: 'positive' | 'negative' | 'neutral' | 'mixed';
    score: number;
    emotions: string[];
    description: string;
  };
}

const emotionColors: Record<string, string> = {
  positive: '#4ade80',
  negative: '#f87171',
  neutral: '#60a5fa',
  mixed: '#fbbf24',
};

const emotionLabels: Record<string, string> = {
  positive: 'Позитивен',
  negative: 'Негативен',
  neutral: 'Неутрален',
  mixed: 'Смесен',
};

export default function Home() {
  const [tab, setTab] = useState<'paste' | 'file'>('paste');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    setFileName(file.name);

    if (ext === 'txt') {
      const content = await file.text();
      setText(content);
    } else if (ext === 'pdf') {
      // Use pdf.js via CDN for browser-side extraction
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: { str?: string }) => item.str || '').join(' ') + '\n';
      }
      setText(fullText);
    } else if (ext === 'docx') {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      setText(result.value);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await readFile(file);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await readFile(file);
  }, []);

  const analyze = async () => {
    const content = text.trim();
    if (!content) { setError('Моля, въведете или качете текст.'); return; }
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Грешка');
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Неочаквана грешка.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = text.length;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">🔍</div>
          <span className="logo-text">Text<span>Lens</span></span>
        </div>
        <p className="header-tagline">Интелигентен анализ на текст</p>
      </header>

      {/* Input section */}
      <section className="input-section">
        {/* Tabs */}
        <div className="tab-bar">
          <button className={`tab-btn ${tab === 'paste' ? 'active' : ''}`} onClick={() => setTab('paste')}>
            ✏️ Въведи текст
          </button>
          <button className={`tab-btn ${tab === 'file' ? 'active' : ''}`} onClick={() => setTab('file')}>
            📁 Качи файл
          </button>
        </div>

        {tab === 'paste' ? (
          <div className="textarea-wrap">
            <textarea
              className="main-textarea"
              placeholder="Поставете или напишете текст тук за анализ…"
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <span className="char-count">{charCount.toLocaleString()} символа</span>
          </div>
        ) : (
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="drop-zone-icon">📄</div>
            <p className="drop-zone-title">Плъзнете файл или кликнете за избор</p>
            <p className="drop-zone-sub">Поддържани формати: .txt, .pdf, .docx</p>
            {fileName && (
              <p className="file-loaded">
                ✅ {fileName}
                {text && ` — ${text.length.toLocaleString()} символа заредени`}
              </p>
            )}
          </div>
        )}

        <button
          className="analyze-btn"
          onClick={analyze}
          disabled={loading || !text.trim()}
        >
          {loading ? (
            <>
              <div className="shimmer" />
              <div className="spinner" />
              Анализирам…
            </>
          ) : (
            '✦ Анализирай текста'
          )}
        </button>
      </section>

      {/* Error */}
      {error && <div className="error-box">⚠️ {error}</div>}

      {/* Results */}
      {result && (
        <section className="results-section">
          {/* Topic */}
          <div className="result-card">
            <div className="card-label">
              <span className="card-label-dot" style={{ background: '#a78bfa' }}></span>
              Тема
            </div>
            <p className="topic-text">{result.topic}</p>
          </div>

          {/* Keywords */}
          <div className="result-card">
            <div className="card-label">
              <span className="card-label-dot" style={{ background: '#60a5fa' }}></span>
              Ключови думи
            </div>
            <div className="keywords-list">
              {result.keywords.map((kw, i) => (
                <span key={i} className="keyword-tag">{kw}</span>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="result-card full-width">
            <div className="card-label">
              <span className="card-label-dot" style={{ background: '#34d399' }}></span>
              Резюме
            </div>
            <p className="summary-text">{result.summary}</p>
          </div>

          {/* Emotion */}
          <div className="result-card full-width">
            <div className="card-label">
              <span className="card-label-dot" style={{ background: emotionColors[result.emotion.overall] }}></span>
              Емоционална натовареност
            </div>
            <div className="emotion-score">
              <div>
                <div className="emotion-score-num">{result.emotion.score}</div>
                <div className="emotion-score-label">Индекс (0–100)</div>
              </div>
              <span className={`emotion-badge ${result.emotion.overall}`}>
                {emotionLabels[result.emotion.overall]}
              </span>
            </div>
            <div className="emotion-bar-wrap">
              <div
                className="emotion-bar"
                style={{
                  width: `${result.emotion.score}%`,
                  background: `linear-gradient(90deg, #f87171, #fbbf24, #4ade80)`,
                }}
              />
            </div>
            <p className="summary-text" style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>
              {result.emotion.description}
            </p>
            <div className="emotions-grid">
              {result.emotion.emotions.map((e, i) => (
                <span key={i} className="emotion-chip">{e}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="footer">
        Powered by Claude AI · TextLens © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
