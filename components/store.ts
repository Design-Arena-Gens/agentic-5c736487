"use client";

import { create } from "zustand";
import { fabric } from "fabric";

// Tiny state container to share canvas and settings
export const useEditorStore = create<{
  canvas: fabric.Canvas | null;
  brandColor: string;
  setCanvas: (c: fabric.Canvas) => void;
  setBrandColor: (c: string) => void;
}>(
  (set) => ({
    canvas: null,
    brandColor: "#ef4444",
    setCanvas: (c) => set({ canvas: c }),
    setBrandColor: (c) => set({ brandColor: c })
  })
);
