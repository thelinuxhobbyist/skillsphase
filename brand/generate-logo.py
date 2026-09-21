#!/usr/bin/env python3
"""Generate the SkillsPhase Fatsia japonica logo, wordmark, and favicon set."""

from __future__ import annotations

import json
import math
import subprocess
import urllib.request
from pathlib import Path

from fontTools.misc.transform import Transform
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "assets"
FONT_URL = (
    "https://raw.githubusercontent.com/coreyhu/Urbanist/main/fonts/ttf/Urbanist-SemiBold.ttf"
)


def oklch_to_hex(L: float, C: float, h: float) -> str:
    hr = math.radians(h)
    a = C * math.cos(hr)
    b = C * math.sin(hr)
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_**3, m_**3, s_**3
    r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

    def comp(u: float) -> int:
        u = min(max(u, 0.0), 1.0)
        enc = 12.92 * u if u <= 0.0031308 else 1.055 * (u ** (1 / 2.4)) - 0.055
        return int(round(enc * 255))

    return f"#{comp(r):02X}{comp(g):02X}{comp(bl):02X}"


# Brand mint, in sRGB gamut so it matches the site primary on screen.
LEAF = "#2BB59A"
VEIN = "#1A7D68"
INK = oklch_to_hex(0.19, 0.025, 245)
PORCELAIN = oklch_to_hex(0.985, 0.004, 190)
ON_DARK = oklch_to_hex(0.96, 0.006, 190)


def project(
    along: float, across: float, angle: float, cx: float, cy: float
) -> tuple[float, float]:
    """Local leaf space: +along toward the tip, +across to the left of that axis."""
    c, s = math.cos(angle), math.sin(angle)
    return (
        cx + along * c - across * s,
        cy + along * s + across * c,
    )


def fmt(pt: tuple[float, float]) -> str:
    return f"{pt[0]:.2f} {pt[1]:.2f}"


def lobe_half_width(t: float, width: float) -> float:
    """Lanceolate envelope: widest near the inner third, tapering to a point."""
    a, b = 0.75, 1.35
    raw = (max(t, 1e-6) ** a) * ((max(1.0 - t, 1e-6)) ** b)
    peak_t = a / (a + b)
    peak = (peak_t**a) * ((1.0 - peak_t) ** b)
    return width * raw / peak


def serration_offset(t: float, width: float, teeth: int) -> float:
    if teeth <= 0 or t < 0.22 or t > 0.88:
        return 0.0
    span = (t - 0.22) / 0.66
    saw = 1.0 - abs((span * teeth) % 1.0 - 0.5) * 2.0
    envelope = math.sin(span * math.pi)
    return width * 0.16 * (saw**1.25) * envelope


def lobe_path(
    cx: float,
    cy: float,
    angle: float,
    length: float,
    width: float,
    teeth: int,
) -> str:
    steps = 64
    left: list[tuple[float, float]] = []
    right: list[tuple[float, float]] = []
    for i in range(steps + 1):
        t = i / steps
        along = t * length
        half = lobe_half_width(t, width) + serration_offset(t, width, teeth)
        left.append(project(along, -half, angle, cx, cy))
        right.append(project(along, half, angle, cx, cy))

    pts = left + list(reversed(right[1:-1]))
    d = [f"M {fmt(pts[0])}"]
    for pt in pts[1:]:
        d.append(f"L {fmt(pt)}")
    d.append("Z")
    return " ".join(d)


def vein_paths(
    cx: float,
    cy: float,
    angle: float,
    length: float,
    width: float,
    detailed: bool,
) -> tuple[str, list[str]]:
    start = project(0.08 * length, 0, angle, cx, cy)
    end = project(0.90 * length, 0, angle, cx, cy)
    midrib = f"M {fmt(start)} L {fmt(end)}"
    laterals: list[str] = []
    if not detailed:
        return midrib, laterals
    for t in (0.34, 0.52, 0.70):
        origin = project(t * length, 0, angle, cx, cy)
        reach = lobe_half_width(t, width) * 0.55
        ahead = length * 0.10
        for side in (-1, 1):
            dest = project(t * length + ahead, side * reach, angle, cx, cy)
            laterals.append(f"M {fmt(origin)} L {fmt(dest)}")
    return midrib, laterals


def fatsia_leaf(cx: float, cy: float, radius: float, detailed: bool = True) -> str:
    """Nine-lobed palmate Fatsia japonica leaf, with a petiole at the basal sinus."""
    n = 9
    span = math.radians(40)
    lobes = []
    midribs = []
    laterals: list[str] = []
    for i in range(n):
        angle = -math.pi / 2 + (i - 4) * span
        dist = abs(i - 4)
        length = radius * (1.0 - 0.04 * max(dist - 1, 0))
        width = radius * (0.205 - 0.008 * dist)
        teeth = 5 if detailed else 0
        lobes.append(lobe_path(cx, cy, angle, length, width, teeth))
        mid, lat = vein_paths(cx, cy, angle, length, width, detailed=detailed)
        midribs.append(mid)
        laterals.extend(lat)

    hub_r = radius * 0.09
    stem_len = radius * 0.14
    stem_w = radius * 0.032
    stem = (
        f"M {cx - stem_w:.2f} {cy:.2f} "
        f"C {cx - stem_w:.2f} {cy + stem_len * 0.55:.2f} "
        f"{cx - stem_w * 0.5:.2f} {cy + stem_len:.2f} "
        f"{cx:.2f} {cy + stem_len:.2f} "
        f"C {cx + stem_w * 0.5:.2f} {cy + stem_len:.2f} "
        f"{cx + stem_w:.2f} {cy + stem_len * 0.55:.2f} "
        f"{cx + stem_w:.2f} {cy:.2f} Z"
    )

    lobe_el = "\n    ".join(f'<path d="{d}"/>' for d in lobes)
    mid_el = "\n    ".join(f'<path d="{d}"/>' for d in midribs)
    lat_el = "\n    ".join(f'<path d="{d}"/>' for d in laterals)
    vein_sw = radius * (0.028 if detailed else 0.04)
    lateral_sw = radius * 0.015

    return f"""  <g>
    <g fill="{LEAF}">
    {lobe_el}
    <circle cx="{cx:.2f}" cy="{cy:.2f}" r="{hub_r:.2f}"/>
    <path d="{stem}"/>
    </g>
    <g fill="none" stroke="{VEIN}" stroke-linecap="round" stroke-linejoin="round">
    <g stroke-width="{vein_sw:.2f}">
    {mid_el}
    </g>
    <g stroke-width="{lateral_sw:.2f}" opacity="0.9">
    {lat_el}
    </g>
    </g>
  </g>"""


def download_font(dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 1000:
        return dest
    print(f"Downloading Urbanist SemiBold → {dest}")
    urllib.request.urlretrieve(FONT_URL, dest)
    return dest


def text_svg_path(
    font: TTFont,
    text: str,
    x: float,
    y: float,
    size: float,
    tracking: float = 0.0,
) -> tuple[str, float]:
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    units = font["head"].unitsPerEm
    scale = size / units
    cursor = 0.0
    commands: list[str] = []
    hmtx = font["hmtx"]
    for i, ch in enumerate(text):
        name = cmap[ord(ch)]
        glyph = glyph_set[name]
        svg_pen = SVGPathPen(glyph_set)
        transform = Transform(scale, 0, 0, -scale, x + cursor, y)
        glyph.draw(TransformPen(svg_pen, transform))
        commands.append(svg_pen.getCommands())
        adv = hmtx[name][0] * scale
        if i < len(text) - 1:
            adv += tracking
        cursor += adv
    return " ".join(commands), cursor


def svg_doc(view_w: float, view_h: float, body: str, title: str, desc: str) -> str:
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {view_w:.0f} {view_h:.0f}" role="img" aria-labelledby="title desc">
  <title id="title">{title}</title>
  <desc id="desc">{desc}</desc>
{body}
</svg>
"""


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)} ({path.stat().st_size} bytes)")


def rasterize(svg_path: Path, png_path: Path, width: int, height: int, background: str | None) -> None:
    png_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "magick",
        "-background",
        background if background else "none",
        "-density",
        "384",
        str(svg_path),
        "-resize",
        f"{width}x{height}",
        "-gravity",
        "center",
        "-extent",
        f"{width}x{height}",
        str(png_path),
    ]
    subprocess.check_call(cmd)


def main() -> None:
    DIST.mkdir(parents=True, exist_ok=True)
    font_path = download_font(ROOT / ".cache" / "Urbanist-SemiBold.ttf")
    font = TTFont(font_path)

    # --- Leaf mark (square) ---
    mark_size = 128
    cx = mark_size / 2
    cy = mark_size / 2 - 2
    radius = 54
    leaf_detailed = fatsia_leaf(cx, cy, radius, detailed=True)
    leaf_simple = fatsia_leaf(cx, cy, radius, detailed=False)

    desc_leaf = (
        "A palmate Fatsia japonica leaf — evergreen, meaning skills stay new."
    )
    write(
        DIST / "favicon.svg",
        svg_doc(mark_size, mark_size, leaf_detailed, "SkillsPhase", desc_leaf),
    )
    write(
        DIST / "leaf.svg",
        svg_doc(mark_size, mark_size, leaf_detailed, "SkillsPhase leaf", desc_leaf),
    )
    write(
        DIST / "leaf-simple.svg",
        svg_doc(mark_size, mark_size, leaf_simple, "SkillsPhase leaf", desc_leaf),
    )

    # --- Wordmark lockup ---
    # Leaf on the left, Urbanist SemiBold "SkillsPhase" on the right.
    # Tight viewBox so the wordmark stays readable at header height.
    lockup_h = 80
    leaf_r = 28
    leaf_cx = 34
    leaf_cy = 38
    text_size = 44
    text_x = 72
    text_y = 54
    tracking = -1.2
    word_path, word_w = text_svg_path(
        font, "SkillsPhase", text_x, text_y, text_size, tracking=tracking
    )
    lockup_w = text_x + word_w + 16
    leaf_lockup = fatsia_leaf(leaf_cx, leaf_cy, leaf_r, detailed=True)

    lockup_desc = (
        "SkillsPhase wordmark in Urbanist SemiBold beside a Fatsia japonica leaf. "
        "The evergreen leaf stands for skills that stay new."
    )
    logo_body = f"""{leaf_lockup}
  <path d="{word_path}" fill="{INK}"/>"""
    logo_dark_body = f"""{leaf_lockup}
  <path d="{word_path}" fill="{ON_DARK}"/>"""

    write(
        DIST / "logo.svg",
        svg_doc(lockup_w, lockup_h, logo_body, "SkillsPhase", lockup_desc),
    )
    write(
        DIST / "logo-on-dark.svg",
        svg_doc(lockup_w, lockup_h, logo_dark_body, "SkillsPhase", lockup_desc),
    )

    # --- Raster favicons from the leaf ---
    simple = DIST / "leaf-simple.svg"
    detailed = DIST / "favicon.svg"

    rasterize(simple, DIST / "favicon-16x16.png", 16, 16, None)
    rasterize(simple, DIST / "favicon-32x32.png", 32, 32, None)
    rasterize(simple, DIST / "favicon-48x48.png", 48, 48, None)
    rasterize(detailed, DIST / "apple-touch-icon.png", 180, 180, PORCELAIN)
    rasterize(detailed, DIST / "android-chrome-192x192.png", 192, 192, PORCELAIN)
    rasterize(detailed, DIST / "android-chrome-512x512.png", 512, 512, PORCELAIN)
    rasterize(DIST / "logo.svg", DIST / "logo.png", 1024, 236, None)
    rasterize(DIST / "logo.svg", DIST / "logo-preview.png", 1024, 236, "#FFFFFF")
    rasterize(detailed, DIST / "leaf-preview.png", 512, 512, "#FFFFFF")

    subprocess.check_call(
        [
            "magick",
            str(DIST / "favicon-16x16.png"),
            str(DIST / "favicon-32x32.png"),
            str(DIST / "favicon-48x48.png"),
            str(DIST / "favicon.ico"),
        ]
    )
    print("wrote assets/favicon.ico")

    manifest = {
        "name": "SkillsPhase",
        "short_name": "SkillsPhase",
        "icons": [
            {
                "src": "https://cdn.skillsphase.com/assets/android-chrome-192x192.png",
                "sizes": "192x192",
                "type": "image/png",
            },
            {
                "src": "https://cdn.skillsphase.com/assets/android-chrome-512x512.png",
                "sizes": "512x512",
                "type": "image/png",
            },
        ],
        "theme_color": LEAF,
        "background_color": PORCELAIN,
        "display": "standalone",
        "start_url": "/",
    }
    (DIST / "site.webmanifest").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    print("wrote dist/site.webmanifest")
    print(f"leaf={LEAF} vein={VEIN} ink={INK}")


if __name__ == "__main__":
    main()
