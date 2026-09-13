"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  startValue?: number;
  className?: string;
  animateOnce?: boolean;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
}

export default function AnimatedCounter({
  value,
  startValue = 0,
  className = "",
  animateOnce = true,
  prefix = "",
  suffix = "",
  duration = 2,
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(startValue);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: animateOnce, margin: "-10px" });
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        let formattedValue = "";
        
        // Use Intl.NumberFormat for Indian numbering format if it looks like a large currency or integer
        if (value >= 1000) {
          formattedValue = latest.toLocaleString("en-IN", {
            maximumFractionDigits: decimals,
            minimumFractionDigits: decimals,
          });
        } else {
          formattedValue = Number(latest).toFixed(decimals);
        }
        
        ref.current.textContent = `${prefix}${formattedValue}${suffix}`;
      }
    });
  }, [springValue, value, prefix, suffix, decimals]);

  // Initial render state
  useEffect(() => {
    let initialFormatted = "";
    if (startValue >= 1000) {
      initialFormatted = startValue.toLocaleString("en-IN", {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals,
      });
    } else {
      initialFormatted = Number(startValue).toFixed(decimals);
    }
    setDisplayValue(`${prefix}${initialFormatted}${suffix}`);
  }, [startValue, prefix, suffix, decimals]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {displayValue}
    </span>
  );
}
