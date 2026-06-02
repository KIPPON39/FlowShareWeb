'use client';

import { useEffect, useRef, useState } from 'react';
import { ShaderGradient as _ShaderGradient, ShaderGradientCanvas as _ShaderGradientCanvas } from '@shadergradient/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShaderGradient = _ShaderGradient as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShaderGradientCanvas = _ShaderGradientCanvas as any;

type ThemeMode = 'light' | 'dark';

type VantaInstance = {
  destroy: () => void;
};

type VantaNetOptions = {
  el: HTMLElement;
  mouseControls: boolean;
  touchControls: boolean;
  gyroControls: boolean;
  minHeight: number;
  minWidth: number;
  scale: number;
  scaleMobile: number;
  color: number;
  backgroundColor: number;
  points: number;
  maxDistance: number;
  spacing: number;
};

type VantaThemeOptions = Pick<VantaNetOptions, 'backgroundColor' | 'color' | 'points' | 'maxDistance' | 'spacing'> & {
  canvasOpacity: number;
};

declare global {
  interface Window {
    THREE?: unknown;
    VANTA?: {
      NET?: (options: VantaNetOptions) => VantaInstance;
    };
  }
}

const THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
const VANTA_SRC = 'https://cdn.jsdelivr.net/npm/vanta/dist/vanta.net.min.js';

const scriptCache = new Map<string, Promise<void>>();

const THEME_OPTIONS: Record<ThemeMode, VantaThemeOptions> = {
  light: {
    backgroundColor: 0xfafafa,
    color: 0xdb6b4d,
    points: 7,
    maxDistance: 14,
    spacing: 40,
    canvasOpacity: 0.26,
  },
  dark: {
    backgroundColor: 0x09090b,
    color: 0xf97316,
    points: 8,
    maxDistance: 16,
    spacing: 44,
    canvasOpacity: 0.2,
  },
};

const SHADER_OPTIONS = {
  light: {
    bgColor1: '#fdf8f6',
    bgColor2: '#fae3da',
    brightness: 1.15,
    color1: '#db6b4d',
    color2: '#efa691',
    color3: '#fff1e8',
    grain: 'off',
    uDensity: 1.1,
    uFrequency: 4.8,
    uSpeed: 0.12,
    uStrength: 2.5,
    rotationZ: 235,
  },
  dark: {
    bgColor1: '#09090b',
    bgColor2: '#111113',
    brightness: 0.96,
    color1: '#f97316',
    color2: '#d8621a',
    color3: '#0c0c10',
    grain: 'off',
    uDensity: 1.2,
    uFrequency: 0.12,
    uSpeed: 0.16,
    uStrength: 1.2,
    rotationZ: -60,
  },
} as const;

function loadScript(src: string) {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }

  const existing = scriptCache.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });

  scriptCache.set(src, promise);
  return promise;
}

function getTheme(): ThemeMode {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function HeroBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaInstanceRef = useRef<VantaInstance | null>(null);
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    setMounted(true);
    setTheme(getTheme());

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(getTheme());
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mounted || !vantaRef.current) return;

    let cancelled = false;

    const initVanta = async () => {
      await loadScript(THREE_SRC);
      await loadScript(VANTA_SRC);

      if (cancelled || !vantaRef.current || !window.VANTA?.NET) return;

      vantaInstanceRef.current?.destroy();
      vantaInstanceRef.current = window.VANTA.NET({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        ...THEME_OPTIONS[theme],
      });

      const canvas = vantaRef.current.querySelector('canvas');
      if (canvas) {
        canvas.style.opacity = String(THEME_OPTIONS[theme].canvasOpacity);
        canvas.style.transition = 'opacity 300ms ease';
      }
    };

    initVanta().catch((error) => {
      console.error('Failed to initialize VANTA background', error);
    });

    return () => {
      cancelled = true;
      vantaInstanceRef.current?.destroy();
      vantaInstanceRef.current = null;
    };
  }, [mounted, theme]);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[100vh] z-[-1] overflow-hidden"
      style={{
        maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
        background:
          'radial-gradient(circle at 20% 20%, rgba(167, 59, 36, 0.05), transparent 30%), radial-gradient(circle at 80% 30%, rgba(167, 59, 36, 0.03), transparent 28%), linear-gradient(to bottom, var(--surface) 0%, var(--bg) 100%)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none z-0 opacity-75 dark:opacity-60">
        {mounted && (
          <ShaderGradientCanvas
            lazyLoad={false}
            pixelDensity={theme === 'dark' ? 0.8 : 1}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <ShaderGradient
              animate="on"
              axesHelper="off"
              bgColor1={SHADER_OPTIONS[theme].bgColor1}
              bgColor2={SHADER_OPTIONS[theme].bgColor2}
              brightness={SHADER_OPTIONS[theme].brightness}
              cAzimuthAngle={180}
              cDistance={theme === 'dark' ? 2.8 : 3.9}
              cPolarAngle={theme === 'dark' ? 80 : 115}
              cameraZoom={theme === 'dark' ? 9.1 : 1}
              color1={SHADER_OPTIONS[theme].color1}
              color2={SHADER_OPTIONS[theme].color2}
              color3={SHADER_OPTIONS[theme].color3}
              destination="onCanvas"
              embedMode="off"
              envPreset="city"
              format="gif"
              fov={45}
              frameRate={theme === 'dark' ? 8 : 10}
              gizmoHelper="hide"
              grain={SHADER_OPTIONS[theme].grain}
              lightType="3d"
              pixelDensity={1}
              positionX={theme === 'dark' ? 0 : -0.3}
              positionY={theme === 'dark' ? 0 : 0.05}
              positionZ={0}
              range="disabled"
              rangeEnd={40}
              rangeStart={0}
              reflection={0.1}
              rotationX={theme === 'dark' ? 50 : 0}
              rotationY={0}
              rotationZ={SHADER_OPTIONS[theme].rotationZ}
              shader="defaults"
              type="waterPlane"
              uAmplitude={0}
              uDensity={SHADER_OPTIONS[theme].uDensity}
              uFrequency={SHADER_OPTIONS[theme].uFrequency}
              uSpeed={SHADER_OPTIONS[theme].uSpeed}
              uStrength={SHADER_OPTIONS[theme].uStrength}
              uTime={theme === 'dark' ? 8 : 0.35}
              wireframe={false}
            />
          </ShaderGradientCanvas>
        )}
      </div>

      <div ref={vantaRef} className="absolute inset-0 pointer-events-none z-10" />
    </div>
  );
}
