"use client";

import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useEditorStore } from "./store";

export default function Editor() {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showThirds, setShowThirds] = useState(true);
  const brandColor = useEditorStore(s => s.brandColor);
  const setCanvas = useEditorStore(s => s.setCanvas);

  useEffect(() => {
    const canvas = new fabric.Canvas("main-canvas", {
      width: 1280,
      height: 720,
      backgroundColor: "#0b0d10",
      preserveObjectStacking: true
    });
    // default background gradient
    const gradient = new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: 0, y2: 720 },
      colorStops: [
        { offset: 0, color: "#0b0d10" },
        { offset: 1, color: "#111827" }
      ]
    });
    const bg = new fabric.Rect({ left: 0, top: 0, width: 1280, height: 720, selectable: false, evented: false });
    (bg as any).fill = gradient;
    canvas.add(bg);
    canvas.sendToBack(bg);

    // initial headline
    const headline = new fabric.Textbox("JUDUL SINGKAT", {
      left: 80, top: 80, width: 1120, fontSize: 140, fontFamily: "Anton, Bebas Neue, Oswald, Poppins, sans-serif",
      fill: "#ffffff", stroke: "#000000", strokeWidth: 6, fontWeight: 800, charSpacing: 40, lineHeight: 0.9
    });
    headline.shadow = new fabric.Shadow({ color: "rgba(0,0,0,0.4)", blur: 18, offsetX: 0, offsetY: 6 });
    canvas.add(headline);

    const sub = new fabric.Textbox("Subjudul ringkas", {
      left: 84, top: 260, width: 860, fontSize: 64, fontFamily: "Poppins, sans-serif", fill: brandColor, fontWeight: 700
    });
    canvas.add(sub);

    canvas.selection = true;
    canvasRef.current = canvas;
    setCanvas(canvas);

    const resize = () => {
      if (!containerRef.current) return;
      const maxW = containerRef.current.clientWidth - 40;
      const maxH = window.innerHeight - 180;
      const scale = Math.min(maxW / 1280, maxH / 720);
      const el = document.getElementById('main-canvas') as HTMLCanvasElement;
      if (!el) return;
      el.style.transformOrigin = 'top left';
      el.style.transform = `scale(${scale})`;
      el.style.margin = '20px';
    };
    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.dispose();
    };
  }, [brandColor, setCanvas]);

  const addText = (preset: 'headline' | 'sub') => {
    const canvas = canvasRef.current!;
    const obj = new fabric.Textbox(preset === 'headline' ? 'TEKS BESAR' : 'Teks kecil', {
      left: 100,
      top: preset === 'headline' ? 100 : 220,
      width: preset === 'headline' ? 1080 : 820,
      fontSize: preset === 'headline' ? 120 : 56,
      fontFamily: preset === 'headline' ? 'Anton, Bebas Neue, Oswald, Poppins, sans-serif' : 'Poppins, sans-serif',
      fill: preset === 'headline' ? '#ffffff' : brandColor,
      stroke: preset === 'headline' ? '#000' : undefined,
      strokeWidth: preset === 'headline' ? 5 : 0,
      fontWeight: 800,
      charSpacing: preset === 'headline' ? 30 : 0,
      lineHeight: 0.9
    });
    if (preset === 'headline') {
      obj.shadow = new fabric.Shadow({ color: 'rgba(0,0,0,0.35)', blur: 16, offsetX: 0, offsetY: 5 });
    }
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  };

  const addShape = (shape: 'rect' | 'circle') => {
    const canvas = canvasRef.current!;
    if (shape === 'rect') {
      const r = new fabric.Rect({ left: 100, top: 400, width: 420, height: 180, rx: 20, ry: 20, fill: brandColor, opacity: 0.9 });
      canvas.add(r);
      canvas.setActiveObject(r);
    } else {
      const c = new fabric.Circle({ left: 600, top: 420, radius: 90, fill: brandColor, opacity: 0.9 });
      canvas.add(c);
      canvas.setActiveObject(c);
    }
    canvas.requestRenderAll();
  };

  const addImage = (file: File) => {
    const canvas = canvasRef.current!;
    const reader = new FileReader();
    reader.onload = () => {
      fabric.Image.fromURL(reader.result as string, (img) => {
        const scale = Math.min(600 / img.width!, 400 / img.height!);
        img.set({ left: 780, top: 300, selectable: true });
        if (scale < 1) img.scale(scale);
        img.set({ clipPath: undefined });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
      }, { crossOrigin: 'anonymous' });
    };
    reader.readAsDataURL(file);
  };

  const setBgColor = (hex: string) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getObjects().find(o => o.type === 'rect' && (o as any).evented === false) as fabric.Rect | undefined;
    if (!rect) return;
    (rect as any).set('fill', hex);
    canvas.requestRenderAll();
  };

  const exportPng = () => {
    const canvas = canvasRef.current!;
    const url = canvas.toDataURL({ format: 'png', multiplier: 1 });
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thumbnail-1280x720.png';
    a.click();
  };

  const bringToFront = () => {
    const canvas = canvasRef.current!;
    const obj = canvas.getActiveObject();
    if (obj) { obj.bringToFront(); canvas.requestRenderAll(); }
  };
  const sendToBack = () => {
    const canvas = canvasRef.current!;
    const obj = canvas.getActiveObject();
    const bg = canvas.getObjects()[0];
    if (obj && obj !== bg) { canvas.sendToBack(obj); canvas.bringToFront(bg); canvas.requestRenderAll(); }
  };

  const duplicate = () => {
    const c = canvasRef.current!;
    const obj = c.getActiveObject();
    if (!obj) return;
    obj.clone((cloned: any) => {
      cloned.set({ left: (obj.left || 0) + 20, top: (obj.top || 0) + 20 });
      c.add(cloned);
      c.setActiveObject(cloned);
      c.requestRenderAll();
    });
  };

  const remove = () => {
    const c = canvasRef.current!;
    const obj = c.getActiveObject();
    if (!obj) return;
    c.remove(obj);
    c.requestRenderAll();
  };

  const onImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) addImage(f);
    e.currentTarget.value = "";
  };

  const toggleGrid = () => setShowGrid(v => !v);
  const toggleThirds = () => setShowThirds(v => !v);

  return (
    <>
      <aside className="left-panel">
        <div className="panel-section">
          <div className="panel-title">Kanvas</div>
          <div className="row" style={{ marginBottom: 8 }}>
            <button className="badge" onClick={toggleGrid}>{showGrid ? 'Hide' : 'Show'} Grid</button>
            <button className="badge" onClick={toggleThirds}>{showThirds ? 'Hide' : 'Show'} Thirds</button>
          </div>
          <label className="hint">Warna latar</label>
          <input className="input" type="color" defaultValue="#0b0d10" onChange={(e) => setBgColor(e.target.value)} />
        </div>

        <div className="panel-section">
          <div className="panel-title">Tambahkan</div>
          <div className="row" style={{ marginBottom: 8 }}>
            <button className="badge" onClick={() => addText('headline')}>+ Headline</button>
            <button className="badge" onClick={() => addText('sub')}>+ Subjudul</button>
          </div>
          <div className="row" style={{ marginBottom: 8 }}>
            <button className="badge" onClick={() => addShape('rect')}>+ Kotak</button>
            <button className="badge" onClick={() => addShape('circle')}>+ Lingkaran</button>
          </div>
          <input className="input" type="file" accept="image/*" onChange={onImageUpload} />
        </div>

        <div className="panel-section">
          <div className="panel-title">Objek</div>
          <div className="row">
            <button className="badge" onClick={bringToFront}>Bring Front</button>
            <button className="badge" onClick={sendToBack}>Send Back</button>
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="badge" onClick={duplicate}>Duplicate</button>
            <button className="badge" onClick={remove}>Delete</button>
          </div>
          <hr className="sep" />
          <button className="badge" onClick={exportPng}>?? Export PNG</button>
        </div>
      </aside>

      <main className="canvas-wrap" ref={containerRef}>
        <div className="canvas-frame" style={{ width: 1280, height: 720 }}>
          <canvas id="main-canvas" width={1280} height={720} />
          <div className="helper-overlay">
            {showGrid && <GridOverlay />}
            {showThirds && <ThirdsOverlay />}
            <SafeMargin />
          </div>
        </div>
      </main>
    </>
  );
}

function GridOverlay() {
  const size = 40;
  const lines = [] as JSX.Element[];
  for (let x = size; x < 1280; x += size) {
    lines.push(<line key={`v-${x}`} x1={x} y1={0} x2={x} y2={720} stroke="#1f2937" strokeWidth="1" />);
  }
  for (let y = size; y < 720; y += size) {
    lines.push(<line key={`h-${y}`} x1={0} y1={y} x2={1280} y2={y} stroke="#1f2937" strokeWidth="1" />);
  }
  return (
    <svg width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
      {lines}
    </svg>
  );
}

function ThirdsOverlay() {
  const v = 1280 / 3;
  const h = 720 / 3;
  return (
    <svg width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
      <line x1={v} y1={0} x2={v} y2={720} stroke="#334155" strokeDasharray="6 6" />
      <line x1={v * 2} y1={0} x2={v * 2} y2={720} stroke="#334155" strokeDasharray="6 6" />
      <line x1={0} y1={h} x2={1280} y2={h} stroke="#334155" strokeDasharray="6 6" />
      <line x1={0} y1={h * 2} x2={1280} y2={h * 2} stroke="#334155" strokeDasharray="6 6" />
    </svg>
  );
}

function SafeMargin() {
  const m = 24;
  return (
    <svg width={1280} height={720} style={{ position: 'absolute', inset: 0 }}>
      <rect x={m} y={m} width={1280 - m * 2} height={720 - m * 2} fill="none" stroke="#0ea5e9" strokeOpacity={0.5} strokeDasharray="4 6" />
    </svg>
  );
}
