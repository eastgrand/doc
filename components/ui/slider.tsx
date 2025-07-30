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
          "h-2 w-full appearance-none rounded-full bg-gray-200",
          "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full",
          "[&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-[#33a852] [&::-webkit-slider-thumb]:bg-[#33a852]",
          "[&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer",
          "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full",
          "[&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-[#33a852] [&::-moz-range-thumb]:bg-[#33a852]",
          "[&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-pointer",
          className
        )}
        {...props}
      />
    </div>
  )
)
Slider.displayName = "Slider"

export { Slider }
