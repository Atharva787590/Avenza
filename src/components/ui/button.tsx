import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-cobalt text-white hover:bg-opacity-90 shadow-md shadow-cobalt/25",
        secondary: "bg-deepslate text-cloud border border-border hover:bg-opacity-80",
        outline: "border border-border text-cloud hover:bg-deepslate/50",
        ghost: "hover:bg-deepslate/50 text-cloud hover:text-white",
        link: "text-cobalt underline-offset-4 hover:underline",
        destructive: "bg-coral text-white hover:bg-opacity-95 shadow-md shadow-coral/25",
        success: "bg-mint text-ink font-semibold hover:bg-opacity-90 shadow-md shadow-mint/25",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        default: "h-11 px-5",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
