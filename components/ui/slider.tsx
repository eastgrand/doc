"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: number;
  onValueChange?: (value: number) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, ...props }, ref) => (
    <div className="relative flex w-full touch-none select-none items-center">
      <input
        type="range"
        ref={ref}
        value={value}
        onChange={(e) => onValueChange?.(Number(e.target.value))}
        className={cn(
          "h-1.5 w-full appearance-none rounded-full bg-primary/20",
          "range-thumb:block range-thumb:h-4 range-thumb:w-4 range-thumb:rounded-full",
          "range-thumb:border range-thumb:border-primary/50 range-thumb:bg-background",
          "range-thumb:transition-colors range-thumb:focus-visible:outline-none",
          "range-thumb:focus-visible:ring-1 range-thumb:focus-visible:ring-ring",
          "range-thumb:disabled:pointer-events-none range-thumb:disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
)
Slider.displayName = "Slider"

export { Slider }
