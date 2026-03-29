import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg  p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        primary: "bg-foreground text-background",
        secondary:"bg-muted-foreground text-background",
        success:"bg-muted text-muted-foreground",
        error:"bg-foreground text-background",
        warning:"bg-muted-foreground text-background",
        info:"bg-muted-foreground text-background",
        lightprimary:"bg-muted text-foreground [&>svg]:text-foreground",
        lightsecondary:"bg-muted text-muted-foreground [&>svg]:text-muted-foreground",
        lightsuccess:"bg-muted text-muted-foreground [&>svg]:text-muted-foreground",
        lightwarning:"bg-muted text-muted-foreground [&>svg]:text-muted-foreground",
        lighterror:"bg-muted text-foreground [&>svg]:text-foreground",
        lightinfo:"bg-muted text-muted-foreground [&>svg]:text-muted-foreground",
        destructive:
          "border-foreground/50 text-foreground dark:border-foreground [&>svg]:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
