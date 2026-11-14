// ============================================================================
// CanvasFrogDemo.js — Remotion component menggunakan Canvas 2D per frame.
// TEST 1: Buktikan Canvas 2D bekerja deterministik dalam pipeline Remotion.
// ============================================================================

import { useVideoConfig, useCurrentFrame } from "remotion";
import { useRef, useEffect } from "react";
import { drawFrog } from "./FrogCanvas.js";

export const CanvasFrogDemo = () => {
  const { width = 1280, height = 720 } = useVideoConfig();
  const frame = useCurrentFrame() ?? 0;
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawFrog(ctx, frame, width, height);
  }, [frame, width, height]);

  return (
    <div
      style={{
        width,
        height,
        background: "#FDFBF0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
};

CanvasFrogDemo.defaultProps = {
  id: "CanvasFrogDemo",
  durationInFrames: 180, // 6 detik @ 30fps
  width: 1280,
  height: 720,
  fps: 30,
};