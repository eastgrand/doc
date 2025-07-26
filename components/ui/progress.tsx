import * as React from "react"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  className?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-primary transition-all duration-500 ease-out bg-blue-600"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </div>
    )
  }
)

Progress.displayName = "Progress"

export { Progress } 