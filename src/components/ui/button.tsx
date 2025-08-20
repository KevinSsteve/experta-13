import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-normal ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        // 🔥 Botão padrão estilo OpenAI
        default:
          "bg-white text-black border border-gray-200 hover:bg-gray-100 hover:shadow-sm",

        destructive:
          "bg-destructive text-white border border-destructive/20 hover:bg-destructive/90 hover:shadow-md",

        outline:
          "border border-border bg-background/60 hover:bg-accent hover:text-accent-foreground hover:shadow-sm",

        secondary:
          "bg-secondary text-secondary-foreground border border-secondary/20 hover:bg-secondary/80 hover:shadow-sm",

        ghost:
          "hover:bg-accent hover:text-accent-foreground",

        link:
          "text-primary underline-offset-4 hover:underline tracking-normal",
      },
      size: {
        default: "h-11 px-8 py-2.5",
        sm: "h-9 rounded-full px-6",
        lg: "h-12 rounded-full px-10",
        icon: "h-11 w-11",
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

