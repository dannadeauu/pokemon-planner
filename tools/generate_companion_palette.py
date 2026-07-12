"""Compute a 'match companion' accent color for every companion sprite.

Picks the sprite's most dominant vibrant color, then darkens it just enough
that white text stays readable on it (relative luminance <= 0.30, roughly
3:1 contrast). Prints a JS object literal to paste into app.js.
"""

import io
import json
import ssl
import urllib.request
from colorsys import hsv_to_rgb, rgb_to_hsv

import certifi
from PIL import Image

SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())

COMPANIONS = [
    "pikachu", "pikachu-f", "pikachu-original", "eevee", "pidgey", "meowth",
    "mimikyu", "cosmog", "bidoof", "bulbasaur", "charmander", "squirtle",
    "chikorita", "cyndaquil", "totodile", "treecko", "torchic", "mudkip",
    "turtwig", "chimchar", "piplup", "snivy", "tepig", "oshawott", "fennekin",
    "froakie", "rowlet", "litten", "popplio", "grookey", "scorbunny", "sobble",
    "flareon", "vaporeon", "leafeon", "espeon", "sylveon", "umbreon",
    "glaceon", "jolteon",
]


def fetch_first_frame(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=SSL_CONTEXT) as r:
        return Image.open(io.BytesIO(r.read())).convert("RGBA")


def luminance(r, g, b):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def best_accent(img):
    counts = {}
    for r, g, b, a in img.getdata():
        if a < 128:
            continue
        counts[(r // 16, g // 16, b // 16)] = counts.get((r // 16, g // 16, b // 16), 0) + 1
    best, best_score = None, -1.0
    for (rq, gq, bq), n in counts.items():
        r, g, b = rq * 16 + 8, gq * 16 + 8, bq * 16 + 8
        h, s, v = rgb_to_hsv(r / 255, g / 255, b / 255)
        lum = luminance(r, g, b)
        if lum > 0.8 or lum < 0.02:
            continue
        score = n * (s ** 1.5) * (0.5 + v / 2)
        if s < 0.15:
            score *= 0.05
        if score > best_score:
            best_score, best = score, (h, s, v)
    if best is None:
        return "#a9abb3"
    h, s, v = best
    s = min(1.0, s * 1.15)
    for _ in range(60):
        r, g, b = (int(round(c * 255)) for c in hsv_to_rgb(h, s, v))
        if luminance(r, g, b) <= 0.30:
            break
        v *= 0.96
    return f"#{r:02x}{g:02x}{b:02x}"


def main():
    palette = {}
    for name in COMPANIONS:
        for variant, folder in (("", "gen5ani"), ("_shiny", "gen5ani-shiny")):
            key = name + variant
            try:
                img = fetch_first_frame(
                    f"https://play.pokemonshowdown.com/sprites/{folder}/{name}.gif"
                )
                palette[key] = best_accent(img)
            except Exception as err:
                fallback = palette.get(name, "#a9abb3")
                palette[key] = fallback
                print(f"// warn: {key} failed ({err}), using {fallback}")
    print(json.dumps(palette, indent=2))


if __name__ == "__main__":
    main()
