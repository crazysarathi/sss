import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md border border-input bg-night-700/60 px-4 py-2 text-base text-ink transition-colors",
          "placeholder:text-ink-dim",
          "focus-visible:border-lime/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-lime/40",
          "aria-[invalid=true]:border-destructive/70",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
