"use client";

import { useEffect, useMemo, useState } from "react";
import { useEditorStore } from "./store";
import { analyzeCanvas, Analysis } from "../lib/analyzer";

export default function AnalyzerPanel() {
  const canvas = useEditorStore(s => s.canvas);
  const brandColor = useEditorStore(s => s.brandColor);
  const setBrandColor = useEditorStore(s => s.setBrandColor);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!canvas) return;
    setBusy(true);
    try {
      const result = await analyzeCanvas(canvas, brandColor);
      setAnalysis(result);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!canvas) return;
    const h = () => {
      const id = setTimeout(() => run(), 300);
      return () => clearTimeout(id);
    };
    canvas.on('object:modified', h());
    canvas.on('object:added', h());
    canvas.on('object:removed', h());
    run();
    return () => {
      canvas.off('object:modified');
      canvas.off('object:added');
      canvas.off('object:removed');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, brandColor]);

  const scoreColor = useMemo(() => {
    const s = analysis?.score ?? 0;
    if (s >= 85) return '#22c55e';
    if (s >= 70) return '#f59e0b';
    return '#ef4444';
  }, [analysis]);

  return (
    <aside className="right-panel">
      <div className="panel-section">
        <div className="panel-title">Brand</div>
        <label className="hint">Warna brand</label>
        <input className="input" type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
      </div>

      <div className="panel-section">
        <div className="panel-title">Analisis Efektivitas</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="hint">Skor</div>
            <div className="score" style={{ color: scoreColor }}>{analysis ? analysis.score : '--'}</div>
          </div>
          <button className="badge" onClick={run} disabled={busy}>{busy ? 'Menganalisis?' : 'Analisis ulang'}</button>
        </div>
        <hr className="sep" />
        <div className="list">
          {(analysis?.findings ?? []).map((f, idx) => (
            <div className="list-item" key={idx}>
              <div>
                <div style={{ fontWeight: 600 }}>{f.label}</div>
                {f.detail && <div className="hint">{f.detail}</div>}
              </div>
              <span className="badge" style={{ color: f.ok ? '#22c55e' : '#ef4444', borderColor: f.ok ? '#14532d' : '#3f1d1d' }}>{f.ok ? 'OK' : 'Perbaiki'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-title">Prinsip Thumbnail Efektif</div>
        <ul style={{ margin: 0, paddingInlineStart: 16, color: '#9ca3af', lineHeight: 1.6 }}>
          <li>Teks singkat, besar, dan kontras (? 6 kata)</li>
          <li>Fokus pada 1 objek utama, hindari elemen berlebihan</li>
          <li>Wajah/ekspresi kuat sering meningkatkan CTR</li>
          <li>Gunakan warna brand untuk konsistensi</li>
          <li>Pastikan terbaca pada ukuran kecil</li>
        </ul>
      </div>
    </aside>
  );
}
