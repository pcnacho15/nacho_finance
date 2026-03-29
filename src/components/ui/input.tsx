import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex h-10 w-full border rounded-lg px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:rounded-sm file:text-sm file:font-medium file:text-foreground file:mr-5  focus-visible:outline-0',
  {
    variants: {
      variant: {
        default:
          'border-ld bg-transparent text-ld placeholder:text-muted-foreground dark:placeholder:text-white/30 focus-visible:border-foreground focus-visible:ring-0',
        gray: 'border-border bg-muted text-foreground placeholder:text-muted-foreground focus:border-foreground focus:ring-foreground dark:border-muted-foreground dark:bg-muted-foreground/20 dark:text-background dark:placeholder:text-muted-foreground dark:focus:border-foreground dark:focus:ring-foreground focus-visible:ring',
        info: 'border-muted-foreground bg-muted text-foreground placeholder:text-muted-foreground focus:border-foreground focus:ring-foreground dark:border-muted-foreground dark:bg-muted-foreground/10 dark:focus:border-foreground dark:focus:ring-foreground focus-visible:ring',
        failure:
          'border-foreground bg-muted text-foreground placeholder:text-muted-foreground focus:border-foreground focus:ring-foreground dark:border-foreground dark:bg-muted-foreground/10 dark:focus:border-foreground dark:focus:ring-foreground focus-visible:ring',
        warning:
          'border-muted-foreground bg-muted text-foreground placeholder:text-muted-foreground focus:border-foreground focus:ring-foreground dark:border-muted-foreground dark:bg-muted-foreground/10 dark:focus:border-foreground dark:focus:ring-foreground focus-visible:ring',
        success:
          'border-muted bg-muted text-muted-foreground placeholder:text-muted-foreground focus:border-muted-foreground focus:ring-muted-foreground dark:border-muted-foreground dark:bg-muted-foreground/10 dark:focus:border-muted-foreground dark:focus:ring-muted-foreground focus-visible:ring',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
  VariantProps<typeof inputVariants> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }
