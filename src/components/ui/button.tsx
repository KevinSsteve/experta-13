
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-light tracking-wider ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-white/10 text-white border border-white/20 backdrop-blur-[10px] hover:bg-white/20 hover:-translate-y-0.5",
        destructive: "bg-red-500/20 text-red-300 border border-red-500/30 backdrop-blur-[10px] hover:bg-red-500/30 hover:-translate-y-0.5",
        outline: "border border-white/20 bg-white/5 backdrop-blur-[10px] hover:bg-white/10 hover:-translate-y-0.5",
        secondary: "bg-primary/20 text-primary border border-primary/30 backdrop-blur-[10px] hover:bg-primary/30 hover:-translate-y-0.5",
        ghost: "hover:bg-white/10 hover:-translate-y-0.5",
        link: "text-primary underline-offset-4 hover:underline tracking-wide",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4",
        lg: "h-14 rounded-xl px-8",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
