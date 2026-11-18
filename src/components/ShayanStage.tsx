import React, { useEffect, useRef } from 'react';
import { OutfitConfig } from '../config/outfits';
import { ProcessedSprite } from '../utils/spriteProcessor';
import { VoiceState } from '../audio/voiceMimic';
import { SceneEffectType } from '../data/tutorLessons';

export type CharacterAction =
  | 'idle'
  | 'giggle'
  | 'surprised'
  | 'tickle'
  | 'hop'
  | 'eat'
  | 'dance'
  | 'sleep';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  text: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface SceneProp {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  size: number;
  kind: SceneEffectType;
  phase: number;
  life: number;
  maxLife: number;
  bounces: number;
}

export interface SceneEffectTrigger {
  type: SceneEffectType;
  emoji: string;
  trigger: number;
}

interface ShayanStageProps {
  outfit: OutfitConfig;
  sprite: ProcessedSprite | null;
  voiceState: VoiceState;
  mouthLevelRef: React.MutableRefObject<number>;
  action: CharacterAction;
  actionTrigger: number;
  snackEmoji: string;
  isSleeping: boolean;
  compact?: boolean;
  sceneEffect: SceneEffectTrigger | null;
  onCatchProp?: () => void;
  onHitZone: (zone: 'head' | 'cheek' | 'belly' | 'feet') => void;
}

export const ShayanStage: React.FC<ShayanStageProps> = ({
  outfit,
  sprite,
  voiceState,
  mouthLevelRef,
  action,
  actionTrigger,
  snackEmoji,
  isSleeping,
  compact = false,
  sceneEffect,
  onCatchProp,
  onHitZone,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const scenePropsRef = useRef<SceneProp[]>([]);
  const propIdRef = useRef(1);
  const charRectRef = useRef<{ x: number; y: number; w: number; h: number }>({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  // Animation state refs for 60fps loop without React re-renders
  const animRef = useRef({
    blinkProgress: 0,
    isBlinking: false,
    nextBlinkTime: performance.now() + 2600,
    actionStart: 0,
    smoothMouth: 0,
    smoothHeadRot: 0,
    smoothHeadY: 0,
    smoothBodyRot: 0,
    snoreTimer: 0,
  });

  // Load background once
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/playroom_bg.jpg';
    img.onload = () => {
      bgRef.current = img;
    };
  }, []);

  // Spawn interactive scene props when a lesson is triggered
  useEffect(() => {
    if (!sceneEffect || sceneEffect.trigger === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    const { type, emoji } = sceneEffect;

    const addProp = (p: Omit<SceneProp, 'id' | 'life'>) => {
      scenePropsRef.current.push({
        ...p,
        id: propIdRef.current++,
        life: 0,
      });
    };

    if (type === 'slither') {
      // e.g. Ojogor python slithering across the rug!
      addProp({
        x: -60,
        y: ch * 0.86,
        vx: Math.max(2.6, cw * 0.0042),
        vy: 0,
        emoji,
        size: 56,
        kind: 'slither',
        phase: 0,
        maxLife: 340,
        bounces: 0,
      });
    } else if (type === 'hop') {
      addProp({
        x: -50,
        y: ch * 0.85,
        vx: Math.max(2.8, cw * 0.0045),
        vy: -7.5,
        emoji,
        size: 52,
        kind: 'hop',
        phase: 0,
        maxLife: 320,
        bounces: 0,
      });
    } else if (type === 'swim' || type === 'sail') {
      const count = type === 'swim' ? 3 : 1;
      for (let i = 0; i < count; i++) {
        addProp({
          x: -60 - i * 110,
          y: ch * (0.8 + i * 0.03),
          vx: Math.max(2.2, cw * 0.0036) + i * 0.3,
          vy: 0,
          emoji,
          size: type === 'sail' ? 62 : 46,
          kind: type,
          phase: i * 1.4,
          maxLife: 360,
          bounces: 0,
        });
      }
    } else if (type === 'fly') {
      for (let i = 0; i < 2; i++) {
        addProp({
          x: -50 - i * 120,
          y: ch * (0.2 + i * 0.1),
          vx: Math.max(3.0, cw * 0.0048),
          vy: 0,
          emoji,
          size: 48,
          kind: 'fly',
          phase: i * 1.5,
          maxLife: 300,
          bounces: 0,
        });
      }
    } else if (type === 'rain') {
      // Mangoes / apples / flowers raining from the sky!
      for (let i = 0; i < 9; i++) {
        addProp({
          x: cw * (0.1 + Math.random() * 0.8),
          y: -40 - i * 45 - Math.random() * 40,
          vx: (Math.random() - 0.5) * 1.1,
          vy: 2.8 + Math.random() * 1.8,
          emoji,
          size: 42 + Math.random() * 10,
          kind: 'rain',
          phase: Math.random() * Math.PI * 2,
          maxLife: 290,
          bounces: 0,
        });
      }
    } else if (type === 'bounce') {
      for (let i = 0; i < 4; i++) {
        addProp({
          x: cw * (0.18 + i * 0.2),
          y: -30 - i * 40,
          vx: (Math.random() - 0.5) * 2.8,
          vy: 2 + Math.random() * 2,
          emoji,
          size: 46,
          kind: 'bounce',
          phase: i,
          maxLife: 280,
          bounces: 0,
        });
      }
    } else {
      // sparkle / burst
      for (let i = 0; i < 8; i++) {
        addProp({
          x: cw * (0.15 + Math.random() * 0.7),
          y: ch * (0.18 + Math.random() * 0.45),
          vx: (Math.random() - 0.5) * 1.4,
          vy: -0.7 - Math.random() * 0.9,
          emoji,
          size: 40 + Math.random() * 12,
          kind: 'sparkle',
          phase: Math.random() * Math.PI * 2,
          maxLife: 200,
          bounces: 0,
        });
      }
    }
  }, [sceneEffect]);

  // Spawn particles when an action triggers
  useEffect(() => {
    if (actionTrigger === 0) return;
    animRef.current.actionStart = performance.now();
    const rect = charRectRef.current;
    if (rect.w === 0) return;

    const cx = rect.x + rect.w * 0.5;
    const headY = rect.y + rect.h * 0.16;
    const bellyY = rect.y + rect.h * 0.42;

    const spawn = (
      x: number,
      y: number,
      emojis: string[],
      count: number,
      speed = 2.2
    ) => {
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
        const spd = speed * (0.7 + Math.random() * 0.8);
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - 0.8,
          text: emojis[Math.floor(Math.random() * emojis.length)],
          size: 24 + Math.random() * 14,
          alpha: 1,
          life: 0,
          maxLife: 55 + Math.random() * 25,
        });
      }
    };

    if (action === 'giggle') {
      spawn(cx, rect.y - 10, ['⭐', '✨', '😄'], 6, 2.2);
    } else if (action === 'surprised') {
      spawn(cx + rect.w * 0.25, headY - 10, ['😮', '✨'], 4, 2.0);
    } else if (action === 'tickle') {
      spawn(cx, bellyY, ['😂', '❤️', '✨'], 7, 2.6);
    } else if (action === 'hop') {
      spawn(cx, rect.y + rect.h * 0.9, ['💫', '⚡', '🌟'], 6, 2.4);
    } else if (action === 'eat') {
      spawn(cx - rect.w * 0.28, headY, [snackEmoji, '😋', '✨'], 5, 2.0);
    }
  }, [action, actionTrigger, snackEmoji]);

  // Main 60fps render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const maxDpr = w < 600 ? 1.5 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (now: number) => {
      rafId = requestAnimationFrame(render);
      resize();

      const maxDpr = canvas.clientWidth < 600 ? 1.5 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cw, ch);

      // 1. Draw Playroom Background (cover)
      const bg = bgRef.current;
      if (bg && bg.complete && bg.naturalWidth > 0) {
        const bgRatio = bg.naturalWidth / bg.naturalHeight;
        const viewRatio = cw / ch;
        let dw = cw;
        let dh = ch;
        let dx = 0;
        let dy = 0;
        if (viewRatio > bgRatio) {
          dh = cw / bgRatio;
          dy = (ch - dh) * 0.55;
        } else {
          dw = ch * bgRatio;
          dx = (cw - dw) * 0.5;
        }
        ctx.drawImage(bg, dx, dy, dw, dh);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 0, ch);
        grad.addColorStop(0, '#bfe6ff');
        grad.addColorStop(1, '#f8e6c8');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, cw, ch);
      }

      // 2. Night / Sleep overlay on background
      if (isSleeping) {
        ctx.fillStyle = 'rgba(12, 18, 48, 0.55)';
        ctx.fillRect(0, 0, cw, ch);
      }

      // 3. Draw Shayan
      if (sprite) {
        const t = now / 1000;
        const actionElapsed = (now - animRef.current.actionStart) / 1000;

        // Adaptive character framing for portrait phones, tutor split-screen, and desktops
        const isCompactPortrait = cw < 560 && ch > cw;
        const targetH = compact
          ? Math.min(ch * 0.54, cw * 0.85)
          : isCompactPortrait
            ? Math.min(ch * 0.65, cw * 1.45)
            : Math.min(ch * 0.78, cw * 1.2);
        const aspect = sprite.width / sprite.height;
        const baseW = targetH * aspect;
        const baseH = targetH;

        const baseX = (cw - baseW) * 0.5;
        const floorLine = compact
          ? ch * 0.90
          : isCompactPortrait
            ? ch * 0.84
            : ch * 0.89;
        const baseY = floorLine - baseH;

        // Procedural motion targets (feet stay planted; head & body move independently)
        let targetBodyScaleX = 1 + Math.sin(t * 2.1) * 0.004;
        let targetBodyScaleY = 1 - Math.sin(t * 2.1) * 0.005;
        let offsetY = 0;
        let offsetX = 0;
        let targetBodyRot = Math.sin(t * 0.9) * 0.004;
        let targetHeadRot = Math.sin(t * 1.3 + 0.5) * 0.014;
        let targetHeadY = Math.sin(t * 2.1 - 0.4) * 1.6;

        const mLvl = animRef.current.smoothMouth;
        if (mLvl > 0.05) {
          // Natural conversational head nod & slight tilt while speaking
          targetHeadRot += Math.sin(t * 6.8) * 0.024 * mLvl;
          targetHeadY -= mLvl * 2.2;
        }

        if (voiceState === 'listening') {
          targetHeadRot = -0.075; // Curious head tilt at neck
          targetHeadY -= 2;
          targetBodyScaleX = 1.015;
          targetBodyScaleY = 1.015;
        } else if (action === 'dance') {
          const beat = t * 9.5;
          offsetX = Math.sin(beat * 0.5) * 14;
          offsetY = -Math.abs(Math.sin(beat)) * 16;
          targetBodyRot = Math.sin(beat * 0.5) * 0.045;
          targetHeadRot = -Math.sin(beat * 0.5) * 0.06;
          targetBodyScaleY = 1 + Math.sin(beat * 2) * 0.025;
          targetBodyScaleX = 1 - Math.sin(beat * 2) * 0.02;

          if (Math.random() < 0.06) {
            particlesRef.current.push({
              x: cw * 0.5 + (Math.random() - 0.5) * baseW * 0.8,
              y: baseY + baseH * 0.15,
              vx: (Math.random() - 0.5) * 1.4,
              vy: -1.6 - Math.random() * 1.2,
              text: Math.random() > 0.5 ? '🎵' : '🎶',
              size: 26,
              alpha: 1,
              life: 0,
              maxLife: 60,
            });
          }
        } else if (action === 'hop' && actionElapsed < 0.65) {
          const p = actionElapsed / 0.65;
          offsetY = -Math.sin(p * Math.PI) * 56;
          targetBodyScaleY = 1 + Math.sin(p * Math.PI) * 0.045;
          targetBodyScaleX = 1 - Math.sin(p * Math.PI) * 0.035;
        } else if (action === 'tickle' && actionElapsed < 1.2) {
          const w = Math.sin(actionElapsed * 26);
          targetBodyRot = w * 0.028;
          targetHeadRot = -w * 0.055;
          targetBodyScaleX = 1 + Math.abs(w) * 0.035;
          targetBodyScaleY = 1 - Math.abs(w) * 0.03;
        } else if (action === 'giggle' && actionElapsed < 0.9) {
          targetHeadRot = Math.sin(actionElapsed * 20) * 0.065;
          targetHeadY = -Math.abs(Math.sin(actionElapsed * 14)) * 4;
        } else if (action === 'surprised' && actionElapsed < 0.8) {
          const p = Math.sin((actionElapsed / 0.8) * Math.PI);
          targetBodyScaleX = 1 + p * 0.03;
          targetBodyScaleY = 1 + p * 0.03;
          targetHeadY = -p * 4;
        } else if (isSleeping) {
          targetHeadY = Math.sin(t * 1.3) * 2.5 + 3;
          targetHeadRot = 0.065; // Sleepy head droop
          if (now - animRef.current.snoreTimer > 1800) {
            animRef.current.snoreTimer = now;
            particlesRef.current.push({
              x: cw * 0.5 + baseW * 0.16,
              y: baseY + baseH * 0.12,
              vx: 0.6,
              vy: -1.1,
              text: '💤',
              size: 24,
              alpha: 1,
              life: 0,
              maxLife: 80,
            });
          }
        }

        // Smoothly lerp head & body transforms so transitions never snap
        animRef.current.smoothHeadRot += (targetHeadRot - animRef.current.smoothHeadRot) * 0.16;
        animRef.current.smoothHeadY += (targetHeadY - animRef.current.smoothHeadY) * 0.18;
        animRef.current.smoothBodyRot += (targetBodyRot - animRef.current.smoothBodyRot) * 0.16;

        const scaleX = targetBodyScaleX;
        const scaleY = targetBodyScaleY;
        const rotation = animRef.current.smoothBodyRot;
        const headRot = animRef.current.smoothHeadRot;
        const headY = animRef.current.smoothHeadY;

        // Soft floor shadow on rug
        const shadowScale = Math.max(0.65, 1 + offsetY / 160);
        ctx.save();
        ctx.fillStyle = isSleeping ? 'rgba(0,0,0,0.42)' : 'rgba(20, 15, 10, 0.24)';
        ctx.beginPath();
        ctx.ellipse(
          cw * 0.5 + offsetX,
          floorLine + 4,
          baseW * 0.28 * shadowScale,
          14 * shadowScale,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();

        // Update hitbox rect
        charRectRef.current = {
          x: baseX + offsetX,
          y: baseY + offsetY,
          w: baseW,
          h: baseH,
        };

        // Draw transformed Shayan sprite
        const pivotX = cw * 0.5 + offsetX;
        const pivotY = baseY + baseH + offsetY;

        ctx.save();
        ctx.translate(pivotX, pivotY);
        ctx.rotate(rotation);
        ctx.scale(scaleX, scaleY);
        ctx.translate(-baseW * 0.5, -baseH);

        // Neck split line (above collar) so head tilts/nods independently of planted body
        const neckRatio = outfit.id === 'beanie' ? 0.215 : 0.195;
        const neckY = baseH * neckRatio;
        const neckSrcY = sprite.height * neckRatio;

        // 1. Draw Lower Body (collar down to sneakers)
        ctx.drawImage(
          sprite.canvas,
          0,
          neckSrcY - 2,
          sprite.width,
          sprite.height - neckSrcY + 2,
          0,
          neckY - 2,
          baseW,
          baseH - neckY + 2
        );

        // 2. Draw Head & Face pivoted from the neck
        ctx.save();
        ctx.translate(baseW * 0.5, neckY + headY);
        ctx.rotate(headRot);
        ctx.translate(-baseW * 0.5, -neckY);

        ctx.drawImage(
          sprite.canvas,
          0,
          0,
          sprite.width,
          neckSrcY + 4,
          0,
          0,
          baseW,
          neckY + 4
        );

        // --- Facial Animations Overlay (Preserving Shayan's Exact Face) ---
        const lm = outfit.landmarks;

        // A. Subtle Natural Eyebrow Lift when Listening, Surprised, or Emphasizing Speech
        const mOpenNow = animRef.current.smoothMouth;
        let targetBrowLift = 0;
        if (voiceState === 'listening') {
          targetBrowLift = baseH * 0.004;
        } else if (action === 'surprised' && actionElapsed < 0.8) {
          targetBrowLift = baseH * 0.006 * Math.sin((actionElapsed / 0.8) * Math.PI);
        } else if (mOpenNow > 0.35) {
          targetBrowLift = baseH * 0.0028 * mOpenNow;
        }

        if (targetBrowLift > 0.4) {
          const drawBrowLift = (eyeXNorm: number, eyeYNorm: number) => {
            const bw = baseW * 0.095;
            const bh = baseH * 0.018;
            const sx = (eyeXNorm - 0.0475) * sprite.width;
            const sy = (eyeYNorm - 0.025) * sprite.height;
            const sw = 0.095 * sprite.width;
            const sh = 0.018 * sprite.height;
            const dx = eyeXNorm * baseW - bw * 0.5;
            const dy = (eyeYNorm - 0.025) * baseH - targetBrowLift;
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(eyeXNorm * baseW, dy + bh * 0.5, bw * 0.48, bh * 0.5, 0, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(sprite.canvas, sx, sy, sw, sh, dx, dy, bw, bh);
            ctx.restore();
          };
          drawBrowLift(lm.leftEye.x, lm.leftEye.y);
          drawBrowLift(lm.rightEye.x, lm.rightEye.y);
        }

        // B. Happy Eye Squint (Duchenne Smile) when Giggling / Tickled
        if (
          (action === 'giggle' && actionElapsed < 0.9) ||
          (action === 'tickle' && actionElapsed < 1.2)
        ) {
          const squintLift = baseH * 0.0045;
          const drawCheekSquint = (eyeXNorm: number, eyeYNorm: number) => {
            const cw2 = baseW * 0.085;
            const ch2 = baseH * 0.014;
            const sx = (eyeXNorm - 0.0425) * sprite.width;
            const sy = (eyeYNorm + 0.008) * sprite.height;
            const sw = 0.085 * sprite.width;
            const sh = 0.014 * sprite.height;
            const dx = eyeXNorm * baseW - cw2 * 0.5;
            const dy = (eyeYNorm + 0.008) * baseH - squintLift;
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(eyeXNorm * baseW, dy + ch2 * 0.5, cw2 * 0.46, ch2 * 0.48, 0, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(sprite.canvas, sx, sy, sw, sh, dx, dy, cw2, ch2);
            ctx.restore();
          };
          drawCheekSquint(lm.leftEye.x, lm.leftEye.y);
          drawCheekSquint(lm.rightEye.x, lm.rightEye.y);
        }

        // C. Blinking / Sleeping Eyelids (3D-shaded skin gradient)
        if (!isSleeping) {
          if (!animRef.current.isBlinking && now >= animRef.current.nextBlinkTime) {
            animRef.current.isBlinking = true;
            animRef.current.blinkProgress = 0;
          }
          if (animRef.current.isBlinking) {
            animRef.current.blinkProgress += 0.18;
            if (animRef.current.blinkProgress >= Math.PI) {
              animRef.current.isBlinking = false;
              animRef.current.blinkProgress = 0;
              animRef.current.nextBlinkTime = now + 2600 + Math.random() * 2400;
            }
          }
        }

        const blinkAmt = isSleeping
          ? 1
          : animRef.current.isBlinking
            ? Math.sin(animRef.current.blinkProgress)
            : 0;

        if (blinkAmt > 0.05) {
          const drawEyelid = (eyeX: number, eyeY: number) => {
            const rx = baseW * lm.eyeRadiusX;
            const ry = baseH * lm.eyeRadiusY;
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(eyeX, eyeY, rx, ry, 0, 0, Math.PI * 2);
            ctx.clip();

            const lidH = ry * 2 * blinkAmt;
            const lidGrad = ctx.createLinearGradient(0, eyeY - ry, 0, eyeY - ry + lidH);
            lidGrad.addColorStop(0, 'rgba(135, 92, 68, 0.92)');
            lidGrad.addColorStop(0.55, sprite.skinColor);
            lidGrad.addColorStop(1, sprite.skinColor);
            ctx.fillStyle = lidGrad;
            ctx.fillRect(eyeX - rx - 2, eyeY - ry - 2, rx * 2 + 4, lidH + 2);

            ctx.strokeStyle = 'rgba(35, 22, 16, 0.72)';
            ctx.lineWidth = Math.max(1.3, baseW * 0.0045);
            ctx.beginPath();
            ctx.moveTo(eyeX - rx * 0.85, eyeY - ry + lidH);
            ctx.quadraticCurveTo(
              eyeX,
              eyeY - ry + lidH + ry * 0.32,
              eyeX + rx * 0.85,
              eyeY - ry + lidH
            );
            ctx.stroke();
            ctx.restore();
          };

          drawEyelid(baseW * lm.leftEye.x, baseH * lm.leftEye.y);
          drawEyelid(baseW * lm.rightEye.x, baseH * lm.rightEye.y);
        }

        // D. Ultra-soft Cheek Blush on Tickle (radial gradient, no hard circle)
        if (action === 'tickle' && actionElapsed < 1.2) {
          const drawSoftBlush = (bx: number, by: number) => {
            const r = baseW * 0.055;
            const g = ctx.createRadialGradient(bx, by, 0, bx, by, r);
            g.addColorStop(0, 'rgba(255, 115, 130, 0.22)');
            g.addColorStop(1, 'rgba(255, 115, 130, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(bx, by, r, 0, Math.PI * 2);
            ctx.fill();
          };
          drawSoftBlush(baseW * (lm.leftEye.x - 0.01), baseH * (lm.mouth.y - 0.012));
          drawSoftBlush(baseW * (lm.rightEye.x + 0.01), baseH * (lm.mouth.y - 0.012));
        }

        // E. Super-Natural Photographic Lip-Sync (preserves Shayan's real upper teeth & lips)
        let targetMouth = mouthLevelRef.current;
        if (action === 'eat' && actionElapsed < 1.1) {
          targetMouth = Math.abs(Math.sin(actionElapsed * 14)) * 0.72;
        } else if (action === 'tickle' && actionElapsed < 1.1) {
          targetMouth = 0.35 + Math.abs(Math.sin(actionElapsed * 18)) * 0.4;
        } else if (action === 'surprised' && actionElapsed < 0.7) {
          targetMouth = 0.65;
        }

        animRef.current.smoothMouth += (targetMouth - animRef.current.smoothMouth) * 0.38;
        const mOpen = animRef.current.smoothMouth;

        if (mOpen > 0.03) {
          const mx = baseW * lm.mouth.x;
          const my = baseH * lm.mouth.y;
          // Viseme width variation (slightly narrower on rounded sounds, wider on open vowels)
          const visemeShape = 0.9 + 0.14 * Math.sin(t * 11.5);
          const mw = baseW * lm.mouthWidth * (action === 'surprised' ? 0.48 : 0.74 * visemeShape);
          const mh = baseH * lm.mouthHeight * (0.16 + mOpen * 0.78);
          const jawDrop = mh * 0.48;

          // 1. Softly feathered natural shadow in the opened mouth gap (NO fake cartoon teeth/tongue!)
          ctx.save();
          const gapCenterY = my + jawDrop * 0.45;
          const mouthGrad = ctx.createRadialGradient(
            mx,
            gapCenterY,
            mw * 0.04,
            mx,
            gapCenterY,
            mw * 0.46
          );
          mouthGrad.addColorStop(0, 'rgba(62, 18, 22, 0.88)');
          mouthGrad.addColorStop(0.55, 'rgba(105, 36, 40, 0.65)');
          mouthGrad.addColorStop(1, 'rgba(150, 72, 70, 0)');
          ctx.fillStyle = mouthGrad;
          ctx.beginPath();
          ctx.ellipse(mx, gapCenterY, mw * 0.46, mh * 0.48, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 2. 12-strip seamless photographic lower-lip & chin stretch
          const strips = 12;
          const regionNormH = 0.044;
          const regionNormW = lm.mouthWidth * 1.15;
          const regionSrcX = Math.max(0, (lm.mouth.x - regionNormW * 0.5) * sprite.width);
          const regionDstX = (lm.mouth.x - regionNormW * 0.5) * baseW;
          const regionSrcW = Math.min(sprite.width - regionSrcX, regionNormW * sprite.width);
          const regionDstW = regionNormW * baseW;

          for (let s = 0; s < strips; s++) {
            const p0 = s / strips;
            const p1 = (s + 1) / strips;
            const sy = (lm.mouth.y + 0.002 + p0 * regionNormH) * sprite.height;
            const sh = (regionNormH / strips) * sprite.height;
            const disp = jawDrop * 0.72 * Math.sin((1 - p0) * Math.PI * 0.5);
            const dy = my + 0.002 * baseH + p0 * regionNormH * baseH + disp;
            const dh = (p1 - p0) * regionNormH * baseH + 0.75;
            ctx.drawImage(sprite.canvas, regionSrcX, sy, regionSrcW, sh, regionDstX, dy, regionDstW, dh);
          }
        }

        ctx.restore(); // end head pivot
        ctx.restore(); // end body pivot
      }

      // 4. Update & Draw Interactive Scene Props (Living Storybook World)
      const props = scenePropsRef.current;
      const floorY = ch * 0.88;
      for (let i = props.length - 1; i >= 0; i--) {
        const pr = props[i];
        pr.life++;
        pr.phase += 0.08;

        if (pr.kind === 'slither') {
          pr.x += pr.vx;
          pr.y = ch * 0.86 + Math.sin(pr.phase * 1.8) * 6;
        } else if (pr.kind === 'hop') {
          pr.x += pr.vx;
          pr.vy += 0.42;
          pr.y += pr.vy;
          if (pr.y >= floorY) {
            pr.y = floorY;
            pr.vy = -8.2;
          }
        } else if (pr.kind === 'swim' || pr.kind === 'sail') {
          pr.x += pr.vx;
          pr.y += Math.sin(pr.phase * 1.2) * 0.65;
        } else if (pr.kind === 'fly') {
          pr.x += pr.vx;
          pr.y += Math.sin(pr.phase * 1.4) * 1.4;
        } else if (pr.kind === 'rain') {
          pr.x += pr.vx + Math.sin(pr.phase * 0.7) * 0.4;
          pr.vy += 0.12;
          pr.y += pr.vy;
          if (pr.y >= floorY) {
            pr.y = floorY;
            if (pr.bounces < 2) {
              pr.vy = -pr.vy * 0.45;
              pr.bounces++;
            } else {
              pr.vy = 0;
              pr.vx *= 0.92;
            }
          }
        } else if (pr.kind === 'bounce') {
          pr.x += pr.vx;
          pr.vy += 0.38;
          pr.y += pr.vy;
          if (pr.y >= floorY) {
            pr.y = floorY;
            pr.vy = -Math.max(4.5, Math.abs(pr.vy) * 0.76);
            pr.bounces++;
          }
          if (pr.x < 30 || pr.x > cw - 30) pr.vx *= -1;
        } else {
          pr.x += pr.vx;
          pr.y += pr.vy;
        }

        const fadeOut = pr.life > pr.maxLife - 30 ? (pr.maxLife - pr.life) / 30 : 1;
        const alpha = Math.max(0, Math.min(1, fadeOut));

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `${pr.size}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Flip horizontal animals/boats facing right if needed
        if (pr.kind === 'slither' || pr.kind === 'hop' || pr.kind === 'swim') {
          ctx.translate(pr.x, pr.y);
          ctx.scale(-1, 1);
          if (pr.kind === 'slither') {
            ctx.rotate(Math.sin(pr.phase * 2) * 0.08);
          }
          ctx.fillText(pr.emoji, 0, 0);
        } else {
          ctx.fillText(pr.emoji, pr.x, pr.y);
        }
        ctx.restore();

        if (pr.life >= pr.maxLife || pr.x > cw + 100) {
          props.splice(i, 1);
        }
      }

      // 5. Update & Draw Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.font = `${p.size}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.text, p.x, p.y);
        ctx.restore();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      ctx.restore();
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, [outfit, sprite, voiceState, mouthLevelRef, action, isSleeping, compact]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const px = e.clientX - bounds.left;
    const py = e.clientY - bounds.top;

    // Check if child tapped an animated scene prop (mango, snake, ball, etc.)
    const props = scenePropsRef.current;
    for (let i = props.length - 1; i >= 0; i--) {
      const pr = props[i];
      const dx = px - pr.x;
      const dy = py - pr.y;
      if (dx * dx + dy * dy <= 42 * 42) {
        props.splice(i, 1);
        for (let k = 0; k < 5; k++) {
          const ang = (Math.PI * 2 * k) / 5;
          particlesRef.current.push({
            x: pr.x,
            y: pr.y,
            vx: Math.cos(ang) * 2.2,
            vy: Math.sin(ang) * 2.2 - 1,
            text: k % 2 === 0 ? '⭐' : '✨',
            size: 24,
            alpha: 1,
            life: 0,
            maxLife: 45,
          });
        }
        onCatchProp?.();
        return;
      }
    }

    const r = charRectRef.current;
    if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) {
      return;
    }

    const relY = (py - r.y) / r.h;
    if (relY < 0.12) {
      onHitZone('head');
    } else if (relY < 0.25) {
      onHitZone('cheek');
    } else if (relY < 0.58) {
      onHitZone('belly');
    } else {
      onHitZone('feet');
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      className="stage-canvas"
      aria-label="Interactive Talking Shayan Character"
    />
  );
};
