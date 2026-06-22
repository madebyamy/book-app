import React, { useState, useEffect, useRef } from 'react';
import { BRAND, FONT } from '../../constants.js';
import { FriendReading } from './FriendReading.jsx';
import { SharedBookshelf } from './SharedBookshelf.jsx';
import { SharedChat } from './SharedChat.jsx';

const AMBIENT_KEY = "bookbrain:ambient";

export function ReadingRoom({ user, friends, tooltips }) {
  const [ambientOn, setAmbientOn] = useState(() => {
    try { return localStorage.getItem(AMBIENT_KEY) !== "off"; } catch { return true; }
  });

  const canvasRef   = useRef(null);
  const rainRafRef  = useRef(null);
  const fireRafRef  = useRef(null);
  const fireGlowRef = useRef(null);
  const ember1Ref   = useRef(null);
  const ember2Ref   = useRef(null);
  // ── Rain canvas ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!ambientOn) {
      cancelAnimationFrame(rainRafRef.current);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const drops = Array.from({ length: 200 }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 2.8 + Math.random() * 5,
      len: 9 + Math.random() * 22,
      op: 0.05 + Math.random() * 0.22,
    }));

    const c = canvas.getContext('2d');
    function draw() {
      c.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach(d => {
        const x = d.x * canvas.width;
        const y = d.y * canvas.height;
        c.save();
        c.globalAlpha = d.op;
        c.strokeStyle = 'rgba(190,215,245,1)';
        c.lineWidth = 0.75;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x - 1.5, y + d.len);
        c.stroke();
        c.restore();
        d.y += d.speed / canvas.height;
        if (d.y > 1.04) { d.y = -0.05; d.x = Math.random(); }
      });
      rainRafRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(rainRafRef.current); window.removeEventListener('resize', resize); };
  }, [ambientOn]);

  // ── Fire glow + ember flicker (direct DOM, no re-renders) ─────────────────
  useEffect(() => {
    cancelAnimationFrame(fireRafRef.current);
    if (!ambientOn) {
      if (fireGlowRef.current) fireGlowRef.current.style.opacity = 0;
      if (ember1Ref.current)   ember1Ref.current.style.opacity = 0;
      if (ember2Ref.current)   ember2Ref.current.style.opacity = 0;
      return;
    }
    let t = 0;
    function tick() {
      t += 0.022;
      const base = 0.55 + Math.sin(t) * 0.12 + Math.sin(t * 2.6) * 0.07 + Math.sin(t * 0.7) * 0.09;
      if (fireGlowRef.current) {
        fireGlowRef.current.style.opacity = base;
        fireGlowRef.current.style.transform =
          `scaleX(${1 + Math.sin(t * 0.95) * 0.06}) scaleY(${1 + Math.sin(t * 1.2) * 0.1})`;
      }
      if (ember1Ref.current) {
        ember1Ref.current.style.opacity = 0.35 + Math.sin(t * 1.7 + 1) * 0.25;
        ember1Ref.current.style.transform =
          `translateX(${Math.sin(t * 0.8) * 18}px) translateY(${-Math.abs(Math.sin(t * 1.1)) * 24}px)`;
      }
      if (ember2Ref.current) {
        ember2Ref.current.style.opacity = 0.3 + Math.sin(t * 2.1 + 2.5) * 0.22;
        ember2Ref.current.style.transform =
          `translateX(${Math.sin(t * 1.3 + 1) * 24}px) translateY(${-Math.abs(Math.sin(t * 0.9 + 0.5)) * 30}px)`;
      }
      fireRafRef.current = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(fireRafRef.current);
  }, [ambientOn]);

  const toggle = () => {
    setAmbientOn(prev => {
      const next = !prev;
      try { localStorage.setItem(AMBIENT_KEY, next ? "on" : "off"); } catch {}
      return next;
    });
  };

  return (
    <section style={{ position: "relative", background: "#1A1008", overflow: "hidden", padding: "clamp(40px,6vw,64px) 0" }}>

      {/* Rain canvas */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} />

      {/* Fireplace glow — bottom-center warm pulse */}
      <div ref={fireGlowRef} style={{
        position: "absolute", bottom: "-10%", left: "50%", transform: "translateX(-50%)",
        width: "70%", height: "60%",
        background: "radial-gradient(ellipse at 50% 90%, rgba(255,110,20,0.55) 0%, rgba(200,60,5,0.3) 35%, rgba(140,30,0,0.1) 60%, transparent 80%)",
        pointerEvents: "none", zIndex: 2, opacity: 0, transition: "opacity .6s",
      }} />

      {/* Secondary cooler glow — ceiling reflection */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "60%", height: "30%",
        background: "radial-gradient(ellipse at 50% 0%, rgba(180,80,10,0.12) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* Ember sparks */}
      <div ref={ember1Ref} style={{ position: "absolute", bottom: "8%", left: "calc(50% - 20px)", width: 5, height: 5, borderRadius: "50%", background: "rgba(255,160,30,0.9)", boxShadow: "0 0 6px 2px rgba(255,120,10,0.6)", pointerEvents: "none", zIndex: 3, opacity: 0 }} />
      <div ref={ember2Ref} style={{ position: "absolute", bottom: "8%", left: "calc(50% + 16px)", width: 4, height: 4, borderRadius: "50%", background: "rgba(255,200,60,0.85)", boxShadow: "0 0 5px 2px rgba(255,150,20,0.5)", pointerEvents: "none", zIndex: 3, opacity: 0 }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 4, maxWidth: 1220, margin: "0 auto", padding: "0 30px" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: FONT.body, fontSize: 12.5, letterSpacing: "0.28em", textTransform: "uppercase", color: BRAND.tan }}>Reading Room</span>
            {ambientOn && (
              <span style={{ fontFamily: FONT.read, fontStyle: "italic", fontSize: 13, color: "rgba(217,162,130,.5)" }}>
                — fireplace & rain
              </span>
            )}
          </div>
          <button onClick={toggle} title={ambientOn ? "Turn off ambiance" : "Turn on ambiance"}
            style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: FONT.body, fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase", background: ambientOn ? "rgba(255,110,20,.15)" : "rgba(255,255,255,.06)", border: `1px solid ${ambientOn ? "rgba(255,110,20,.45)" : "rgba(251,246,232,.2)"}`, color: ambientOn ? "rgba(255,160,60,.9)" : "rgba(251,246,232,.45)", padding: "6px 13px", borderRadius: 2, cursor: "pointer", transition: "all .25s" }}>
            <span style={{ fontSize: 15 }}>{ambientOn ? "🔥" : "🌑"}</span>
            {ambientOn ? "Ambiance on" : "Ambiance off"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,280px),1fr))", gap: 16, marginBottom: 22 }}>
          <FriendReading friends={friends} tooltipText={tooltips?.friendReading} />
          <SharedBookshelf viewerId={user.id} friends={friends} tooltipText={tooltips?.sharedBooks} />
        </div>
        <SharedChat activeUser={user} friends={friends} tooltipText={tooltips?.chat} />
      </div>

      {/* Bottom vignette for depth */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(0deg, rgba(10,5,0,.6), transparent)", pointerEvents: "none", zIndex: 5 }} />
    </section>
  );
}
