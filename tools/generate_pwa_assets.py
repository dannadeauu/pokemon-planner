"""Pre-generate every sprite the PWA needs as static files.

The Flask app crops sprites on demand (trimming transparent padding) and
caches them server-side. GitHub Pages can't run Python, so this script does
all of that cropping once at build time and writes the results into docs/,
where the static app references them by path.

Run from the repo root:  python3 tools/generate_pwa_assets.py
"""

import io
import json
import ssl
import urllib.request
from pathlib import Path

import certifi
from PIL import Image, ImageDraw, ImageSequence

SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
DOCS = Path(__file__).resolve().parent.parent / "docs"

# All dex ids (evolution stages + mega forms) and mega stone slugs the app
# references, kept in sync with POKEMON_FAMILIES / MEGA_DATA.
MANIFEST = json.loads((Path(__file__).resolve().parent / "assets_manifest.json").read_text())
ICON_DEX_IDS = MANIFEST["icon_dex_ids"]
MEGA_STONES = MANIFEST["stones"]
CROPPED_COMPANIONS = ("grookey", "scorbunny", "sobble", "froakie")

ICON_BASE = (
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/"
    "pokemon/versions/generation-viii/icons"
)
SHINY_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny"
ITEM_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items"
COMPANION_BASE = "https://play.pokemonshowdown.com/sprites/gen5ani"
COMPANION_SHINY_BASE = "https://play.pokemonshowdown.com/sprites/gen5ani-shiny"

ACCENT = (111, 143, 82, 255)  # --color-add


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=SSL_CONTEXT) as response:
        return response.read()


def cropped_png(url, dest):
    image = Image.open(io.BytesIO(fetch(url))).convert("RGBA")
    bbox = image.getbbox()
    if bbox:
        image = image.crop(bbox)
    image.save(dest)


def cropped_gif(url, dest):
    original = Image.open(io.BytesIO(fetch(url)))
    frames, durations, union = [], [], None
    for frame in ImageSequence.Iterator(original):
        rgba = frame.convert("RGBA")
        frames.append(rgba)
        durations.append(frame.info.get("duration", 100))
        bbox = rgba.getbbox()
        if bbox:
            if union is None:
                union = list(bbox)
            else:
                union[0] = min(union[0], bbox[0])
                union[1] = min(union[1], bbox[1])
                union[2] = max(union[2], bbox[2])
                union[3] = max(union[3], bbox[3])
    if union is None:
        union = (0, 0, original.width, original.height)
    cropped = [frame.crop(tuple(union)) for frame in frames]
    cropped[0].save(
        dest, save_all=True, append_images=cropped[1:], duration=durations,
        loop=original.info.get("loop", 0), disposal=2,
    )


def generate_pokemon_icons():
    out = DOCS / "sprites" / "icon"
    out.mkdir(parents=True, exist_ok=True)
    for dex in ICON_DEX_IDS:
        if (out / f"{dex}.png").exists() and (out / f"{dex}_shiny.png").exists():
            continue
        cropped_png(f"{ICON_BASE}/{dex}.png", out / f"{dex}.png")
        try:
            cropped_png(f"{SHINY_BASE}/{dex}.png", out / f"{dex}_shiny.png")
        except urllib.error.HTTPError:
            # A few forms have no shiny sprite upstream; fall back to normal.
            (out / f"{dex}_shiny.png").write_bytes((out / f"{dex}.png").read_bytes())
            print(f"  (no shiny for {dex}, used normal)")
    print(f"icons: {len(list(out.glob('*.png')))} files")


def generate_mega_stones():
    out = DOCS / "sprites" / "item"
    out.mkdir(parents=True, exist_ok=True)
    for slug in MEGA_STONES:
        cropped_png(f"{ITEM_BASE}/{slug}.png", out / f"{slug}.png")
    print(f"items: {len(list(out.glob('*.png')))} files")


def generate_companions():
    out = DOCS / "sprites" / "companion"
    out.mkdir(parents=True, exist_ok=True)
    for name in CROPPED_COMPANIONS:
        cropped_gif(f"{COMPANION_BASE}/{name}.gif", out / f"{name}.gif")
        cropped_gif(f"{COMPANION_SHINY_BASE}/{name}.gif", out / f"{name}_shiny.gif")
    print(f"companions: {len(list(out.glob('*.gif')))} files")


def rounded_rect_mask(size, radius):
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def make_app_icon(size, sprite, sprite_fraction, rounded, dest):
    icon = Image.new("RGBA", (size, size), ACCENT)
    target = int(size * sprite_fraction)
    scale = target / max(sprite.size)
    scaled = sprite.resize(
        (int(sprite.width * scale), int(sprite.height * scale)), Image.NEAREST
    )
    icon.alpha_composite(
        scaled, ((size - scaled.width) // 2, (size - scaled.height) // 2)
    )
    if rounded:
        icon.putalpha(rounded_rect_mask(size, size // 5))
    icon.save(dest)


def generate_app_icons():
    out = DOCS / "icons"
    out.mkdir(parents=True, exist_ok=True)
    sprite = Image.open(io.BytesIO(fetch(f"{ICON_BASE}/25.png"))).convert("RGBA")
    sprite = sprite.crop(sprite.getbbox())
    make_app_icon(512, sprite, 0.68, True, out / "icon-512.png")
    make_app_icon(192, sprite, 0.68, True, out / "icon-192.png")
    make_app_icon(512, sprite, 0.52, False, out / "icon-maskable-512.png")
    apple = Image.new("RGBA", (180, 180), ACCENT)
    target = int(180 * 0.68)
    scale = target / max(sprite.size)
    scaled = sprite.resize(
        (int(sprite.width * scale), int(sprite.height * scale)), Image.NEAREST
    )
    apple.alpha_composite(scaled, ((180 - scaled.width) // 2, (180 - scaled.height) // 2))
    apple.convert("RGB").save(out / "apple-touch-icon.png")
    print("app icons: 4 files")


if __name__ == "__main__":
    generate_pokemon_icons()
    generate_mega_stones()
    generate_companions()
    generate_app_icons()
    print("done")
