import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-foreground text-background hover:bg-foreground/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-foreground text-foreground bg-transparent hover:bg-foreground hover:text-background',
        outlinesecondary:
          'border border-muted-foreground text-muted-foreground bg-transparent hover:bg-muted-foreground hover:text-background',
        outlinesuccess:
          'border border-muted text-muted bg-transparent hover:bg-muted text-muted-foreground hover:text-background',
        outlinewarning:
          'border border-muted-foreground text-muted-foreground bg-transparent hover:bg-muted-foreground hover:text-background',
        outlineinfo:
          'border border-muted-foreground text-muted-foreground bg-transparent hover:bg-muted-foreground hover:text-background',
        outlineerror:
          'border border-foreground text-foreground bg-transparent hover:bg-foreground hover:text-background',
        secondary: 'bg-muted-foreground text-background hover:bg-muted-foreground/90',
        success: 'bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-background',
        warning: 'bg-muted-foreground text-background hover:bg-muted-foreground/90',
        info: 'bg-muted-foreground text-background hover:bg-muted-foreground/90',
        error: 'bg-foreground text-background hover:bg-foreground/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        ghostprimary: 'hover:bg-muted hover:text-foreground text-foreground',
        ghostsecondary:
          'hover:bg-muted hover:text-muted-foreground text-muted-foreground',
        ghostsuccess: 'hover:bg-muted text-muted-foreground',
        ghostwarning: 'hover:bg-muted text-muted-foreground',
        ghosterror: 'hover:bg-muted text-foreground',
        ghostinfo: 'hover:bg-muted text-muted-foreground',
        link: 'text-foreground underline-offset-4 hover:underline',
        lightprimary:
          'bg-muted text-foreground hover:bg-foreground hover:text-background',
        lightsecondary:
          'bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-background',
        lightsuccess:
          'bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-background',
        lightwarning:
          'bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-background',
        lightinfo: 'bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-background',
        lighterror: 'bg-muted text-foreground hover:bg-foreground hover:text-background',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
      shape: {
        pill: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, shape, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
