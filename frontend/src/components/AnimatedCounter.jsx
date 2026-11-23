import React, { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { useUltraLite } from '../app/UltraLiteContext';

/**
 * AnimatedCounter
 * Smoothly animates numbers from 0 to target value when scrolled into view.
 * Supports prefixes (e.g. ₹), suffixes (e.g. +, T, kg), decimals, and formatted numbers.
 */
export const AnimatedCounter = ({
  value,
  duration = 1.8,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const { ultraLite } = useUltraLite();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState(0);

  // Parse numeric target from value (can be number or string like "40000" or "3.2")
  const numericTarget = typeof value === 'number' 
    ? value 
    : parseFloat(String(value || '0').replace(/[^0-9.-]/g, '')) || 0;

  useEffect(() => {
    if (ultraLite) {
      setDisplayValue(numericTarget);
      return;
    }

    if (!isInView) return;

    let startTime = null;
    let animationFrame = null;

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easedProgress = easeOutExpo(progress);
      const current = easedProgress * numericTarget;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setDisplayValue(numericTarget);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isInView, numericTarget, duration, ultraLite]);

  const formattedNumber = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString();

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
