"use client";

import { cn } from "@/lib/utils";

interface ProgressiveBlurProps {
  className?: string;
  direction?: "left" | "right" | "top" | "bottom";
  blurIntensity?: number;
}

export function ProgressiveBlur({
  className,
  direction = "right",
  blurIntensity = 1,
}: ProgressiveBlurProps) {
  const gradientDirection = {
    left: "to left",
    right: "to right",
    top: "to top",
    bottom: "to bottom",
  };

  return (
    <div
      className={cn("pointer-events-none", className)}
      style={{
        background: `linear-gradient(${gradientDirection[direction]}, transparent, var(--background))`,
        backdropFilter: `blur(${blurIntensity}px)`,
      }}
    />
  );
}
