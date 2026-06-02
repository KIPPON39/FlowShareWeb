'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

const IDLE_FRAMES = [1, 2, 3];
const CLICK_FRAMES = [4, 5, 6, 7, 8, 9, 10];

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(1);
  const idleFrameIndexRef = useRef(0);
  const idleDirectionRef = useRef<1 | -1>(1);
  const clickFrameIndexRef = useRef(0);

  // Toggle visibility based on scroll depth
  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Frame Animation Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isClicked) {
      // Idle animation: 1 -> 2 -> 3 -> 2 -> 1
      interval = setInterval(() => {
        idleFrameIndexRef.current += idleDirectionRef.current;

        if (idleFrameIndexRef.current >= IDLE_FRAMES.length - 1) {
          idleFrameIndexRef.current = IDLE_FRAMES.length - 1;
          idleDirectionRef.current = -1;
        } else if (idleFrameIndexRef.current <= 0) {
          idleFrameIndexRef.current = 0;
          idleDirectionRef.current = 1;
        }

        setCurrentFrame(IDLE_FRAMES[idleFrameIndexRef.current]);
      }, 1200);
    } else {
      // Click animation
      interval = setInterval(() => {
        clickFrameIndexRef.current = Math.min(clickFrameIndexRef.current + 1, CLICK_FRAMES.length - 1);
        setCurrentFrame(CLICK_FRAMES[clickFrameIndexRef.current]);
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isClicked]);

  const scrollToTop = () => {
    if (isClicked) return;
    setIsClicked(true);
    clickFrameIndexRef.current = 0;
    setCurrentFrame(4); // Reset to start of click animation

    // Shake the screen
    document.body.classList.add('shake-screen');

    // Smooth scroll to top after the shake effect
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      // Wait for scrolling to finish and rocket to fly off, then reset
      setTimeout(() => {
        setIsClicked(false);
        idleFrameIndexRef.current = 0;
        idleDirectionRef.current = 1;
        clickFrameIndexRef.current = 0;
        setCurrentFrame(1);
        document.body.classList.remove('shake-screen');
      }, 2500); // give it time to fly out
    }, 500); // increased delay to let the shake finish before scrolling and flying
  };

  return (
    <div
      className={`fixed z-[100] transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 translate-y-10 pointer-events-none'
        } ${isClicked ? 'stt-fly-up' : ''}`}
      style={{ bottom: '2rem', right: '2rem' }}
    >
      <button
        onClick={scrollToTop}
        className="relative flex justify-center items-center overflow-hidden hover:scale-105 active:scale-95 transition-transform"
        style={{ width: '80px', height: '80px', borderRadius: '16px' }}
        aria-label="Scroll to top"
      >
        {Array.from({ length: 10 }, (_, i) => i + 1).map((frame) => (
          <Image
            key={frame}
            src={`/rocket_frames/${frame}.svg`}
            alt={`Scroll up rocket frame ${frame}`}
            fill
            className={`object-contain ${currentFrame === frame ? 'opacity-100' : 'opacity-0'}`}
            unoptimized
          />
        ))}
      </button>
    </div>
  );
}
