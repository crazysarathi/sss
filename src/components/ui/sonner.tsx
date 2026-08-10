import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-night-700 group-[.toaster]:text-ink group-[.toaster]:border-line group-[.toaster]:shadow-card-deep group-[.toaster]:backdrop-blur-md",
          description: "group-[.toast]:text-ink-soft",
          actionButton: "group-[.toast]:bg-lime group-[.toast]:text-night-800",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-ink-soft",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
