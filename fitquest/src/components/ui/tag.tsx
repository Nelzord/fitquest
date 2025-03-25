"use client"

import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const tagVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        muscle: "border-transparent bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30",
        cardio: "border-transparent bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
        strength: "border-transparent bg-amber-500/20 text-amber-500 hover:bg-amber-500/30",
        difficulty: "border-transparent bg-purple-500/20 text-purple-500 hover:bg-purple-500/30",
      },
      selected: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        selected: true,
        className: "bg-primary/90",
      },
      {
        variant: "secondary",
        selected: true,
        className: "bg-secondary/90",
      },
      {
        variant: "destructive",
        selected: true,
        className: "bg-destructive/90",
      },
      {
        variant: "outline",
        selected: true,
        className: "bg-accent text-accent-foreground",
      },
      {
        variant: "muscle",
        selected: true,
        className: "bg-emerald-500/40 text-emerald-500",
      },
      {
        variant: "cardio",
        selected: true,
        className: "bg-blue-500/40 text-blue-500",
      },
      {
        variant: "strength",
        selected: true,
        className: "bg-amber-500/40 text-amber-500",
      },
      {
        variant: "difficulty",
        selected: true,
        className: "bg-purple-500/40 text-purple-500",
      },
    ],
  },
)

export interface TagProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tagVariants> {
  onRemove?: () => void
  onClick?: () => void
  removable?: boolean
  selected?: boolean
}

function Tag({
  className,
  variant = "default",
  onRemove,
  onClick,
  removable = false,
  selected = false,
  children,
  ...props
}: TagProps) {
  return (
    <div
      className={cn(tagVariants({ variant, selected }), onClick && "cursor-pointer", className)}
      onClick={onClick}
      {...props}
    >
      <span className="flex-1">{children}</span>
      {removable && (
        <button
          type="button"
          className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove</span>
        </button>
      )}
    </div>
  )
}

export { Tag, tagVariants }

