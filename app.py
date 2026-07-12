import io
import random
import ssl
import sqlite3
import sys
import threading
import urllib.request
import webbrowser
from pathlib import Path

import certifi
from flask import Flask, g, jsonify, render_template, request, send_file
from PIL import Image, ImageSequence

SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())

STATUSES = ("not started", "in progress", "done!")
PORT = 5050
SHINY_CHANCE = 0.10

# Each entry is a 3-stage evolution line: ((dex ids), (showdown names)),
# one dex id / name per stage. The status index (0/1/2) selects which stage
# is shown for an item. Every 3-stage line from the national dex is here,
# except lines where any stage lacks an animated sprite or box icon upstream.
# NOTE: saved tasks reference these by index - only append, never reorder.
POKEMON_FAMILIES = (
    ((1, 2, 3), ("bulbasaur", "ivysaur", "venusaur")),
    ((4, 5, 6), ("charmander", "charmeleon", "charizard")),
    ((7, 8, 9), ("squirtle", "wartortle", "blastoise")),
    ((10, 11, 12), ("caterpie", "metapod", "butterfree")),
    ((13, 14, 15), ("weedle", "kakuna", "beedrill")),
    ((16, 17, 18), ("pidgey", "pidgeotto", "pidgeot")),
    ((63, 64, 65), ("abra", "kadabra", "alakazam")),
    ((66, 67, 68), ("machop", "machoke", "machamp")),
    ((92, 93, 94), ("gastly", "haunter", "gengar")),
    ((147, 148, 149), ("dratini", "dragonair", "dragonite")),
    ((152, 153, 154), ("chikorita", "bayleef", "meganium")),
    ((155, 156, 157), ("cyndaquil", "quilava", "typhlosion")),
    ((158, 159, 160), ("totodile", "croconaw", "feraligatr")),
    ((252, 253, 254), ("treecko", "grovyle", "sceptile")),
    ((255, 256, 257), ("torchic", "combusken", "blaziken")),
    ((258, 259, 260), ("mudkip", "marshtomp", "swampert")),
    ((280, 281, 282), ("ralts", "kirlia", "gardevoir")),
    ((328, 329, 330), ("trapinch", "vibrava", "flygon")),
    ((172, 25, 26), ("pichu", "pikachu", "raichu")),
    ((29, 30, 31), ("nidoranf", "nidorina", "nidoqueen")),
    ((32, 33, 34), ("nidoranm", "nidorino", "nidoking")),
    ((173, 35, 36), ("cleffa", "clefairy", "clefable")),
    ((174, 39, 40), ("igglybuff", "jigglypuff", "wigglytuff")),
    ((41, 42, 169), ("zubat", "golbat", "crobat")),
    ((43, 44, 45), ("oddish", "gloom", "vileplume")),
    ((60, 61, 62), ("poliwag", "poliwhirl", "poliwrath")),
    ((69, 70, 71), ("bellsprout", "weepinbell", "victreebel")),
    ((74, 75, 76), ("geodude", "graveler", "golem")),
    ((81, 82, 462), ("magnemite", "magneton", "magnezone")),
    ((111, 112, 464), ("rhyhorn", "rhydon", "rhyperior")),
    ((440, 113, 242), ("happiny", "chansey", "blissey")),
    ((116, 117, 230), ("horsea", "seadra", "kingdra")),
    ((239, 125, 466), ("elekid", "electabuzz", "electivire")),
    ((240, 126, 467), ("magby", "magmar", "magmortar")),
    ((137, 233, 474), ("porygon", "porygon2", "porygonz")),
    ((175, 176, 468), ("togepi", "togetic", "togekiss")),
    ((179, 180, 181), ("mareep", "flaaffy", "ampharos")),
    ((298, 183, 184), ("azurill", "marill", "azumarill")),
    ((187, 188, 189), ("hoppip", "skiploom", "jumpluff")),
    ((220, 221, 473), ("swinub", "piloswine", "mamoswine")),
    ((246, 247, 248), ("larvitar", "pupitar", "tyranitar")),
    ((265, 266, 267), ("wurmple", "silcoon", "beautifly")),
    ((270, 271, 272), ("lotad", "lombre", "ludicolo")),
    ((273, 274, 275), ("seedot", "nuzleaf", "shiftry")),
    ((287, 288, 289), ("slakoth", "vigoroth", "slaking")),
    ((293, 294, 295), ("whismur", "loudred", "exploud")),
    ((304, 305, 306), ("aron", "lairon", "aggron")),
    ((406, 315, 407), ("budew", "roselia", "roserade")),
    ((355, 356, 477), ("duskull", "dusclops", "dusknoir")),
    ((363, 364, 365), ("spheal", "sealeo", "walrein")),
    ((371, 372, 373), ("bagon", "shelgon", "salamence")),
    ((374, 375, 376), ("beldum", "metang", "metagross")),
    ((396, 397, 398), ("starly", "staravia", "staraptor")),
    ((403, 404, 405), ("shinx", "luxio", "luxray")),
    ((443, 444, 445), ("gible", "gabite", "garchomp")),
    ((506, 507, 508), ("lillipup", "herdier", "stoutland")),
    ((519, 520, 521), ("pidove", "tranquill", "unfezant")),
    ((524, 525, 526), ("roggenrola", "boldore", "gigalith")),
    ((532, 533, 534), ("timburr", "gurdurr", "conkeldurr")),
    ((535, 536, 537), ("tympole", "palpitoad", "seismitoad")),
    ((540, 541, 542), ("sewaddle", "swadloon", "leavanny")),
    ((543, 544, 545), ("venipede", "whirlipede", "scolipede")),
    ((551, 552, 553), ("sandile", "krokorok", "krookodile")),
    ((574, 575, 576), ("gothita", "gothorita", "gothitelle")),
    ((577, 578, 579), ("solosis", "duosion", "reuniclus")),
    ((582, 583, 584), ("vanillite", "vanillish", "vanilluxe")),
    ((599, 600, 601), ("klink", "klang", "klinklang")),
    ((602, 603, 604), ("tynamo", "eelektrik", "eelektross")),
    ((607, 608, 609), ("litwick", "lampent", "chandelure")),
    ((610, 611, 612), ("axew", "fraxure", "haxorus")),
    ((633, 634, 635), ("deino", "zweilous", "hydreigon")),
    ((650, 651, 652), ("chespin", "quilladin", "chesnaught")),
    ((653, 654, 655), ("fennekin", "braixen", "delphox")),
    ((656, 657, 658), ("froakie", "frogadier", "greninja")),
    ((661, 662, 663), ("fletchling", "fletchinder", "talonflame")),
    ((664, 665, 666), ("scatterbug", "spewpa", "vivillon")),
    ((669, 670, 671), ("flabebe", "floette", "florges")),
    ((704, 705, 706), ("goomy", "sliggoo", "goodra")),
    ((722, 723, 724), ("rowlet", "dartrix", "decidueye")),
    ((725, 726, 727), ("litten", "torracat", "incineroar")),
    ((728, 729, 730), ("popplio", "brionne", "primarina")),
    ((731, 732, 733), ("pikipek", "trumbeak", "toucannon")),
    ((736, 737, 738), ("grubbin", "charjabug", "vikavolt")),
    ((761, 762, 763), ("bounsweet", "steenee", "tsareena")),
    ((782, 783, 784), ("jangmoo", "hakamoo", "kommoo")),
    ((789, 790, 791), ("cosmog", "cosmoem", "solgaleo")),
    ((821, 822, 823), ("rookidee", "corvisquire", "corviknight")),
    ((824, 825, 826), ("blipbug", "dottler", "orbeetle")),
    ((837, 838, 839), ("rolycoly", "carkol", "coalossal")),
    ((856, 857, 858), ("hatenna", "hattrem", "hatterene")),
    ((859, 860, 861), ("impidimp", "morgrem", "grimmsnarl")),
    ((885, 886, 887), ("dreepy", "drakloak", "dragapult")),
    ((679, 680, 681), ("honedge", "doublade", "aegislash")),
    ((387, 388, 389), ("turtwig", "grotle", "torterra")),
    ((390, 391, 392), ("chimchar", "monferno", "infernape")),
    ((393, 394, 395), ("piplup", "prinplup", "empoleon")),
    ((495, 496, 497), ("snivy", "servine", "serperior")),
    ((498, 499, 500), ("tepig", "pignite", "emboar")),
    ((501, 502, 503), ("oshawott", "dewott", "samurott")),
    ((810, 811, 812), ("grookey", "thwackey", "rillaboom")),
    ((813, 814, 815), ("scorbunny", "raboot", "cinderace")),
    ((816, 817, 818), ("sobble", "drizzile", "inteleon")),
    ((43, 44, 182), ("oddish", "gloom", "bellossom")),
    ((60, 61, 186), ("poliwag", "poliwhirl", "politoed")),
    ((265, 268, 269), ("wurmple", "cascoon", "dustox")),
    ((280, 281, 475), ("ralts", "kirlia", "gallade")),
    ((789, 790, 792), ("cosmog", "cosmoem", "lunala")),
    ((439, 122, 866), ("mimejr", "mrmime", "mrrime")),
    ((263, 264, 862), ("zigzagoon", "linoone", "obstagoon")),
)

ICON_SPRITE_BASE = (
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/"
    "pokemon/versions/generation-viii/icons"
)
ICON_SPRITE_SHINY_BASE = (
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny"
)
ITEM_SPRITE_BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items"

# Mega Evolution only exists for fully-evolved species that got one in the games.
# Charizard has two (X and Y) - everyone else who has one only has one.
# Keyed by index into POKEMON_FAMILIES. Each option is
# (showdown sprite slug, extended dex id for icons, mega stone item slug).
MEGA_DATA = {
    0: [("venusaur-mega", 10033, "venusaurite")],
    1: [("charizard-megax", 10034, "charizardite-x"), ("charizard-megay", 10035, "charizardite-y")],
    2: [("blastoise-mega", 10036, "blastoisinite")],
    4: [("beedrill-mega", 10090, "beedrillite")],
    5: [("pidgeot-mega", 10073, "pidgeotite")],
    6: [("alakazam-mega", 10037, "alakazite")],
    8: [("gengar-mega", 10038, "gengarite")],
    13: [("sceptile-mega", 10065, "sceptilite")],
    14: [("blaziken-mega", 10050, "blazikenite")],
    15: [("swampert-mega", 10064, "swampertite")],
    16: [("gardevoir-mega", 10051, "gardevoirite")],
    36: [("ampharos-mega", 10045, "ampharosite")],
    40: [("tyranitar-mega", 10049, "tyranitarite")],
    46: [("aggron-mega", 10053, "aggronite")],
    50: [("salamence-mega", 10089, "salamencite")],
    51: [("metagross-mega", 10076, "metagrossite")],
    54: [("garchomp-mega", 10058, "garchompite")],
    105: [("gallade-mega", 10068, "galladite")],
}


def pokemon_for(row):
    stage = STATUSES.index(row["status"])
    dex_ids, names = POKEMON_FAMILIES[row["pokemon_family"]]
    shiny = bool(row["is_shiny"])

    mega_options = MEGA_DATA.get(row["pokemon_family"])
    mega_available = mega_options is not None and stage == 2
    mega_active = mega_available and bool(row["is_mega"])
    variant = row["mega_variant"] or 0

    if mega_active:
        mega_name, mega_dex_id, _stone_item = mega_options[variant]
        name, dex_id = mega_name, mega_dex_id
    else:
        name, dex_id = names[stage], dex_ids[stage]

    sprite_variant = "ani-shiny" if shiny else "ani"
    icon_url = f"/sprites/icon/{dex_id}.png"
    if shiny:
        icon_url += "?shiny=1"

    mega_field = None
    if mega_available and not mega_active:
        mega_field = [
            {"variant": i, "stone_icon": f"/sprites/item/{stone_item}.png"}
            for i, (_, _, stone_item) in enumerate(mega_options)
        ]

    return {
        "name": name,
        "dex_id": dex_id,
        "shiny": shiny,
        "sprite": f"https://play.pokemonshowdown.com/sprites/{sprite_variant}/{name}.gif",
        "icon": icon_url,
        "mega_active": mega_active,
        "mega": mega_field,
    }


def todo_dict(row):
    d = dict(row)
    d["pokemon"] = pokemon_for(row)
    return d


def resource_path(relative_path):
    """Location of bundled templates/static files, whether running from source or from a frozen executable."""
    base_path = getattr(sys, "_MEIPASS", Path(__file__).parent)
    return str(Path(base_path) / relative_path)


def data_dir():
    """Persistent, writable location for the database, independent of where the app is installed or extracted."""
    directory = Path.home() / ".todo-app"
    directory.mkdir(exist_ok=True)
    return directory


DB_PATH = data_dir() / "todos.db"


def sprite_cache_dir():
    directory = data_dir() / "sprite_cache"
    directory.mkdir(exist_ok=True)
    return directory


def cropped_sprite_path(cache_key, source_url):
    """Download a sprite once, trim its transparent padding, and cache the result locally."""
    cache_path = sprite_cache_dir() / f"{cache_key}.png"
    if not cache_path.exists():
        with urllib.request.urlopen(source_url, context=SSL_CONTEXT) as response:
            raw = response.read()
        image = Image.open(io.BytesIO(raw)).convert("RGBA")
        bbox = image.getbbox()
        if bbox:
            image = image.crop(bbox)
        image.save(cache_path)
    return cache_path


def cropped_icon_path(dex_id, shiny=False):
    base = ICON_SPRITE_SHINY_BASE if shiny else ICON_SPRITE_BASE
    cache_key = f"{dex_id}_shiny" if shiny else f"{dex_id}"
    return cropped_sprite_path(cache_key, f"{base}/{dex_id}.png")


MEGA_STONE_ITEMS = {entry[2] for options in MEGA_DATA.values() for entry in options}


def cropped_item_path(item_slug):
    return cropped_sprite_path(f"item_{item_slug}", f"{ITEM_SPRITE_BASE}/{item_slug}.png")


# These companion sprites sit on a much larger canvas than the others (lots of
# transparent padding), which made them render tiny relative to everything
# else at the same target width. Crop every frame to the same bounding box
# (the union of visible content across the whole animation) so the animation
# still plays correctly, just without the wasted margin.
COMPANION_GIF_BASE = "https://play.pokemonshowdown.com/sprites/gen5ani"
COMPANION_GIF_SHINY_BASE = "https://play.pokemonshowdown.com/sprites/gen5ani-shiny"
COMPANION_CROP_OVERRIDES = {"grookey", "scorbunny", "sobble"}


def cropped_companion_gif_path(name, shiny=False):
    cache_path = sprite_cache_dir() / (f"companion_{name}_shiny.gif" if shiny else f"companion_{name}.gif")
    if not cache_path.exists():
        base = COMPANION_GIF_SHINY_BASE if shiny else COMPANION_GIF_BASE
        url = f"{base}/{name}.gif"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=SSL_CONTEXT) as response:
            raw = response.read()
        original = Image.open(io.BytesIO(raw))

        frames = []
        durations = []
        union = None
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

        cropped = [frame.crop(union) for frame in frames]
        cropped[0].save(
            cache_path,
            save_all=True,
            append_images=cropped[1:],
            duration=durations,
            loop=original.info.get("loop", 0),
            disposal=2,
        )
    return cache_path


app = Flask(
    __name__,
    template_folder=resource_path("templates"),
    static_folder=resource_path("static"),
)
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
app.config["TEMPLATES_AUTO_RELOAD"] = True


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    with sqlite3.connect(DB_PATH) as db:
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'not started',
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            )
            """
        )
        columns = [row[1] for row in db.execute("PRAGMA table_info(todos)")]
        if "pokemon_family" not in columns:
            db.execute("ALTER TABLE todos ADD COLUMN pokemon_family INTEGER")
        if "is_shiny" not in columns:
            db.execute("ALTER TABLE todos ADD COLUMN is_shiny INTEGER NOT NULL DEFAULT 0")
        if "is_mega" not in columns:
            db.execute("ALTER TABLE todos ADD COLUMN is_mega INTEGER NOT NULL DEFAULT 0")
        if "mega_variant" not in columns:
            db.execute("ALTER TABLE todos ADD COLUMN mega_variant INTEGER NOT NULL DEFAULT 0")
        if "position" not in columns:
            db.execute("ALTER TABLE todos ADD COLUMN position INTEGER")
        db.execute(
            "UPDATE todos SET pokemon_family = ABS(RANDOM() % ?) WHERE pokemon_family IS NULL",
            (len(POKEMON_FAMILIES),),
        )
        # Negative id preserves the original newest-first order (ascending
        # position) for rows that predate the position column.
        db.execute("UPDATE todos SET position = -id WHERE position IS NULL")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/sprites/icon/<int:dex_id>.png")
def sprite_icon(dex_id):
    shiny = request.args.get("shiny") == "1"
    return send_file(cropped_icon_path(dex_id, shiny), mimetype="image/png")


@app.route("/sprites/item/<item_slug>.png")
def sprite_item(item_slug):
    if item_slug not in MEGA_STONE_ITEMS:
        return jsonify({"error": "unknown item"}), 404
    return send_file(cropped_item_path(item_slug), mimetype="image/png")


@app.route("/api/pokedex", methods=["GET"])
def pokedex_entries():
    """Every unique form in the roster, ordered by national dex number with
    mega forms right after their base form."""
    entries = {}
    for family_index, (dex_ids, names) in enumerate(POKEMON_FAMILIES):
        for stage in range(3):
            key = str(dex_ids[stage])
            if key not in entries:
                entries[key] = {
                    "icon_dex": dex_ids[stage],
                    "name": names[stage],
                    "label": f"{dex_ids[stage]:04d}",
                    "sort": dex_ids[stage] * 10,
                }
        for variant_index, (slug, mega_dex, _stone) in enumerate(MEGA_DATA.get(family_index, [])):
            key = str(mega_dex)
            if key not in entries:
                base = dex_ids[2]
                if slug.endswith("megax"):
                    suffix = " M-X"
                elif slug.endswith("megay"):
                    suffix = " M-Y"
                else:
                    suffix = " M"
                entries[key] = {
                    "icon_dex": mega_dex,
                    "name": slug,
                    "label": f"{base:04d}{suffix}",
                    "sort": base * 10 + 1 + variant_index,
                }
    return jsonify(sorted(entries.values(), key=lambda e: e["sort"]))


@app.route("/sprites/companion/<name>.gif")
def sprite_companion(name):
    if name not in COMPANION_CROP_OVERRIDES:
        return jsonify({"error": "unknown companion"}), 404
    shiny = request.args.get("shiny") == "1"
    return send_file(cropped_companion_gif_path(name, shiny), mimetype="image/gif")


@app.route("/api/todos", methods=["GET"])
def list_todos():
    db = get_db()
    rows = db.execute("SELECT * FROM todos ORDER BY position ASC, id DESC").fetchall()
    return jsonify([todo_dict(row) for row in rows])


@app.route("/api/todos", methods=["POST"])
def create_todo():
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "text is required"}), 400

    db = get_db()
    family = random.randrange(len(POKEMON_FAMILIES))
    is_shiny = 1 if random.random() < SHINY_CHANCE else 0
    # New items always land at the very top, same as the old newest-first order.
    min_position = db.execute("SELECT MIN(position) AS m FROM todos").fetchone()["m"]
    new_position = (min_position - 1) if min_position is not None else 0
    cur = db.execute(
        "INSERT INTO todos (text, status, pokemon_family, is_shiny, position) VALUES (?, ?, ?, ?, ?)",
        (text, "not started", family, is_shiny, new_position),
    )
    db.commit()
    row = db.execute("SELECT * FROM todos WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(todo_dict(row)), 201


@app.route("/api/todos/reorder", methods=["POST"])
def reorder_todos():
    data = request.get_json(silent=True) or {}
    order = data.get("order")
    if not isinstance(order, list) or not order:
        return jsonify({"error": "order must be a non-empty list of ids"}), 400

    db = get_db()
    for index, todo_id in enumerate(order):
        db.execute("UPDATE todos SET position = ? WHERE id = ?", (index, todo_id))
    db.commit()
    rows = db.execute("SELECT * FROM todos ORDER BY position ASC, id DESC").fetchall()
    return jsonify([todo_dict(row) for row in rows])


@app.route("/api/todos/<int:todo_id>", methods=["PATCH"])
def update_todo(todo_id):
    data = request.get_json(silent=True) or {}
    db = get_db()

    if "status" in data:
        if data["status"] not in STATUSES:
            return jsonify({"error": f"status must be one of {STATUSES}"}), 400
        # Mega Evolution only holds while an item stays done!, same as it only
        # lasts for a battle in the games - leaving done! reverts it.
        db.execute(
            "UPDATE todos SET status = ?, is_mega = 0 WHERE id = ?", (data["status"], todo_id)
        )

    if "text" in data:
        text = (data.get("text") or "").strip()
        if not text:
            return jsonify({"error": "text cannot be empty"}), 400
        db.execute("UPDATE todos SET text = ? WHERE id = ?", (text, todo_id))

    db.commit()
    row = db.execute("SELECT * FROM todos WHERE id = ?", (todo_id,)).fetchone()
    if row is None:
        return jsonify({"error": "not found"}), 404
    return jsonify(todo_dict(row))


@app.route("/api/todos/<int:todo_id>/mega", methods=["POST"])
def mega_evolve(todo_id):
    data = request.get_json(silent=True) or {}
    variant = data.get("variant", 0)

    db = get_db()
    row = db.execute("SELECT * FROM todos WHERE id = ?", (todo_id,)).fetchone()
    if row is None:
        return jsonify({"error": "not found"}), 404
    if row["status"] != "done!":
        return jsonify({"error": "item must be done! to mega evolve"}), 400
    mega_options = MEGA_DATA.get(row["pokemon_family"])
    if mega_options is None:
        return jsonify({"error": "this pokemon has no mega evolution"}), 400
    if not isinstance(variant, int) or not (0 <= variant < len(mega_options)):
        return jsonify({"error": "invalid mega variant"}), 400

    db.execute(
        "UPDATE todos SET is_mega = 1, mega_variant = ? WHERE id = ?", (variant, todo_id)
    )
    db.commit()
    row = db.execute("SELECT * FROM todos WHERE id = ?", (todo_id,)).fetchone()
    return jsonify(todo_dict(row))


@app.route("/api/todos/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id):
    db = get_db()
    db.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
    db.commit()
    return "", 204


@app.route("/api/stats", methods=["GET"])
def stats():
    """Backend calculations over the todos database, returned to the frontend."""
    db = get_db()
    rows = db.execute(
        "SELECT status, COUNT(*) AS count FROM todos GROUP BY status"
    ).fetchall()
    counts = {status: 0 for status in STATUSES}
    for row in rows:
        counts[row["status"]] = row["count"]

    total = sum(counts.values())
    # In-progress tasks count for half of a completed task.
    progress_score = counts["done!"] + counts["in progress"] / 2
    percent_done = round((progress_score / total) * 100, 1) if total else 0.0

    return jsonify(
        {
            "total": total,
            "counts": counts,
            "percent_done": percent_done,
        }
    )


def open_browser():
    webbrowser.open(f"http://127.0.0.1:{PORT}")


if __name__ == "__main__":
    init_db()
    threading.Timer(1.0, open_browser).start()
    app.run(host="0.0.0.0", port=PORT, debug=False)
