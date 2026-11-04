#!/usr/bin/env python3
"""Studio photo: turn a seller's phone photo into a clean product shot, locally and free.

  python scripts/studio_photo.py IN.jpg OUT.jpg [--bg "#111111" | --scene SCENE.jpg] [--size 1600] [--no-shadow] [--keep-bg]

What it does
  1. Fixes orientation (phone EXIF), white balance and contrast, then sharpens a little.
  2. Removes the background with rembg when installed (pip install "rembg[cpu]"), places the product
     centred on a clean backdrop (solid colour with a soft light falloff) or on a full scene photo
     (--scene, softened so the product stays the focal point), with a soft contact shadow.
  3. Without rembg, keeps the original background and only enhances and pads to a square.
Prints one JSON line: {"output": ..., "removedBackground": true|false, "note": ...}

Runs on the seller's own machine: no upload, no per-image cost.
"""
import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageEnhance, ImageFilter, ImageOps
except ImportError:  # pragma: no cover
    print(json.dumps({"error": "Pillow is required: pip install pillow"}))
    sys.exit(1)


def hex_rgb(value):
    value = value.lstrip("#")
    if len(value) != 6:
        raise argparse.ArgumentTypeError("Use a colour like #111111")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def enhance(img):
    img = ImageOps.exif_transpose(img).convert("RGB")
    # Gentle grey-world white balance: pull the average colour towards neutral.
    from PIL import ImageStat
    r, g, b = ImageStat.Stat(img).mean
    avg = (r + g + b) / 3
    if min(r, g, b) > 0:
        img = Image.merge("RGB", [c.point(lambda v, k=avg / m: min(255, int(v * (1 + (k - 1) * 0.6)))) for c, m in zip(img.split(), (r, g, b))])
    img = ImageOps.autocontrast(img, cutoff=1)
    img = ImageEnhance.Color(img).enhance(1.06)
    return img.filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=3))


def backdrop(size, rgb):
    """Solid colour with a soft centre light, like a seamless studio sweep."""
    base = Image.new("RGB", (size, size), rgb)
    light = tuple(min(255, int(c + (255 - c) * 0.10)) for c in rgb)
    glow = Image.new("RGB", (size, size), light)
    mask = Image.new("L", (size, size), 0)
    radial = Image.radial_gradient("L").resize((size, size))
    mask = ImageOps.invert(radial).point(lambda v: int(v * 0.85))
    return Image.composite(glow, base, mask)


def scene(path, size):
    """A real photo as the backdrop: cover-cropped, slightly blurred and dimmed for depth."""
    bg = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    bg = ImageOps.fit(bg, (size, size), Image.LANCZOS)
    bg = bg.filter(ImageFilter.GaussianBlur(size / 260))
    return ImageEnhance.Brightness(bg).enhance(0.86)


def cut_out(img):
    try:
        from rembg import remove  # type: ignore
    except Exception:
        return None
    return remove(img)  # RGBA, transparent background


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--bg", type=hex_rgb, default=hex_rgb("#f2f0eb"), help="backdrop colour, e.g. #111111")
    ap.add_argument("--scene", help="a photo to use as the full background (street, shelf, studio)")
    ap.add_argument("--size", type=int, default=1600)
    ap.add_argument("--no-shadow", action="store_true")
    ap.add_argument("--keep-bg", action="store_true", help="enhance only, never remove the background")
    ap.add_argument("--transparent", action="store_true", help="output the cut-out alone as a transparent PNG (for illustrations)")
    a = ap.parse_args()

    src = Image.open(a.input)
    img = enhance(src)
    cut = None if a.keep_bg else cut_out(img)
    size = a.size

    if cut is not None and a.transparent:
        bbox = cut.getchannel("A").point(lambda v: 255 if v > 16 else 0).getbbox()
        if bbox:
            cut = cut.crop(bbox)
        cut.thumbnail((size, size), Image.LANCZOS)
        out = Path(a.output).with_suffix(".png")
        out.parent.mkdir(parents=True, exist_ok=True)
        cut.save(out, optimize=True)
        print(json.dumps({"output": str(out.resolve()), "removedBackground": True, "transparent": True, "note": "Transparent cut-out, ready to place on any background without a frame.", "size": max(cut.size)}))
        return
    if cut is not None:
        bbox = cut.getchannel("A").point(lambda v: 255 if v > 16 else 0).getbbox()
        if bbox:
            cut = cut.crop(bbox)
        # Product fills about 72% of the frame, sitting slightly below centre.
        scale = (size * 0.72) / max(cut.width, cut.height)
        cut = cut.resize((max(1, int(cut.width * scale)), max(1, int(cut.height * scale))), Image.LANCZOS)
        canvas = scene(a.scene, size) if a.scene else backdrop(size, a.bg)
        x = (size - cut.width) // 2
        y = int((size - cut.height) * 0.56)
        if not a.no_shadow:
            shadow = Image.new("L", (int(cut.width * 0.9), max(8, int(cut.height * 0.07))), 0)
            ell = Image.new("L", shadow.size, 0)
            from PIL import ImageDraw
            ImageDraw.Draw(ell).ellipse((0, 0, shadow.width - 1, shadow.height - 1), fill=120)
            ell = ell.filter(ImageFilter.GaussianBlur(max(4, shadow.height // 3)))
            dark = Image.new("RGB", ell.size, (20, 20, 20) if a.scene else tuple(int(c * 0.55) for c in a.bg))
            canvas.paste(dark, (x + (cut.width - ell.width) // 2, y + cut.height - ell.height // 2), ell)
        canvas.paste(cut, (x, y), cut)
        removed = True
        note = "Background removed and placed on " + ("the scene photo." if a.scene else "a studio backdrop.")
    else:
        # Enhance only: centre on a square backdrop without cropping the product.
        img.thumbnail((int(size * 0.92), int(size * 0.92)), Image.LANCZOS)
        canvas = backdrop(size, a.bg)
        canvas.paste(img, ((size - img.width) // 2, (size - img.height) // 2))
        removed = False
        note = "Enhanced (colour, contrast, sharpness). For background removal run: pip install \"rembg[cpu]\" (Python 3.10 to 3.13)."

    out = Path(a.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    if out.suffix.lower() in (".jpg", ".jpeg"):
        canvas.convert("RGB").save(out, quality=88, optimize=True, progressive=True)
    else:
        canvas.save(out, optimize=True)
    print(json.dumps({"output": str(out.resolve()), "removedBackground": removed, "note": note, "size": size}))


if __name__ == "__main__":
    main()
