const STATUSES = ["not started", "in progress", "done!"];
const STATUS_LABELS = {
  "not started": "not started",
  "in progress": "in progress...",
  "done!": "done!",
};
const TEAM_SIZE = 6;

// ---------------------------------------------------------------------------
// Data layer. This PWA runs entirely on-device: tasks live in localStorage
// and the evolutionary-line logic (ported from the original Python backend)
// runs right here. No server needed.
// ---------------------------------------------------------------------------

const SHINY_CHANCE = 0.1;

// Each entry is a 3-stage evolution line: [[dex ids], [showdown names]],
// one dex id / name per stage. The status index (0/1/2) selects which stage
// is shown for an item. Every 3-stage line from the national dex is here,
// except lines where any stage lacks an animated sprite or box icon upstream.
// NOTE: saved tasks reference these by index - only append, never reorder.
const POKEMON_FAMILIES = [
  [[1, 2, 3], ["bulbasaur", "ivysaur", "venusaur"]],
  [[4, 5, 6], ["charmander", "charmeleon", "charizard"]],
  [[7, 8, 9], ["squirtle", "wartortle", "blastoise"]],
  [[10, 11, 12], ["caterpie", "metapod", "butterfree"]],
  [[13, 14, 15], ["weedle", "kakuna", "beedrill"]],
  [[16, 17, 18], ["pidgey", "pidgeotto", "pidgeot"]],
  [[63, 64, 65], ["abra", "kadabra", "alakazam"]],
  [[66, 67, 68], ["machop", "machoke", "machamp"]],
  [[92, 93, 94], ["gastly", "haunter", "gengar"]],
  [[147, 148, 149], ["dratini", "dragonair", "dragonite"]],
  [[152, 153, 154], ["chikorita", "bayleef", "meganium"]],
  [[155, 156, 157], ["cyndaquil", "quilava", "typhlosion"]],
  [[158, 159, 160], ["totodile", "croconaw", "feraligatr"]],
  [[252, 253, 254], ["treecko", "grovyle", "sceptile"]],
  [[255, 256, 257], ["torchic", "combusken", "blaziken"]],
  [[258, 259, 260], ["mudkip", "marshtomp", "swampert"]],
  [[280, 281, 282], ["ralts", "kirlia", "gardevoir"]],
  [[328, 329, 330], ["trapinch", "vibrava", "flygon"]],
  [[172, 25, 26], ["pichu", "pikachu", "raichu"]],
  [[29, 30, 31], ["nidoranf", "nidorina", "nidoqueen"]],
  [[32, 33, 34], ["nidoranm", "nidorino", "nidoking"]],
  [[173, 35, 36], ["cleffa", "clefairy", "clefable"]],
  [[174, 39, 40], ["igglybuff", "jigglypuff", "wigglytuff"]],
  [[41, 42, 169], ["zubat", "golbat", "crobat"]],
  [[43, 44, 45], ["oddish", "gloom", "vileplume"]],
  [[60, 61, 62], ["poliwag", "poliwhirl", "poliwrath"]],
  [[69, 70, 71], ["bellsprout", "weepinbell", "victreebel"]],
  [[74, 75, 76], ["geodude", "graveler", "golem"]],
  [[81, 82, 462], ["magnemite", "magneton", "magnezone"]],
  [[111, 112, 464], ["rhyhorn", "rhydon", "rhyperior"]],
  [[440, 113, 242], ["happiny", "chansey", "blissey"]],
  [[116, 117, 230], ["horsea", "seadra", "kingdra"]],
  [[239, 125, 466], ["elekid", "electabuzz", "electivire"]],
  [[240, 126, 467], ["magby", "magmar", "magmortar"]],
  [[137, 233, 474], ["porygon", "porygon2", "porygonz"]],
  [[175, 176, 468], ["togepi", "togetic", "togekiss"]],
  [[179, 180, 181], ["mareep", "flaaffy", "ampharos"]],
  [[298, 183, 184], ["azurill", "marill", "azumarill"]],
  [[187, 188, 189], ["hoppip", "skiploom", "jumpluff"]],
  [[220, 221, 473], ["swinub", "piloswine", "mamoswine"]],
  [[246, 247, 248], ["larvitar", "pupitar", "tyranitar"]],
  [[265, 266, 267], ["wurmple", "silcoon", "beautifly"]],
  [[270, 271, 272], ["lotad", "lombre", "ludicolo"]],
  [[273, 274, 275], ["seedot", "nuzleaf", "shiftry"]],
  [[287, 288, 289], ["slakoth", "vigoroth", "slaking"]],
  [[293, 294, 295], ["whismur", "loudred", "exploud"]],
  [[304, 305, 306], ["aron", "lairon", "aggron"]],
  [[406, 315, 407], ["budew", "roselia", "roserade"]],
  [[355, 356, 477], ["duskull", "dusclops", "dusknoir"]],
  [[363, 364, 365], ["spheal", "sealeo", "walrein"]],
  [[371, 372, 373], ["bagon", "shelgon", "salamence"]],
  [[374, 375, 376], ["beldum", "metang", "metagross"]],
  [[396, 397, 398], ["starly", "staravia", "staraptor"]],
  [[403, 404, 405], ["shinx", "luxio", "luxray"]],
  [[443, 444, 445], ["gible", "gabite", "garchomp"]],
  [[506, 507, 508], ["lillipup", "herdier", "stoutland"]],
  [[519, 520, 521], ["pidove", "tranquill", "unfezant"]],
  [[524, 525, 526], ["roggenrola", "boldore", "gigalith"]],
  [[532, 533, 534], ["timburr", "gurdurr", "conkeldurr"]],
  [[535, 536, 537], ["tympole", "palpitoad", "seismitoad"]],
  [[540, 541, 542], ["sewaddle", "swadloon", "leavanny"]],
  [[543, 544, 545], ["venipede", "whirlipede", "scolipede"]],
  [[551, 552, 553], ["sandile", "krokorok", "krookodile"]],
  [[574, 575, 576], ["gothita", "gothorita", "gothitelle"]],
  [[577, 578, 579], ["solosis", "duosion", "reuniclus"]],
  [[582, 583, 584], ["vanillite", "vanillish", "vanilluxe"]],
  [[599, 600, 601], ["klink", "klang", "klinklang"]],
  [[602, 603, 604], ["tynamo", "eelektrik", "eelektross"]],
  [[607, 608, 609], ["litwick", "lampent", "chandelure"]],
  [[610, 611, 612], ["axew", "fraxure", "haxorus"]],
  [[633, 634, 635], ["deino", "zweilous", "hydreigon"]],
  [[650, 651, 652], ["chespin", "quilladin", "chesnaught"]],
  [[653, 654, 655], ["fennekin", "braixen", "delphox"]],
  [[656, 657, 658], ["froakie", "frogadier", "greninja"]],
  [[661, 662, 663], ["fletchling", "fletchinder", "talonflame"]],
  [[664, 665, 666], ["scatterbug", "spewpa", "vivillon"]],
  [[669, 670, 671], ["flabebe", "floette", "florges"]],
  [[704, 705, 706], ["goomy", "sliggoo", "goodra"]],
  [[722, 723, 724], ["rowlet", "dartrix", "decidueye"]],
  [[725, 726, 727], ["litten", "torracat", "incineroar"]],
  [[728, 729, 730], ["popplio", "brionne", "primarina"]],
  [[731, 732, 733], ["pikipek", "trumbeak", "toucannon"]],
  [[736, 737, 738], ["grubbin", "charjabug", "vikavolt"]],
  [[761, 762, 763], ["bounsweet", "steenee", "tsareena"]],
  [[782, 783, 784], ["jangmoo", "hakamoo", "kommoo"]],
  [[789, 790, 791], ["cosmog", "cosmoem", "solgaleo"]],
  [[821, 822, 823], ["rookidee", "corvisquire", "corviknight"]],
  [[824, 825, 826], ["blipbug", "dottler", "orbeetle"]],
  [[837, 838, 839], ["rolycoly", "carkol", "coalossal"]],
  [[856, 857, 858], ["hatenna", "hattrem", "hatterene"]],
  [[859, 860, 861], ["impidimp", "morgrem", "grimmsnarl"]],
  [[885, 886, 887], ["dreepy", "drakloak", "dragapult"]],
  [[679, 680, 681], ["honedge", "doublade", "aegislash"]],
  [[387, 388, 389], ["turtwig", "grotle", "torterra"]],
  [[390, 391, 392], ["chimchar", "monferno", "infernape"]],
  [[393, 394, 395], ["piplup", "prinplup", "empoleon"]],
  [[495, 496, 497], ["snivy", "servine", "serperior"]],
  [[498, 499, 500], ["tepig", "pignite", "emboar"]],
  [[501, 502, 503], ["oshawott", "dewott", "samurott"]],
  [[810, 811, 812], ["grookey", "thwackey", "rillaboom"]],
  [[813, 814, 815], ["scorbunny", "raboot", "cinderace"]],
  [[816, 817, 818], ["sobble", "drizzile", "inteleon"]],
  [[43, 44, 182], ["oddish", "gloom", "bellossom"]],
  [[60, 61, 186], ["poliwag", "poliwhirl", "politoed"]],
  [[265, 268, 269], ["wurmple", "cascoon", "dustox"]],
  [[280, 281, 475], ["ralts", "kirlia", "gallade"]],
  [[789, 790, 792], ["cosmog", "cosmoem", "lunala"]],
  [[439, 122, 866], ["mimejr", "mrmime", "mrrime"]],
  [[263, 264, 862], ["zigzagoon", "linoone", "obstagoon"]],
];

// Mega Evolution only exists for fully-evolved species that got one in the
// games. Charizard has two (X and Y). Keyed by index into POKEMON_FAMILIES;
// each option is [showdown sprite slug, dex id for icons, mega stone slug].
const MEGA_DATA = {
  0: [["venusaur-mega", 10033, "venusaurite"]],
  1: [["charizard-megax", 10034, "charizardite-x"], ["charizard-megay", 10035, "charizardite-y"]],
  2: [["blastoise-mega", 10036, "blastoisinite"]],
  4: [["beedrill-mega", 10090, "beedrillite"]],
  5: [["pidgeot-mega", 10073, "pidgeotite"]],
  6: [["alakazam-mega", 10037, "alakazite"]],
  8: [["gengar-mega", 10038, "gengarite"]],
  13: [["sceptile-mega", 10065, "sceptilite"]],
  14: [["blaziken-mega", 10050, "blazikenite"]],
  15: [["swampert-mega", 10064, "swampertite"]],
  16: [["gardevoir-mega", 10051, "gardevoirite"]],
  36: [["ampharos-mega", 10045, "ampharosite"]],
  40: [["tyranitar-mega", 10049, "tyranitarite"]],
  46: [["aggron-mega", 10053, "aggronite"]],
  50: [["salamence-mega", 10089, "salamencite"]],
  51: [["metagross-mega", 10076, "metagrossite"]],
  54: [["garchomp-mega", 10058, "garchompite"]],
  105: [["gallade-mega", 10068, "galladite"]],
};

const TASKS_KEY = "todo-app-tasks";

function loadTaskStore() {
  try {
    const stored = JSON.parse(localStorage.getItem(TASKS_KEY));
    if (stored && Array.isArray(stored.todos) && Number.isInteger(stored.nextId)) {
      return stored;
    }
  } catch {
    // fall through to a fresh store
  }
  return { nextId: 1, todos: [] };
}

const taskStore = loadTaskStore();

function saveTaskStore() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(taskStore));
}

// A local task edit: stamp when it happened, persist it, and (if signed in)
// back it up to the account so it reaches this user's other devices.
function commitTaskChange() {
  taskStore.updatedAt = new Date().toISOString();
  saveTaskStore();
  scheduleTaskSync();
}

function pokemonFor(todo) {
  const stage = STATUSES.indexOf(todo.status);
  const [dexIds, names] = POKEMON_FAMILIES[todo.pokemon_family];
  const shiny = Boolean(todo.is_shiny);

  const megaOptions = MEGA_DATA[todo.pokemon_family] || null;
  const megaAvailable = megaOptions !== null && stage === 2;
  const megaActive = megaAvailable && Boolean(todo.is_mega);
  const variant = todo.mega_variant || 0;

  let name;
  let dexId;
  if (megaActive) {
    [name, dexId] = megaOptions[variant];
  } else {
    name = names[stage];
    dexId = dexIds[stage];
  }

  const spriteVariant = shiny ? "ani-shiny" : "ani";
  return {
    name,
    dex_id: dexId,
    shiny,
    sprite: `https://play.pokemonshowdown.com/sprites/${spriteVariant}/${name}.gif`,
    icon: `./sprites/icon/${dexId}${shiny ? "_shiny" : ""}.png`,
    mega_active: megaActive,
    mega:
      megaAvailable && !megaActive
        ? megaOptions.map((option, i) => ({
            variant: i,
            stone_icon: `./sprites/item/${option[2]}.png`,
          }))
        : null,
  };
}

function listTodosWithPokemon() {
  const sorted = [...taskStore.todos].sort(
    (a, b) => a.position - b.position || b.id - a.id
  );
  return sorted.map((todo) => ({ ...todo, pokemon: pokemonFor(todo) }));
}

function storeCreateTodo(text) {
  const positions = taskStore.todos.map((t) => t.position);
  const newPosition = positions.length ? Math.min(...positions) - 1 : 0;
  taskStore.todos.push({
    id: taskStore.nextId++,
    text,
    status: "not started",
    pokemon_family: Math.floor(Math.random() * POKEMON_FAMILIES.length),
    is_shiny: Math.random() < SHINY_CHANCE ? 1 : 0,
    is_mega: 0,
    mega_variant: 0,
    position: newPosition,
    created_at: new Date().toISOString(),
  });
  commitTaskChange();
}

function storeUpdateTodo(id, changes) {
  const todo = taskStore.todos.find((t) => t.id === id);
  if (!todo) return;
  if (changes.status !== undefined && STATUSES.includes(changes.status)) {
    todo.status = changes.status;
    // Mega Evolution only holds while an item stays done!, same as it only
    // lasts for a battle in the games - leaving done! reverts it.
    todo.is_mega = 0;
  }
  if (changes.text !== undefined && changes.text.trim()) {
    todo.text = changes.text.trim();
  }
  commitTaskChange();
}

function storeDeleteTodo(id) {
  taskStore.todos = taskStore.todos.filter((t) => t.id !== id);
  commitTaskChange();
}

function storeMegaEvolve(id, variant) {
  const todo = taskStore.todos.find((t) => t.id === id);
  if (!todo || todo.status !== "done!") return;
  const megaOptions = MEGA_DATA[todo.pokemon_family];
  if (!megaOptions || variant < 0 || variant >= megaOptions.length) return;
  todo.is_mega = 1;
  todo.mega_variant = variant;
  commitTaskChange();
}

function storeReorder(order) {
  order.forEach((id, index) => {
    const todo = taskStore.todos.find((t) => t.id === id);
    if (todo) todo.position = index;
  });
  commitTaskChange();
}

function computeStats() {
  const total = taskStore.todos.length;
  const done = taskStore.todos.filter((t) => t.status === "done!").length;
  const inProgress = taskStore.todos.filter((t) => t.status === "in progress").length;
  // In-progress tasks count for half of a completed task.
  const progressScore = done + inProgress / 2;
  const percent = total ? Math.round((progressScore / total) * 1000) / 10 : 0;
  return { total, done, percent_done: percent };
}

const listEl = document.getElementById("todo-list");
const listScrollEl = document.querySelector(".list-scroll");
const headerFadeEl = document.querySelector(".header-fade");
const teamGridEl = document.getElementById("team-grid");
const teamBlurBgEl = document.getElementById("team-blur-bg");
const formEl = document.getElementById("add-form");
const inputEl = document.getElementById("new-item");
const addButtonEl = formEl.querySelector("button");
const progressTextEl = document.getElementById("progress-text");
const dateTextEl = document.getElementById("date-text");
const companionRowEl = document.getElementById("companion-row");
const companionImgEl = document.getElementById("companion-img");
const shinyFxEl = document.getElementById("shiny-fx");
const settingsFabEl = document.getElementById("settings-fab");
// The settings / account / friends overlays are unified into one tabbed hub.
const hubOverlayEl = document.getElementById("hub-overlay");
const settingsOverlayEl = hubOverlayEl;
const settingsCloseEl = document.getElementById("hub-close");
const companionSearchEl = document.getElementById("companion-search");
const companionMenuEl = document.getElementById("companion-menu");

const COMPANIONS = [
  { value: "", label: "(none)" },
  { value: "pikachu", label: "pikachu ♂" },
  { value: "pikachu-f", label: "pikachu ♀" },
  { value: "pikachu-original", label: "cap pikachu" },
  { value: "eevee", label: "eevee" },
  { value: "pidgey", label: "pidgey" },
  { value: "meowth", label: "meowth" },
  { value: "mimikyu", label: "mimikyu" },
  { value: "cosmog", label: "cosmog" },
  { value: "bidoof", label: "bidoof" },
  { value: "applin", label: "applin" },
  { value: "budew", label: "budew" },
  { value: "cinccino", label: "cinccino" },
  { value: "comfey", label: "comfey" },
  { value: "dracozolt", label: "dracozolt" },
  { value: "dragonite", label: "dragonite" },
  { value: "eldegoss", label: "eldegoss" },
  { value: "emolga", label: "emolga" },
  { value: "flabebe", label: "flabébé" },
  { value: "fletchling", label: "fletchling" },
  { value: "sentret", label: "sentret" },
  { value: "furret", label: "furret" },
  { value: "gengar", label: "gengar" },
  { value: "lapras", label: "lapras" },
  { value: "lurantis", label: "lurantis" },
  { value: "mismagius", label: "mismagius" },
  { value: "porygon2", label: "porygon2" },
  { value: "reuniclus", label: "reuniclus" },
  { value: "shinx", label: "shinx" },
  { value: "wooper", label: "wooper" },
  { value: "zorua", label: "zorua" },
  // Every stage-one starter available in gen5ani (Chespin and the gen9
  // starters aren't in that sprite set, so they're left out).
  { value: "bulbasaur", label: "bulbasaur" },
  { value: "charmander", label: "charmander" },
  { value: "squirtle", label: "squirtle" },
  { value: "chikorita", label: "chikorita" },
  { value: "cyndaquil", label: "cyndaquil" },
  { value: "totodile", label: "totodile" },
  { value: "treecko", label: "treecko" },
  { value: "torchic", label: "torchic" },
  { value: "mudkip", label: "mudkip" },
  { value: "turtwig", label: "turtwig" },
  { value: "chimchar", label: "chimchar" },
  { value: "piplup", label: "piplup" },
  { value: "snivy", label: "snivy" },
  { value: "tepig", label: "tepig" },
  { value: "oshawott", label: "oshawott" },
  { value: "fennekin", label: "fennekin" },
  { value: "froakie", label: "froakie" },
  { value: "rowlet", label: "rowlet" },
  { value: "litten", label: "litten" },
  { value: "popplio", label: "popplio" },
  { value: "grookey", label: "grookey" },
  { value: "scorbunny", label: "scorbunny" },
  { value: "sobble", label: "sobble" },
  { value: "flareon", label: "flareon" },
  { value: "vaporeon", label: "vaporeon" },
  { value: "leafeon", label: "leafeon" },
  { value: "espeon", label: "espeon" },
  { value: "sylveon", label: "sylveon" },
  { value: "umbreon", label: "umbreon" },
  { value: "glaceon", label: "glaceon" },
  { value: "jolteon", label: "jolteon" },
];
const COMPANION_SPRITE_BASE = "https://play.pokemonshowdown.com/sprites/gen5ani";
const COMPANION_SPRITE_SHINY_BASE = "https://play.pokemonshowdown.com/sprites/gen5ani-shiny";
// These sit on a much bigger canvas than the other companions, so they ship
// pre-cropped as static assets to match everyone else's sizing.
const COMPANION_CROP_OVERRIDES = new Set([
  "grookey",
  "scorbunny",
  "sobble",
  "froakie",
  "fletchling",
]);

function companionSpriteUrl(name, shiny) {
  if (COMPANION_CROP_OVERRIDES.has(name)) {
    return `./sprites/companion/${name}${shiny ? "_shiny" : ""}.gif`;
  }
  const base = shiny ? COMPANION_SPRITE_SHINY_BASE : COMPANION_SPRITE_BASE;
  return `${base}/${name}.gif`;
}

// iOS can leave the document panned after a bottom sheet closes (keyboard or
// scroll chaining), which lingers as a black bar above the fixed pages.
// Force the viewport back to the top whenever an overlay closes.
function resetViewportScroll() {
  // Desktop scrolls the window itself, so resetting it would jump the user to
  // the top when closing an overlay (e.g. a pokedex entry). This fix is only
  // needed for the mobile fixed-page layout.
  if (window.matchMedia && window.matchMedia("(min-width: 1024px)").matches) return;
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

const SETTINGS_KEY = "todo-app-settings";
const DEFAULT_SETTINGS = {
  theme: "light",
  colors: {
    add: "#6f8f52",
    "not-started": "#d9dade",
    "in-progress": "#c9a876",
    done: "#6f8f52",
  },
  companion: "",
  matchCompanion: false,
  matchCompanionDone: false,
  font: "Baloo 2",
  fontMobile: "Baloo 2",
  differentFontMobile: false,
  pageEdit: false,
};

// Selectable app fonts. `google` is the fonts.googleapis.com family param (null
// for system fonts that need no download).
const APP_FONTS = [
  { label: "Baloo 2", stack: "'Baloo 2', sans-serif", google: "Baloo+2:wght@500;600;700;800" },
  { label: "Arial", stack: "Arial, Helvetica, sans-serif", google: null },
  { label: "Playfair Display", stack: "'Playfair Display', serif", google: "Playfair+Display:wght@500;600;700;800" },
  { label: "Fraunces", stack: "'Fraunces', serif", google: "Fraunces:wght@500;600;700" },
  { label: "Cormorant Garamond", stack: "'Cormorant Garamond', serif", google: "Cormorant+Garamond:wght@600;700" },
  { label: "PT Serif", stack: "'PT Serif', serif", google: "PT+Serif:wght@400;700" },
];

function appFontByLabel(label) {
  return APP_FONTS.find((f) => f.label === label) || APP_FONTS[0];
}

// Which font this device shows: the mobile-specific one only when signed in,
// the toggle is on, and this is a mobile-width device; otherwise the main font.
function currentFontLabel() {
  const isMobile = !(window.matchMedia && window.matchMedia("(min-width: 1024px)").matches);
  if (isMobile && settings.differentFontMobile && authSession) return settings.fontMobile;
  return settings.font;
}

// Apply the chosen font app-wide: load it (if it needs downloading) and set the
// document font so everything using `inherit` picks it up.
function applyFont() {
  const font = appFontByLabel(currentFontLabel());
  let link = document.getElementById("app-font-link");
  if (font.google) {
    const href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`;
    if (!link) {
      link = document.createElement("link");
      link.id = "app-font-link";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    if (link.href !== href) link.href = href;
  }
  document.documentElement.style.setProperty("--app-font", font.stack);
  document.body.style.fontFamily = font.stack;
}

function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      colors: { ...DEFAULT_SETTINGS.colors, ...(stored && stored.colors) },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

let settings = loadSettings();

function applyTheme() {
  document.body.classList.toggle("theme-dark", settings.theme === "dark");
  for (const btn of document.querySelectorAll(".theme-btn")) {
    btn.classList.toggle("active", btn.dataset.theme === settings.theme);
  }
}

function applyColors() {
  const root = document.documentElement;
  root.style.setProperty("--color-add", settings.colors.add);
  root.style.setProperty("--color-not-started", settings.colors["not-started"]);
  root.style.setProperty("--color-in-progress", settings.colors["in-progress"]);
  root.style.setProperty("--color-done", settings.colors.done);

  document.getElementById("color-add").value = settings.colors.add;
  document.getElementById("color-not-started").value = settings.colors["not-started"];
  document.getElementById("color-in-progress").value = settings.colors["in-progress"];
  document.getElementById("color-done").value = settings.colors.done;
}

function companionDisplayName(value) {
  if (!value) return "";
  const match = COMPANIONS.find((c) => c.value === value);
  return match ? match.label : value.replace(/-/g, " ");
}

// Keep the search box showing the current companion (unless the user is typing).
function updateCompanionSearch() {
  if (companionSearchEl && document.activeElement !== companionSearchEl) {
    companionSearchEl.value = companionDisplayName(settings.companion);
  }
}

// Pokedex-style grid of companions (icon + name); the current one is highlighted.
function renderCompanionMenu(filter) {
  if (!companionMenuEl) return;
  const q = (filter || "").trim().toLowerCase();
  companionMenuEl.innerHTML = "";
  const list = COMPANIONS.filter(
    (c) => !q || c.label.toLowerCase().includes(q) || c.value.toLowerCase().includes(q)
  );
  for (const c of list) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "companion-cell" + (c.value === settings.companion ? " active" : "");
    if (c.value) {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.src = companionSpriteUrl(c.value, teamFullyEvolved);
      img.alt = c.value;
      cell.appendChild(img);
    }
    const name = document.createElement("span");
    name.textContent = c.value ? companionDisplayName(c.value) : "none";
    cell.appendChild(name);
    cell.addEventListener("click", () => {
      settings.companion = c.value;
      saveSettings(settings);
      applyCompanion();
      applyMatchCompanion();
      touchPrefs();
      if (companionSearchEl) companionSearchEl.value = companionDisplayName(c.value);
      companionMenuEl.classList.add("hidden");
      renderCompanionMenu("");
    });
    companionMenuEl.appendChild(cell);
  }
}

// Whether at least SHINY_COMPANION_THRESHOLD tasks anywhere in the list are
// done!. Recomputed on every refresh; when true, the companion goes shiny.
let teamFullyEvolved = false;

function applyCompanion() {
  if (!settings.companion) {
    companionRowEl.classList.add("empty");
    companionImgEl.removeAttribute("src");
    return;
  }
  companionRowEl.classList.remove("empty");
  companionImgEl.src = companionSpriteUrl(settings.companion, teamFullyEvolved);
  companionImgEl.alt = settings.companion;
  sizeCompanionImage();
}

// Species whose sprites read small at the standard size.
const COMPANION_SCALE_OVERRIDES = {
  mimikyu: 1.5,
  cosmog: 1.5,
  rowlet: 1.5,
  flareon: 1.5,
  leafeon: 1.5,
  espeon: 1.5,
  glaceon: 1.5,
};

function sizeCompanionImage() {
  if (!settings.companion) return;
  const scale = COMPANION_SCALE_OVERRIDES[settings.companion] || 1;
  const targetWidth = addButtonEl.getBoundingClientRect().width * 0.75 * scale;
  const img = companionImgEl;
  const apply = () => {
    if (!img.naturalWidth || !img.naturalHeight) return;
    const ratio = img.naturalHeight / img.naturalWidth;
    img.style.width = `${targetWidth}px`;
    img.style.height = `${targetWidth * ratio}px`;
  };
  if (img.complete && img.naturalWidth) apply();
  else img.addEventListener("load", apply, { once: true });
}

// "match companion" accent mode: the accent color follows the companion's
// dominant vibrant color (precomputed per sprite, darkened so white text
// stays readable). Falls back to light gray with no companion, and switches
// to the shiny palette when the companion goes shiny.
const NO_COMPANION_ACCENT = "#b9bbc1";

const COMPANION_ACCENTS = {
  "pikachu": "#c28907",
  "pikachu_shiny": "#ca8700",
  "pikachu-f": "#c28907",
  "pikachu-f_shiny": "#ca8700",
  "pikachu-original": "#c28907",
  "pikachu-original_shiny": "#b38b14",
  "eevee": "#c7832e",
  "eevee_shiny": "#8391ba",
  "pidgey": "#b68a42",
  "pidgey_shiny": "#969600",
  "meowth": "#886600",
  "meowth_shiny": "#984400",
  "mimikyu": "#9e9358",
  "mimikyu_shiny": "#b86e37",
  "cosmog": "#273aa8",
  "cosmog_shiny": "#273aa8",
  "bidoof": "#c87e35",
  "bidoof_shiny": "#a98c36",
  "bulbasaur": "#2a9898",
  "bulbasaur_shiny": "#6ca126",
  "charmander": "#db7a28",
  "charmander_shiny": "#cd8400",
  "squirtle": "#4c96a8",
  "squirtle_shiny": "#5f92d6",
  "chikorita": "#58a715",
  "chikorita_shiny": "#96961a",
  "cyndaquil": "#d80000",
  "cyndaquil_shiny": "#d80000",
  "totodile": "#4b9ccd",
  "totodile_shiny": "#3da772",
  "treecko": "#7d9c1f",
  "treecko_shiny": "#d83232",
  "torchic": "#e56e19",
  "torchic_shiny": "#9e9335",
  "mudkip": "#309acf",
  "mudkip_shiny": "#b972ee",
  "turtwig": "#a3941c",
  "turtwig_shiny": "#96961a",
  "chimchar": "#cf8000",
  "chimchar_shiny": "#d82057",
  "piplup": "#207cd8",
  "piplup_shiny": "#239fb1",
  "snivy": "#00aa00",
  "snivy_shiny": "#009898",
  "tepig": "#df751c",
  "tepig_shiny": "#ae9316",
  "oshawott": "#0ea1b1",
  "oshawott_shiny": "#577cd8",
  "fennekin": "#f8521b",
  "fennekin_shiny": "#f82e2e",
  "froakie": "#4791c8",
  "froakie_shiny": "#4e9c9c",
  "rowlet": "#b38b63",
  "rowlet_shiny": "#589e7b",
  "litten": "#f8401b",
  "litten_shiny": "#f8401b",
  "popplio": "#375cb8",
  "popplio_shiny": "#374ab8",
  "grookey": "#5da234",
  "grookey_shiny": "#819c32",
  "scorbunny": "#f8651b",
  "scorbunny_shiny": "#ca8200",
  "sobble": "#4a98b7",
  "sobble_shiny": "#00a1b0",
  "flareon": "#f8652e",
  "flareon_shiny": "#b7891b",
  "vaporeon": "#369fbd",
  "vaporeon_shiny": "#680c43",
  "leafeon": "#2a9873",
  "leafeon_shiny": "#00aa5d",
  "espeon": "#bd81ae",
  "espeon_shiny": "#4fa218",
  "sylveon": "#e56e90",
  "sylveon_shiny": "#4c9fba",
  "umbreon": "#233648",
  "umbreon_shiny": "#3781b8",
  "glaceon": "#5d9a9a",
  "glaceon_shiny": "#006dc8",
  "jolteon": "#ac922c",
  "jolteon_shiny": "#829a20"
};

const matchCompanionBtnEl = document.getElementById("match-companion-btn");
const matchCompanionDoneBtnEl = document.getElementById("match-companion-done-btn");

function computeCompanionAccent() {
  if (!settings.companion) return NO_COMPANION_ACCENT;
  const key = settings.companion + (teamFullyEvolved ? "_shiny" : "");
  return COMPANION_ACCENTS[key] || COMPANION_ACCENTS[settings.companion] || NO_COMPANION_ACCENT;
}

function updateMatchCompanionButtons() {
  matchCompanionBtnEl.classList.toggle("active", Boolean(settings.matchCompanion));
  matchCompanionDoneBtnEl.classList.toggle("active", Boolean(settings.matchCompanionDone));
}

function applyMatchCompanion() {
  const accent = computeCompanionAccent();
  let changed = false;
  if (settings.matchCompanion && settings.colors.add !== accent) {
    settings.colors.add = accent;
    changed = true;
  }
  if (settings.matchCompanionDone && settings.colors.done !== accent) {
    settings.colors.done = accent;
    changed = true;
  }
  if (changed) {
    saveSettings(settings);
    applyColors();
  }
}

// Font pickers: a button that opens a menu of fonts, each shown in its own
// face. Generalized so the main (desktop/shared) and mobile pickers share it.
function updateFontButton(btnId, label) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const font = appFontByLabel(label);
  btn.textContent = font.label;
  btn.style.fontFamily = font.stack;
}
function buildFontMenu(menuId, currentLabel, onSelect) {
  const menu = document.getElementById(menuId);
  if (!menu) return;
  menu.innerHTML = "";
  for (const f of APP_FONTS) {
    const opt = document.createElement("button");
    opt.type = "button";
    opt.className = "font-option" + (f.label === currentLabel ? " active" : "");
    opt.textContent = f.label;
    opt.style.fontFamily = f.stack;
    if (f.google && !document.querySelector(`link[data-font-preload="${f.label}"]`)) {
      // preload once so the option renders in its real face
      const pre = document.createElement("link");
      pre.rel = "stylesheet";
      pre.dataset.fontPreload = f.label;
      pre.href = `https://fonts.googleapis.com/css2?family=${f.google}&display=swap`;
      document.head.appendChild(pre);
    }
    opt.addEventListener("click", () => {
      onSelect(f.label);
      menu.classList.add("hidden");
    });
    menu.appendChild(opt);
  }
}
function refreshFontPicker(p) {
  updateFontButton(p.btnId, p.getVal());
  buildFontMenu(p.menuId, p.getVal(), (label) => {
    p.setVal(label);
    saveSettings(settings);
    applyFont();
    touchPrefs();
    refreshFontPicker(p);
  });
}
function wireFontPicker(p) {
  const btn = document.getElementById(p.btnId);
  const menu = document.getElementById(p.menuId);
  if (!btn || !menu) return;
  refreshFontPicker(p);
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });
  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("hidden") && !menu.parentElement.contains(e.target)) {
      menu.classList.add("hidden");
    }
  });
}
const MAIN_FONT_PICKER = { btnId: "font-btn", menuId: "font-menu", getVal: () => settings.font, setVal: (v) => { settings.font = v; } };
const MOBILE_FONT_PICKER = { btnId: "font-mobile-btn", menuId: "font-mobile-menu", getVal: () => settings.fontMobile, setVal: (v) => { settings.fontMobile = v; } };

// The "different font on mobile" toggle + mobile picker only make sense for a
// signed-in account (they sync a separate font to phones), so they only show
// when signed in.
function updateFontMobileUI() {
  const row = document.getElementById("font-mobile-row");
  if (!row) return;
  const signedIn = Boolean(authSession);
  const on = signedIn && settings.differentFontMobile;
  row.classList.toggle("hidden", !signedIn);
  const toggle = document.getElementById("font-mobile-toggle");
  if (toggle) {
    toggle.classList.toggle("on", on);
    toggle.setAttribute("aria-checked", String(on));
  }
  const section = document.getElementById("font-mobile-section");
  if (section) section.classList.toggle("hidden", !on);
  const label = document.getElementById("font-label");
  if (label) label.textContent = on ? "desktop font" : "font";
}

function initSettings() {
  applyTheme();
  applyColors();
  applyFont();
  updateCompanionSearch();
  renderCompanionMenu("");
  applyCompanion();
  updateMatchCompanionButtons();
  applyMatchCompanion();

  wireFontPicker(MAIN_FONT_PICKER);
  wireFontPicker(MOBILE_FONT_PICKER);
  updateFontMobileUI();
  const fontMobileToggle = document.getElementById("font-mobile-toggle");
  if (fontMobileToggle) {
    fontMobileToggle.addEventListener("click", () => {
      if (!authSession) return;
      settings.differentFontMobile = !settings.differentFontMobile;
      saveSettings(settings);
      updateFontMobileUI();
      applyFont();
      touchPrefs();
    });
  }

  // page edit mode toggle + recolor pickers (desktop only)
  const pageEditToggle = document.getElementById("page-edit-toggle");
  if (pageEditToggle) {
    const syncToggle = () => {
      pageEditToggle.classList.toggle("on", settings.pageEdit);
      pageEditToggle.setAttribute("aria-checked", String(Boolean(settings.pageEdit)));
    };
    syncToggle();
    pageEditToggle.addEventListener("click", () => {
      settings.pageEdit = !settings.pageEdit;
      saveSettings(settings);
      syncToggle();
      setPageEdit(settings.pageEdit);
    });
    const colorInputs = { "pe-bg": "bg", "pe-clock": "clock", "pe-primary": "primary", "pe-secondary": "secondary" };
    for (const [id, key] of Object.entries(colorInputs)) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.addEventListener("input", (e) => {
        pageLayout().colors = pageLayout().colors || {};
        pageLayout().colors[key] = e.target.value;
        applyPageLayout();
        touchUiPrefs();
      });
    }
  }

  matchCompanionBtnEl.addEventListener("click", () => {
    settings.matchCompanion = !settings.matchCompanion;
    saveSettings(settings);
    updateMatchCompanionButtons();
    applyMatchCompanion();
  });

  matchCompanionDoneBtnEl.addEventListener("click", () => {
    settings.matchCompanionDone = !settings.matchCompanionDone;
    saveSettings(settings);
    updateMatchCompanionButtons();
    applyMatchCompanion();
  });

  settingsFabEl.addEventListener("click", () => openHub("settings"));

  for (const btn of document.querySelectorAll(".theme-btn")) {
    btn.addEventListener("click", () => {
      settings.theme = btn.dataset.theme;
      saveSettings(settings);
      applyTheme();
    });
  }

  const colorInputs = {
    "color-add": "add",
    "color-not-started": "not-started",
    "color-in-progress": "in-progress",
    "color-done": "done",
  };
  for (const [id, key] of Object.entries(colorInputs)) {
    document.getElementById(id).addEventListener("input", (e) => {
      if (id === "color-add") settings.matchCompanion = false;
      if (id === "color-done") settings.matchCompanionDone = false;
      updateMatchCompanionButtons();
      settings.colors[key] = e.target.value;
      saveSettings(settings);
      applyColors();
    });
  }

  if (companionSearchEl && companionMenuEl) {
    companionSearchEl.addEventListener("focus", () => {
      companionSearchEl.select();
      renderCompanionMenu(""); // show all when opening
      companionMenuEl.classList.remove("hidden");
    });
    companionSearchEl.addEventListener("input", () => {
      renderCompanionMenu(companionSearchEl.value);
      companionMenuEl.classList.remove("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!companionMenuEl.classList.contains("hidden") && !e.target.closest(".companion-picker")) {
        companionMenuEl.classList.add("hidden");
        updateCompanionSearch(); // revert text to the current selection
      }
    });
  }

  window.addEventListener("resize", sizeCompanionImage);
}

function ordinalSuffix(day) {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

function renderDate() {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const now = new Date();
  const day = now.getDate();
  dateTextEl.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${day}${ordinalSuffix(day)}`;
}

const SHINY_COMPANION_THRESHOLD = 6;
const SHINY_FX_COOLDOWN_MS = 10000;
const SHINY_FX_DURATION_MS = 1800;
let previousTeamFullyEvolved = false;
let lastShinyFxTime = 0;
let shinyFxHideTimer = null;

function playShinyFx() {
  if (!settings.companion) return;
  shinyFxEl.src = `./shiny_sparkle.webp?t=${Date.now()}`;
  shinyFxEl.classList.add("playing");
  clearTimeout(shinyFxHideTimer);
  shinyFxHideTimer = setTimeout(() => {
    shinyFxEl.classList.remove("playing");
  }, SHINY_FX_DURATION_MS);
}

function maybeTriggerShinyFx() {
  if (teamFullyEvolved && !previousTeamFullyEvolved) {
    const now = Date.now();
    // Cooldown means rapid back-and-forth toggling between shiny and normal
    // (e.g. un-completing then re-completing a task) can't spam the effect.
    if (now - lastShinyFxTime >= SHINY_FX_COOLDOWN_MS) {
      playShinyFx();
      lastShinyFxTime = now;
    }
  }
  previousTeamFullyEvolved = teamFullyEvolved;
}

async function fetchTodos() {
  const todos = listTodosWithPokemon();
  renderTodos(todos);
  renderTeam(todos);

  const doneCount = todos.filter((t) => t.status === "done!").length;
  teamFullyEvolved = doneCount >= SHINY_COMPANION_THRESHOLD;
  applyCompanion();
  applyMatchCompanion();
  maybeTriggerShinyFx();
  // Desktop only (flag set in buildDesktop): re-append the 48h calendar items
  // the render above just cleared. No-op on mobile.
  if (window.__desktopReady) renderCalTeamExtras();
}

async function fetchStats() {
  const stats = computeStats();
  progressTextEl.textContent = `list progress: ${stats.percent_done}%`;
}

function refresh() {
  fetchTodos();
  fetchStats();
}

function waitForImage(img) {
  if (img.complete && img.naturalWidth) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true });
  });
}

// Mega Sceptile's native frame (74x97) is the size reference: it fills the
// cell at "default" scale. Using a fixed reference keeps each sprite's
// on-screen size absolute - a given pokemon always renders the same size,
// regardless of which other pokemon are on the team. Anything with a
// larger native frame gets shrunk down just enough to still fit the cell.
const REFERENCE_SPRITE_DIMENSION = 97;
// Floor so very small sprites (Weedle, Ralts, etc.) stay legible; still well
// under any full-size sprite, so relative ordering never gets reversed.
// Expressed as a fraction of the cell so it adapts to any viewport.
const MIN_SPRITE_CELL_FRACTION = 0.24;

function renderTeamBlurBg(todos) {
  teamBlurBgEl.innerHTML = "";
  for (const todo of todos.slice(0, TEAM_SIZE)) {
    const img = document.createElement("img");
    img.src = todo.pokemon.sprite;
    img.alt = "";
    teamBlurBgEl.appendChild(img);
  }
}

// Pokemon whose animated sprites depict them airborne or levitating. Their
// gifs are cropped to content like everyone else's, so bottom-aligning them
// plants them on the ground; these get centered in the slot instead.
const FLYING_POKEMON = new Set([
  "butterfree", "beedrill", "beedrill-mega", "pidgeot-mega", "zubat",
  "golbat", "crobat", "gastly", "haunter", "alakazam-mega", "magnemite",
  "magneton", "magnezone", "flygon", "beautifly", "dustox", "duskull",
  "porygon2", "porygonz", "togetic", "togekiss", "hoppip", "skiploom",
  "jumpluff", "beldum", "metang", "metagross-mega", "salamence-mega",
  "solosis", "duosion", "reuniclus", "vanillite", "vanillish", "vanilluxe",
  "klink", "klang", "klinklang", "tynamo", "eelektrik", "eelektross",
  "lampent", "chandelure", "hydreigon", "vivillon", "orbeetle", "cosmog",
  "cosmoem", "lunala", "dreepy", "drakloak", "dragapult", "honedge",
  "doublade", "aegislash",
]);

function isFlying(name) {
  return FLYING_POKEMON.has(name);
}

async function renderTeam(todos) {
  lastTeamTodos = todos;
  schedulePushTeam();
  renderTeamBlurBg(todos);
  teamGridEl.innerHTML = "";
  const entries = [];

  for (let i = 0; i < TEAM_SIZE; i++) {
    const slot = document.createElement("div");
    const todo = todos[i];
    if (todo) {
      slot.className = "team-slot" + (isFlying(todo.pokemon.name) ? " flying" : "");
      registerDiscovery(todo.pokemon);
      const img = document.createElement("img");
      img.alt = todo.pokemon.name;
      img.src = todo.pokemon.sprite;
      img.style.cursor = "pointer";
      img.addEventListener("click", () => openPokedex(todo.pokemon));
      slot.appendChild(img);
      entries.push({ slot, img });
    } else {
      slot.className = "team-slot empty";
    }
    teamGridEl.appendChild(slot);
  }

  if (entries.length === 0) return;

  await Promise.all(entries.map(({ img }) => waitForImage(img)));

  // Sizes are percentages of the cell, not fixed pixels: fixed px widths
  // measured at one viewport width forced the grid tracks wider than the
  // card at other widths, clipping the right column. Percentages track the
  // cell size, so the grid can never overflow and resizing stays correct.
  for (const { img } of entries) {
    if (!img.naturalWidth || !img.naturalHeight) continue;
    const maxNativeDim = Math.max(img.naturalWidth, img.naturalHeight);
    // Fraction of the cell the sprite's largest dimension should occupy:
    // native size relative to the reference frame, capped at 100% of the
    // cell, floored for legibility.
    let fraction = maxNativeDim / REFERENCE_SPRITE_DIMENSION;
    fraction = Math.min(fraction, 1);
    fraction = Math.max(fraction, MIN_SPRITE_CELL_FRACTION);
    const widthFraction = fraction * (img.naturalWidth / maxNativeDim);
    img.style.width = `${(widthFraction * 100).toFixed(2)}%`;
    img.style.height = "auto";
  }
}

function renderTodos(todos) {
  listEl.innerHTML = "";

  if (todos.length === 0) {
    listEl.innerHTML = '<div class="empty-state">get busy!!</div>';
    return;
  }

  for (const todo of todos) {
    listEl.appendChild(renderTodoItem(todo));
  }
}

function renderTodoItem(todo) {
  const li = document.createElement("li");
  li.className = `todo-item status-${todo.status === "done!" ? "done" : "pending"}`;
  li.dataset.id = todo.id;

  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "drag-handle";
  handle.setAttribute("aria-label", "Drag to reorder");
  handle.innerHTML =
    '<svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">' +
    '<circle cx="6" cy="4" r="1.6"></circle><circle cx="14" cy="4" r="1.6"></circle>' +
    '<circle cx="6" cy="10" r="1.6"></circle><circle cx="14" cy="10" r="1.6"></circle>' +
    '<circle cx="6" cy="16" r="1.6"></circle><circle cx="14" cy="16" r="1.6"></circle></svg>';
  attachDragHandlers(handle, li);

  const text = document.createElement("span");
  text.className = "text";
  text.textContent = todo.text;
  text.addEventListener("click", () => beginEditText(li, text, todo));

  const select = document.createElement("select");
  select.className = "status-select";
  select.dataset.status = todo.status;
  for (const status of STATUSES) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = STATUS_LABELS[status];
    if (status === todo.status) option.selected = true;
    select.appendChild(option);
  }
  select.addEventListener("change", () => updateStatus(todo.id, select.value));

  const sprite = document.createElement("img");
  sprite.className = "sprite";
  sprite.src = todo.pokemon.icon;
  sprite.alt = todo.pokemon.name;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "✕";
  deleteBtn.addEventListener("click", () => askDeleteTodo(todo.id));

  li.append(handle, text, select, sprite);

  if (todo.pokemon.mega) {
    for (const stone of todo.pokemon.mega) {
      const stoneBtn = document.createElement("button");
      stoneBtn.className = "mega-stone-btn";
      stoneBtn.title = "Mega Evolve";
      const stoneImg = document.createElement("img");
      stoneImg.src = stone.stone_icon;
      stoneImg.alt = "Mega Stone";
      stoneBtn.appendChild(stoneImg);
      stoneBtn.addEventListener("click", () => megaEvolve(todo.id, stone.variant));
      li.append(stoneBtn);
    }
  }

  li.append(deleteBtn);
  return li;
}

function beginEditText(li, textEl, todo) {
  if (li.classList.contains("editing")) return;
  li.classList.add("editing");

  const input = document.createElement("input");
  input.type = "text";
  input.className = "edit-input";
  input.value = todo.text;
  textEl.replaceWith(input);
  input.focus();
  input.select();

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    li.classList.remove("editing");
    const newText = input.value.trim();
    if (newText && newText !== todo.text) {
      updateText(todo.id, newText);
    } else {
      input.replaceWith(textEl);
    }
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") {
      input.value = todo.text;
      input.blur();
    }
  });
  input.addEventListener("blur", finish, { once: true });
}

// Touch-friendly drag-to-reorder using Pointer Events (HTML5 drag-and-drop
// doesn't work on mobile browsers). While dragging, a ghost of the row
// follows the pointer and an accent-colored line marks where it will land.
let dragging = null;
let dragGhost = null;
let dropIndicator = null;
let dragStartPointerY = 0;

function attachDragHandlers(handle, li) {
  handle.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dragging = li;
    dragStartPointerY = e.clientY;

    const rect = li.getBoundingClientRect();
    dragGhost = li.cloneNode(true);
    // cloneNode misses the select's live value; restore it so the status
    // pill keeps its color and label on the ghost
    const liSelect = li.querySelector(".status-select");
    const ghostSelect = dragGhost.querySelector(".status-select");
    if (liSelect && ghostSelect) {
      ghostSelect.value = liSelect.value;
      ghostSelect.dataset.status = liSelect.dataset.status;
    }
    dragGhost.classList.add("drag-ghost");
    dragGhost.style.left = `${rect.left}px`;
    dragGhost.style.top = `${rect.top}px`;
    dragGhost.style.width = `${rect.width}px`;
    document.body.appendChild(dragGhost);

    dropIndicator = document.createElement("div");
    dropIndicator.className = "drop-indicator";
    listEl.insertBefore(dropIndicator, li);

    li.classList.add("dragging");
    try {
      handle.setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignore - dragging still works via the listeners below.
    }
    handle.addEventListener("pointermove", onDragMove);
    handle.addEventListener("pointerup", onDragEnd, { once: true });
    handle.addEventListener("pointercancel", onDragEnd, { once: true });
  });
}

function onDragMove(e) {
  if (!dragging) return;
  dragGhost.style.transform = `translateY(${e.clientY - dragStartPointerY}px)`;

  const pointerY = e.clientY;
  const items = Array.from(listEl.querySelectorAll(".todo-item")).filter((el) => el !== dragging);
  let target = null;
  for (const item of items) {
    const rect = item.getBoundingClientRect();
    if (pointerY < rect.top + rect.height / 2) {
      target = item;
      break;
    }
  }
  if (target) {
    listEl.insertBefore(dropIndicator, target);
  } else {
    listEl.appendChild(dropIndicator);
  }
}

function onDragEnd() {
  if (!dragging) return;
  listEl.insertBefore(dragging, dropIndicator);
  dropIndicator.remove();
  dragGhost.remove();
  dragging.classList.remove("dragging");
  dropIndicator = null;
  dragGhost = null;
  const order = Array.from(listEl.querySelectorAll(".todo-item")).map((el) => Number(el.dataset.id));
  dragging = null;
  reorderTodos(order);
}

async function addTodo(text) {
  storeCreateTodo(text);
  refresh();
}

async function updateStatus(id, status) {
  storeUpdateTodo(id, { status });
  refresh();
}

async function updateText(id, text) {
  storeUpdateTodo(id, { text });
  refresh();
}

async function reorderTodos(order) {
  storeReorder(order);
  refresh();
}

async function deleteTodo(id) {
  storeDeleteTodo(id);
  refresh();
}

// Deleting a task from "my team" goes through a small yes/no confirmation.
const deleteTaskOverlayEl = document.getElementById("delete-task-overlay");
const deleteTaskYesEl = document.getElementById("delete-task-yes");
const deleteTaskNoEl = document.getElementById("delete-task-no");
let pendingDeleteId = null;

function askDeleteTodo(id) {
  pendingDeleteId = id;
  deleteTaskOverlayEl.classList.remove("hidden");
}

function closeDeleteConfirm() {
  pendingDeleteId = null;
  deleteTaskOverlayEl.classList.add("hidden");
}

deleteTaskNoEl.addEventListener("click", closeDeleteConfirm);
deleteTaskYesEl.addEventListener("click", () => {
  const id = pendingDeleteId;
  closeDeleteConfirm();
  if (id != null) deleteTodo(id);
});
deleteTaskOverlayEl.addEventListener("click", (e) => {
  if (e.target === deleteTaskOverlayEl) closeDeleteConfirm();
});

async function megaEvolve(id, variant) {
  storeMegaEvolve(id, variant);
  refresh();
}

// ---------------------------------------------------------------------------
// Pokedex modal: tap a team pokemon to see its dex entry, base stats, and
// latest pokedex description (fetched from PokeAPI, cached after first view).
// ---------------------------------------------------------------------------

const pokedexOverlayEl = document.getElementById("pokedex-overlay");
const pokedexPanelEl = document.getElementById("pokedex-panel");
const pokedexContentEl = document.getElementById("pokedex-content");
const pokedexCloseEl = document.getElementById("pokedex-close");

// Sparkle mark shown only for shiny pokemon; fill follows the text color.
const SHINY_STAR_SVG =
  '<svg class="shiny-star" viewBox="0 0 100 100" fill="currentColor" aria-label="shiny">' +
  '<path d="M34 30 Q37.84 58.16 66 62 Q37.84 65.84 34 94 Q30.16 65.84 2 62 Q30.16 58.16 34 30 Z"/>' +
  '<path d="M74 12 Q76.88 33.12 98 36 Q76.88 38.88 74 60 Q71.12 38.88 50 36 Q71.12 33.12 74 12 Z"/>' +
  '<path d="M28 1 Q29.32 10.68 39 12 Q29.32 13.32 28 23 Q26.68 13.32 17 12 Q26.68 10.68 28 1 Z"/>' +
  "</svg>";

const dexDataCache = new Map();

async function fetchDexData(dexId) {
  if (dexDataCache.has(dexId)) return dexDataCache.get(dexId);
  const poke = await (await fetch(`https://pokeapi.co/api/v2/pokemon/${dexId}`)).json();
  const species = await (await fetch(poke.species.url)).json();
  const english = species.flavor_text_entries.filter((e) => e.language.name === "en");
  const flavor = english.length
    ? english[english.length - 1].flavor_text.replace(/[\n\f\r]+/g, " ")
    : "";
  const genusEntry = species.genera.find((g) => g.language.name === "en");
  const data = {
    name: poke.name,
    nationalNo: species.id,
    types: poke.types.map((t) => t.type.name),
    genus: genusEntry ? genusEntry.genus : "",
    heightM: poke.height / 10,
    weightKg: poke.weight / 10,
    abilities: poke.abilities,
    stats: poke.stats,
    flavor,
  };
  dexDataCache.set(dexId, data);
  return data;
}

const STAT_LABELS = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

// Level-100 stat ranges, same formulas pokemondb uses (0 vs 31 IV, 0 vs 252 EV).
function statMin(name, base) {
  return name === "hp" ? 2 * base + 110 : Math.floor((2 * base + 5) * 0.9);
}

function statMax(name, base) {
  return name === "hp" ? 2 * base + 204 : Math.floor((2 * base + 99) * 1.1);
}

function statBarColor(value) {
  if (value < 30) return "#f34444";
  if (value < 60) return "#ff7f0f";
  if (value < 90) return "#ffdd57";
  if (value < 120) return "#a0e515";
  if (value < 150) return "#23cd5e";
  return "#00c2b8";
}

function formatHeight(m) {
  const totalInches = Math.round(m * 39.3701);
  const feet = Math.floor(totalInches / 12);
  const inches = String(totalInches % 12).padStart(2, "0");
  return `${m.toFixed(1)} m (${feet}’${inches}”)`;
}

function formatWeight(kg) {
  return `${kg.toFixed(1)} kg (${(kg * 2.20462).toFixed(1)} lbs)`;
}

function pokedexDisplayName(apiName) {
  const parts = apiName.split("-");
  if (parts.includes("mega")) {
    const rest = parts.filter((p, i) => i > 0 && p !== "mega");
    return ["mega", parts[0], ...rest].join(" ");
  }
  return parts.join(" ");
}

function renderPokedex(pokemon, d) {
  const typeIcons = d.types
    .map(
      (t) =>
        `<img class="type-icon" src="https://play.pokemonshowdown.com/sprites/types/${t[0].toUpperCase() + t.slice(1)}.png" alt="${t}">`
    )
    .join(" ");

  const numbered = d.abilities
    .filter((a) => !a.is_hidden)
    .map((a, i) => `${i + 1}. ${a.ability.name.replace(/-/g, " ")}`);
  const hidden = d.abilities
    .filter((a) => a.is_hidden)
    .map((a) => `${a.ability.name.replace(/-/g, " ")} (hidden ability)`);
  const abilityLines = [...numbered, ...hidden];

  let statsRows = "";
  let total = 0;
  for (const s of d.stats) {
    const base = s.base_stat;
    total += base;
    // Scale bars to a 200 "full" reference (not the rare 255 max) so typical
    // stats fill more of the track instead of bunching up on the left.
    const width = Math.min(100, (base / 200) * 100);
    statsRows +=
      `<div class="stat-row">` +
      `<span class="stat-name">${STAT_LABELS[s.stat.name] || s.stat.name}</span>` +
      `<span class="stat-val">${base}</span>` +
      `<span class="stat-bar-track"><span class="stat-bar" style="width:${width.toFixed(1)}%;background:${statBarColor(base)}"></span></span>` +
      `<span class="stat-minmax">${statMin(s.stat.name, base)}</span>` +
      `<span class="stat-minmax">${statMax(s.stat.name, base)}</span>` +
      `</div>`;
  }
  statsRows +=
    `<div class="stat-row total">` +
    `<span class="stat-name">Total</span>` +
    `<span class="stat-val">${total}</span>` +
    `<span class="stat-bar-track"></span>` +
    `<span class="stat-minmax">Min</span>` +
    `<span class="stat-minmax">Max</span>` +
    `</div>`;

  pokedexContentEl.innerHTML =
    `<h2 class="pokedex-title">${pokedexDisplayName(d.name)}${pokemon.shiny ? SHINY_STAR_SVG : ""}</h2>` +
    `<div class="pokedex-hero">` +
    `<div class="pokedex-gif-box"><img src="${pokemon.sprite}" alt="${pokemon.name}"></div>` +
    `<div class="pokedex-head">` +
    `<div class="pokedex-info">` +
    `<div>national no: ${d.nationalNo}</div>` +
    `<div>type: ${typeIcons}</div>` +
    `<div>species: ${d.genus.toLowerCase()}</div>` +
    `<div>height: ${formatHeight(d.heightM)}</div>` +
    `<div>weight: ${formatWeight(d.weightKg)}</div>` +
    `<div>abilities: ${abilityLines.join("<br>")}</div>` +
    `</div></div></div>` +
    `<p class="pokedex-desc">${d.flavor.toLowerCase()}</p>` +
    `<div class="pokedex-stats"><h3>Base stats</h3>${statsRows}</div>`;
}

function dexIdFromPokemon(pokemon) {
  if (pokemon.dex_id) return pokemon.dex_id;
  // Older server payloads lack dex_id; the icon path always carries it.
  const match = (pokemon.icon || "").match(/\/icon\/(\d+)/);
  return match ? Number(match[1]) : null;
}

async function openPokedex(pokemon) {
  // Backdrop keeps the full team blur exactly as it is on the card; only the
  // tapped pokemon's gif is shown crisp (no other gifs, no empty slots).
  const oldBlur = pokedexPanelEl.querySelector(".team-blur-bg");
  if (oldBlur) oldBlur.remove();
  const blurClone = teamBlurBgEl.cloneNode(true);
  blurClone.removeAttribute("id");
  pokedexPanelEl.prepend(blurClone);

  pokedexContentEl.innerHTML = '<p class="pokedex-loading">loading...</p>';
  pokedexOverlayEl.classList.remove("hidden");

  try {
    const data = await fetchDexData(dexIdFromPokemon(pokemon));
    renderPokedex(pokemon, data);
  } catch {
    pokedexContentEl.innerHTML =
      "<p class=\"pokedex-loading\">couldn't load pokedex data - check your connection.</p>";
  }
}

function closePokedex() {
  pokedexOverlayEl.classList.add("hidden");
  resetViewportScroll();
}

pokedexCloseEl.addEventListener("click", closePokedex);
pokedexOverlayEl.addEventListener("click", (e) => {
  if (e.target === pokedexOverlayEl) closePokedex();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePokedex();
});

function dexIconUrl(dex, shiny) {
  return `./sprites/icon/${dex}${shiny ? "_shiny" : ""}.png`;
}

async function loadDexEntries() {
  const entries = new Map();
  POKEMON_FAMILIES.forEach(([dexIds, names], familyIndex) => {
    dexIds.forEach((d, stage) => {
      const key = String(d);
      if (!entries.has(key)) {
        entries.set(key, {
          icon_dex: d,
          name: names[stage],
          label: String(d).padStart(4, "0"),
          sort: d * 10,
        });
      }
    });
    (MEGA_DATA[familyIndex] || []).forEach(([slug, megaDex], variantIndex) => {
      const key = String(megaDex);
      if (!entries.has(key)) {
        const base = dexIds[2];
        const suffix = slug.endsWith("megax") ? " M-X" : slug.endsWith("megay") ? " M-Y" : " M";
        entries.set(key, {
          icon_dex: megaDex,
          name: slug,
          label: String(base).padStart(4, "0") + suffix,
          sort: base * 10 + 1 + variantIndex,
        });
      }
    });
  });
  return [...entries.values()].sort((a, b) => a.sort - b.sort);
}

// ---------------------------------------------------------------------------
// Pokedex page: swipe left to browse every pokemon in the roster. Everything
// starts as a dark silhouette and fills with color once that form has
// appeared on the team. Shiny sightings register in both tabs. Discoveries
// persist on this device.
// ---------------------------------------------------------------------------

const dexPageEl = document.getElementById("dex-page");
const appPageEl = document.querySelector(".app.page");
const dexGridEl = document.getElementById("dex-grid");

const DEX_KEY = "todo-app-pokedex";

function loadDexDiscoveries() {
  try {
    const stored = JSON.parse(localStorage.getItem(DEX_KEY));
    if (stored && stored.all && stored.shiny) return stored;
  } catch (e) {
    // fall through to a fresh dex
  }
  return { all: {}, shiny: {} };
}

const dexDiscoveries = loadDexDiscoveries();

function saveDexDiscoveries() {
  localStorage.setItem(DEX_KEY, JSON.stringify(dexDiscoveries));
}

function registerDiscovery(pokemon) {
  const key = String(dexIdFromPokemon(pokemon));
  let changed = false;
  if (!dexDiscoveries.all[key]) {
    dexDiscoveries.all[key] = true;
    changed = true;
  }
  if (pokemon.shiny && !dexDiscoveries.shiny[key]) {
    dexDiscoveries.shiny[key] = true;
    changed = true;
  }
  if (changed) {
    saveDexDiscoveries();
    scheduleDexSync();
  }
}

let dexEntriesPromise = null;

function getDexEntries() {
  if (!dexEntriesPromise) dexEntriesPromise = loadDexEntries();
  return dexEntriesPromise;
}

let dexActiveTab = "all";

// The "special" tab is a fixed set of mythical/legendary pokemon that only ever
// visit the pokepark by chance. Until registered they stay silhouetted (though
// their national dex number always shows), and tapping one opens the hint menu.
// Each one that has visited the park and been tapped fills in with a real dex
// entry, just like the other tabs.
const SPECIAL_POKEMON = [
  { dex: 482, name: "azelf", label: "0482" },
  { dex: 480, name: "uxie", label: "0480" },
  { dex: 481, name: "mesprit", label: "0481" },
  { dex: 489, name: "phione", label: "0489" },
  { dex: 490, name: "manaphy", label: "0490" },
  { dex: 494, name: "victini", label: "0494" },
  { dex: 492, name: "shaymin", label: "0492" },
  { dex: 10006, name: "shaymin-sky", label: "0492 S" },
  { dex: 647, name: "keldeo", label: "0647" },
  { dex: 802, name: "marshadow", label: "0802" },
];

const SPECIAL_KEY = "todo-app-special-dex";

function loadSpecialRegistered() {
  try {
    const stored = JSON.parse(localStorage.getItem(SPECIAL_KEY));
    if (stored && typeof stored === "object") return stored;
  } catch (e) {
    // fall through to a fresh set
  }
  return {};
}

const specialRegistered = loadSpecialRegistered();

function saveSpecialRegistered() {
  localStorage.setItem(SPECIAL_KEY, JSON.stringify(specialRegistered));
}

function registerSpecial(dex) {
  if (!specialRegistered[String(dex)]) {
    specialRegistered[String(dex)] = true;
    saveSpecialRegistered();
    scheduleDexSync();
  }
}

function specialPokemonPayload(entry) {
  return {
    name: entry.name,
    dex_id: entry.dex,
    shiny: false,
    sprite: `https://play.pokemonshowdown.com/sprites/ani/${entry.name}.gif`,
    icon: dexIconUrl(entry.dex, false),
  };
}

function renderSpecialGrid() {
  dexGridEl.innerHTML = "";
  for (const entry of SPECIAL_POKEMON) {
    const registered = Boolean(specialRegistered[String(entry.dex)]);
    const cell = document.createElement("div");
    cell.className = "dex-cell special " + (registered ? "discovered" : "undiscovered");
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = dexIconUrl(entry.dex, false);
    img.alt = registered ? entry.name : "undiscovered";
    const num = document.createElement("span");
    num.className = "dex-num";
    num.textContent = entry.label;
    cell.append(img, num);
    if (registered) {
      cell.addEventListener("click", () => openPokedex(specialPokemonPayload(entry)));
    } else {
      cell.addEventListener("click", openSpecialEntry);
    }
    dexGridEl.appendChild(cell);
  }
}

function openSpecialEntry() {
  const oldBlur = pokedexPanelEl.querySelector(".team-blur-bg");
  if (oldBlur) oldBlur.remove();
  pokedexContentEl.innerHTML =
    `<h2 class="pokedex-title">???</h2>` +
    `<p class="pokedex-desc">there's a small daily chance this pokemon will visit your pokepark. keep your eye out!</p>`;
  pokedexOverlayEl.classList.remove("hidden");
}

// Registering a special visitor from the park: mark it discovered, then show a
// "registered!" header above its full, standard dex entry.
async function openSpecialRegister(entry) {
  registerSpecial(entry.dex);
  if (dexActiveTab === "special") renderSpecialGrid();
  // Rebuild the park floor so the just-registered visitor stops hopping around.
  renderParkMine();

  const oldBlur = pokedexPanelEl.querySelector(".team-blur-bg");
  if (oldBlur) oldBlur.remove();
  pokedexContentEl.innerHTML = '<p class="pokedex-loading">loading...</p>';
  pokedexOverlayEl.classList.remove("hidden");
  try {
    const data = await fetchDexData(entry.dex);
    renderPokedex(specialPokemonPayload(entry), data);
    pokedexContentEl.insertAdjacentHTML(
      "afterbegin",
      '<h2 class="pokedex-registered">registered!</h2>'
    );
  } catch {
    pokedexContentEl.innerHTML =
      "<p class=\"pokedex-loading\">couldn't load pokedex data - check your connection.</p>";
  }
}

// Once a day, a 5% roll decides whether one random special pokemon visits the
// park. The result is cached for the day so re-renders don't re-roll.
const SPECIAL_VISIT_KEY = "todo-app-special-visit";
const SPECIAL_VISIT_CHANCE = 0.05;

function specialTodayStamp() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getSpecialVisitor() {
  let record = null;
  try {
    record = JSON.parse(localStorage.getItem(SPECIAL_VISIT_KEY));
  } catch (e) {
    // fall through to a fresh roll
  }
  const today = specialTodayStamp();
  if (!record || record.date !== today) {
    // Only roll among pokemon not already registered, so a mythical the player
    // has caught never comes back to the park.
    const pool = SPECIAL_POKEMON.filter((p) => !specialRegistered[String(p.dex)]);
    let dex = null;
    if (pool.length && Math.random() < SPECIAL_VISIT_CHANCE) {
      dex = pool[Math.floor(Math.random() * pool.length)].dex;
    }
    record = { date: today, dex };
    localStorage.setItem(SPECIAL_VISIT_KEY, JSON.stringify(record));
  }
  if (record.dex == null) return null;
  // Today's visitor may have since been registered (tapped) - or registered on
  // another device and synced in; either way it shouldn't appear anymore.
  if (specialRegistered[String(record.dex)]) return null;
  return SPECIAL_POKEMON.find((p) => p.dex === record.dex) || null;
}

async function renderDexGrid() {
  const tab = dexActiveTab;
  // The hint belongs to the special tab only; keep it in sync with whatever
  // we're actually rendering, no matter how the render was triggered.
  dexPageEl.classList.toggle("special-active", tab === "special");
  const dtRoot = document.getElementById("dt-root");
  if (dtRoot) dtRoot.classList.toggle("special-active", tab === "special");
  if (tab === "special") {
    renderSpecialGrid();
    return;
  }
  const entries = await getDexEntries();
  // A newer render (e.g. a fast tab switch) began while we awaited entries;
  // bail so this stale render can't clobber the grid it left behind.
  if (dexActiveTab !== tab) return;
  const shiny = tab === "shiny";
  const seen = dexDiscoveries[shiny ? "shiny" : "all"];
  dexGridEl.innerHTML = "";
  for (const entry of entries) {
    const discovered = Boolean(seen[String(entry.icon_dex)]);
    const cell = document.createElement("div");
    cell.className = "dex-cell " + (discovered ? "discovered" : "undiscovered");
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = dexIconUrl(entry.icon_dex, shiny);
    img.alt = discovered ? entry.name : "undiscovered";
    const num = document.createElement("span");
    num.className = "dex-num";
    num.textContent = entry.label;
    cell.append(img, num);
    if (discovered) {
      cell.addEventListener("click", () =>
        openPokedex({
          name: entry.name,
          dex_id: entry.icon_dex,
          shiny,
          sprite: `https://play.pokemonshowdown.com/sprites/${shiny ? "ani-shiny" : "ani"}/${entry.name}.gif`,
          icon: dexIconUrl(entry.icon_dex, shiny),
        })
      );
    }
    dexGridEl.appendChild(cell);
  }
}

let pageIndex = 1; // 0 = friends, 1 = main list, 2 = pokedex

// ---- interactive swipe between the friends page, the list, and the pokedex ----
// The three pages sit side by side and track the finger while it moves; on
// release they settle to whichever page is closer, or to the one a quick
// flick points at.

const friendsPageEl = document.getElementById("friends-page");
const pagerPages = [friendsPageEl, appPageEl, dexPageEl];

const PAGE_OFFSET = 1.02; // keep in sync with .off-left / .off-right in the CSS

let swipeStartX = null;
let swipeStartY = null;
let swipeEligible = false;
let swipeAxis = null; // null until the gesture locks to "h" or "v"
let swipeOffset = 0;
let swipeSamples = [];
let pagesSettling = false;

function pageWidth() {
  return window.innerWidth * PAGE_OFFSET;
}

function restPageTransforms() {
  pagerPages.forEach((el, i) => {
    el.style.transform = `translateX(${(i - pageIndex) * 102}%)`;
  });
}

restPageTransforms();

function positionPages(offset) {
  pagerPages.forEach((el, i) => {
    el.style.transition = "none";
    el.style.transform = `translateX(calc(${(i - pageIndex) * 102}% + ${offset}px))`;
  });
}

function settlePages(targetIndex, velocity) {
  const width = pageWidth();
  const remaining = Math.abs((pageIndex - targetIndex) * width - swipeOffset);
  // Finish at the fling speed (but never crawl), so the release feels
  // continuous with the drag instead of restarting a canned animation.
  const speed = Math.max(Math.abs(velocity), 0.6); // px per ms
  const duration = Math.round(Math.min(Math.max(remaining / speed, 120), 340));
  swipeOffset = 0;
  pageIndex = targetIndex;
  if (pageIndex === 0) refreshPark();
  pagesSettling = true;
  const ease = `transform ${duration}ms cubic-bezier(0.25, 0.8, 0.4, 1)`;
  pagerPages.forEach((el) => (el.style.transition = ease));
  restPageTransforms();
  setTimeout(() => {
    pagerPages.forEach((el) => (el.style.transition = ""));
    pagesSettling = false;
  }, duration + 60);
}

document.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length > 1 || pagesSettling) return;
    const touch = e.touches[0];
    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
    swipeAxis = null;
    swipeSamples = [{ t: e.timeStamp, x: touch.clientX }];
    swipeEligible = !e.target.closest(
      ".drag-handle, input, select, .settings-overlay, .pokedex-overlay, .dev-note-overlay"
    );
  },
  { passive: true }
);

document.addEventListener(
  "touchmove",
  (e) => {
    if (!swipeEligible || swipeStartX === null) return;
    const touch = e.touches[0];
    const dx = touch.clientX - swipeStartX;
    const dy = touch.clientY - swipeStartY;
    if (swipeAxis === null) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      swipeAxis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
      // render the grid up front so it's populated while it slides in
      if (swipeAxis === "h" && pageIndex === 1 && dx < 0) renderDexGrid();
    }
    if (swipeAxis !== "h") return;
    e.preventDefault();
    const width = pageWidth();
    let offset = Math.max(
      Math.min(dx, pageIndex > 0 ? width : 0),
      pageIndex < pagerPages.length - 1 ? -width : 0
    );
    if (offset === 0 && dx !== 0) {
      // rubber-band when there is no page in that direction
      offset = Math.max(Math.min(dx / 4, 48), -48);
    }
    swipeOffset = offset;
    positionPages(offset);
    swipeSamples.push({ t: e.timeStamp, x: touch.clientX });
    if (swipeSamples.length > 8) swipeSamples.shift();
  },
  { passive: false }
);

document.addEventListener(
  "touchend",
  (e) => {
    if (swipeStartX === null) return;
    const dragged = swipeEligible && swipeAxis === "h";
    const samples = swipeSamples;
    swipeStartX = null;
    swipeStartY = null;
    swipeAxis = null;
    swipeSamples = [];
    if (!dragged) return;
    const touch = e.changedTouches[0];
    const now = e.timeStamp;
    // velocity over the last ~120ms (px/ms, negative = leftward)
    const recent = samples.filter((s) => now - s.t <= 120);
    const first = recent[0];
    const velocity =
      first && now > first.t ? (touch.clientX - first.x) / (now - first.t) : 0;
    let target = pageIndex;
    if (swipeOffset !== 0) {
      const dir = swipeOffset < 0 ? 1 : -1; // page index the drag points at
      const next = pageIndex + dir;
      if (next >= 0 && next < pagerPages.length) {
        const progress = Math.abs(swipeOffset) / pageWidth();
        const vDir = -velocity * dir; // release speed in the drag direction
        if (vDir > -0.3 && (progress > 0.5 || vDir > 0.3)) target = next;
      }
    }
    settlePages(target, velocity);
  },
  { passive: true }
);

document.addEventListener(
  "touchcancel",
  () => {
    if (swipeStartX !== null && swipeEligible && swipeAxis === "h") {
      settlePages(pageIndex, 0);
    }
    swipeStartX = null;
    swipeStartY = null;
    swipeAxis = null;
    swipeSamples = [];
  },
  { passive: true }
);

// ---------------------------------------------------------------------------
// Friends page: swipe right from the main list. Trainer identity and the
// friends list live on this device; team snapshots sync through Supabase so
// friends' pokemon can visit your park. With no Supabase project configured
// everything still works, codes are just local and the park stays private.
// ---------------------------------------------------------------------------

// Paste your Supabase project's URL and anon (publishable) key here to turn
// on sharing - both come from Project Settings -> API in the Supabase
// dashboard, after running supabase/schema.sql in the SQL editor. The
// localStorage overrides exist for debugging only.
const SUPABASE_URL =
  localStorage.getItem("park-supabase-url") || "https://symqtabwgvickxmoxuzk.supabase.co";
const SUPABASE_ANON_KEY =
  localStorage.getItem("park-supabase-key") ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5bXF0YWJ3Z3ZpY2t4bW94dXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NjcyNDAsImV4cCI6MjA5OTU0MzI0MH0.NfnKW7cPUF9zGXa87B2MkWmUomX7Fi2DorKHfqrnhXk";

const TRAINER_KEY = "todo-app-trainer";
const FRIENDS_KEY = "todo-app-friends";

const friendsFabEl = document.getElementById("friends-fab");
const friendsOverlayEl = hubOverlayEl;
const friendsCloseEl = settingsCloseEl;
const friendsHomeViewEl = document.getElementById("friends-home-view");
const friendsNicknameViewEl = document.getElementById("friends-nickname-view");
const friendsCodeEntryEl = document.getElementById("friends-code-entry");
const getCodeBtnEl = document.getElementById("get-code-btn");
const friendsMyCodeEl = document.getElementById("friends-my-code");
const friendsMyCodeLabelEl = document.getElementById("friends-my-code-label");
const friendsCodeValueEl = document.getElementById("friends-code-value");
const nicknameInputEl = document.getElementById("nickname-input");
const nicknameErrorEl = document.getElementById("nickname-error");
const friendCodeFormEl = document.getElementById("friend-code-form");
const friendCodeInputEl = document.getElementById("friend-code-input");
const friendCodeErrorEl = document.getElementById("friend-code-error");
const parkListEl = document.getElementById("park-list");
const parkMineEl = document.getElementById("park-mine");
const parkFriendsEl = document.getElementById("park-friends");
const copyCodeBtnEl = document.getElementById("copy-code-btn");
const shareLinkBtnEl = document.getElementById("share-link-btn");
const friendsEmptyEl = document.getElementById("friends-empty");
const nicknameGoogleBtnEl = document.getElementById("nickname-google-btn");
const devNoteOverlayEl = document.getElementById("dev-note-overlay");
const devNoteContinueEl = document.getElementById("dev-note-continue");
const devNoteCancelEl = document.getElementById("dev-note-cancel");
const accountNicknameFormEl = document.getElementById("account-nickname-form");
const accountNicknameInputEl = document.getElementById("account-nickname-input");
const accountErrorEl = document.getElementById("account-error");
const googleSigninBtnEl = document.getElementById("google-signin-btn");
const accountSignedinEl = document.getElementById("account-signedin");
const accountEmailEl = document.getElementById("account-email");
const googleSignoutBtnEl = document.getElementById("google-signout-btn");

const friendRequestsEl = document.getElementById("friend-requests");
const friendRequestsListEl = document.getElementById("friend-requests-list");
const removeFriendOverlayEl = document.getElementById("remove-friend-overlay");
const removeFriendYesEl = document.getElementById("remove-friend-yes");
const removeFriendNoEl = document.getElementById("remove-friend-no");
const hideTasksToggleEl = document.getElementById("hide-tasks-toggle");

function supabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

async function supabaseRpc(fn, args, accessToken) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = `supabase ${fn} failed: ${res.status}`;
    try {
      const body = JSON.parse(text);
      if (body && body.message) msg = body.message;
    } catch (e) {
      // non-JSON error body
    }
    throw new Error(msg);
  }
  return text ? JSON.parse(text) : null;
}

function loadTrainer() {
  try {
    const stored = JSON.parse(localStorage.getItem(TRAINER_KEY));
    if (stored && stored.nickname && stored.code) return stored;
  } catch (e) {
    // fall through to no trainer yet
  }
  return null;
}

let trainer = loadTrainer();

function saveTrainer() {
  localStorage.setItem(TRAINER_KEY, JSON.stringify(trainer));
}

function loadFriends() {
  try {
    const stored = JSON.parse(localStorage.getItem(FRIENDS_KEY));
    if (Array.isArray(stored)) return stored;
  } catch (e) {
    // fall through to an empty park
  }
  return [];
}

let friends = loadFriends();

function saveFriends() {
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}

const REQUESTS_KEY = "todo-app-requests";

function loadRequests() {
  try {
    const stored = JSON.parse(localStorage.getItem(REQUESTS_KEY));
    if (Array.isArray(stored)) return stored;
  } catch (e) {
    // fall through to no requests
  }
  return [];
}

let friendRequests = loadRequests();

function saveRequests() {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(friendRequests));
}

const PARK_MSG_KEY = "todo-app-park-message";
let parkMessage = localStorage.getItem(PARK_MSG_KEY) || "";

// Last time this device changed a synced profile pref (companion / park
// message), for last-write-wins resolution across devices.
const PREFS_TS_KEY = "todo-app-prefs-ts";
let prefsUpdatedAt = localStorage.getItem(PREFS_TS_KEY) || null;

function touchPrefs() {
  prefsUpdatedAt = new Date().toISOString();
  localStorage.setItem(PREFS_TS_KEY, prefsUpdatedAt);
  schedulePrefsSync();
}

// Whether this device shares its task text with friends. Default on; when off,
// task strings are left out of the pushed snapshot entirely.
const HIDE_TASKS_KEY = "todo-app-hide-tasks";
let hideTasks = localStorage.getItem(HIDE_TASKS_KEY) === "1";

// Local fallback used only when no Supabase project is configured; a
// registered trainer gets a server-generated code instead so it's unique.
function generateTrainerCode() {
  const digits = new Uint32Array(12);
  crypto.getRandomValues(digits);
  const raw = [...digits].map((n) => n % 10).join("");
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

function normalizeCode(raw) {
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length !== 12) return null;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
}

// ---- pushing this device's team up to the park ----

let lastTeamTodos = [];
let lastPushedSnapshot = null;
let pushTeamTimer = null;

function buildTeamSnapshot() {
  const team = lastTeamTodos.slice(0, 6).map((t) => ({
    name: t.pokemon.name,
    dex_id: t.pokemon.dex_id,
    shiny: Boolean(t.pokemon.shiny),
    sprite: t.pokemon.sprite,
    icon: t.pokemon.icon,
    task: !hideTasks && t.text ? t.text : null,
  }));
  const total = lastTeamTodos.length;
  const done = lastTeamTodos.filter((t) => t.status === "done!").length;
  return {
    team,
    progress: total ? Math.round((done / total) * 100) : 0,
    fully_evolved:
      team.length > 0 &&
      lastTeamTodos.slice(0, 6).every((t) => t.status === "done!"),
    message: parkMessage.trim().slice(0, 200),
  };
}

function schedulePushTeam() {
  if (!supabaseConfigured() || !trainer || !trainer.secret) return;
  clearTimeout(pushTeamTimer);
  pushTeamTimer = setTimeout(async () => {
    const snapshot = buildTeamSnapshot();
    const body = JSON.stringify(snapshot);
    if (body === lastPushedSnapshot) return;
    try {
      await supabaseRpc("push_team", {
        p_code: trainer.code,
        p_secret: trainer.secret,
        p_snapshot: snapshot,
      });
      lastPushedSnapshot = body;
    } catch (e) {
      // offline or misconfigured - the next change will retry
    }
  }, 2000);
}

// ---- the park: friends' teams ----

// Turn a showdown slug into something readable for the speech bubble.
function prettyPokeName(n) {
  return String(n)
    .replace(/-megax$/, " mega x")
    .replace(/-megay$/, " mega y")
    .replace(/-mega$/, " mega")
    .replace(/-/g, " ");
}

// The pokepark floor: this device's first two pokemon plus each friend's
// first two roam the whole box like a top-down field - wandering up/down and
// side to side, each hop a little arc, facing their heading and bouncing off
// the padded edges, resting a good while between short bursts. Tapping one
// stops it and pops a small speech bubble naming its owner + pokemon (and the
// associated task, when that owner shares task info).
let parkFloorRaf = null;

function renderParkFloor(actorData) {
  if (parkFloorRaf) {
    cancelAnimationFrame(parkFloorRaf);
    parkFloorRaf = null;
  }
  const list = (actorData || []).filter((d) => d && d.icon).slice(0, 30);
  if (list.length === 0) return;

  const floor = document.createElement("div");
  floor.className = "park-floor";
  parkMineEl.appendChild(floor);

  const bubble = document.createElement("div");
  bubble.className = "park-bubble hidden";
  parkMineEl.appendChild(bubble);

  const rand = (a, b) => a + Math.random() * (b - a);
  const PAD = 8; // gap so they never touch the sides
  const LIFT_MAX = 18; // tallest hop arc; also the top margin so it never clips

  let pausedActor = null;

  let hideTimer = null;

  function positionBubble(a) {
    const above = a.y > 52;
    bubble.classList.toggle("below", !above);
    // center on the pokemon, clamped so the bubble never clips off-screen
    let left = floor.offsetLeft + a.x + a.w / 2;
    const bw = bubble.offsetWidth;
    const cw = parkMineEl.clientWidth;
    left = Math.min(Math.max(left, bw / 2 + 6), cw - bw / 2 - 6);
    bubble.style.left = `${left}px`;
    bubble.style.top = `${floor.offsetTop + a.y + (above ? 0 : a.h)}px`;
  }

  function showBubble(a) {
    clearTimeout(hideTimer);
    if (pausedActor && pausedActor !== a) {
      pausedActor.paused = false;
      pausedActor.restUntil = performance.now() + rand(300, 1000);
    }
    pausedActor = a;
    a.paused = true;
    a.phase = "rest";
    a.hop = null;
    a.hopsLeft = 0;

    const inner = document.createElement("div");
    inner.className = "park-bubble-inner";
    const title = document.createElement("div");
    title.className = "bubble-title";
    title.textContent = `${a.data.nickname}'s ${prettyPokeName(a.data.name)}`;
    inner.appendChild(title);
    if (a.data.task) {
      const task = document.createElement("div");
      task.className = "bubble-task";
      task.textContent = a.data.task;
      inner.appendChild(task);
    }
    bubble.classList.remove("show");
    bubble.innerHTML = "";
    bubble.appendChild(inner);
    bubble.classList.remove("hidden");
    positionBubble(a);
    // reflow so the rise + fade-in transition plays from its hidden start
    void bubble.offsetWidth;
    bubble.classList.add("show");
  }

  function hideBubble() {
    if (!pausedActor) {
      bubble.classList.remove("show");
      bubble.classList.add("hidden");
      return;
    }
    pausedActor.paused = false;
    pausedActor.restUntil = performance.now() + rand(300, 1000);
    pausedActor = null;
    // play the fall + fade-out, then drop it from layout
    bubble.classList.remove("show");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => bubble.classList.add("hidden"), 180);
  }

  floor.addEventListener("click", () => hideBubble());

  // On hover-capable pointers (desktop) the bubble appears on hover; touch
  // devices keep the tap behavior, so mobile is unchanged.
  const hoverCapable = window.matchMedia("(hover: hover)").matches;

  const actors = list.map((d, i) => {
    const img = document.createElement("img");
    img.className = "park-actor" + (d.special ? " special" : "");
    img.src = d.icon;
    img.alt = d.name || "";
    floor.appendChild(img);
    const angle = rand(0, Math.PI * 2);
    const a = {
      img,
      data: d,
      w: 34,
      h: 34,
      sized: false,
      x: 0,
      y: 0,
      hx: Math.cos(angle),
      hy: Math.sin(angle),
      face: 1,
      phase: "rest",
      restUntil: performance.now() + rand(300, 2400) + i * 400,
      hopsLeft: 0,
      hop: null,
      paused: false,
    };
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      if (d.special) {
        openSpecialRegister(d.special);
        return;
      }
      if (pausedActor === a) hideBubble();
      else showBubble(a);
    });
    if (hoverCapable && !d.special) {
      // freeze + show the bubble while hovered, resume on leave
      img.addEventListener("mouseenter", () => showBubble(a));
      img.addEventListener("mouseleave", () => {
        if (pausedActor === a) hideBubble();
      });
    }
    return a;
  });

  const startHop = (a, now, W, H) => {
    const minX = PAD;
    const maxX = Math.max(minX, W - a.w - PAD);
    const minY = PAD + LIFT_MAX;
    const maxY = Math.max(minY, H - a.h - PAD);
    const step = rand(20, 40);
    let nx = a.x + a.hx * step;
    let ny = a.y + a.hy * step;
    if (nx < minX || nx > maxX) {
      a.hx = -a.hx; // reflect off the vertical walls
      nx = a.x + a.hx * step;
    }
    if (ny < minY || ny > maxY) {
      a.hy = -a.hy; // reflect off the top / bottom
      ny = a.y + a.hy * step;
    }
    nx = Math.min(Math.max(nx, minX), maxX);
    ny = Math.min(Math.max(ny, minY), maxY);
    if (Math.abs(a.hx) > 0.15) a.face = a.hx > 0 ? -1 : 1; // face travel dir
    a.hop = { t0: now, dur: rand(360, 470), x0: a.x, y0: a.y, x1: nx, y1: ny, lift: rand(10, LIFT_MAX) };
  };

  let placed = false;

  const frame = (now) => {
    const W = floor.clientWidth;
    const H = floor.clientHeight;
    if (W > 0 && !placed) {
      actors.forEach((a, i) => {
        if (a.img.offsetWidth) {
          a.w = a.img.offsetWidth;
          a.h = a.img.offsetHeight;
          a.sized = true;
        }
        a.x = PAD + Math.max(0, W - a.w - PAD * 2) * ((i + 0.5) / actors.length);
        a.y = (PAD + LIFT_MAX) + Math.max(0, H - a.h - PAD - (PAD + LIFT_MAX)) * rand(0.15, 0.85);
      });
      placed = true;
    }
    for (const a of actors) {
      if (!a.sized && a.img.offsetWidth) {
        a.w = a.img.offsetWidth;
        a.h = a.img.offsetHeight;
        a.sized = true;
      }
      if (a.paused) {
        // stack by ground position: lower on the floor (bigger y) sits in front
        a.img.style.zIndex = Math.round(a.y);
        a.img.style.transform =
          `translate(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px) scaleX(${a.face})`;
        continue;
      }
      let lift = 0;
      if (a.phase === "rest" && now >= a.restUntil) {
        a.hopsLeft = Math.round(rand(2, 4)); // a couple/few hops
        const angle = rand(0, Math.PI * 2); // fresh heading each burst
        a.hx = Math.cos(angle);
        a.hy = Math.sin(angle);
        startHop(a, now, W, H);
        a.phase = "hop";
      }
      if (a.phase === "hop" && a.hop) {
        const p = (now - a.hop.t0) / a.hop.dur;
        if (p >= 1) {
          a.x = a.hop.x1;
          a.y = a.hop.y1;
          a.hopsLeft -= 1;
          if (a.hopsLeft > 0) {
            startHop(a, now, W, H);
          } else {
            a.phase = "rest";
            a.restUntil = now + rand(2400, 5500); // long, varied pause
            a.hop = null;
          }
        } else {
          a.x = a.hop.x0 + (a.hop.x1 - a.hop.x0) * p;
          a.y = a.hop.y0 + (a.hop.y1 - a.hop.y0) * p;
          lift = a.hop.lift * 4 * p * (1 - p); // parabolic hop arc
        }
      }
      const maxX = Math.max(PAD, W - a.w - PAD);
      const maxY = Math.max(PAD + LIFT_MAX, H - a.h - PAD);
      a.x = Math.min(Math.max(a.x, PAD), maxX);
      a.y = Math.min(Math.max(a.y, PAD + LIFT_MAX), maxY);
      // stack by ground position (ignoring the hop lift) so a pokemon farther
      // up the box renders behind one lower down / in front of it
      a.img.style.zIndex = Math.round(a.y);
      a.img.style.transform =
        `translate(${a.x.toFixed(1)}px, ${(a.y - lift).toFixed(1)}px) scaleX(${a.face})`;
    }
    if (pausedActor) positionBubble(pausedActor);
    parkFloorRaf = requestAnimationFrame(frame);
  };
  parkFloorRaf = requestAnimationFrame(frame);
}
function renderParkMine() {
  parkMineEl.innerHTML = "";

  const title = document.createElement("h2");
  title.className = "park-my-title";
  title.textContent = "my team";
  parkMineEl.appendChild(title);

  const box = document.createElement("div");
  box.className = "park-my-icons";
  for (const todo of lastTeamTodos.slice(0, 6)) {
    const img = document.createElement("img");
    img.src = todo.pokemon.icon;
    img.alt = todo.pokemon.name;
    box.appendChild(img);
  }
  parkMineEl.appendChild(box);

  const msg = document.createElement("textarea");
  msg.className = "park-msg-input";
  msg.rows = 1;
  msg.maxLength = 200;
  msg.placeholder = "add a message for your friends...";
  msg.value = parkMessage;
  const autosize = () => {
    msg.style.height = "auto";
    msg.style.height = `${msg.scrollHeight}px`;
  };
  msg.addEventListener("input", () => {
    parkMessage = msg.value.slice(0, 200);
    localStorage.setItem(PARK_MSG_KEY, parkMessage);
    autosize();
    schedulePushTeam();
    touchPrefs();
  });
  parkMineEl.appendChild(msg);
  autosize();

  // Populate the floor: this device's first two, plus each friend's first two.
  const myNick = trainer ? trainer.nickname : "me";
  const floorActors = [];
  for (const t of lastTeamTodos.slice(0, 2)) {
    floorActors.push({
      icon: t.pokemon.icon,
      nickname: myNick,
      name: t.pokemon.name,
      task: !hideTasks && t.text ? t.text : null,
    });
  }
  for (const friend of friends) {
    const team =
      friend.snapshot && Array.isArray(friend.snapshot.team) ? friend.snapshot.team : [];
    for (const p of team.slice(0, 2)) {
      floorActors.push({
        icon: p.icon || dexIconUrl(p.dex_id, p.shiny),
        nickname: friend.nickname,
        name: p.name,
        task: typeof p.task === "string" && p.task ? p.task : null,
      });
    }
  }
  // A rare special visitor hops around with the rest when today's roll hits.
  const visitor = getSpecialVisitor();
  if (visitor) {
    floorActors.push({
      icon: dexIconUrl(visitor.dex, false),
      nickname: "",
      name: visitor.name,
      special: visitor,
    });
  }
  renderParkFloor(floorActors);
}

function renderParkFriends() {
  parkFriendsEl.innerHTML = "";
  for (const friend of friends) {
    const section = document.createElement("div");
    section.className = "park-friend";

    const head = document.createElement("div");
    head.className = "park-friend-head";
    const name = document.createElement("h2");
    name.className = "park-friend-name";
    name.textContent = `${friend.nickname}'s team`;
    const snapshot = friend.snapshot || null;
    if (snapshot && snapshot.fully_evolved) {
      name.insertAdjacentHTML("beforeend", SHINY_STAR_SVG);
    }
    const remove = document.createElement("button");
    remove.className = "park-remove";
    remove.setAttribute("aria-label", `remove ${friend.nickname}`);
    remove.textContent = "\u2715";
    remove.addEventListener("click", () => askRemoveFriend(friend.code));
    head.append(name, remove);
    section.appendChild(head);

    const team = snapshot && Array.isArray(snapshot.team) ? snapshot.team : [];
    if (team.length) {
      // same card structure as the main team: blurred copies behind a 3x2 grid
      const card = document.createElement("div");
      card.className = "park-team-card";
      const blur = document.createElement("div");
      blur.className = "team-blur-bg";
      for (const p of team) {
        const img = document.createElement("img");
        img.src = p.sprite;
        img.alt = "";
        blur.appendChild(img);
      }
      const grid = document.createElement("div");
      grid.className = "team-grid";
      for (let i = 0; i < 6; i++) {
        const slot = document.createElement("div");
        const p = team[i];
        if (p) {
          slot.className = "team-slot" + (isFlying(p.name) ? " flying" : "");
          const img = document.createElement("img");
          img.src = p.sprite;
          img.alt = p.name;
          slot.appendChild(img);
        } else {
          slot.className = "team-slot empty";
        }
        grid.appendChild(slot);
      }
      card.append(blur, grid);
      section.appendChild(card);
    } else {
      const empty = document.createElement("p");
      empty.className = "park-empty";
      empty.textContent = "no team synced yet";
      section.appendChild(empty);
    }

    const msgText =
      snapshot && typeof snapshot.message === "string"
        ? snapshot.message.trim().slice(0, 200)
        : "";
    if (msgText) {
      const m = document.createElement("p");
      m.className = "park-friend-msg";
      m.textContent = `"${msgText}"`;
      section.appendChild(m);
    }

    parkFriendsEl.appendChild(section);
  }
}

// NOTE: friends' pokemon are display-only - nothing in the park calls
// registerDiscovery, so visiting teams never fill in the local pokedex.
function renderPark() {
  renderParkMine();
  renderParkFriends();
}

// Pull the authoritative friend + request state from the server. Accepted
// friends arrive with their team snapshots embedded; incoming requests are
// trainers who added my code and I haven't accepted yet.
async function refreshFriends() {
  if (!supabaseConfigured() || !trainer || !trainer.secret) return;
  try {
    const data = await supabaseRpc("list_friends", {
      p_code: trainer.code,
      p_secret: trainer.secret,
    });
    const nextFriends = (data && data.friends) || [];
    // Rebuild the floor when the friend data changes, so friends' pokemon
    // (and their task bubbles) appear/update instead of lagging a refresh.
    const friendsChanged = JSON.stringify(nextFriends) !== JSON.stringify(friends);
    friends = nextFriends;
    friendRequests = (data && data.requests) || [];
    saveFriends();
    saveRequests();
    if (friendsChanged) renderParkMine();
    renderParkFriends();
    renderFriendRequests();
    renderFriendsTeams();
  } catch (e) {
    // offline or friends.sql not run yet - keep cached state
  }
}

function refreshPark() {
  renderPark();
  refreshFriends();
}

function renderFriendRequests() {
  if (!friendRequestsEl) return;
  friendRequestsListEl.innerHTML = "";
  friendRequestsEl.classList.toggle("hidden", friendRequests.length === 0);
  for (const req of friendRequests) {
    const row = document.createElement("div");
    row.className = "friend-request-row";
    const name = document.createElement("span");
    name.className = "friend-request-name";
    name.textContent = req.nickname;
    const actions = document.createElement("div");
    actions.className = "friend-request-actions";
    const yes = document.createElement("button");
    yes.className = "req-btn req-accept";
    yes.setAttribute("aria-label", `accept ${req.nickname}`);
    yes.textContent = "\u2713";
    yes.addEventListener("click", () => respondRequest(req.code, true));
    const no = document.createElement("button");
    no.className = "req-btn req-decline";
    no.setAttribute("aria-label", `decline ${req.nickname}`);
    no.textContent = "\u2715";
    no.addEventListener("click", () => respondRequest(req.code, false));
    actions.append(yes, no);
    row.append(name, actions);
    friendRequestsListEl.appendChild(row);
  }
}

async function respondRequest(code, accept) {
  if (!trainer || !trainer.secret) return;
  // optimistic: drop it from the list right away
  friendRequests = friendRequests.filter((r) => r.code !== code);
  saveRequests();
  renderFriendRequests();
  try {
    await supabaseRpc("respond_friend_request", {
      p_code: trainer.code,
      p_secret: trainer.secret,
      p_requester_code: code,
      p_accept: accept,
    });
  } catch (e) {
    // the refresh below re-syncs the real state
  }
  refreshFriends();
}

// ---- removing a friend (with confirmation) ----

let pendingRemoveCode = null;

function askRemoveFriend(code) {
  pendingRemoveCode = code;
  removeFriendOverlayEl.classList.remove("hidden");
}

removeFriendNoEl.addEventListener("click", () => {
  pendingRemoveCode = null;
  removeFriendOverlayEl.classList.add("hidden");
});

removeFriendYesEl.addEventListener("click", async () => {
  const code = pendingRemoveCode;
  pendingRemoveCode = null;
  removeFriendOverlayEl.classList.add("hidden");
  if (!code || !trainer || !trainer.secret) return;
  friends = friends.filter((f) => f.code !== code);
  saveFriends();
  renderParkFriends();
  try {
    await supabaseRpc("remove_friend", {
      p_code: trainer.code,
      p_secret: trainer.secret,
      p_friend_code: code,
    });
  } catch (e) {
    // ignore; refresh re-syncs
  }
  refreshFriends();
});

removeFriendOverlayEl.addEventListener("click", (e) => {
  if (e.target === removeFriendOverlayEl) {
    pendingRemoveCode = null;
    removeFriendOverlayEl.classList.add("hidden");
  }
});

// ---- the friends menu ----

function showFormError(el, msg) {
  el.textContent = msg;
  el.classList.remove("hidden");
  el.classList.remove("success");
}

function showFormNote(el, msg) {
  el.textContent = msg;
  el.classList.remove("hidden");
  el.classList.add("success");
}

// A read-only look at everyone's team (as PC icon sprites) + their messages,
// shown in the friends menu below the hide-tasks toggle. Desktop-only, so the
// mobile friends menu (which already has the pokepark page) is unchanged.
function renderFriendsTeams() {
  const el = document.getElementById("friends-teams");
  if (!el) return;
  if (!window.matchMedia || !window.matchMedia("(min-width: 1024px)").matches) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = "";

  const iconRow = (items) => {
    const box = document.createElement("div");
    box.className = "ft-icons";
    for (const p of items.slice(0, 6)) {
      const img = document.createElement("img");
      img.src = p.icon;
      img.alt = p.name || "";
      box.appendChild(img);
    }
    return box;
  };
  const addMsg = (text, prefix) => {
    const t = (text || "").trim();
    if (!t) return;
    const p = document.createElement("p");
    p.className = "ft-msg";
    p.textContent = prefix ? `message: "${t}"` : `"${t}"`;
    el.appendChild(p);
  };

  // my team
  const myTitle = document.createElement("h3");
  myTitle.className = "ft-title";
  myTitle.textContent = "my team";
  el.appendChild(myTitle);
  el.appendChild(iconRow(lastTeamTodos.slice(0, 6).map((t) => ({ icon: t.pokemon.icon, name: t.pokemon.name }))));
  addMsg(parkMessage, true);

  // each friend
  for (const friend of friends) {
    const snap = friend.snapshot || null;
    const title = document.createElement("h3");
    title.className = "ft-title";
    title.textContent = `${friend.nickname}'s team`;
    if (snap && snap.fully_evolved) title.insertAdjacentHTML("beforeend", SHINY_STAR_SVG);
    el.appendChild(title);
    const team = snap && Array.isArray(snap.team) ? snap.team : [];
    if (team.length) {
      el.appendChild(iconRow(team.map((p) => ({ icon: p.icon || dexIconUrl(p.dex_id, p.shiny), name: p.name }))));
    } else {
      const e = document.createElement("p");
      e.className = "ft-empty";
      e.textContent = "no team synced yet";
      el.appendChild(e);
    }
    addMsg(snap && snap.message, false);
  }
}

function renderFriendsMenu() {
  friendsHomeViewEl.classList.remove("hidden");
  friendsNicknameViewEl.classList.add("hidden");
  friendCodeErrorEl.classList.add("hidden");
  nicknameErrorEl.classList.add("hidden");
  const hasTrainer = Boolean(trainer);
  getCodeBtnEl.classList.toggle("hidden", hasTrainer);
  friendsCodeEntryEl.classList.toggle("hidden", !hasTrainer);
  friendsMyCodeEl.classList.toggle("hidden", !hasTrainer);
  if (hasTrainer) {
    friendsMyCodeLabelEl.textContent = `${trainer.nickname}'s trainer code`;
    friendsCodeValueEl.textContent = trainer.code;
    friendsEmptyEl.classList.toggle("hidden", friends.length > 0);
    renderFriendRequests();
    hideTasksToggleEl.classList.toggle("on", hideTasks);
    hideTasksToggleEl.setAttribute("aria-checked", String(hideTasks));
    renderFriendsTeams();
  }
}

// ---- unified settings / account / friends hub ----
const HUB_PANES = {
  settings: "hub-pane-settings",
  account: "hub-pane-account",
  friends: "hub-pane-friends",
};

function showHubTab(tab) {
  for (const [name, id] of Object.entries(HUB_PANES)) {
    const pane = document.getElementById(id);
    if (pane) pane.classList.toggle("hidden", name !== tab);
  }
  document.querySelectorAll(".hub-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.hubtab === tab);
  });
  if (tab === "settings") {
    updateFontMobileUI(); // reflect current sign-in state
  } else if (tab === "friends") {
    renderFriendsMenu();
    refreshFriends();
  } else if (tab === "account") {
    renderAccountView();
  }
}

function openHub(tab) {
  showHubTab(tab || "settings");
  hubOverlayEl.classList.remove("hidden");
}

function closeHub() {
  hubOverlayEl.classList.add("hidden");
  resetViewportScroll();
}

document.querySelectorAll(".hub-tab").forEach((btn) => {
  btn.addEventListener("click", () => showHubTab(btn.dataset.hubtab));
});
settingsCloseEl.addEventListener("click", closeHub);
hubOverlayEl.addEventListener("click", (e) => {
  if (e.target === hubOverlayEl) closeHub();
});

friendsFabEl.addEventListener("click", () => openHub("friends"));

hideTasksToggleEl.addEventListener("click", () => {
  hideTasks = !hideTasks;
  localStorage.setItem(HIDE_TASKS_KEY, hideTasks ? "1" : "0");
  hideTasksToggleEl.classList.toggle("on", hideTasks);
  hideTasksToggleEl.setAttribute("aria-checked", String(hideTasks));
  schedulePushTeam(); // re-push so friends' bubbles reflect the change
  renderParkMine(); // rebuild the floor with/without task text
});

getCodeBtnEl.addEventListener("click", () => {
  friendsHomeViewEl.classList.add("hidden");
  friendsNicknameViewEl.classList.remove("hidden");
  nicknameInputEl.focus();
});

friendsNicknameViewEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nickname = nicknameInputEl.value.trim();
  if (!nickname) return;
  nicknameErrorEl.classList.add("hidden");
  const btn = friendsNicknameViewEl.querySelector("button");
  btn.disabled = true;
  const error = await saveNickname(nickname);
  btn.disabled = false;
  if (error) {
    showFormError(nicknameErrorEl, error);
    return;
  }
  nicknameInputEl.blur();
  renderFriendsMenu();
});

friendCodeFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  friendCodeErrorEl.classList.add("hidden");
  const code = normalizeCode(friendCodeInputEl.value);
  if (!code) {
    showFormError(friendCodeErrorEl, "that doesn't look like a trainer code");
    return;
  }
  if (trainer && code === trainer.code) {
    showFormError(friendCodeErrorEl, "that's your own code!");
    return;
  }
  if (friends.some((f) => f.code === code)) {
    showFormError(friendCodeErrorEl, "they're already in your park");
    return;
  }
  if (!supabaseConfigured() || !trainer || !trainer.secret) {
    showFormError(friendCodeErrorEl, "make your trainer code first");
    return;
  }
  const btn = friendCodeFormEl.querySelector("button");
  btn.disabled = true;
  try {
    const res = await supabaseRpc("send_friend_request", {
      p_code: trainer.code,
      p_secret: trainer.secret,
      p_friend_code: code,
    });
    friendCodeInputEl.value = "";
    showFormNote(
      friendCodeErrorEl,
      res && res.status === "accepted" ? "you're friends now!" : "request sent!"
    );
    await refreshFriends();
  } catch (err) {
    const msg = String((err && err.message) || "");
    showFormError(
      friendCodeErrorEl,
      msg.includes("no trainer")
        ? "no trainer found with that code"
        : "couldn't reach the park - try again"
    );
  } finally {
    btn.disabled = false;
  }
});

async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // legacy fallback for older webviews / missing clipboard permission
    const scratch = document.createElement("textarea");
    scratch.value = text;
    scratch.setAttribute("readonly", "");
    scratch.style.position = "fixed";
    scratch.style.opacity = "0";
    document.body.appendChild(scratch);
    scratch.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e2) {
      ok = false;
    }
    scratch.remove();
    return ok;
  }
}

const INVITE_MESSAGE =
  "be my friend on pokeplanner plzzzz my team is so cool you gotta see";
const COPY_ICON_HTML = copyCodeBtnEl.innerHTML;
const SHARE_ICON_HTML = shareLinkBtnEl.innerHTML;
const CHECK_ICON_HTML =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>';

function appLink() {
  return location.origin + location.pathname;
}

// The copy icon copies the trainer code itself; briefly swap to a checkmark.
async function copyTrainerCode() {
  if (!trainer) return;
  const ok = await writeClipboard(trainer.code);
  if (!ok) return;
  copyCodeBtnEl.innerHTML = CHECK_ICON_HTML;
  copyCodeBtnEl.classList.add("copied");
  setTimeout(() => {
    copyCodeBtnEl.innerHTML = COPY_ICON_HTML;
    copyCodeBtnEl.classList.remove("copied");
  }, 1200);
}

// The share button hands the invite link to the OS share sheet (iMessage,
// Instagram, etc). Where that isn't available, it copies text + link instead.
async function shareInvite() {
  const url = appLink();
  const text = trainer ? `${INVITE_MESSAGE}: ${trainer.code}` : INVITE_MESSAGE;
  if (navigator.share) {
    try {
      await navigator.share({ text, url });
    } catch (e) {
      // user dismissed the share sheet - nothing to do
    }
    return;
  }
  const ok = await writeClipboard(`${text} ${url}`);
  if (!ok) return;
  shareLinkBtnEl.innerHTML = CHECK_ICON_HTML;
  setTimeout(() => {
    shareLinkBtnEl.innerHTML = SHARE_ICON_HTML;
  }, 1200);
}

copyCodeBtnEl.addEventListener("click", copyTrainerCode);
shareLinkBtnEl.addEventListener("click", shareInvite);

// ---- account: nickname changes + google sign-in backup ----

const AUTH_KEY = "todo-app-auth";

function loadAuthSession() {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTH_KEY));
    if (stored && stored.access_token) return stored;
  } catch (e) {
    // fall through to signed out
  }
  return null;
}

let authSession = loadAuthSession();
let authRedirectError = "";

function saveAuthSession() {
  if (authSession) localStorage.setItem(AUTH_KEY, JSON.stringify(authSession));
  else localStorage.removeItem(AUTH_KEY);
}

// After signing in: back up this device's trainer to the account, or - on a
// fresh device - restore the trainer the account already owns.
async function syncTrainerWithAccount() {
  if (!authSession || !supabaseConfigured()) return;
  try {
    if (trainer && trainer.secret) {
      await supabaseRpc(
        "link_trainer",
        { p_code: trainer.code, p_secret: trainer.secret },
        authSession.access_token
      );
    } else {
      const mine = await supabaseRpc("get_my_trainer", {}, authSession.access_token);
      if (mine && mine.code) {
        trainer = { nickname: mine.nickname, code: mine.code, secret: mine.secret };
        saveTrainer();
        schedulePushTeam();
      }
    }
  } catch (e) {
    // offline, or account.sql not run yet - sign-in still works locally
  }
}

// ---- cross-device task sync (signed-in accounts) ----
// A signed-in user's whole task list is backed up to their account and
// restored on any device they sign in on. Conflicts resolve last-write-wins by
// timestamp: whichever device edited most recently wins. Everything degrades
// gracefully - offline or before tasks.sql is run, these just no-op locally.
let lastSyncedTasks = null;
let taskSyncTimer = null;

function taskSyncPayload() {
  return { nextId: taskStore.nextId, todos: taskStore.todos };
}

function scheduleTaskSync() {
  if (!authSession || !supabaseConfigured()) return;
  clearTimeout(taskSyncTimer);
  taskSyncTimer = setTimeout(pushTasks, 1500);
}

async function pushTasks() {
  if (!authSession || !supabaseConfigured()) return;
  const payload = taskSyncPayload();
  const body = JSON.stringify(payload);
  if (body === lastSyncedTasks) return;
  try {
    await ensureFreshAuth();
    if (!authSession) return;
    await supabaseRpc("push_tasks", { p_data: payload }, authSession.access_token);
    lastSyncedTasks = body;
  } catch (e) {
    // offline or tasks.sql not run yet - the next change retries
  }
}

async function pullTasks() {
  if (!authSession || !supabaseConfigured()) return;
  try {
    await ensureFreshAuth();
    if (!authSession) return;
    const remote = await supabaseRpc("get_tasks", {}, authSession.access_token);
    if (!remote || !remote.data) {
      // nothing backed up yet: seed the account from this device
      lastSyncedTasks = null;
      if (taskStore.todos.length) scheduleTaskSync();
      return;
    }
    const remoteMs = remote.updated_at ? Date.parse(remote.updated_at) : 0;
    const localMs = taskStore.updatedAt ? Date.parse(taskStore.updatedAt) : 0;
    if (remoteMs >= localMs) {
      // the account's list is newer (or this device has no edits yet): adopt it
      const data = remote.data;
      const before = JSON.stringify(taskSyncPayload()); // what's rendered now
      taskStore.todos = Array.isArray(data.todos) ? data.todos : [];
      taskStore.nextId = Number.isInteger(data.nextId)
        ? data.nextId
        : taskStore.todos.reduce((m, t) => Math.max(m, t.id), 0) + 1;
      taskStore.updatedAt = remote.updated_at;
      saveTaskStore();
      const after = JSON.stringify(taskSyncPayload());
      lastSyncedTasks = after;
      if (after !== before) refresh(); // only re-render when the list changed
    } else {
      // this device edited more recently: push it up
      lastSyncedTasks = null;
      scheduleTaskSync();
    }
  } catch (e) {
    // offline or tasks.sql not run yet
  }
}

// ---- cross-device pokedex sync (signed-in accounts) ----
// Pokedex progress (discoveries + registered specials) only ever grows, so both
// sides are unioned together rather than one overwriting the other - no
// conflicts, no data loss regardless of which device saw what first.
let dexSyncTimer = null;

function dexSyncPayload() {
  return {
    discoveries: { all: dexDiscoveries.all, shiny: dexDiscoveries.shiny },
    special: specialRegistered,
  };
}

function scheduleDexSync() {
  if (!authSession || !supabaseConfigured()) return;
  clearTimeout(dexSyncTimer);
  dexSyncTimer = setTimeout(pushDex, 1500);
}

async function pushDex() {
  if (!authSession || !supabaseConfigured()) return;
  try {
    await ensureFreshAuth();
    if (!authSession) return;
    await supabaseRpc("push_dex", { p_data: dexSyncPayload() }, authSession.access_token);
  } catch (e) {
    // offline or tasks.sql not run yet - the next discovery retries
  }
}

// Union the account's progress into this device's. Reports whether local gained
// anything (needs a re-render) and whether the cloud is missing anything we
// have (needs a push so it converges to the union).
function mergeDexFrom(remote) {
  let localChanged = false;
  let cloudMissing = false;
  const union = (localObj, remoteObj) => {
    remoteObj = remoteObj || {};
    for (const k in remoteObj) {
      if (remoteObj[k] && !localObj[k]) {
        localObj[k] = true;
        localChanged = true;
      }
    }
    for (const k in localObj) {
      if (localObj[k] && !remoteObj[k]) cloudMissing = true;
    }
  };
  const d = (remote && remote.discoveries) || {};
  union(dexDiscoveries.all, d.all);
  union(dexDiscoveries.shiny, d.shiny);
  union(specialRegistered, remote && remote.special);
  return { localChanged, cloudMissing };
}

async function pullDex() {
  if (!authSession || !supabaseConfigured()) return;
  try {
    await ensureFreshAuth();
    if (!authSession) return;
    const remote = await supabaseRpc("get_dex", {}, authSession.access_token);
    const { localChanged, cloudMissing } = mergeDexFrom(remote);
    if (localChanged) {
      saveDexDiscoveries();
      saveSpecialRegistered();
      renderDexGrid();
    }
    // push our merged superset up whenever the cloud is missing anything we have
    if (cloudMissing) scheduleDexSync();
  } catch (e) {
    // offline or tasks.sql not run yet
  }
}

// ---- cross-device profile sync: companion pokemon + pokepark message ----
// Single-value settings, resolved last-write-wins by timestamp like tasks.
let prefsSyncTimer = null;

function prefsSyncPayload() {
  return {
    companion: settings.companion,
    parkMessage,
    font: settings.font,
    fontMobile: settings.fontMobile,
    differentFontMobile: settings.differentFontMobile,
  };
}

function schedulePrefsSync() {
  if (!authSession || !supabaseConfigured()) return;
  clearTimeout(prefsSyncTimer);
  prefsSyncTimer = setTimeout(pushPrefs, 1500);
}

async function pushPrefs() {
  if (!authSession || !supabaseConfigured()) return;
  try {
    await ensureFreshAuth();
    if (!authSession) return;
    await supabaseRpc("push_prefs", { p_data: prefsSyncPayload() }, authSession.access_token);
  } catch (e) {
    // offline or tasks.sql not run yet - the next change retries
  }
}

async function pullPrefs() {
  if (!authSession || !supabaseConfigured()) return;
  try {
    await ensureFreshAuth();
    if (!authSession) return;
    const remote = await supabaseRpc("get_prefs", {}, authSession.access_token);
    if (!remote || !remote.data) {
      if (prefsUpdatedAt) schedulePrefsSync(); // seed the account from this device
      return;
    }
    const remoteMs = remote.updated_at ? Date.parse(remote.updated_at) : 0;
    const localMs = prefsUpdatedAt ? Date.parse(prefsUpdatedAt) : 0;
    if (remoteMs >= localMs) {
      // adopt the account's newer companion / message
      const data = remote.data;
      const companion = typeof data.companion === "string" ? data.companion : settings.companion;
      const message = typeof data.parkMessage === "string" ? data.parkMessage : parkMessage;
      const font = typeof data.font === "string" ? data.font : settings.font;
      const fontMobile = typeof data.fontMobile === "string" ? data.fontMobile : settings.fontMobile;
      const diffFontMobile =
        typeof data.differentFontMobile === "boolean" ? data.differentFontMobile : settings.differentFontMobile;
      const fontChanged =
        font !== settings.font ||
        fontMobile !== settings.fontMobile ||
        diffFontMobile !== settings.differentFontMobile;
      const changed = companion !== settings.companion || message !== parkMessage || fontChanged;
      settings.companion = companion;
      settings.font = font;
      settings.fontMobile = fontMobile;
      settings.differentFontMobile = diffFontMobile;
      saveSettings(settings);
      parkMessage = message;
      localStorage.setItem(PARK_MSG_KEY, parkMessage);
      prefsUpdatedAt = remote.updated_at;
      localStorage.setItem(PREFS_TS_KEY, prefsUpdatedAt);
      if (changed) {
        updateCompanionSearch();
        renderCompanionMenu("");
        applyCompanion();
        applyMatchCompanion();
        const msgInput = document.querySelector(".park-msg-input");
        if (msgInput) msgInput.value = parkMessage;
      }
      if (fontChanged) {
        applyFont();
        refreshFontPicker(MAIN_FONT_PICKER);
        refreshFontPicker(MOBILE_FONT_PICKER);
        updateFontMobileUI();
      }
    } else {
      schedulePrefsSync(); // this device is newer: push it up
    }
  } catch (e) {
    // offline or tasks.sql not run yet
  }
}

// Supabase sends OAuth tokens back in the URL hash after the Google redirect.
async function handleAuthRedirect() {
  if (!location.hash) return;
  const params = new URLSearchParams(location.hash.slice(1));
  const desc = params.get("error_description");
  if (desc) {
    authRedirectError = desc.replace(/\+/g, " ");
    history.replaceState(null, "", location.pathname + location.search);
    return;
  }
  const access = params.get("access_token");
  if (!access) return;
  history.replaceState(null, "", location.pathname + location.search);
  authSession = {
    access_token: access,
    refresh_token: params.get("refresh_token") || "",
    expires_at: Date.now() + Number(params.get("expires_in") || 3600) * 1000,
    email: "",
  };
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${access}` },
    });
    if (res.ok) {
      const user = await res.json();
      authSession.email = user.email || "";
    }
  } catch (e) {
    // keep the session; the email line is cosmetic
  }
  saveAuthSession();
  await syncTrainerWithAccount();
  await pullTasks();
  await pullDex();
  await pullPrefs();
  await pullUi();
  await pullCal();
  // now signed in: the mobile-font toggle becomes available and may change
  // which font this device shows
  updateFontMobileUI();
  applyFont();
}

async function ensureFreshAuth() {
  if (!authSession || !supabaseConfigured()) return;
  if (Date.now() < authSession.expires_at - 60000) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ refresh_token: authSession.refresh_token }),
    });
    if (!res.ok) throw new Error(`refresh failed: ${res.status}`);
    const data = await res.json();
    authSession.access_token = data.access_token;
    authSession.refresh_token = data.refresh_token || authSession.refresh_token;
    authSession.expires_at = Date.now() + (data.expires_in || 3600) * 1000;
    if (data.user && data.user.email) authSession.email = data.user.email;
    saveAuthSession();
  } catch (e) {
    authSession = null;
    saveAuthSession();
  }
}

function startGoogleSignIn() {
  const redirect = encodeURIComponent(location.origin + location.pathname);
  location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirect}`;
}

async function signOutGoogle() {
  const token = authSession ? authSession.access_token : null;
  authSession = null;
  saveAuthSession();
  // Keep the tasks on this device, but forget the sync state so signing back
  // in (or a different account) re-evaluates against the cloud cleanly.
  lastSyncedTasks = null;
  // the mobile-font option is signed-in-only; hide it and revert to the shared font
  updateFontMobileUI();
  applyFont();
  renderAccountView();
  if (token) {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      // local sign-out already happened
    }
  }
}

// Save a nickname: renames the existing trainer, or registers a new one.
async function saveNickname(nickname) {
  if (supabaseConfigured()) {
    try {
      if (trainer && trainer.secret) {
        await supabaseRpc("update_nickname", {
          p_code: trainer.code,
          p_secret: trainer.secret,
          p_nickname: nickname,
        });
        trainer = { ...trainer, nickname };
      } else {
        const created = await supabaseRpc("create_trainer", { p_nickname: nickname });
        trainer = { nickname, code: created.code, secret: created.secret };
        await syncTrainerWithAccount();
      }
    } catch (err) {
      return "couldn't reach the park - try again";
    }
  } else {
    trainer = {
      nickname,
      code: trainer ? trainer.code : generateTrainerCode(),
      secret: trainer ? trainer.secret : undefined,
    };
  }
  saveTrainer();
  schedulePushTeam();
  return null;
}

function renderAccountView() {
  accountNicknameInputEl.value = trainer ? trainer.nickname : "";
  accountErrorEl.classList.add("hidden");
  if (authRedirectError) {
    showFormError(accountErrorEl, authRedirectError);
    authRedirectError = "";
  }
  const signedIn = Boolean(authSession);
  googleSigninBtnEl.classList.toggle("hidden", signedIn);
  accountSignedinEl.classList.toggle("hidden", !signedIn);
  if (signedIn) {
    accountEmailEl.textContent = authSession.email
      ? `signed in as ${authSession.email}`
      : "signed in";
  }
}

accountNicknameFormEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nickname = accountNicknameInputEl.value.trim();
  if (!nickname) return;
  accountErrorEl.classList.add("hidden");
  const btn = accountNicknameFormEl.querySelector("button");
  btn.disabled = true;
  const error = await saveNickname(nickname);
  btn.disabled = false;
  if (error) {
    showFormError(accountErrorEl, error);
    return;
  }
  btn.textContent = "saved!";
  setTimeout(() => {
    btn.textContent = "save";
  }, 1200);
});

// Both sign-in entry points first show the "note from developer" popup so the
// supabase redirect domain isn't a surprise; continue then does the redirect.
function requestGoogleSignIn(errorEl) {
  if (!supabaseConfigured()) {
    if (errorEl) showFormError(errorEl, "sharing isn't set up on this build yet");
    return;
  }
  devNoteOverlayEl.classList.remove("hidden");
}

googleSigninBtnEl.addEventListener("click", () => requestGoogleSignIn(accountErrorEl));
nicknameGoogleBtnEl.addEventListener("click", () => requestGoogleSignIn(nicknameErrorEl));

devNoteContinueEl.addEventListener("click", () => {
  devNoteOverlayEl.classList.add("hidden");
  startGoogleSignIn();
});
devNoteCancelEl.addEventListener("click", () => {
  devNoteOverlayEl.classList.add("hidden");
});
devNoteOverlayEl.addEventListener("click", (e) => {
  if (e.target === devNoteOverlayEl) devNoteOverlayEl.classList.add("hidden");
});

googleSignoutBtnEl.addEventListener("click", signOutGoogle);

// A trainer registered before sharing was configured has no write secret;
// re-register them once so their code becomes real. Their code changes,
// but a local-only code was never shareable anyway.
if (supabaseConfigured() && trainer && !trainer.secret) {
  supabaseRpc("create_trainer", { p_nickname: trainer.nickname })
    .then((created) => {
      trainer = { nickname: trainer.nickname, code: created.code, secret: created.secret };
      saveTrainer();
      schedulePushTeam();
    })
    .catch(() => {
      // stay local until the park is reachable
    });
}

refreshPark();

if (supabaseConfigured()) {
  (async () => {
    await handleAuthRedirect();
    await ensureFreshAuth();
    // Already signed in from a previous visit: pull this account's latest
    // tasks, pokedex progress, and profile (companion + park message).
    await pullTasks();
    await pullDex();
    await pullPrefs();
    await pullUi();
    await pullCal();
  })();
}

// Coming back to the app (switching devices, reopening the tab) re-pulls so the
// list, pokedex, and profile reflect changes made on another device.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    pullTasks();
    pullDex();
    pullPrefs();
    pullUi();
    pullCal();
  }
});

for (const tab of document.querySelectorAll(".dex-tab")) {
  tab.addEventListener("click", () => {
    dexActiveTab = tab.dataset.tab;
    document.querySelectorAll(".dex-tab").forEach((b) => b.classList.toggle("active", b === tab));
    renderDexGrid();
  });
}

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = "";
  addTodo(text);
});

listScrollEl.addEventListener("scroll", () => {
  headerFadeEl.classList.toggle("visible", listScrollEl.scrollTop > 0);
});

renderDate();
initSettings();
refresh();

// ==========================================================================
// Desktop dashboard (>=1024px). Relocates the live team / task / poképark /
// pokédex nodes into the desktop scaffold and drives the desktop-only widgets
// (editable banner + title, clock, spotify embed). Mobile is never touched:
// none of this runs, and no styles apply, below the breakpoint.
// ==========================================================================
const DESKTOP_MQ = window.matchMedia("(min-width: 1024px)");

const UI_PREFS_KEY = "todo-app-ui-prefs";
function loadUiPrefs() {
  const defaults = { banner: "", title: "pokeplanner", spotify: "", bannerPos: 50, pageLayout: {} };
  try {
    const s = JSON.parse(localStorage.getItem(UI_PREFS_KEY));
    if (s && typeof s === "object") return { ...defaults, ...s, pageLayout: { ...(s.pageLayout || {}) } };
  } catch (e) {
    // fall through to defaults
  }
  return { ...defaults };
}
let uiPrefs = loadUiPrefs();
function saveUiPrefs() {
  localStorage.setItem(UI_PREFS_KEY, JSON.stringify(uiPrefs));
}

// ---- ui prefs sync (banner/title/spotify), last-write-wins by timestamp ----
let uiSyncTimer = null;
let lastSyncedUi = null;
function uiSyncBody() {
  return JSON.stringify({ banner: uiPrefs.banner, title: uiPrefs.title, spotify: uiPrefs.spotify, bannerPos: uiPrefs.bannerPos, pageLayout: uiPrefs.pageLayout });
}
function touchUiPrefs() {
  uiPrefs.updatedAt = new Date().toISOString();
  saveUiPrefs();
  if (!authSession || !supabaseConfigured()) return;
  clearTimeout(uiSyncTimer);
  uiSyncTimer = setTimeout(pushUi, 1500);
}
async function pushUi() {
  if (!authSession || !supabaseConfigured()) return;
  const body = uiSyncBody();
  if (body === lastSyncedUi) return;
  try {
    await ensureFreshAuth();
    if (!authSession) return;
    await supabaseRpc(
      "push_ui",
      { p_data: { banner: uiPrefs.banner, title: uiPrefs.title, spotify: uiPrefs.spotify, bannerPos: uiPrefs.bannerPos, pageLayout: uiPrefs.pageLayout, updatedAt: uiPrefs.updatedAt } },
      authSession.access_token
    );
    lastSyncedUi = body;
  } catch (e) {
    // offline or tasks.sql not run yet - retries on next change
  }
}
async function pullUi() {
  if (!authSession || !supabaseConfigured()) return;
  try {
    await ensureFreshAuth();
    if (!authSession) return;
    const remote = await supabaseRpc("get_ui", {}, authSession.access_token);
    if (!remote || !remote.data) {
      if (uiPrefs.updatedAt) { clearTimeout(uiSyncTimer); uiSyncTimer = setTimeout(pushUi, 1500); }
      return;
    }
    const remoteMs = remote.updated_at ? Date.parse(remote.updated_at) : 0;
    const localMs = uiPrefs.updatedAt ? Date.parse(uiPrefs.updatedAt) : 0;
    if (remoteMs >= localMs) {
      const d = remote.data;
      if (typeof d.banner === "string") uiPrefs.banner = d.banner;
      if (typeof d.title === "string") uiPrefs.title = d.title;
      if (typeof d.spotify === "string") uiPrefs.spotify = d.spotify;
      if (typeof d.bannerPos === "number") uiPrefs.bannerPos = d.bannerPos;
      if (d.pageLayout && typeof d.pageLayout === "object") uiPrefs.pageLayout = d.pageLayout;
      uiPrefs.updatedAt = remote.updated_at;
      saveUiPrefs();
      lastSyncedUi = uiSyncBody();
      if (DESKTOP_MQ.matches) applyUiPrefs();
    } else {
      clearTimeout(uiSyncTimer);
      uiSyncTimer = setTimeout(pushUi, 1500);
    }
  } catch (e) {
    // offline or tasks.sql not run yet
  }
}

// A spotify share link (or spotify: URI) -> its /embed/ iframe URL.
function spotifyEmbedUrl(link) {
  if (!link) return "";
  let m = link.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]+)/);
  if (m) return `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
  m = link.match(/spotify:(playlist|album|track|artist|show|episode):([A-Za-z0-9]+)/);
  if (m) return `https://open.spotify.com/embed/${m[1]}/${m[2]}`;
  return "";
}
function renderSpotifyEmbed() {
  const frame = document.getElementById("dt-embed-frame");
  if (!frame) return;
  const embed = spotifyEmbedUrl(uiPrefs.spotify);
  frame.innerHTML = embed
    ? `<iframe src="${embed}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`
    : `<div class="dt-embed-empty">add a spotify playlist link</div>`;
}

function applyUiPrefs() {
  const banner = document.getElementById("dt-banner");
  if (banner) {
    banner.style.backgroundImage = uiPrefs.banner ? `url("${uiPrefs.banner}")` : "";
    banner.classList.toggle("has-image", Boolean(uiPrefs.banner));
    banner.style.backgroundPosition = `center ${uiPrefs.bannerPos != null ? uiPrefs.bannerPos : 50}%`;
  }
  const title = document.getElementById("dt-title");
  if (title && document.activeElement !== title) title.textContent = uiPrefs.title || "pokeplanner";
  renderSpotifyEmbed();
  applyPageLayout();
}

// ==========================================================================
// Page edit mode (desktop only): drag to resize columns / margins / items and
// recolor the clock, background, and button tiers. All of it persists in
// uiPrefs.pageLayout (synced), and none of it is interactive unless edit mode
// is on. Mobile never sees any of this.
// ==========================================================================
const PAGE_ITEMS = [
  { id: "clock", sel: ".dt-clock" },
  { id: "habit", sel: ".dt-habit-box" },
  { id: "embed", sel: ".dt-embed" },
  { id: "park", sel: ".dt-park-box" },
  { id: "calendar", sel: ".dt-calendar" },
  { id: "calTasks", sel: ".dt-cal-tasks" },
];

function pageLayout() {
  if (!uiPrefs.pageLayout || typeof uiPrefs.pageLayout !== "object") uiPrefs.pageLayout = {};
  return uiPrefs.pageLayout;
}

// Apply the saved sizes + colors to the desktop layout (idempotent).
function applyPageLayout() {
  if (!document.getElementById("dt-root")) return;
  const pl = pageLayout();
  const root = document.documentElement;

  const colors = pl.colors || {};
  const setVar = (name, val) => {
    if (val) root.style.setProperty(name, val);
    else root.style.removeProperty(name);
  };
  setVar("--dt-bg", colors.bg);
  setVar("--dt-clock", colors.clock);
  setVar("--dt-btn-primary", colors.primary);
  setVar("--dt-btn-secondary", colors.secondary);

  if (pl.contentMax) root.style.setProperty("--dt-content-max", pl.contentMax + "px");
  else root.style.removeProperty("--dt-content-max");

  const dash = document.querySelector(".dt-dashboard");
  if (dash) dash.style.gridTemplateColumns = pl.dashCols || "";
  const calRow = document.querySelector(".dt-cal-row");
  if (calRow) calRow.style.gridTemplateColumns = pl.calCols || "";

  const items = pl.items || {};
  for (const item of PAGE_ITEMS) {
    const el = document.querySelector(item.sel);
    if (!el) continue;
    const size = items[item.id];
    if (size && (size.w || size.h)) {
      if (size.w) el.style.width = size.w + "px";
      if (size.h) el.style.height = size.h + "px";
      el.style.marginLeft = "auto";
      el.style.marginRight = "auto"; // stay centered in the cell when smaller
      el.style.flex = "none";
    } else {
      el.style.width = "";
      el.style.height = "";
      el.style.marginLeft = "";
      el.style.marginRight = "";
      el.style.flex = "";
    }
  }
  fixItemOverlaps();
}

// Safety net: stacked boxes in a column must sit on their own lines. If a
// resized box ever ends up overlapping the one below it, push the lower box
// down by the overlap so nothing sits on top of anything else. Runs on every
// layout apply (i.e. on refresh) and after a resize ends.
function fixItemOverlaps() {
  if (!document.getElementById("dt-root")) return;
  const cols = document.querySelectorAll(".dt-tasks-col, .dt-mid-col, .dt-right-col");
  cols.forEach((col) => {
    const kids = [...col.children];
    // clear previous corrections first so we measure the natural layout
    kids.forEach((el) => (el.style.marginTop = ""));
    for (let i = 1; i < kids.length; i++) {
      const prev = kids[i - 1].getBoundingClientRect();
      const el = kids[i];
      const cur = el.getBoundingClientRect();
      const overlap = prev.bottom - cur.top;
      if (overlap > 1) {
        const base = parseFloat(getComputedStyle(el).marginTop) || 0;
        el.style.marginTop = base + Math.ceil(overlap) + "px";
      }
    }
  });
}

// A generic pointer-drag helper: onMove(dx, dy) each frame, onEnd() at the end.
function pageDrag(startEvent, onMove, onEnd) {
  startEvent.preventDefault();
  const sx = startEvent.clientX;
  const sy = startEvent.clientY;
  const move = (e) => onMove(e.clientX - sx, e.clientY - sy);
  const up = () => {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", up);
    if (onEnd) onEnd();
  };
  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up);
}

let pageEditMode = false;

function cssColsToPx(gridEl) {
  return getComputedStyle(gridEl).gridTemplateColumns.split(" ").map(parseFloat);
}
function gridGap(gridEl) {
  return parseFloat(getComputedStyle(gridEl).columnGap) || 0;
}

// Build resize handles for a grid's columns (adjacent-pair resize).
function buildColHandles(gridEl, storeKey) {
  const gap = gridGap(gridEl);
  const place = () => {
    const cols = cssColsToPx(gridEl);
    const handles = gridEl.querySelectorAll(".dt-col-handle");
    let x = 0;
    for (let i = 0; i < cols.length - 1; i++) {
      x += cols[i] + gap;
      const h = handles[i];
      if (h) h.style.left = x - gap / 2 + "px";
    }
  };
  for (let i = 0; i < cssColsToPx(gridEl).length - 1; i++) {
    const handle = document.createElement("div");
    handle.className = "dt-col-handle";
    handle.addEventListener("pointerdown", (e) => {
      const cols = cssColsToPx(gridEl);
      pageDrag(
        e,
        (dx) => {
          const next = cols.slice();
          next[i] = Math.max(40, cols[i] + dx);
          next[i + 1] = Math.max(40, cols[i + 1] - dx);
          gridEl.style.gridTemplateColumns = next.map((c) => c + "px").join(" ");
          place();
        },
        () => {
          pageLayout()[storeKey] = gridEl.style.gridTemplateColumns;
          fixItemOverlaps();
          touchUiPrefs();
        }
      );
    });
    gridEl.appendChild(handle);
  }
  place();
}

// Margin (content width) handles pinned to the content's left/right edges.
let marginHandles = [];
function buildMarginHandles() {
  const dash = document.querySelector(".dt-dashboard");
  if (!dash) return;
  const place = () => {
    const r = dash.getBoundingClientRect();
    if (marginHandles[0]) {
      marginHandles[0].style.left = r.left - 8 + "px";
      marginHandles[0].style.top = r.top + "px";
      marginHandles[0].style.height = Math.min(r.height, 400) + "px";
    }
    if (marginHandles[1]) {
      marginHandles[1].style.left = r.right - 8 + "px";
      marginHandles[1].style.top = r.top + "px";
      marginHandles[1].style.height = Math.min(r.height, 400) + "px";
    }
  };
  [-1, 1].forEach((sideSign, idx) => {
    const h = document.createElement("div");
    h.className = "dt-margin-handle";
    h.addEventListener("pointerdown", (e) => {
      const startMax = dash.getBoundingClientRect().width;
      pageDrag(
        e,
        (dx) => {
          // dragging either edge outward widens content (shrinks margins)
          const delta = sideSign === 1 ? dx : -dx;
          const w = Math.max(400, Math.min(window.innerWidth, startMax + delta * 2));
          document.documentElement.style.setProperty("--dt-content-max", w + "px");
          place();
        },
        () => {
          const w = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--dt-content-max"));
          if (w) {
            pageLayout().contentMax = Math.round(w);
            touchUiPrefs();
          }
        }
      );
    });
    document.body.appendChild(h);
    marginHandles.push(h);
  });
  place();
  window.addEventListener("resize", place);
}

// Corner resize handle on each resizable box.
function buildItemHandles() {
  for (const item of PAGE_ITEMS) {
    const el = document.querySelector(item.sel);
    if (!el || el.querySelector(":scope > .dt-item-handle")) continue;
    el.classList.add("dt-resizable");
    const handle = document.createElement("div");
    handle.className = "dt-item-handle";
    handle.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      // don't let a box grow past its column so it can't overlap its neighbors
      const parent = el.parentElement;
      const maxW = parent
        ? parent.clientWidth -
          parseFloat(getComputedStyle(parent).paddingLeft) -
          parseFloat(getComputedStyle(parent).paddingRight)
        : Infinity;
      pageDrag(
        e,
        (dx, dy) => {
          const w = Math.min(maxW, Math.max(80, rect.width + dx));
          const h = Math.max(60, rect.height + dy);
          el.style.width = w + "px";
          el.style.height = h + "px";
          el.style.marginLeft = "auto";
          el.style.marginRight = "auto";
          el.style.flex = "none";
        },
        () => {
          pageLayout().items = pageLayout().items || {};
          pageLayout().items[item.id] = {
            w: Math.round(el.getBoundingClientRect().width),
            h: Math.round(el.getBoundingClientRect().height),
          };
          fixItemOverlaps();
          touchUiPrefs();
        }
      );
    });
    el.appendChild(handle);
  }
}

function teardownPageHandles() {
  document.querySelectorAll(".dt-col-handle, .dt-item-handle").forEach((h) => h.remove());
  marginHandles.forEach((h) => h.remove());
  marginHandles = [];
  document.querySelectorAll(".dt-resizable").forEach((el) => el.classList.remove("dt-resizable"));
}

function setPageEdit(on) {
  pageEditMode = on;
  const root = document.getElementById("dt-root");
  if (!root) return;
  root.classList.toggle("dt-editing", on);
  const colors = document.getElementById("page-edit-colors");
  if (colors) colors.classList.toggle("hidden", !on);
  teardownPageHandles();
  if (on) {
    const dash = document.querySelector(".dt-dashboard");
    if (dash) buildColHandles(dash, "dashCols");
    const calRow = document.querySelector(".dt-cal-row");
    if (calRow) buildColHandles(calRow, "calCols");
    buildMarginHandles();
    buildItemHandles();
    syncPageEditColorInputs();
  }
}

// Seed the color <input>s from the current custom colors (or computed defaults).
function syncPageEditColorInputs() {
  const colors = pageLayout().colors || {};
  const cs = getComputedStyle(document.documentElement);
  const bodyCs = getComputedStyle(document.body);
  const toHex = (c) => {
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c);
    if (!m) return null;
    return "#" + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, "0")).join("");
  };
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
  };
  set("pe-bg", colors.bg || toHex(bodyCs.backgroundColor));
  set("pe-clock", colors.clock || "#16171a");
  set("pe-primary", colors.primary || toHex(cs.getPropertyValue("--input-bg")) || "#35363b");
  set("pe-secondary", colors.secondary || toHex(cs.getPropertyValue("--team-card")) || "#313236");
}

// Downscale a picked banner so its data URL stays small enough to sync.
function downscaleImage(dataUrl, maxW, quality) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      try {
        resolve(c.toDataURL("image/jpeg", quality));
      } catch (e) {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function startDesktopClock() {
  const hEl = document.getElementById("dt-clock-h");
  const mEl = document.getElementById("dt-clock-m");
  const apEl = document.getElementById("dt-clock-ampm");
  if (!hEl) return;
  const tick = () => {
    const d = new Date();
    let hr = d.getHours();
    const pm = hr >= 12;
    hr = hr % 12;
    if (hr === 0) hr = 12;
    hEl.textContent = hr;
    mEl.textContent = String(d.getMinutes()).padStart(2, "0");
    apEl.textContent = pm ? "PM" : "AM";
  };
  tick();
  setInterval(tick, 15000);
}

// ==========================================================================
// Desktop calendar: assignments placed on their due date, colored by class.
// Each item generates a pokemon; items due within 48h also show in today's
// team. Synced across the account. Desktop-only, so mobile is untouched.
// ==========================================================================
const CAL_ITEMS_KEY = "todo-app-cal-items";
const CAL_CLASSES_KEY = "todo-app-cal-classes";
const CAL_TS_KEY = "todo-app-cal-ts";
const CAL_NEUTRAL = "#8a8b91"; // classless items show basic gray
const CAL_COMPLETIONS = ["not started", "in progress", "done!"];
const CAL_SOON_MS = 48 * 60 * 60 * 1000; // "within 48 hours"

function loadCalArray(key) {
  try {
    const s = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(s)) return s;
  } catch (e) {
    // fall through to empty
  }
  return [];
}
let calItems = loadCalArray(CAL_ITEMS_KEY);
let calClasses = loadCalArray(CAL_CLASSES_KEY);
let calUpdatedAt = localStorage.getItem(CAL_TS_KEY) || "";
let calNextId = calItems.reduce((m, it) => Math.max(m, it.id || 0), 0) + 1;
let calClassNextId = calClasses.reduce((m, c) => Math.max(m, c.id || 0), 0) + 1;

function saveCalItems() {
  localStorage.setItem(CAL_ITEMS_KEY, JSON.stringify(calItems));
}
function saveCalClasses() {
  localStorage.setItem(CAL_CLASSES_KEY, JSON.stringify(calClasses));
}
// A user edit: re-render the desktop views, stamp, and sync to the account.
function calTouch() {
  calUpdatedAt = new Date().toISOString();
  localStorage.setItem(CAL_TS_KEY, calUpdatedAt);
  renderDesktopCalendar();
  renderCalTasks();
  renderCalTeamExtras();
  scheduleCalSync();
}
function calClassById(id) {
  return calClasses.find((c) => c.id === id) || null;
}
function calClassColor(id) {
  const c = calClassById(id);
  return c ? c.color : CAL_NEUTRAL;
}
function calHexToRgb(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex || "");
  if (!m) return { r: 138, g: 139, b: 145 };
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}
// The class color at the given opacity (over whatever's behind it).
function calRgba(clsId, alpha) {
  const { r, g, b } = calHexToRgb(calClassColor(clsId));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function calEsc(s) {
  const d = document.createElement("div");
  d.textContent = s == null ? "" : String(s);
  return d.innerHTML;
}
function calDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
// The pokemon an item shows - it evolves with the item's completion, just like
// a team task (not started -> base, in progress -> middle, done! -> final).
function calItemPokemon(it) {
  return pokemonFor({
    status: it.completion,
    pokemon_family: it.pokemon_family,
    is_shiny: it.is_shiny,
    is_mega: 0,
    mega_variant: 0,
  });
}
function calItemDueSoon(it) {
  const dueMs = new Date(it.due + "T23:59:59").getTime();
  const now = Date.now();
  return dueMs >= now && dueMs - now <= CAL_SOON_MS;
}

// ---- cross-device calendar sync (items + classes), last-write-wins ----
let calSyncTimer = null;
let lastSyncedCal = null;
function calSyncPayload() {
  return { items: calItems, classes: calClasses };
}
function scheduleCalSync() {
  if (!authSession || !supabaseConfigured()) return;
  clearTimeout(calSyncTimer);
  calSyncTimer = setTimeout(pushCal, 1500);
}
async function pushCal() {
  if (!authSession || !supabaseConfigured()) return;
  const body = JSON.stringify(calSyncPayload());
  if (body === lastSyncedCal) return;
  try {
    await ensureFreshAuth();
    if (!authSession) return;
    await supabaseRpc(
      "push_cal",
      { p_data: { items: calItems, classes: calClasses, updatedAt: calUpdatedAt } },
      authSession.access_token
    );
    lastSyncedCal = body;
  } catch (e) {
    // offline or tasks.sql not run yet - retries on next change
  }
}
async function pullCal() {
  if (!authSession || !supabaseConfigured()) return;
  try {
    await ensureFreshAuth();
    if (!authSession) return;
    const remote = await supabaseRpc("get_cal", {}, authSession.access_token);
    if (!remote || !remote.data) {
      if (calItems.length || calClasses.length) { clearTimeout(calSyncTimer); calSyncTimer = setTimeout(pushCal, 1500); }
      return;
    }
    const remoteMs = remote.updated_at ? Date.parse(remote.updated_at) : 0;
    const localMs = calUpdatedAt ? Date.parse(calUpdatedAt) : 0;
    if (remoteMs >= localMs) {
      const d = remote.data;
      calItems = Array.isArray(d.items) ? d.items : [];
      calClasses = Array.isArray(d.classes) ? d.classes : [];
      calNextId = calItems.reduce((m, it) => Math.max(m, it.id || 0), 0) + 1;
      calClassNextId = calClasses.reduce((m, c) => Math.max(m, c.id || 0), 0) + 1;
      calUpdatedAt = remote.updated_at;
      saveCalItems();
      saveCalClasses();
      localStorage.setItem(CAL_TS_KEY, calUpdatedAt);
      lastSyncedCal = JSON.stringify(calSyncPayload());
      if (window.__desktopReady) {
        renderDesktopCalendar();
        renderCalTasks();
        renderCalTeamExtras();
      }
    } else {
      clearTimeout(calSyncTimer);
      calSyncTimer = setTimeout(pushCal, 1500);
    }
  } catch (e) {
    // offline or tasks.sql not run yet
  }
}

// A month grid; each day is a cell that holds its due-that-day items as colored
// chips and opens the add/edit popup when clicked.
function renderDesktopCalendar() {
  const el = document.getElementById("dt-calendar");
  if (!el) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayNum = now.getDate();
  const monthName = now.toLocaleString("default", { month: "long" }).toLowerCase();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dows = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  let cells = dows.map((d) => `<div class="dt-cal-dow">${d}</div>`).join("");
  for (let i = 0; i < firstDow; i++) cells += `<div class="dt-cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = calDateStr(year, month, d);
    const chips = calItems
      .filter((it) => it.due === dateStr)
      .map(
        // 50% opacity of the class color, over the calendar cell
        (it) =>
          `<div class="dt-cal-chip${it.completion === "done!" ? " done" : ""}" data-id="${it.id}" style="background:${calRgba(it.cls, 0.5)}">${calEsc(it.name)}</div>`
      )
      .join("");
    cells +=
      `<div class="dt-cal-day${d === todayNum ? " today" : ""}" data-date="${dateStr}">` +
      `<span class="dt-cal-daynum">${d}</span>` +
      `<div class="dt-cal-chips">${chips}</div></div>`;
  }
  el.innerHTML =
    `<div class="dt-cal-month">${monthName} ${year}</div>` +
    `<div class="dt-cal-grid">${cells}</div>`;

  el.querySelectorAll(".dt-cal-day[data-date]").forEach((cell) => {
    cell.addEventListener("click", (e) => {
      const chip = e.target.closest(".dt-cal-chip");
      if (chip) {
        const item = calItems.find((it) => it.id === Number(chip.dataset.id));
        openCalPopup(cell.dataset.date, item || null, chip);
      } else {
        openCalPopup(cell.dataset.date, null, cell);
      }
    });
  });
}

// ---- the running list of assignments, to the right of the calendar ----
function renderCalTasks() {
  const el = document.getElementById("dt-cal-tasks");
  if (!el) return;
  const sorted = [...calItems].sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : 0));
  let html = `<div class="dt-cal-list-head"><span>name</span><span>class</span><span>progress</span><span></span></div>`;
  if (sorted.length === 0) {
    html += `<div class="dt-cal-list-empty">click a day to add an assignment</div>`;
  }
  for (const it of sorted) {
    const cls = calClassById(it.cls);
    html +=
      `<div class="dt-cal-item${it.completion === "done!" ? " done" : ""}" data-id="${it.id}">` +
      `<span class="ci-name">${calEsc(it.name)}</span>` +
      `<span class="ci-class"${cls ? ` style="color:${cls.color}"` : ""}>${cls ? calEsc(cls.name) : "—"}</span>` +
      `<span class="ci-prog" data-c="${it.completion}">${it.completion}</span>` +
      `<button class="ci-del" data-id="${it.id}" type="button" aria-label="delete">✕</button>` +
      `</div>`;
  }
  el.innerHTML = html;
  el.querySelectorAll(".dt-cal-item").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.closest(".ci-del")) return;
      const item = calItems.find((it) => it.id === Number(row.dataset.id));
      if (item) openCalPopup(item.due, item, row);
    });
  });
  el.querySelectorAll(".ci-del").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      calItems = calItems.filter((it) => it.id !== Number(btn.dataset.id));
      saveCalItems();
      calTouch();
    });
  });
}

// ---- the add/edit popup (appears beside the clicked cell) ----
let calPopupEl = null;
let calPopupItemId = null;
let calPopupDate = null;
let calPopupSelectedClass = "";

function buildCalPopup() {
  if (calPopupEl) return;
  calPopupEl = document.createElement("div");
  calPopupEl.className = "dt-cal-popup hidden";
  calPopupEl.innerHTML =
    `<div class="dt-pop-date"></div>` +
    `<input class="dt-pop-name" type="text" placeholder="name" />` +
    `<label class="dt-pop-label">class</label>` +
    `<select class="dt-pop-class"></select>` +
    `<label class="dt-pop-label">completion</label>` +
    `<select class="dt-pop-completion">` +
    CAL_COMPLETIONS.map((c) => `<option value="${c}">${c}</option>`).join("") +
    `</select>` +
    `<label class="dt-pop-label">notes</label>` +
    `<textarea class="dt-pop-notes" placeholder="notes about this assignment..." rows="3"></textarea>` +
    `<div class="dt-pop-actions">` +
    `<button class="dt-pop-delete" type="button">delete</button>` +
    `<button class="dt-pop-save" type="button">save</button>` +
    `</div>`;
  document.body.appendChild(calPopupEl);

  const classSel = calPopupEl.querySelector(".dt-pop-class");
  classSel.addEventListener("change", () => {
    if (classSel.value === "__add__") {
      classSel.value = calPopupSelectedClass || "";
      openClassEditor(true);
    } else if (classSel.value === "__edit__") {
      classSel.value = calPopupSelectedClass || "";
      openClassEditor(false);
    } else {
      calPopupSelectedClass = classSel.value;
    }
  });
  calPopupEl.querySelector(".dt-pop-save").addEventListener("click", saveCalPopup);
  calPopupEl.querySelector(".dt-pop-delete").addEventListener("click", deleteCalPopup);

  document.addEventListener("mousedown", (e) => {
    if (!calPopupEl || calPopupEl.classList.contains("hidden")) return;
    if (
      !calPopupEl.contains(e.target) &&
      !e.target.closest(".dt-cal-day, .dt-cal-item, .dt-class-editor-overlay")
    ) {
      closeCalPopup();
    }
  });
}

function renderClassSelect(sel, selected) {
  let html = `<option value="">(no class)</option>`;
  html += calClasses.map((c) => `<option value="${c.id}">${calEsc(c.name)}</option>`).join("");
  html += `<option value="__add__">+ add a class</option>`;
  html += `<option value="__edit__">✎ edit classes</option>`;
  sel.innerHTML = html;
  sel.value = selected != null ? String(selected) : "";
}

function openCalPopup(date, item, anchorEl) {
  buildCalPopup();
  calPopupDate = date;
  calPopupItemId = item ? item.id : null;
  calPopupSelectedClass = item && item.cls ? String(item.cls) : "";
  calPopupEl.querySelector(".dt-pop-date").textContent = "due " + date;
  calPopupEl.querySelector(".dt-pop-name").value = item ? item.name : "";
  renderClassSelect(calPopupEl.querySelector(".dt-pop-class"), calPopupSelectedClass);
  calPopupEl.querySelector(".dt-pop-completion").value = item ? item.completion : "not started";
  calPopupEl.querySelector(".dt-pop-notes").value = item ? item.notes || "" : "";
  calPopupEl.querySelector(".dt-pop-delete").style.display = item ? "" : "none";
  calPopupEl.classList.remove("hidden");
  positionCalPopup(anchorEl);
  calPopupEl.querySelector(".dt-pop-name").focus();
}

// Beside the anchor, flipping to the other side if it would run off-screen.
function positionCalPopup(anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const pw = calPopupEl.offsetWidth || 260;
  const ph = calPopupEl.offsetHeight || 300;
  const margin = 10;
  let left = rect.right + margin;
  if (left + pw > window.innerWidth - 8) left = rect.left - margin - pw;
  if (left < 8) left = 8;
  let top = rect.top;
  if (top + ph > window.innerHeight - 8) top = window.innerHeight - 8 - ph;
  if (top < 8) top = 8;
  calPopupEl.style.left = left + "px";
  calPopupEl.style.top = top + "px";
}

function closeCalPopup() {
  if (calPopupEl) calPopupEl.classList.add("hidden");
}

function saveCalPopup() {
  const name = calPopupEl.querySelector(".dt-pop-name").value.trim();
  if (!name) {
    calPopupEl.querySelector(".dt-pop-name").focus();
    return;
  }
  const cls = calPopupSelectedClass ? Number(calPopupSelectedClass) : "";
  const completion = calPopupEl.querySelector(".dt-pop-completion").value;
  const notes = calPopupEl.querySelector(".dt-pop-notes").value;
  if (calPopupItemId != null) {
    const it = calItems.find((x) => x.id === calPopupItemId);
    if (it) {
      it.name = name;
      it.cls = cls;
      it.completion = completion;
      it.notes = notes;
    }
  } else {
    // each new assignment generates its own pokemon (family + shiny roll)
    calItems.push({
      id: calNextId++,
      name,
      cls,
      completion,
      notes,
      due: calPopupDate,
      pokemon_family: Math.floor(Math.random() * POKEMON_FAMILIES.length),
      is_shiny: Math.random() < SHINY_CHANCE ? 1 : 0,
    });
  }
  saveCalItems();
  calTouch();
  closeCalPopup();
}

function deleteCalPopup() {
  if (calPopupItemId != null) {
    calItems = calItems.filter((x) => x.id !== calPopupItemId);
    saveCalItems();
    calTouch();
  }
  closeCalPopup();
}

// ---- class manager (add classes, edit their names + colors) ----
let classEditorEl = null;
const CAL_CLASS_PALETTE = [
  "#6f8f52", "#7a5c9e", "#b5643f", "#3f7fb5", "#b53f6e", "#c9a032", "#3fa08a", "#5b6bd6",
];

function randomClassColor() {
  return CAL_CLASS_PALETTE[Math.floor(Math.random() * CAL_CLASS_PALETTE.length)];
}

function buildClassEditor() {
  if (classEditorEl) return;
  classEditorEl = document.createElement("div");
  classEditorEl.className = "dt-class-editor-overlay hidden";
  classEditorEl.innerHTML =
    `<div class="dt-class-editor">` +
    `<h3 class="dt-class-title">classes</h3>` +
    `<div class="dt-class-rows"></div>` +
    `<button class="dt-class-add" type="button">+ add a class</button>` +
    `<button class="dt-class-done" type="button">done</button>` +
    `</div>`;
  document.body.appendChild(classEditorEl);
  classEditorEl.addEventListener("mousedown", (e) => {
    if (e.target === classEditorEl) closeClassEditor();
  });
  classEditorEl.querySelector(".dt-class-add").addEventListener("click", () => {
    calClasses.push({ id: calClassNextId++, name: "new class", color: randomClassColor() });
    saveCalClasses();
    calTouch();
    renderClassRows();
  });
  classEditorEl.querySelector(".dt-class-done").addEventListener("click", closeClassEditor);
}

function renderClassRows() {
  const wrap = classEditorEl.querySelector(".dt-class-rows");
  wrap.innerHTML = "";
  if (calClasses.length === 0) {
    wrap.innerHTML = `<p class="dt-class-empty">no classes yet</p>`;
  }
  calClasses.forEach((c) => {
    const row = document.createElement("div");
    row.className = "dt-class-row";
    row.innerHTML =
      `<input type="color" class="dt-class-color" value="${c.color}" />` +
      `<input type="text" class="dt-class-name" value="${calEsc(c.name)}" />` +
      `<button class="dt-class-del" type="button" aria-label="delete">✕</button>`;
    const colorIn = row.querySelector(".dt-class-color");
    const nameIn = row.querySelector(".dt-class-name");
    const delBtn = row.querySelector(".dt-class-del");
    colorIn.addEventListener("input", () => {
      c.color = colorIn.value;
      saveCalClasses();
      calTouch();
    });
    nameIn.addEventListener("input", () => {
      c.name = nameIn.value;
      saveCalClasses();
      calTouch();
    });
    nameIn.addEventListener("change", () => {
      refreshClassSelectIfOpen();
    });
    delBtn.addEventListener("click", () => {
      calClasses = calClasses.filter((x) => x.id !== c.id);
      calItems.forEach((it) => {
        if (it.cls === c.id) it.cls = "";
      });
      saveCalClasses();
      saveCalItems();
      calTouch();
      renderClassRows();
      refreshClassSelectIfOpen();
    });
    wrap.appendChild(row);
  });
}

function openClassEditor(addNew) {
  buildClassEditor();
  if (addNew) {
    calClasses.push({ id: calClassNextId++, name: "new class", color: randomClassColor() });
    saveCalClasses();
    calTouch();
  }
  renderClassRows();
  classEditorEl.classList.remove("hidden");
}

function closeClassEditor() {
  if (classEditorEl) classEditorEl.classList.add("hidden");
  refreshClassSelectIfOpen();
}

function refreshClassSelectIfOpen() {
  if (calPopupEl && !calPopupEl.classList.contains("hidden")) {
    renderClassSelect(calPopupEl.querySelector(".dt-pop-class"), calPopupSelectedClass);
  }
}

// Assignments due within 48h join today's team: a row in the list (tinted with
// the class color at 15% over the standard gray) plus their pokemon in the team
// column. Desktop-only; re-run after every task render so it survives refreshes.
function renderCalTeamExtras() {
  const list = document.getElementById("todo-list");
  if (!list) return;
  list.querySelectorAll(".dt-cal-team-item").forEach((e) => e.remove());
  const teamGrid = document.getElementById("team-grid");
  if (teamGrid) teamGrid.querySelectorAll(".dt-cal-team-slot").forEach((e) => e.remove());

  const soon = calItems.filter(calItemDueSoon);
  if (soon.length) {
    const empty = list.querySelector(".empty-state");
    if (empty) empty.remove();
  }
  for (const it of soon) {
    const poke = calItemPokemon(it);

    const li = document.createElement("li");
    li.className =
      "todo-item dt-cal-team-item" + (it.completion === "done!" ? " status-done" : " status-pending");
    if (it.cls) {
      li.style.backgroundImage = `linear-gradient(0deg, ${calRgba(it.cls, 0.15)}, ${calRgba(it.cls, 0.15)})`;
    }
    const text = document.createElement("span");
    text.className = "text";
    text.textContent = it.name;
    const prog = document.createElement("span");
    prog.className = "dt-cal-team-prog";
    prog.dataset.c = it.completion;
    prog.textContent = it.completion;
    const img = document.createElement("img");
    img.className = "sprite";
    img.src = poke.icon;
    img.alt = poke.name;
    li.append(text, prog, img);
    li.addEventListener("click", () => openCalPopup(it.due, it, li));
    list.appendChild(li);

    if (teamGrid) {
      const slot = document.createElement("div");
      slot.className = "team-slot dt-cal-team-slot";
      const simg = document.createElement("img");
      simg.src = poke.sprite;
      simg.alt = poke.name;
      slot.appendChild(simg);
      teamGrid.appendChild(slot);
    }
  }
}

let desktopBuilt = false;
function buildDesktop() {
  if (desktopBuilt) return;
  desktopBuilt = true;

  const move = (node, slot) => {
    if (node && slot) slot.appendChild(node);
  };
  move(document.getElementById("team-grid"), document.getElementById("dt-team-slot"));
  const tasksSlot = document.getElementById("dt-tasks-slot");
  // companion sits above the add button, then the add form, then the list
  move(document.getElementById("companion-row"), tasksSlot);
  move(document.getElementById("add-form"), tasksSlot);
  move(document.getElementById("todo-list"), tasksSlot);
  move(document.getElementById("park-mine"), document.getElementById("dt-park-slot"));
  const dexSlot = document.getElementById("dt-dex-slot");
  move(document.querySelector(".dex-tabs"), dexSlot);
  move(document.querySelector(".dex-card"), dexSlot);
  move(document.getElementById("dex-hint"), dexSlot);

  // the discreet gear in the title row opens the unified settings hub
  const gearBtn = document.getElementById("dt-gear-btn");
  if (gearBtn) gearBtn.addEventListener("click", () => openHub("settings"));

  // editable banner
  const bannerEl = document.getElementById("dt-banner");
  const bannerInput = document.getElementById("dt-banner-input");
  document.getElementById("dt-banner-edit").addEventListener("click", () => bannerInput.click());
  bannerInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      downscaleImage(reader.result, 1600, 0.82).then((url) => {
        uiPrefs.banner = url;
        uiPrefs.bannerPos = 50; // reset framing for the new image
        applyUiPrefs();
        touchUiPrefs();
      });
    reader.readAsDataURL(file);
  });

  // reposition: drag the banner up/down to reframe it (Notion-style)
  const repositionBtn = document.getElementById("dt-banner-reposition");
  let repositioning = false;
  repositionBtn.addEventListener("click", () => {
    repositioning = !repositioning;
    bannerEl.classList.toggle("repositioning", repositioning);
    repositionBtn.textContent = repositioning ? "done" : "reposition";
    if (!repositioning) touchUiPrefs(); // save framing on exit
  });
  bannerEl.addEventListener("pointerdown", (e) => {
    if (!repositioning || !uiPrefs.banner) return;
    e.preventDefault();
    const startY = e.clientY;
    const startPos = uiPrefs.bannerPos != null ? uiPrefs.bannerPos : 50;
    const h = bannerEl.offsetHeight || 160;
    const onMove = (ev) => {
      const dy = ev.clientY - startY;
      let pos = startPos - (dy / h) * 100; // drag down -> reveal the top
      pos = Math.max(0, Math.min(100, pos));
      uiPrefs.bannerPos = pos;
      bannerEl.style.backgroundPosition = `center ${pos}%`;
    };
    const onUp = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      saveUiPrefs();
    };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  });

  // editable title
  const titleEl = document.getElementById("dt-title");
  titleEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      titleEl.blur();
    }
  });
  titleEl.addEventListener("blur", () => {
    const t = (titleEl.textContent || "").trim() || "pokeplanner";
    titleEl.textContent = t;
    if (t !== uiPrefs.title) {
      uiPrefs.title = t;
      touchUiPrefs();
    }
  });

  // editable spotify embed
  document.getElementById("dt-embed-edit").addEventListener("click", () => {
    const link = window.prompt("paste a spotify playlist / album / track link:", uiPrefs.spotify || "");
    if (link === null) return;
    uiPrefs.spotify = link.trim();
    renderSpotifyEmbed();
    touchUiPrefs();
  });

  window.__desktopReady = true; // lets fetchTodos re-append the 48h calendar items
  applyUiPrefs();
  startDesktopClock();
  renderDesktopCalendar();
  renderCalTasks();

  // populate the relocated widgets
  refresh();
  refreshPark();
  renderDexGrid();
  renderCalTeamExtras();

  // restore page-edit mode if it was left on
  if (settings.pageEdit) setPageEdit(true);
}

if (DESKTOP_MQ.matches) buildDesktop();
// Crossing the breakpoint swaps between two very different layouts; a reload is
// the clean way to rebuild rather than shuffle nodes back and forth live.
DESKTOP_MQ.addEventListener("change", () => location.reload());

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
