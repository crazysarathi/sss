import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-condensed uppercase tracking-[0.14em] transition-[color,background-color,border-color,box-shadow,transform,filter] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-night disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-lime text-night-800 shadow-glow-lime hover:bg-lime-bright hover:shadow-[0_0_56px_-8px_rgba(203,230,110,0.6)]",
        secondary:
          "bg-royal text-ink shadow-glow-blue hover:bg-royal-bright hover:text-night-800",
        ghost:
          "border border-line bg-white/[0.03] text-ink backdrop-blur-sm hover:border-royal-bright/50 hover:bg-royal/15",
        insta:
          "bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white hover:brightness-110 hover:shadow-[0_0_44px_-10px_rgba(221,42,123,0.65)]",
        link: "text-lime underline-offset-4 hover:underline normal-case tracking-normal",
      },
      size: {
        default: "h-12 px-7 text-base",
        sm: "h-9 px-4 text-sm",
        lg: "h-14 px-9 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
