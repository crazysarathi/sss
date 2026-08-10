#!/usr/bin/env python3
"""Crop/resize photos for the Moments accordion gallery.

Typical uses:
  # Just downsize for web (object-cover does the on-screen cropping):
  python3 scripts/crop-gallery.py in.jpg src/assets/gallery/team-reveal.jpg --width 1200

  # Cut a pixel rectangle first (e.g. trim phone UI off a screenshot),
  # box is X Y WIDTH HEIGHT from the top-left corner:
  python3 scripts/crop-gallery.py shot.png src/assets/gallery/press-coverage.jpg --box 0 440 588 390 --width 1000

  # Center-crop to the panel's portrait shape, keeping a focal point
  # (fractions of width/height, 0-1) inside the frame:
  python3 scripts/crop-gallery.py in.jpg src/assets/gallery/league-launch.jpg --aspect 3:4 --focus 0.5 0.4 --width 1000
"""
import argparse
import sys

from PIL import Image


def aspect_crop(img: Image.Image, ratio: float, fx: float, fy: float) -> Image.Image:
    w, h = img.size
    if w / h > ratio:  # too wide -> trim sides
        tw, th = int(h * ratio), h
    else:  # too tall -> trim top/bottom
        tw, th = w, int(w / ratio)
    left = min(max(int(fx * w - tw / 2), 0), w - tw)
    top = min(max(int(fy * h - th / 2), 0), h - th)
    return img.crop((left, top, left + tw, top + th))


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("input")
    p.add_argument("output")
    p.add_argument("--box", nargs=4, type=int, metavar=("X", "Y", "W", "H"), help="pixel rectangle to cut first")
    p.add_argument("--aspect", help="target aspect like 3:4 (center-crop toward --focus)")
    p.add_argument("--focus", nargs=2, type=float, default=[0.5, 0.5], metavar=("FX", "FY"), help="focal point 0-1")
    p.add_argument("--width", type=int, help="downscale to this width (never upscales)")
    p.add_argument("--quality", type=int, default=82, help="JPEG quality (default 82)")
    args = p.parse_args()

    img = Image.open(args.input)
    img = img.convert("RGB") if args.output.lower().endswith((".jpg", ".jpeg")) else img

    if args.box:
        x, y, w, h = args.box
        img = img.crop((x, y, x + w, y + h))

    if args.aspect:
        try:
            aw, ah = (float(n) for n in args.aspect.split(":"))
        except ValueError:
            sys.exit(f"bad --aspect {args.aspect!r}, expected like 3:4")
        img = aspect_crop(img, aw / ah, *args.focus)

    if args.width and img.width > args.width:
        img = img.resize((args.width, int(img.height * args.width / img.width)), Image.LANCZOS)

    if args.output.lower().endswith((".jpg", ".jpeg")):
        img.save(args.output, quality=args.quality, optimize=True, progressive=True)
    else:
        img.save(args.output, optimize=True)
    print(f"{args.output}: {img.width}x{img.height}")


if __name__ == "__main__":
    main()
