// src/hooks/useGoogleButtonMetrics.ts
//
// Measures the container width and detects the rendered border radius of
// Google's <GoogleLogin> button (it renders inside a cross-origin iframe,
// so we can't just style it directly). This effect was previously
// duplicated, byte-for-byte, in both LoginForm.tsx and SignupForm.tsx.
//
// Usage:
//   const { containerRef, buttonWidth, borderRadius } = useGoogleButtonMetrics();
//   <div ref={containerRef}><GoogleLogin width={buttonWidth} .../></div>
//   <Button style={{ borderRadius }}>...</Button>
//
// `initialBorderRadius` sets the value used before the effect below has had
// a chance to measure the real one (LoginForm and SignupForm each use a
// different starting value for their submit button).

import { useEffect, useRef, useState } from "react";

export function useGoogleButtonMetrics(initialBorderRadius: string = "16px") {
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState<number>(300);
  const [borderRadius, setBorderRadius] = useState<string>(initialBorderRadius);

  // Measure parent div width and Google button border radius
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setButtonWidth(width);

        // Get border radius from Google button iframe
        const googleButton = containerRef.current.querySelector('iframe');
        if (googleButton) {
          const computedStyle = window.getComputedStyle(googleButton);
          const radius = computedStyle.borderRadius;

          // Google Sign-In button typically uses 3px or 4px border radius
          if (radius && radius !== '0px') {
            setBorderRadius(radius);
          } else {
            // Fallback to Google's standard border radius
            setBorderRadius('3px');
          }
        }
      }
    };

    // Multiple attempts to get the border radius as Google button loads
    const timer1 = setTimeout(updateDimensions, 100);
    const timer2 = setTimeout(updateDimensions, 300);
    const timer3 = setTimeout(updateDimensions, 500);
    const timer4 = setTimeout(updateDimensions, 1000);

    window.addEventListener('resize', updateDimensions);

    // Use MutationObserver to detect when Google button is rendered
    const observer = new MutationObserver(() => {
      setTimeout(updateDimensions, 100);
    });
    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      window.removeEventListener('resize', updateDimensions);
      observer.disconnect();
    };
  }, []);

  return { containerRef, buttonWidth, borderRadius };
}
