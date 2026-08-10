import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";

export interface LightboxMedia {
  type: "image" | "video";
  src: string;
  /** Video poster frame, shown while the clip buffers. */
  poster?: string;
  alt: string;
  /** Metadata kept for accessibility (screen-reader title) — not rendered. */
  tag?: string;
  title?: string;
  caption?: string;
}

interface MediaLightboxProps {
  media: LightboxMedia | null;
  onClose: () => void;
}

/**
 * Minimal media viewer — just the photo or clip, edge to edge, with a red
 * close button riding the top corner. One instance per host, fed by state.
 */
export function MediaLightbox({ media, onClose }: MediaLightboxProps) {
  return (
    <Dialog open={media !== null} onOpenChange={(open) => !open && onClose()}>
      {media && (
        <DialogPortal>
          <DialogOverlay className="bg-night/90" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            // closing is deliberate: the red X (or Escape) only — a stray
            // click outside must not dismiss the viewer
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            className="fixed left-1/2 top-[46%] z-[95] w-[calc(100%-2.5rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 outline-none duration-300 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-90 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          >
            <DialogPrimitive.Title className="sr-only">
              {media.title ?? media.alt}
            </DialogPrimitive.Title>

            <div className="overflow-hidden rounded-lg border border-line bg-night shadow-card-deep">
              {media.type === "video" ? (
                /* Key forces a fresh element per clip — otherwise the browser
                   keeps playing the previous src when the dialog is reused. */
                <video
                  key={media.src}
                  src={media.src}
                  poster={media.poster}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  className="max-h-[78vh] w-full bg-night object-contain sm:max-h-[85vh]"
                >
                  <p className="p-6 text-sm text-ink-soft">{media.alt}</p>
                </video>
              ) : (
                <img
                  src={media.src}
                  alt={media.alt}
                  className="max-h-[78vh] w-full bg-night object-contain sm:max-h-[85vh]"
                />
              )}
            </div>

            {/* phones: red close pill under the media (a corner button would
                cover the photo or clip at the viewport edge) */}
            <div className="mt-3 flex justify-center sm:hidden">
              <DialogPrimitive.Close className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-6 font-condensed text-sm uppercase tracking-[0.2em] text-white shadow-lg transition-colors duration-200 hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                <X className="h-4 w-4" aria-hidden="true" />
                Close
              </DialogPrimitive.Close>
            </div>

            {/* sm+: round red X hung off the media's top-right corner */}
            <DialogPrimitive.Close className="absolute -right-10 -top-10 hidden h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-[background-color,transform] duration-200 hover:scale-105 hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex">
              <X className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      )}
    </Dialog>
  );
}
