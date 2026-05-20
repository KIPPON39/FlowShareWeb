'use client';

import { useEffect, useState } from 'react';
import { ShaderGradient as _ShaderGradient, ShaderGradientCanvas as _ShaderGradientCanvas } from '@shadergradient/react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShaderGradient = _ShaderGradient as any;
const ShaderGradientCanvas = _ShaderGradientCanvas as any;

export function HeroBackground() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted || !theme) return null;

  return (
    <div
      className="absolute top-0 left-0 right-0 h-[100vh] z-[-1] pointer-events-none overflow-hidden"
      style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
    >
      {theme === 'dark' ? (
        <ShaderGradientCanvas
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <ShaderGradient
            animate="on"
            axesHelper="off"
            bgColor1="#000000"
            bgColor2="#000000"
            brightness={1}
            cAzimuthAngle={180}
            cDistance={2.8}
            cPolarAngle={80}
            cameraZoom={9.1}
            color1="#25110f"
            color2="#a73b24"
            color3="#000000"
            destination="onCanvas"
            embedMode="off"
            envPreset="city"
            format="gif"
            fov={45}
            frameRate={10}
            gizmoHelper="hide"
            grain="on"
            lightType="3d"
            pixelDensity={1}
            positionX={0}
            positionY={0}
            positionZ={0}
            range="disabled"
            rangeEnd={40}
            rangeStart={0}
            reflection={0.1}
            rotationX={50}
            rotationY={0}
            rotationZ={-60}
            shader="defaults"
            type="waterPlane"
            uAmplitude={0}
            uDensity={1.5}
            uFrequency={0}
            uSpeed={0.3}
            uStrength={1.5}
            uTime={8}
            wireframe={false}
          />
        </ShaderGradientCanvas>
      ) : (
        <>
          <ShaderGradientCanvas
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <ShaderGradient
              animate="on"
              axesHelper="on"
              bgColor1="#faf6f4"
              bgColor2="#faf6f4"
              brightness={1.2}
              cAzimuthAngle={180}
              cDistance={3.9}
              cPolarAngle={115}
              cameraZoom={1}
              color1="#c44a2d"
              color2="#f5e8e2"
              color3="#faf6f4"
              destination="onCanvas"
              embedMode="off"
              envPreset="city"
              format="gif"
              fov={45}
              frameRate={10}
              gizmoHelper="hide"
              grain="off"
              lightType="3d"
              pixelDensity={1}
              positionX={-0.5}
              positionY={0.1}
              positionZ={0}
              range="disabled"
              rangeEnd={40}
              rangeStart={0}
              reflection={0.1}
              rotationX={0}
              rotationY={0}
              rotationZ={235}
              shader="defaults"
              type="waterPlane"
              uAmplitude={0}
              uDensity={1.1}
              uFrequency={5.5}
              uSpeed={0.1}
              uStrength={1.2}
              uTime={0.2}
              wireframe={false}
            />
          </ShaderGradientCanvas>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(250, 246, 244, 0.55) 0%, transparent 100%)'
            }}
          />
        </>
      )}
    </div>
  );
}
