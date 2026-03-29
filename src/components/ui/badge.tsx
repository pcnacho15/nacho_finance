import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent text-background bg-foreground',
        primary: 'border-transparent text-background bg-foreground',
        secondary: 'border-transparent bg-muted-foreground text-background',
        success: 'border-transparent bg-muted text-muted-foreground',
        warning: 'border-transparent bg-muted-foreground text-background',
        info: 'border-transparent bg-muted-foreground text-background',
        error: 'border-transparent bg-foreground text-background',
        outline: 'border-foreground text-foreground',
        outlineSecondary: 'border-muted-foreground text-muted-foreground',
        outlineSuccess: 'border-muted text-muted',
        outlineWarning: 'border-muted-foreground text-muted-foreground',
        outlineError: 'border-foreground text-foreground',
        outlineInfo: 'border-muted-foreground text-muted-foreground',
        lightPrimary: 'bg-muted text-foreground border-0',
        lightSecondary: 'bg-muted text-muted-foreground border-0',
        lightSuccess: 'bg-muted text-muted-foreground border-0',
        lightError: 'bg-muted text-foreground border-0',
        lightInfo: 'bg-muted text-muted-foreground border-0',
        lightWarning: 'bg-muted text-muted-foreground border-0',
        destructive: 'border-transparent bg-foreground text-background',
        gray: 'border-transparent bg-muted text-foreground'
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };