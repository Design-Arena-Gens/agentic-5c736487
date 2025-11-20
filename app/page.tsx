"use client";

import { useEffect } from "react";
import Editor from "../components/Editor";
import AnalyzerPanel from "../components/AnalyzerPanel";
import "../styles/globals.css";

export default function Page() {
  useEffect(() => {
    // Prevent pinch-zoom scroll on trackpads while editing
    document.addEventListener(
      "wheel",
      (e) => {
        if ((e as WheelEvent).ctrlKey) e.preventDefault();
      },
      { passive: false }
    );
  }, []);

  return (
    <div className="app-shell">
      <header className="header">
        <div className="brand">
          <div className="brand-logo">??</div>
          <div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>YouTube</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Thumbnail Studio</div>
          </div>
        </div>
        <div className="toolbar">
          <span className="badge">1280 ? 720 (16:9)</span>
          <a className="badge link" href="https://support.google.com/youtube/answer/72431" target="_blank" rel="noreferrer">Guidelines</a>
        </div>
      </header>

      <Editor />
      <AnalyzerPanel />
    </div>
  );
}
