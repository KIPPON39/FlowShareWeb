'use client';

import { useEffect, useState } from 'react';
import { ShaderGradient as _ShaderGradient, ShaderGradientCanvas as _ShaderGradientCanvas } from '@shadergradient/react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShaderGradient = _ShaderGradient as any;
const ShaderGradientCanvas = _ShaderGradientCanvas as any;

export function LightHeroBackground() {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLight(document.documentElement.getAttribute('data-theme') !== 'dark');

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setIsLight(document.documentElement.getAttribute('data-theme') !== 'dark');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-700 overflow-hidden ${isLight ? 'opacity-100' : 'opacity-0'}`}
      style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}
    >
      {isLight && (
        <ShaderGradientCanvas
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <ShaderGradient
            animate="on"
            axesHelper="on"
            bgColor1="#faf6f4"
            bgColor2="#faf6f4"
            brightness={1.0}
            cAzimuthAngle={180}
            cDistance={3.9}
            cPolarAngle={115}
            cameraZoom={1}
            color1="#a73b24"
            color2="#f5c4b3"
            color3="#fceee9"
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
            uStrength={2.4}
            uTime={0.2}
            wireframe={false}
          />
        </ShaderGradientCanvas>
      )}
    </div>
  );
}
