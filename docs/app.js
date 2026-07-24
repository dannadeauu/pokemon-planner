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

function storeClearTodos() {
  taskStore.todos = [];
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
  // per-role font overrides (null = inherit the base "body text" font)
  fontHeading: null,
  fontClock: null,
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

// Add a stylesheet <link> for a Google font once (keyed by label); locally
// available fonts (google: null) need no download.
function ensureFontLoaded(font) {
  if (!font || !font.google) return;
  if (document.querySelector(`link[data-font-preload="${CSS.escape(font.label)}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.dataset.fontPreload = font.label;
  link.href = `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`;
  document.head.appendChild(link);
}

// Apply the chosen fonts: the base "body text" font (everything using `inherit`
// picks it up) plus optional per-role overrides for headings and the clock,
// exposed as CSS vars that fall back to the body font when unset.
function applyFont() {
  const bodyFont = appFontByLabel(currentFontLabel());
  ensureFontLoaded(bodyFont);
  document.documentElement.style.setProperty("--app-font", bodyFont.stack);
  document.body.style.fontFamily = bodyFont.stack;

  const setRoleFont = (varName, label) => {
    if (label) {
      const f = appFontByLabel(label);
      ensureFontLoaded(f);
      document.documentElement.style.setProperty(varName, f.stack);
    } else {
      document.documentElement.style.removeProperty(varName);
    }
  };
  setRoleFont("--font-heading", settings.fontHeading);
  setRoleFont("--font-clock", settings.fontClock);
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
    ensureFontLoaded(f); // so the option renders in its real face
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
// Per-role pickers: when a role has no explicit font it shows (and inherits) the
// base body font.
const HEADING_FONT_PICKER = { btnId: "font-heading-btn", menuId: "font-heading-menu", getVal: () => settings.fontHeading || settings.font, setVal: (v) => { settings.fontHeading = v; } };
const CLOCK_FONT_PICKER = { btnId: "font-clock-btn", menuId: "font-clock-menu", getVal: () => settings.fontClock || settings.font, setVal: (v) => { settings.fontClock = v; } };

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
  if (label) label.textContent = on ? "desktop body text font" : "body text font";
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

  wireFontPicker(HEADING_FONT_PICKER);
  wireFontPicker(MAIN_FONT_PICKER);
  wireFontPicker(CLOCK_FONT_PICKER);
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

  // "edit page" leaves the settings menu and drops into the draggable edit menu
  const pageEditBtn = document.getElementById("page-edit-btn");
  if (pageEditBtn) {
    pageEditBtn.addEventListener("click", () => {
      closeHub();
      setPageEdit(true);
    });
  }

  // "clear cache" drops the service-worker caches and reloads, so a stuck/stale
  // shell (old app.js/style.css) gets replaced with the latest deployed version.
  const clearCacheBtn = document.getElementById("clear-cache-btn");
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener("click", async () => {
      clearCacheBtn.disabled = true;
      clearCacheBtn.textContent = "clearing…";
      try {
        if (window.caches) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        if (navigator.serviceWorker) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        }
      } catch (e) {
        // best-effort; reload anyway to pull fresh files from the network
      }
      location.reload();
    });
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

// "clear task list" wipes every task, behind a second confirmation.
const clearTaskListEl = document.getElementById("clear-task-list");
const clearTasksOverlayEl = document.getElementById("clear-tasks-overlay");
const clearTasksYesEl = document.getElementById("clear-tasks-yes");
const clearTasksNoEl = document.getElementById("clear-tasks-no");
function closeClearConfirm() {
  clearTasksOverlayEl.classList.add("hidden");
}
if (clearTaskListEl) {
  clearTaskListEl.addEventListener("click", () => {
    closeDeleteConfirm(); // leave the per-task prompt, ask the bigger question
    clearTasksOverlayEl.classList.remove("hidden");
  });
  clearTasksNoEl.addEventListener("click", closeClearConfirm);
  clearTasksYesEl.addEventListener("click", () => {
    closeClearConfirm();
    storeClearTodos();
    refresh();
  });
  clearTasksOverlayEl.addEventListener("click", (e) => {
    if (e.target === clearTasksOverlayEl) closeClearConfirm();
  });
}

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

// Pull the account's latest tasks / pokedex / profile so this device reflects
// edits made on another device.
function pullAll() {
  pullTasks();
  pullDex();
  pullPrefs();
  pullUi();
  pullCal();
}

// Coming back to the app (switching devices, reopening the tab) re-pulls; and
// going away flushes any pending edit up before the tab is suspended, so a quick
// edit-then-switch on mobile still reaches the other device.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearTimeout(taskSyncTimer);
    pushTasks();
  } else {
    pullAll();
    if (typeof spotifyAuth !== "undefined" && spotifyAuth) {
      refreshSpotifyNowPlaying();
      // Re-sync the player immediately on return: while the tab was hidden the
      // song may have paused, advanced, or changed, so the local clock is stale.
      if (typeof refreshSpotifyPlayer === "function") refreshSpotifyPlayer();
    }
  }
});
// A backgrounded mobile PWA can be frozen before the debounced push fires, so
// flush on the way out too.
window.addEventListener("pagehide", () => {
  clearTimeout(taskSyncTimer);
  pushTasks();
});
// Keep an open tab current with the account without needing a manual refocus,
// so edits made on another device show up on their own. Pulls no-op when signed
// out; adopting remote only happens when it's newer than this device's edits.
setInterval(() => {
  if (!document.hidden) pullAll();
}, 20000);

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
  const defaults = { banner: "", title: "pokeplanner", spotify: "", bannerPos: 50, bannerHidden: false, pageLayout: {} };
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
  return JSON.stringify({ banner: uiPrefs.banner, title: uiPrefs.title, spotify: uiPrefs.spotify, bannerPos: uiPrefs.bannerPos, bannerHidden: uiPrefs.bannerHidden, pageLayout: uiPrefs.pageLayout });
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
      { p_data: { banner: uiPrefs.banner, title: uiPrefs.title, spotify: uiPrefs.spotify, bannerPos: uiPrefs.bannerPos, bannerHidden: uiPrefs.bannerHidden, pageLayout: uiPrefs.pageLayout, updatedAt: uiPrefs.updatedAt } },
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
      if (typeof d.bannerHidden === "boolean") uiPrefs.bannerHidden = d.bannerHidden;
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

// ==========================================================================
// Spotify sign-in (Authorization Code + PKCE, no backend/secret) layered on top
// of the basic embed: a live "now playing" card and the user's recent playlists.
// Needs the user's own Spotify app Client ID with THIS page's URL registered as
// a redirect URI. Everything degrades to just the basic embed if not connected.
// ==========================================================================
const SPOTIFY_CLIENT_KEY = "spotify-client-id";
const SPOTIFY_AUTH_KEY = "spotify-auth";
const SPOTIFY_VERIFIER_KEY = "spotify-pkce-verifier";
const SPOTIFY_SCOPES =
  "user-read-currently-playing user-read-playback-state user-read-recently-played " +
  "user-modify-playback-state user-library-read user-library-modify playlist-read-private";

function spotifyRedirectUri() {
  return location.origin + location.pathname;
}
function spotifyClientId() {
  return localStorage.getItem(SPOTIFY_CLIENT_KEY) || "";
}
function loadSpotifyAuth() {
  try {
    const s = JSON.parse(localStorage.getItem(SPOTIFY_AUTH_KEY));
    if (s && s.access_token) return s;
  } catch (e) {
    // fall through
  }
  return null;
}
let spotifyAuth = loadSpotifyAuth();
function saveSpotifyAuth() {
  if (spotifyAuth) localStorage.setItem(SPOTIFY_AUTH_KEY, JSON.stringify(spotifyAuth));
  else localStorage.removeItem(SPOTIFY_AUTH_KEY);
}

function spotifyB64Url(bytes) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function spotifyRandom(len) {
  const arr = crypto.getRandomValues(new Uint8Array(len));
  return spotifyB64Url(arr).slice(0, len);
}

async function spotifyConnect() {
  let clientId = spotifyClientId();
  if (!clientId) {
    clientId = window.prompt(
      "Enter your Spotify app Client ID.\n\nCreate a free app at developer.spotify.com/dashboard, then copy its Client ID here.",
      ""
    );
    if (!clientId || !clientId.trim()) return;
    clientId = clientId.trim();
    localStorage.setItem(SPOTIFY_CLIENT_KEY, clientId);
    window.alert(
      "One-time setup: in your Spotify app's settings, add this exact Redirect URI, then continue:\n\n" +
        spotifyRedirectUri()
    );
  }
  const verifier = spotifyRandom(96);
  sessionStorage.setItem(SPOTIFY_VERIFIER_KEY, verifier);
  const challenge = spotifyB64Url(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))
  );
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: spotifyRedirectUri(),
    scope: SPOTIFY_SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state: "spotify",
  });
  location.href = "https://accounts.spotify.com/authorize?" + params.toString();
}

// Runs on load: if we came back from Spotify's auth page, trade the code for
// tokens. Uses the query string + a "spotify" state so it never collides with
// the Google (hash-based) auth redirect.
async function handleSpotifyRedirect() {
  const q = new URLSearchParams(location.search);
  if (q.get("state") !== "spotify" || !q.get("code")) return;
  const code = q.get("code");
  const verifier = sessionStorage.getItem(SPOTIFY_VERIFIER_KEY);
  history.replaceState(null, "", location.pathname);
  if (!verifier) return;
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: spotifyRedirectUri(),
        client_id: spotifyClientId(),
        code_verifier: verifier,
      }),
    });
    if (!res.ok) throw new Error("token exchange failed");
    const data = await res.json();
    spotifyAuth = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || "",
      expires_at: Date.now() + (data.expires_in || 3600) * 1000,
    };
    saveSpotifyAuth();
  } catch (e) {
    // leave disconnected; the button stays "connect spotify"
  }
  sessionStorage.removeItem(SPOTIFY_VERIFIER_KEY);
}

async function ensureSpotifyToken() {
  if (!spotifyAuth) return null;
  if (Date.now() < spotifyAuth.expires_at - 60000) return spotifyAuth.access_token;
  if (!spotifyAuth.refresh_token) return spotifyAuth.access_token;
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: spotifyAuth.refresh_token,
        client_id: spotifyClientId(),
      }),
    });
    if (!res.ok) throw new Error("refresh failed");
    const data = await res.json();
    spotifyAuth.access_token = data.access_token;
    if (data.refresh_token) spotifyAuth.refresh_token = data.refresh_token;
    spotifyAuth.expires_at = Date.now() + (data.expires_in || 3600) * 1000;
    saveSpotifyAuth();
    return spotifyAuth.access_token;
  } catch (e) {
    return null;
  }
}

async function spotifyApi(path) {
  return spotifyReq(path, "GET");
}

// General Spotify request (GET reads + POST/PUT/DELETE playback & library actions).
async function spotifyReq(path, method, body) {
  const token = await ensureSpotifyToken();
  if (!token) return null;
  const opts = { method: method || "GET", headers: { Authorization: "Bearer " + token } };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch("https://api.spotify.com/v1" + path, opts);
  } catch (e) {
    return null;
  }
  if (res.status === 401) {
    spotifyDisconnect();
    return null;
  }
  if (res.status === 204) return { empty: true };
  if (!res.ok) return { error: res.status };
  const txt = await res.text();
  return txt ? JSON.parse(txt) : {};
}

function spotifyDisconnect() {
  spotifyAuth = null;
  saveSpotifyAuth();
  renderSpotifyPanel();
  renderSpotifyPlayer();
}

async function refreshSpotifyNowPlaying() {
  const np = document.getElementById("dt-now-playing");
  if (!np || !spotifyAuth) return;
  const data = await spotifyApi("/me/player/currently-playing");
  if (!data || data.empty || !data.item) {
    np.innerHTML = `<div class="np-idle">nothing playing right now</div>`;
    return;
  }
  const t = data.item;
  const art = t.album && t.album.images && t.album.images[0] ? t.album.images[0].url : "";
  const artists = (t.artists || []).map((a) => a.name).join(", ");
  const url = (t.external_urls && t.external_urls.spotify) || "#";
  np.innerHTML =
    `<a class="np-card" href="${url}" target="_blank" rel="noopener">` +
    (art ? `<img class="np-art" src="${art}" alt="" />` : `<div class="np-art np-noart"></div>`) +
    `<div class="np-info">` +
    `<div class="np-label">${data.is_playing ? "now playing" : "paused"}</div>` +
    `<div class="np-title">${calEsc(t.name)}</div>` +
    `<div class="np-artist">${calEsc(artists)}</div>` +
    `</div></a>`;
}

async function refreshSpotifyPlaylists() {
  const el = document.getElementById("dt-playlists");
  if (!el || !spotifyAuth) return;
  const data = await spotifyApi("/me/playlists?limit=6");
  if (!data || !Array.isArray(data.items)) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML =
    `<div class="pl-title">your playlists</div>` +
    `<div class="pl-grid">` +
    data.items
      .map((p) => {
        const img = p.images && p.images[0] ? p.images[0].url : "";
        const url = (p.external_urls && p.external_urls.spotify) || "#";
        return (
          `<a class="pl-item" href="${url}" target="_blank" rel="noopener" title="${calEsc(p.name)}">` +
          (img ? `<img src="${img}" alt="" />` : `<div class="pl-noart"></div>`) +
          `<span>${calEsc(p.name)}</span></a>`
        );
      })
      .join("") +
    `</div>`;
}

function renderSpotifyPanel() {
  const connectBtn = document.getElementById("dt-spotify-connect");
  if (connectBtn) connectBtn.textContent = spotifyAuth ? "disconnect spotify" : "connect spotify";
  const panel = document.getElementById("dt-spotify");
  if (!panel) return;
  panel.classList.toggle("hidden", !spotifyAuth);
  if (spotifyAuth) {
    refreshSpotifyNowPlaying();
    refreshSpotifyPlaylists();
  }
}

// ---- custom spotify player widget: now playing / last played, live controls,
// 3 recent albums, and time-synced lyrics (lyrics from lrclib.net) ----
const splayer = {
  track: null, isLast: false, isPlaying: false,
  progressMs: 0, durationMs: 0, fetchedAt: 0,
  // stateChangedAt: when we last toggled play/pause locally. A poll that lands
  // within GRACE of it is ignored for the play/pause flag, since Spotify may not
  // have registered the change yet and would otherwise flip us back and forth.
  stateChangedAt: 0,
  // resuming: an unpause is pending. The clock stays frozen at the paused line
  // until Spotify confirms it actually resumed (which can lag by seconds while a
  // device spins up); then we jump FORWARD to the real position. This keeps
  // unpause motion strictly forward so the lyrics never snap backward.
  resuming: false,
  liked: false, lyrics: null, lyricsKey: "", albums: [],
};
// Reconcile a poll against the same, already-loaded track without yanking the
// lyrics. Small backward position corrections (network jitter / clock latency)
// are treated as noise and ignored; only a real seek (> SEEK_TOLERANCE) or a
// forward move is accepted. A just-issued local play/pause wins during GRACE.
const SPLAYER_GRACE_MS = 3000;
const SPLAYER_SEEK_TOLERANCE_MS = 1500;
const SPLAYER_FORWARD_JITTER_MS = 600;
function reconcileSplayerSameTrack(reportedPlaying, reportedMs) {
  const now = Date.now();
  if (splayer.resuming) {
    // Unpause in progress. We started advancing optimistically for a smooth
    // start, but Spotify may not have actually resumed yet (a device can take a
    // moment). Keep the motion strictly forward: if the audio is behind us, stop
    // and wait for it to catch up rather than ever snapping the lyrics backward.
    const shownNow = splayerCurrentMs();
    if (!reportedPlaying) {
      // audio still paused: freeze where we are so we don't overshoot further
      splayer.isPlaying = false;
      splayer.progressMs = shownNow;
      splayer.fetchedAt = now;
    } else if (reportedMs >= shownNow - SPLAYER_FORWARD_JITTER_MS) {
      // audio has reached us (or we were accurate): resume normal tracking,
      // never stepping back (Math.max guards against a small latency undershoot)
      splayer.resuming = false;
      splayer.isPlaying = true;
      splayer.progressMs = Math.max(shownNow, reportedMs);
      splayer.fetchedAt = now;
    } else {
      // audio is playing but still behind us: hold until it catches up
      splayer.isPlaying = false;
      splayer.progressMs = shownNow;
      splayer.fetchedAt = now;
    }
    return;
  }
  const shown = splayerCurrentMs();
  const withinGrace = now - splayer.stateChangedAt < SPLAYER_GRACE_MS;
  const playing = withinGrace ? splayer.isPlaying : reportedPlaying;
  let anchorMs;
  if (playing) {
    const delta = reportedMs - shown;
    // The local clock ticks at real speed, so between polls it stays accurate on
    // its own. Keep it MONOTONIC across polls: a single reading may pull us
    // forward to catch up, or hold, but never steps us backward — Spotify returns
    // the occasional stale/low progress_ms, and honoring it is what made the
    // lyrics backtrack right after syncing. A genuine rewind is only honored once
    // several consecutive polls agree the position really moved back.
    if (delta > SPLAYER_FORWARD_JITTER_MS) {
      anchorMs = reportedMs; // we fell behind the audio -> catch up forward
      splayer._seekBackVotes = 0;
    } else if (delta < -SPLAYER_SEEK_TOLERANCE_MS) {
      splayer._seekBackVotes = (splayer._seekBackVotes || 0) + 1;
      if (splayer._seekBackVotes >= 3) { anchorMs = reportedMs; splayer._seekBackVotes = 0; } // confirmed rewind
      else anchorMs = shown; // one-off low reading -> ignore, hold the clock
    } else {
      anchorMs = shown; // within tolerance -> hold the smooth free-running clock
      splayer._seekBackVotes = 0;
    }
  } else if (withinGrace) {
    // Just paused locally. Spotify actually stops ~one network hop after the
    // click, a bit past our optimistic freeze, so once it *confirms* the pause
    // its reported position is the true, authoritative stop point — adopt it.
    // Only while the poll is stale (still reports "playing") do we hold frozen.
    anchorMs = reportedPlaying ? splayer.progressMs : reportedMs;
  } else {
    anchorMs = reportedMs;
  }
  splayer.isPlaying = playing;
  splayer.progressMs = anchorMs;
  splayer.fetchedAt = now;
}
let splayerTick = null;
// Bumped at the start of every refresh; a response whose seq is stale (a newer
// refresh started while it was in flight) is dropped, so out-of-order or slow
// responses can never rewind the clock.
let splayerReqSeq = 0;

function splayerVisible() {
  const el = document.getElementById("dt-splayer");
  return !!(el && el.offsetParent !== null);
}

function parseLrc(lrc) {
  const out = [];
  for (const line of (lrc || "").split("\n")) {
    const m = line.match(/^\[(\d+):(\d+)(?:[.:](\d+))?\]\s*(.*)$/);
    if (!m) continue;
    const frac = m[3] ? Number("0." + m[3]) : 0;
    out.push({ time: (Number(m[1]) * 60 + Number(m[2]) + frac) * 1000, text: m[4].trim() });
  }
  return out.sort((a, b) => a.time - b.time);
}

async function loadSplayerLyrics(track) {
  if (!track) {
    splayer.lyrics = null;
    splayer.lyricsKey = "";
    return;
  }
  if (splayer.lyricsKey === track.id) return; // already loaded for this track
  splayer.lyricsKey = track.id;
  splayer.lyrics = null;
  const artist = (track.artists && track.artists[0] && track.artists[0].name) || "";
  try {
    let synced = null;
    // exact match first (artist + track + album + duration)
    const getRes = await fetch(
      "https://lrclib.net/api/get?" +
        new URLSearchParams({
          track_name: track.name || "",
          artist_name: artist,
          album_name: (track.album && track.album.name) || "",
          duration: String(Math.round((track.duration_ms || 0) / 1000)),
        })
    );
    if (getRes.ok) {
      const d = await getRes.json();
      if (d && d.syncedLyrics) synced = d.syncedLyrics;
    }
    // fuzzy search fallback if the strict lookup misses
    if (!synced) {
      const sRes = await fetch(
        "https://lrclib.net/api/search?" +
          new URLSearchParams({ track_name: track.name || "", artist_name: artist })
      );
      if (sRes.ok) {
        const arr = await sRes.json();
        const hit = Array.isArray(arr) ? arr.find((x) => x.syncedLyrics) : null;
        if (hit) synced = hit.syncedLyrics;
      }
    }
    if (splayer.lyricsKey === track.id && synced) splayer.lyrics = parseLrc(synced);
  } catch (e) {
    // no lyrics available for this track
  }
}

async function refreshSpotifyPlayer() {
  if (!splayerVisible() || !spotifyAuth) return;
  const seq = ++splayerReqSeq;
  // Refresh the access token first (a no-op when still valid) so the timing
  // below measures only the currently-playing call. Otherwise the one-off token
  // refresh on the first poll after a page load would inflate the latency
  // estimate and mis-anchor the clock — a big cause of "off" lyrics on refresh.
  await ensureSpotifyToken();
  if (seq !== splayerReqSeq) return;
  // Time the request so we can undo network latency: Spotify reads progress_ms
  // early while handling the call (then does server work before responding), so
  // by the time the response lands the song has moved on by more than half the
  // round trip. Without this the lyrics run consistently late, so we assume the
  // read happens ~30% in and compensate ~70% of the round trip (capped).
  const t0 = Date.now();
  const np = await spotifyApi("/me/player/currently-playing");
  if (seq !== splayerReqSeq) return; // a newer refresh superseded this one
  const latencyComp = Math.min(Math.round((Date.now() - t0) * 0.7), 800);
  let track = null, isPlaying = false, progressMs = 0, isLast = false;
  if (np && !np.empty && !np.error && np.item) {
    track = np.item;
    isPlaying = !!np.is_playing;
    // only advance a *playing* position; a paused position is static
    progressMs = (np.progress_ms || 0) + (isPlaying ? latencyComp : 0);
  } else {
    const recent = await spotifyApi("/me/player/recently-played?limit=1");
    if (seq !== splayerReqSeq) return; // superseded
    if (recent && recent.items && recent.items[0]) {
      track = recent.items[0].track;
      isLast = true;
    }
  }
  // Detect what actually changed since the last poll. The heavy work (lyrics,
  // albums, liked, full re-render) only needs to run when the track changes;
  // rebuilding the DOM every poll would otherwise reset the lyric scroll.
  const prevId = splayer.track && splayer.track.id;
  const prevPlaying = splayer.isPlaying;
  const newId = track && track.id;
  const trackChanged = newId !== prevId;

  if (!trackChanged && track) {
    // Same track still loaded: reconcile play/pause + position without a jarring
    // rebuild, and without letting jitter or a racing poll rewind the lyrics.
    // (reconcile reads the *old* anchor via splayerCurrentMs, so run it first.)
    reconcileSplayerSameTrack(isPlaying, progressMs);
    splayer.isLast = isLast;
    splayer.durationMs = track.duration_ms;
    if (prevPlaying !== splayer.isPlaying) updateSplayerPlayButton();
    updateSplayerProgress();
    startSplayerTick();
    return;
  }

  splayer.track = track;
  splayer.isPlaying = isPlaying;
  splayer.isLast = isLast;
  splayer.progressMs = progressMs;
  splayer.durationMs = track ? track.duration_ms : 0;
  splayer._prevRestartAt = 0; // the track changed, so the skip-back arm resets
  // fetchedAt anchors the local progress clock: re-anchoring on every poll keeps
  // extrapolated time from drifting away from Spotify while playing.
  splayer.fetchedAt = Date.now();

  if (track) {
    const liked = await spotifyApi("/me/tracks/contains?ids=" + track.id);
    splayer.liked = Array.isArray(liked) ? !!liked[0] : false;
  } else {
    splayer.liked = false;
  }
  // three most-recent distinct albums
  const rp = await spotifyApi("/me/player/recently-played?limit=50");
  const albums = [];
  if (rp && rp.items) {
    const seen = new Set();
    for (const it of rp.items) {
      const al = it.track && it.track.album;
      if (al && !seen.has(al.id)) {
        seen.add(al.id);
        albums.push(al);
      }
      if (albums.length >= 3) break;
    }
  }
  splayer.albums = albums;
  await loadSplayerLyrics(track);
  if (seq !== splayerReqSeq) return; // superseded while loading lyrics/albums
  renderSpotifyPlayer();
  startSplayerTick();
}

// Swap just the play/pause icon in place (no full rebuild -> keeps lyric scroll).
function updateSplayerPlayButton() {
  const el = document.getElementById("dt-splayer");
  if (!el) return;
  const btn = el.querySelector('.sp-btn[data-act="playpause"]');
  if (btn) btn.innerHTML = splayerIcon((splayer.isPlaying || splayer.resuming) ? "pause" : "play");
}

// Toggle just the heart state in place (no full rebuild -> keeps lyric scroll).
function updateSplayerHeart() {
  const el = document.getElementById("dt-splayer");
  if (!el) return;
  const btn = el.querySelector('.sp-btn[data-act="like"]');
  if (btn) btn.classList.toggle("sp-liked", splayer.liked);
}

function splayerCurrentMs() {
  return splayer.isPlaying ? splayer.progressMs + (Date.now() - splayer.fetchedAt) : splayer.progressMs;
}

function updateSplayerProgress() {
  const el = document.getElementById("dt-splayer");
  if (!el || !splayer.track) return;
  const dur = splayer.durationMs || 1;
  const p = Math.min(splayerCurrentMs(), dur);
  const pct = Math.max(0, Math.min(100, (p / dur) * 100));
  const fill = el.querySelector(".sp-bar-fill");
  const dot = el.querySelector(".sp-bar-dot");
  if (fill) fill.style.width = pct + "%";
  if (dot) dot.style.left = pct + "%";
  // scroll the lyrics so the current line lands in place just before it's sung
  const scroll = el.querySelector(".sp-lyrics-scroll");
  if (splayer.lyrics && splayer.lyrics.length && scroll) {
    const LEAD = 1450; // begin the scroll ~this long before the line is sung (500ms ahead of the previous 450ms tuning)
    let idx = 0;
    for (let i = 0; i < splayer.lyrics.length; i++) {
      if (splayer.lyrics[i].time <= p + LEAD) idx = i;
      else break;
    }
    if (splayer._lyricIdx !== idx) {
      const first = splayer._lyricIdx == null || splayer._lyricIdx < 0;
      splayer._lyricIdx = idx;
      const lines = scroll.children;
      for (let k = 0; k < lines.length; k++) lines[k].classList.toggle("sp-current", k === idx);
      const cur = lines[idx];
      if (cur) {
        // seat the current line just below the top fade
        const y = -(cur.offsetTop - 28);
        if (first) {
          // no animation for the very first placement
          scroll.style.transition = "none";
          scroll.style.transform = `translateY(${y}px)`;
          void scroll.offsetWidth;
          scroll.style.transition = "";
        } else {
          scroll.style.transform = `translateY(${y}px)`;
        }
      }
    }
  }
}

function startSplayerTick() {
  if (splayerTick) return;
  splayerTick = setInterval(() => {
    if (document.hidden || !splayerVisible()) return;
    updateSplayerProgress();
  }, 250);
}

function splayerIcon(name) {
  if (name === "minus") {
    return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>';
  }
  const paths = {
    heart:
      '<path d="M12 21s-7-4.35-9.5-8.5C1 9.5 2.5 6 6 6c2 0 3 1.2 4 2.5C11 7.2 12 6 14 6c3.5 0 5 3.5 3.5 6.5C19 16.65 12 21 12 21z"/>',
    prev: '<path d="M6 6h2v12H6z"/><path d="M20 6l-11 6 11 6z"/>',
    next: '<path d="M16 6h2v12h-2z"/><path d="M4 6l11 6-11 6z"/>',
    play: '<path d="M8 5v14l11-7z"/>',
    pause: '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>',
  };
  return '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">' + (paths[name] || "") + "</svg>";
}

// Wrapper: after any render path (connect / empty / now-playing) re-add the
// resize handle in edit mode, since each path rebuilds the player's innerHTML
// and drops the handle child.
function renderSpotifyPlayer() {
  renderSpotifyPlayerBody();
  if (pageEditMode) buildItemHandles();
}
function renderSpotifyPlayerBody() {
  const el = document.getElementById("dt-splayer");
  if (!el) return;
  if (!spotifyAuth) {
    el.innerHTML =
      '<div class="sp-connect"><div class="sp-label" style="margin-bottom:10px">spotify player</div>' +
      '<button type="button" id="sp-connect-btn">connect spotify</button></div>';
    const b = document.getElementById("sp-connect-btn");
    if (b) b.addEventListener("click", () => spotifyConnect());
    return;
  }
  const t = splayer.track;
  if (!t) {
    el.innerHTML =
      '<div class="sp-label">now playing:</div><div class="sp-lyrics-none">play something on spotify to see it here</div>';
    return;
  }
  const art = t.album && t.album.images && t.album.images[0] ? t.album.images[0].url : "";
  const artists = (t.artists || []).map((a) => a.name).join(", ");
  const label = splayer.isLast ? "last played:" : "now playing:";
  const playIcon = (splayer.isPlaying || splayer.resuming) ? "pause" : "play";
  const albumsHtml = splayer.albums
    .map((al) => {
      const img = al.images && al.images[0] ? al.images[0].url : "";
      const url = (al.external_urls && al.external_urls.spotify) || "#";
      return (
        `<a href="${url}" target="_blank" rel="noopener" title="${calEsc(al.name)}">` +
        (img ? `<img class="sp-album" src="${img}" alt="" />` : '<div class="sp-album sp-noart"></div>') +
        "</a>"
      );
    })
    .join("");
  const hasLyrics = splayer.lyrics && splayer.lyrics.length;
  const lyricsHtml = hasLyrics
    ? '<div class="sp-lyrics"><div class="sp-lyrics-scroll">' +
      splayer.lyrics.map((l) => `<div class="sp-lyric">${calEsc(l.text)}</div>`).join("") +
      "</div></div>"
    : '<div class="sp-lyrics sp-lyrics-empty"><div class="sp-lyrics-none">no synced lyrics found</div></div>';
  splayer._lyricIdx = -1; // force the scroll to re-seat on the next tick
  el.innerHTML =
    '<div class="sp-top">' +
    `<div class="sp-label">${label}</div>` +
    '<div class="sp-top-row">' +
    (art ? `<img class="sp-art" src="${art}" alt="" />` : '<div class="sp-art sp-noart"></div>') +
    '<div class="sp-main">' +
    `<div class="sp-track"><div class="sp-title">${calEsc(t.name)}</div><div class="sp-artist">${calEsc(artists)}</div></div>` +
    '<div class="sp-bar"><div class="sp-bar-fill"></div><div class="sp-bar-dot"></div></div>' +
    '<div class="sp-controls">' +
    `<button class="sp-btn sp-heart${splayer.liked ? " sp-liked" : ""}" data-act="like" title="save to liked">${splayerIcon("heart")}</button>` +
    `<button class="sp-btn" data-act="prev" title="previous">${splayerIcon("prev")}</button>` +
    `<button class="sp-btn sp-play" data-act="playpause" title="play / pause">${splayerIcon(playIcon)}</button>` +
    `<button class="sp-btn" data-act="next" title="next">${splayerIcon("next")}</button>` +
    `<button class="sp-btn" data-act="minus" title="remove from liked">${splayerIcon("minus")}</button>` +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>" +
    `<div class="sp-bottom">${lyricsHtml}<div class="sp-albums">${albumsHtml}</div></div>`;
  el.querySelectorAll(".sp-btn").forEach((btn) => {
    btn.addEventListener("click", () => splayerControl(btn.dataset.act));
  });
  updateSplayerProgress();
}

async function splayerControl(act) {
  const t = splayer.track;
  if (!t) return;
  if (act === "like" || act === "minus") {
    const like = act === "like" && !splayer.liked;
    await spotifyReq("/me/tracks?ids=" + t.id, like ? "PUT" : "DELETE");
    splayer.liked = like;
    updateSplayerHeart();
    return;
  }
  if (act === "playpause") {
    const showingPlaying = splayer.isPlaying || splayer.resuming;
    if (!showingPlaying) {
      // Resume: start advancing immediately for a smooth start, and mark
      // 'resuming' so the reconcile can freeze us (forward-only) if Spotify turns
      // out not to have resumed yet. Snapshot the position before flipping
      // isPlaying, which splayerCurrentMs depends on.
      splayer.progressMs = splayerCurrentMs();
      splayer.isPlaying = true;
      splayer.resuming = true;
      splayer.fetchedAt = Date.now();
      splayer.stateChangedAt = Date.now();
      updateSplayerPlayButton();
      updateSplayerProgress();
      await spotifyReq("/me/player/play", "PUT");
      confirmSplayerResume();
      return;
    }
    // Pause (also cancels a pending resume). Freeze the clock immediately at the
    // current position so the lyrics stop in lockstep with Spotify.
    splayer.resuming = false;
    const dur = splayer.durationMs || Infinity;
    splayer.progressMs = Math.min(splayerCurrentMs(), dur);
    splayer.isPlaying = false;
    splayer.fetchedAt = Date.now();
    splayer.stateChangedAt = Date.now(); // start the grace window (see reconcile)
    updateSplayerPlayButton();
    updateSplayerProgress();
    await spotifyReq("/me/player/pause", "PUT");
    setTimeout(refreshSpotifyPlayer, 350); // reconcile exact stop point with Spotify
    return;
  }
  if (act === "prev") {
    const now = Date.now();
    const pos = splayerCurrentMs();
    // First skip-back restarts the current song. A second skip-back while still
    // in the first 5s (i.e. right after that restart) skips to the previous
    // track. The 10s wall-clock guard keeps a stale restart from a much earlier
    // song from arming this once a new track has started on its own.
    const armed = splayer._prevRestartAt && now - splayer._prevRestartAt < 10000;
    if (armed && pos < 5000) {
      splayer._prevRestartAt = 0;
      splayerReqSeq++; // drop any in-flight poll so it can't fight the change
      await spotifyReq("/me/player/previous", "POST");
    } else {
      splayer._prevRestartAt = now;
      // Optimistically snap to the top so the lyrics restart instantly; bump the
      // request seq so an in-flight poll (still reporting the old position) is
      // dropped instead of snapping the clock forward again.
      splayerReqSeq++;
      splayer.resuming = false;
      splayer.progressMs = 0;
      splayer.fetchedAt = now;
      splayer.stateChangedAt = now;
      splayer._seekBackVotes = 0;
      splayer._lyricIdx = -1;
      updateSplayerProgress();
      await spotifyReq("/me/player/seek?position_ms=0", "PUT");
    }
    setTimeout(refreshSpotifyPlayer, 350); // let Spotify apply, then re-sync
    return;
  }
  if (act === "next") {
    splayer._prevRestartAt = 0;
    await spotifyReq("/me/player/next", "POST");
    setTimeout(refreshSpotifyPlayer, 350); // let Spotify apply, then re-sync
    return;
  }
}

// Poll quickly after an unpause until Spotify confirms it actually resumed; the
// reconcile then flips resuming -> playing and anchors to the real position.
async function confirmSplayerResume() {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 10 && splayer.resuming; i++) {
    await refreshSpotifyPlayer();
    if (!splayer.resuming) return;
    await sleep(300);
  }
  // Fallback after ~3s so we never get stuck frozen if confirmation never lands.
  if (splayer.resuming) {
    splayer.resuming = false;
    splayer.isPlaying = true;
    splayer.fetchedAt = Date.now();
    refreshSpotifyPlayer();
  }
}

// Wire the connect/disconnect button + initialize (desktop only).
function initSpotify() {
  const connectBtn = document.getElementById("dt-spotify-connect");
  if (connectBtn) {
    connectBtn.addEventListener("click", () => {
      if (spotifyAuth) spotifyDisconnect();
      else spotifyConnect();
    });
  }
  (async () => {
    await handleSpotifyRedirect();
    renderSpotifyPanel();
    renderSpotifyPlayer();
    refreshSpotifyPlayer();
  })();
  // Poll the custom player often so pause/resume/seek/track changes made from
  // any device re-sync within a few seconds instead of drifting for a full
  // poll cycle. The poll is cheap when the track is unchanged (one API call).
  setInterval(() => {
    if (document.hidden || !spotifyAuth || !splayerVisible()) return;
    refreshSpotifyPlayer();
  }, 4000);
  // The lightweight now-playing banner can stay on a slower cadence.
  setInterval(() => {
    if (document.hidden || !spotifyAuth) return;
    refreshSpotifyNowPlaying();
  }, 15000);
}

// Render the title: use this device's saved rich (formatted) version when its
// plain text still matches the synced title, otherwise fall back to plain text.
function renderTitle() {
  const title = document.getElementById("dt-title");
  if (!title || document.activeElement === title) return;
  const plain = uiPrefs.title || "pokeplanner";
  const rich = deviceStyle.richText && deviceStyle.richText.title;
  if (rich && stripHtml(rich).trim() === plain.trim()) title.innerHTML = rich;
  else title.textContent = plain;
}

function applyUiPrefs() {
  const root = document.getElementById("dt-root");
  if (root) root.classList.toggle("dt-no-banner", Boolean(uiPrefs.bannerHidden));
  const banner = document.getElementById("dt-banner");
  if (banner) {
    banner.style.backgroundImage = uiPrefs.banner ? `url("${uiPrefs.banner}")` : "";
    banner.classList.toggle("has-image", Boolean(uiPrefs.banner));
    banner.style.backgroundPosition = `center ${uiPrefs.bannerPos != null ? uiPrefs.bannerPos : 50}%`;
  }
  renderTitle();
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
  { id: "splayer", sel: ".dt-splayer" },
  { id: "calendar", sel: ".dt-calendar" },
  { id: "calTasks", sel: ".dt-cal-tasks" },
];
// Items whose height acts as a minimum (content can grow past it) rather than a
// hard clip — the habit box (wrapping month dots) and the spotify player (its
// lyrics/albums have their own layout we don't want to cut off).
const MIN_HEIGHT_ITEMS = ["habit", "splayer"];

function pageLayout() {
  if (!uiPrefs.pageLayout || typeof uiPrefs.pageLayout !== "object") uiPrefs.pageLayout = {};
  return uiPrefs.pageLayout;
}

// Widest a resizable box may grow: it stays inside its own grid column, except
// the outer columns, which may run out to the viewport edge (into the page
// margin). A box grows rightward from its column's left edge, so the limit is
// (right boundary − column left), where the right boundary is the viewport edge
// for the last column or the column's own right edge otherwise.
function itemMaxWidth(el) {
  let cell = el;
  while (
    cell.parentElement &&
    !cell.parentElement.classList.contains("dt-dashboard") &&
    !cell.parentElement.classList.contains("dt-cal-row")
  ) {
    cell = cell.parentElement;
  }
  const grid = cell.parentElement;
  if (!grid) return Infinity;
  const cs = getComputedStyle(grid);
  const tracks = cs.gridTemplateColumns.split(" ").map(parseFloat).filter((n) => !isNaN(n));
  const gap = parseFloat(cs.columnGap) || 0;
  const padL = parseFloat(cs.paddingLeft) || 0;
  const idx = [...grid.children].indexOf(cell);
  if (idx < 0 || idx >= tracks.length) return Infinity;
  let cellLeft = grid.getBoundingClientRect().left + padL;
  for (let i = 0; i < idx; i++) cellLeft += tracks[i] + gap;
  const cellRight = cellLeft + tracks[idx];
  // stay within the column; the last column's right edge is the content edge
  // (i.e. the right margin border), so items never spill into the margin
  return Math.max(1, cellRight - cellLeft);
}

// ---- column / margin geometry (page edit mode) ----
const MIN_COL = 70; // minimum width for any resizable column
const DASH_MINS_MARGIN = 0; // margins may shrink to the screen edge

// Scale `sizes` to sum to `total`, then enforce per-index minimums, pulling the
// difference from the segments that still have room above their minimum.
function fitSizes(sizes, mins, total) {
  const cur = sizes.reduce((a, b) => a + b, 0);
  let s = sizes.map((v) => (cur > 0 ? (v * total) / cur : total / sizes.length));
  s = s.map((v, i) => Math.max(v, mins[i]));
  let excess = s.reduce((a, b) => a + b, 0) - total;
  if (excess > 0) {
    const pool = s.map((v, i) => Math.max(0, v - mins[i]));
    const poolSum = pool.reduce((a, b) => a + b, 0);
    if (poolSum > 0) s = s.map((v, i) => v - (excess * pool[i]) / poolSum);
  }
  return s;
}

// Move the boundary between segment `index` and `index+1` by `delta` px, taking
// space from the neighbours in cascade (respecting mins) so the total is fixed
// and nothing is ever pushed off-screen.
function moveBoundary(sizes, mins, index, delta) {
  const s = sizes.slice();
  if (delta > 0) {
    let need = delta;
    for (let j = index + 1; j < s.length && need > 0.01; j++) {
      const take = Math.min(s[j] - mins[j], need);
      s[j] -= take;
      need -= take;
    }
    s[index] += delta - need;
  } else if (delta < 0) {
    let need = -delta;
    for (let j = index; j >= 0 && need > 0.01; j--) {
      const take = Math.min(s[j] - mins[j], need);
      s[j] -= take;
      need -= take;
    }
    s[index + 1] += -delta - need;
  }
  return s;
}

// The dashboard's flexible segments, in order: [leftMargin, col1..colN, rightMargin].
function dashMins(nCols) {
  return [DASH_MINS_MARGIN, ...Array(nCols).fill(MIN_COL), DASH_MINS_MARGIN];
}

// Total width shared by the dashboard's margins + columns (viewport minus the
// fixed content padding and column gaps).
function dashFixedTotal(dash) {
  const cs = getComputedStyle(dash);
  const pad = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
  const gap = parseFloat(cs.columnGap) || 0;
  const nCols = cssColsToPx(dash).length;
  return document.documentElement.clientWidth - pad - gap * (nCols - 1);
}

// Read the dashboard's current [leftMargin, ...cols, rightMargin] from layout.
function currentDashSizes(dash) {
  const r = dash.getBoundingClientRect();
  const cols = cssColsToPx(dash);
  const ml = Math.max(0, r.left);
  const mr = Math.max(0, document.documentElement.clientWidth - r.right);
  return [ml, ...cols, mr];
}

// Clamp/scale stored sizes to the current viewport so nothing overflows.
function fitDashSizes(sizes) {
  const dash = document.querySelector(".dt-dashboard");
  if (!dash) return sizes;
  const nCols = sizes.length - 2;
  return fitSizes(sizes, dashMins(nCols), dashFixedTotal(dash));
}

// Apply a [leftMargin, ...cols, rightMargin] array to the CSS.
function applyDashSizes(sizes) {
  const root = document.documentElement;
  const dash = document.querySelector(".dt-dashboard");
  if (!dash) return;
  const ml = Math.round(sizes[0]);
  const mr = Math.round(sizes[sizes.length - 1]);
  const cols = sizes.slice(1, -1).map((c) => Math.round(c));
  root.style.setProperty("--dt-ml", ml + "px");
  root.style.setProperty("--dt-mr", mr + "px");
  root.style.setProperty("--dt-content-max", "none");
  dash.style.gridTemplateColumns = cols.map((c) => c + "px").join(" ");
  // a narrower column must squeeze the boxes inside it (never let them spill out)
  clampItemsToColumns();
  alignBoxTitles();
}

// Keep every resized box within its column: width = min(saved width, column).
// Growing the column back restores the box up to its saved width.
function clampItemsToColumns() {
  const items = pageLayout().items || {};
  for (const item of PAGE_ITEMS) {
    const el = document.querySelector(item.sel);
    if (!el) continue;
    const size = items[item.id];
    if (!size || !size.w) continue;
    el.style.width = Math.min(size.w, itemMaxWidth(el)) + "px";
    el.style.marginLeft = "auto";
    el.style.marginRight = "auto";
    el.style.flex = "none";
  }
}

// Box titles (habit tracker / pokepark) hug the top-left corner of their box as
// it's resized, instead of staying pinned to the column's left border.
function alignBoxTitles() {
  for (const sel of [".dt-habit-box", ".dt-park-box"]) {
    const box = document.querySelector(sel);
    if (!box) continue;
    const heading = box.previousElementSibling;
    if (!heading || heading.tagName !== "H2") continue;
    const ml = parseFloat(getComputedStyle(box).marginLeft) || 0;
    heading.style.marginLeft = ml > 0 ? ml + "px" : "";
  }
}

// ---- per-device look (page-edit colors + rich-text formatting) ----
// Stored locally only; never synced, so each device keeps its own look.
const DEVICE_STYLE_KEY = "todo-app-device-style";
function loadDeviceStyle() {
  try {
    const s = JSON.parse(localStorage.getItem(DEVICE_STYLE_KEY));
    if (s && typeof s === "object") {
      return {
        colors: s.colors && typeof s.colors === "object" ? s.colors : {},
        richText: s.richText && typeof s.richText === "object" ? s.richText : {},
        menuPos: s.menuPos || null,
        widgets: s.widgets && typeof s.widgets === "object" ? s.widgets : null,
        widgetStyles: s.widgetStyles && typeof s.widgetStyles === "object" ? s.widgetStyles : {},
        widgetGap: typeof s.widgetGap === "number" ? s.widgetGap : null,
        bgImage: s.bgImage && typeof s.bgImage === "object" ? s.bgImage : null,
        menuSize: s.menuSize && typeof s.menuSize === "object" ? s.menuSize : null,
      };
    }
  } catch (e) {
    // fall through to defaults
  }
  return { colors: {}, richText: {}, menuPos: null, widgets: null, widgetStyles: {}, widgetGap: null, bgImage: null, menuSize: null };
}
let deviceStyle = loadDeviceStyle();
function saveDeviceStyle() {
  localStorage.setItem(DEVICE_STYLE_KEY, JSON.stringify(deviceStyle));
}
function stripHtml(html) {
  const d = document.createElement("div");
  d.innerHTML = html || "";
  return d.textContent || "";
}

// ==========================================================================
// Page background image (per-device). Sits behind all content in #dt-bg-layer
// and scrolls with the page, so it "ends" partway down; below it the layer's own
// background shows the chosen end fill — a solid color, or a soft "mirage" of
// dispersed colors sampled from the image (frosted with a grain overlay).
// ==========================================================================
const BG_DEFAULTS = { src: null, posX: 50, posY: 50, zoom: 100, height: 900, end: "solid", endColor: null, mirage: null, parallax: false };
// With "scroll with background depth" on, the background moves at this fraction
// of the page's scroll speed (0.5 = half as fast) for a parallax effect.
const BG_PARALLAX_FACTOR = 0.5;
// A very dispersed rainbow fallback if we can't sample the image (e.g. a remote
// link with no CORS): mirrors the soft blue→green→yellow→pink spread.
const DEFAULT_MIRAGE = ["120,110,220", "96,150,214", "126,201,150", "232,214,120", "234,150,110", "225,112,162"];
// Tiny fractal-noise tile for the frosted grain (inline SVG data URL).
const GRAIN_URL =
  "url(\"data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.6"/></svg>'
  ) +
  "\")";

function bgImageCfg() {
  return { ...BG_DEFAULTS, ...(deviceStyle.bgImage || {}) };
}
function saveBgImageCfg(patch) {
  deviceStyle.bgImage = { ...bgImageCfg(), ...patch };
  saveDeviceStyle();
}

// Sample a spread of colors from the image by drawing it tiny and reading a
// grid of pixels. Resolves null if the canvas is tainted (remote image without
// CORS) so the caller can fall back to the default palette.
function sampleImageColors(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const n = 4;
        const c = document.createElement("canvas");
        c.width = n;
        c.height = n;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, n, n);
        const d = ctx.getImageData(0, 0, n, n).data;
        const all = [];
        for (let i = 0; i < n * n; i++) all.push(`${d[i * 4]},${d[i * 4 + 1]},${d[i * 4 + 2]}`);
        const picks = [];
        const step = Math.max(1, Math.floor(all.length / 6));
        for (let i = 0; i < all.length && picks.length < 6; i += step) picks.push(all[i]);
        resolve(picks.length ? picks : null);
      } catch (e) {
        resolve(null); // tainted canvas
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Build a dispersed, slightly-frosted multi-color gradient from sampled colors:
// soft large radial blooms at spread-out spots over an averaged base, plus a
// faint white wash. The grain overlay (CSS) supplies the frosted texture.
function buildMirageGradient(colors) {
  const cols = colors && colors.length ? colors : DEFAULT_MIRAGE;
  const spots = [[14, 8], [84, 14], [50, 42], [18, 74], [82, 66], [50, 96]];
  const layers = spots.map((p, i) => {
    const c = cols[i % cols.length];
    return `radial-gradient(60% 55% at ${p[0]}% ${p[1]}%, rgba(${c},0.85) 0%, rgba(${c},0) 68%)`;
  });
  // averaged base color so there are no gaps between the blooms
  const acc = [0, 0, 0];
  cols.forEach((c) => c.split(",").forEach((v, k) => (acc[k] += Number(v))));
  const avg = acc.map((v) => Math.round(v / cols.length)).join(",");
  layers.unshift("linear-gradient(rgba(255,255,255,0.10), rgba(255,255,255,0.03))"); // frost wash
  layers.push(`linear-gradient(rgba(${avg},1), rgba(${avg},1))`);
  return layers.join(", ");
}

// Push the current bg-image config to CSS (idempotent; safe to call any time).
function applyBackgroundImage() {
  const root = document.getElementById("dt-root");
  const layer = document.getElementById("dt-bg-layer");
  const imgEl = document.getElementById("dt-bg-img");
  const grain = document.getElementById("dt-bg-grain");
  if (!root || !layer || !imgEl) return;
  const b = bgImageCfg();
  if (!b.src) {
    root.classList.remove("has-bg-image");
    layer.style.transform = ""; // drop any parallax offset from a prior image
    layer.style.willChange = "";
    return;
  }
  root.classList.add("has-bg-image");
  const rs = document.documentElement.style;
  rs.setProperty("--dt-bg-image", `url("${b.src}")`);
  rs.setProperty("--dt-bg-img-h", (b.height || 900) + "px");
  rs.setProperty("--dt-bg-size", b.zoom > 100 ? b.zoom + "% auto" : "cover");
  rs.setProperty("--dt-bg-pos", `${b.posX}% ${b.posY}%`);
  if (grain) rs.setProperty("--dt-grain-url", GRAIN_URL);
  if (b.end === "mirage") {
    layer.classList.add("has-mirage");
    layer.style.background = buildMirageGradient(b.mirage);
  } else {
    layer.classList.remove("has-mirage");
    const endColor = b.endColor || (deviceStyle.colors && deviceStyle.colors.bg) || getComputedStyle(document.body).backgroundColor;
    layer.style.background = endColor;
  }
  layer.style.willChange = b.parallax ? "transform" : "";
  updateBgParallax();
}

// Offset the background layer for the "scroll with background depth" parallax:
// the layer scrolls with the document, so translating it DOWN by (1−factor)×
// scroll makes it appear to move up slower than the page content. Skipped while
// cropping (the layer is raised + dragged) and when parallax/image is off.
function updateBgParallax() {
  const layer = document.getElementById("dt-bg-layer");
  const root = document.getElementById("dt-root");
  if (!layer || !root) return;
  const b = bgImageCfg();
  const editing = root.classList.contains("dt-bg-editing");
  if (!b.src || !b.parallax || editing) {
    layer.style.transform = "";
    return;
  }
  const sy = (document.scrollingElement || document.documentElement).scrollTop || 0;
  layer.style.transform = `translateY(${((1 - BG_PARALLAX_FACTOR) * sy).toFixed(1)}px)`;
}
let bgParallaxRaf = 0;
function onBgParallaxScroll() {
  if (bgParallaxRaf) return;
  bgParallaxRaf = requestAnimationFrame(() => {
    bgParallaxRaf = 0;
    updateBgParallax();
  });
}

// Apply the saved sizes + colors to the desktop layout (idempotent).
function applyPageLayout() {
  if (!document.getElementById("dt-root")) return;
  const pl = pageLayout();
  const root = document.documentElement;

  const colors = deviceStyle.colors || {};
  const setVar = (name, val) => {
    if (val) root.style.setProperty(name, val);
    else root.style.removeProperty(name);
  };
  setVar("--dt-bg", colors.bg);
  setVar("--dt-clock", colors.clock);
  setVar("--dt-btn-primary", colors.primary);
  setVar("--dt-btn-secondary", colors.secondary);
  // Per-category text colors: headings (.dt-h2) and task info (task-name text)
  // get their own swatches; the CSS applies these vars scoped to the dashboard.
  // All other text stays theme-colored and can be recolored via highlight+format.
  setVar("--dt-heading", colors.heading);
  setVar("--dt-task", colors.task);
  setVar("--dt-task-done", colors.taskDone);

  const dash = document.querySelector(".dt-dashboard");
  // New model: independent left/right margins act as the outer column borders,
  // with the columns filling the space between them. Falls back to the legacy
  // centered max-width model for layouts saved before margins existed.
  if (dash && pl.marginLeft != null && pl.marginRight != null && pl.dashCols) {
    const cols = pl.dashCols.split(" ").map(parseFloat).filter((n) => !isNaN(n));
    let sizes = [pl.marginLeft, ...cols, pl.marginRight];
    sizes = fitDashSizes(sizes);
    applyDashSizes(sizes);
  } else {
    root.style.removeProperty("--dt-ml");
    root.style.removeProperty("--dt-mr");
    if (pl.contentMax) root.style.setProperty("--dt-content-max", pl.contentMax + "px");
    else root.style.removeProperty("--dt-content-max");
    if (dash) dash.style.gridTemplateColumns = pl.dashCols || "";
  }

  const calRow = document.querySelector(".dt-cal-row");
  if (calRow) {
    if (pl.calCols) {
      // re-fit the calendar row's columns to the (margin-adjusted) section width
      const cc = pl.calCols.split(" ").map(parseFloat).filter((n) => !isNaN(n));
      const gap = gridGap(calRow);
      const avail = calRow.getBoundingClientRect().width - gap * (cc.length - 1);
      const fitted = fitSizes(cc, cc.map(() => MIN_COL), avail);
      calRow.style.gridTemplateColumns = fitted.map((c) => Math.round(c) + "px").join(" ");
    } else {
      calRow.style.gridTemplateColumns = "";
    }
  }

  const items = pl.items || {};
  for (const item of PAGE_ITEMS) {
    const el = document.querySelector(item.sel);
    if (!el) continue;
    const size = items[item.id];
    if (size && (size.w || size.h)) {
      // clamp to the current viewport so a width saved on a wider screen can't
      // spill past the edge / into another column after a refresh or resize
      if (size.w) el.style.width = Math.min(size.w, itemMaxWidth(el)) + "px";
      if (size.h) {
        if (MIN_HEIGHT_ITEMS.includes(item.id)) {
          // treat the saved height as a minimum so content (wrapping month dots /
          // the player's lyrics + albums) can extend it instead of being clipped
          el.style.minHeight = size.h + "px";
          el.style.height = "auto";
        } else {
          el.style.height = size.h + "px";
        }
      }
      el.style.marginLeft = "auto";
      el.style.marginRight = "auto"; // stay centered in the cell when smaller
      el.style.flex = "none";
    } else {
      el.style.width = "";
      el.style.height = "";
      if (MIN_HEIGHT_ITEMS.includes(item.id)) el.style.minHeight = "";
      el.style.marginLeft = "";
      el.style.marginRight = "";
      el.style.flex = "";
    }
  }
  alignBoxTitles();
  applyBackgroundImage();
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
    // ignore hidden widgets / the transient drop line so measurements are clean
    const kids = [...col.children].filter(
      (el) => el.offsetParent !== null && !el.classList.contains("dt-widget-drop")
    );
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

// ==========================================================================
// Habit tracker (desktop): a weekly calendar of habit dots, a month-long dot
// strip, and three editable daily habit checkboxes. State is stored locally.
// ==========================================================================
const HABITS_KEY = "todo-app-habits";
const HABIT_COUNT = 3;
// Placeholder dot counts per weekday (Sun..Sat): 3 on Mon/Wed/Fri, 2 otherwise.
const HABIT_DOTS_BY_DAY = [2, 3, 2, 3, 2, 3, 2];
const HABIT_DEFAULT_LABELS = ["3 bottles/water", "active", "journal/meditate"];

function loadHabits() {
  try {
    const s = JSON.parse(localStorage.getItem(HABITS_KEY));
    if (s && typeof s === "object") {
      return {
        labels:
          Array.isArray(s.labels) && s.labels.length === HABIT_COUNT
            ? s.labels
            : HABIT_DEFAULT_LABELS.slice(),
        log: s.log && typeof s.log === "object" ? s.log : {},
      };
    }
  } catch (e) {
    // fall through to defaults
  }
  return { labels: HABIT_DEFAULT_LABELS.slice(), log: {} };
}
let habitData = loadHabits();
function saveHabits() {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habitData));
}

function habitDateKey(d) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}
function habitDayState(key) {
  const v = habitData.log[key];
  if (Array.isArray(v)) {
    const out = v.slice(0, HABIT_COUNT);
    while (out.length < HABIT_COUNT) out.push(false);
    return out;
  }
  return Array(HABIT_COUNT).fill(false);
}
function habitCompletedCount(key) {
  return habitDayState(key).filter(Boolean).length;
}
function habitDotCount(dayIndex) {
  return HABIT_DOTS_BY_DAY[dayIndex];
}

function renderHabitWeek() {
  const el = document.getElementById("habit-week");
  if (!el) return;
  el.innerHTML = "";
  const letters = ["s", "m", "t", "w", "th", "f", "sa"];
  const today = new Date();
  const todayKey = habitDateKey(today);
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay()); // Sunday of this week
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = habitDateKey(d);
    const dots = habitDotCount(i);
    const filled = Math.min(habitCompletedCount(key), dots);

    const col = document.createElement("div");
    col.className = "habit-day" + (key === todayKey ? " today" : "");
    const label = document.createElement("div");
    label.className = "habit-day-label";
    label.textContent = letters[i];
    col.appendChild(label);
    const dotsWrap = document.createElement("div");
    dotsWrap.className = "habit-day-dots";
    for (let j = 0; j < dots; j++) {
      const dot = document.createElement("div");
      dot.className = "habit-wdot" + (j < filled ? " filled" : "");
      dotsWrap.appendChild(dot);
    }
    col.appendChild(dotsWrap);
    el.appendChild(col);
  }
}

function renderHabitMonth() {
  const el = document.getElementById("habit-month");
  if (!el) return;
  el.innerHTML = "";
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= days; day++) {
    const d = new Date(year, month, day);
    const done = habitCompletedCount(habitDateKey(d));
    const target = habitDotCount(d.getDay());
    const dot = document.createElement("div");
    let cls = "habit-mdot";
    if (done > 0) cls += done >= target ? " full" : " half";
    if (day === today.getDate()) cls += " today";
    dot.className = cls;
    el.appendChild(dot);
  }
}

function renderHabitChecks() {
  const el = document.getElementById("habit-checks");
  if (!el) return;
  el.innerHTML = "";
  const todayKey = habitDateKey(new Date());
  const state = habitDayState(todayKey);
  for (let i = 0; i < HABIT_COUNT; i++) {
    const box = document.createElement("div");
    box.className = "habit-check" + (state[i] ? " checked" : "");

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "habit-check-toggle";
    toggle.setAttribute("aria-pressed", String(Boolean(state[i])));
    toggle.innerHTML =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    toggle.addEventListener("click", () => {
      const cur = habitDayState(todayKey);
      cur[i] = !cur[i];
      habitData.log[todayKey] = cur;
      saveHabits();
      renderHabitTracker(); // fills a dot on today in the weekly calendar
    });

    const label = document.createElement("div");
    label.className = "habit-check-label";
    label.contentEditable = String(Boolean(pageEditMode));
    label.spellcheck = false;
    const plainLabel = habitData.labels[i] || "";
    const richLabel = deviceStyle.richText && deviceStyle.richText.habit && deviceStyle.richText.habit[i];
    if (richLabel && stripHtml(richLabel).trim() === plainLabel.trim()) label.innerHTML = richLabel;
    else label.textContent = plainLabel;
    label.addEventListener("blur", () => {
      habitData.labels[i] = label.textContent.trim() || habitData.labels[i];
      deviceStyle.richText = deviceStyle.richText || {};
      deviceStyle.richText.habit = deviceStyle.richText.habit || [];
      deviceStyle.richText.habit[i] = label.innerHTML;
      saveDeviceStyle();
      saveHabits();
    });
    label.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        label.blur();
      }
    });

    box.appendChild(toggle);
    box.appendChild(label);
    el.appendChild(box);
  }
}

function renderHabitTracker() {
  renderHabitWeek();
  renderHabitMonth();
  renderHabitChecks();
}

// A generic pointer-drag helper: onMove(dx, dy) each frame, onEnd() at the end.
function pageDrag(startEvent, onMove, onEnd) {
  startEvent.preventDefault();
  const sx = startEvent.clientX;
  const sy = startEvent.clientY;
  // Capture the pointer to the handle so the drag keeps tracking even when the
  // cursor leaves the column or passes over the spotify iframe (which would
  // otherwise swallow the events and leave the item stuck in drag mode). The
  // capture is always released on pointerup / pointercancel.
  const handle = startEvent.currentTarget || startEvent.target;
  const pointerId = startEvent.pointerId;
  const captured =
    handle && handle.setPointerCapture && pointerId != null
      ? ((() => {
          try {
            handle.setPointerCapture(pointerId);
            return true;
          } catch (e) {
            return false;
          }
        })())
      : false;

  const move = (e) => onMove(e.clientX - sx, e.clientY - sy);
  const end = () => {
    document.removeEventListener("pointermove", move);
    document.removeEventListener("pointerup", end);
    document.removeEventListener("pointercancel", end);
    if (captured) {
      try {
        handle.releasePointerCapture(pointerId);
      } catch (e) {
        // already released
      }
    }
    if (onEnd) onEnd();
  };
  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", end);
  document.addEventListener("pointercancel", end);
}

let pageEditMode = false;

function cssColsToPx(gridEl) {
  return getComputedStyle(gridEl).gridTemplateColumns.split(" ").map(parseFloat);
}
function gridGap(gridEl) {
  return parseFloat(getComputedStyle(gridEl).columnGap) || 0;
}

// Build resize handles for a plain grid's columns (e.g. the calendar row).
// Adjacent columns cascade with a 120px minimum; total width is preserved so
// nothing overflows the row.
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
      const mins = cols.map(() => MIN_COL);
      pageDrag(
        e,
        (dx) => {
          const next = moveBoundary(cols, mins, i, dx);
          gridEl.style.gridTemplateColumns = next.map((c) => Math.round(c) + "px").join(" ");
          place();
          clampItemsToColumns(); // squeeze boxes that the new column can't hold
          alignBoxTitles();
        },
        () => {
          pageLayout()[storeKey] = gridEl.style.gridTemplateColumns;
          clampItemsToColumns();
          alignBoxTitles();
          fixItemOverlaps();
          touchUiPrefs();
        }
      );
    });
    gridEl.appendChild(handle);
  }
  place();
}

// Unified dashboard handles: the 3 column borders plus the left/right margin
// borders all operate on one [leftMargin, ...cols, rightMargin] array. Dragging
// any border cascades into its neighbours (min 120px per column, margins clamp
// at the screen edge) with the total pinned to the viewport, so nothing can be
// pushed off-screen.
let marginHandles = [];
function buildDashboardHandles() {
  const dash = document.querySelector(".dt-dashboard");
  if (!dash) return;
  const nCols = cssColsToPx(dash).length;
  const mins = dashMins(nCols);

  const save = () => {
    const sizes = currentDashSizes(dash);
    pageLayout().marginLeft = Math.round(sizes[0]);
    pageLayout().marginRight = Math.round(sizes[sizes.length - 1]);
    pageLayout().dashCols = dash.style.gridTemplateColumns;
    fixItemOverlaps();
    touchUiPrefs();
  };

  const placeCols = () => {
    const cols = cssColsToPx(dash);
    const cs = getComputedStyle(dash);
    const gap = parseFloat(cs.columnGap) || 0;
    const padL = parseFloat(cs.paddingLeft) || 0;
    const handles = dash.querySelectorAll(".dt-col-handle");
    let x = padL;
    for (let i = 0; i < cols.length - 1; i++) {
      x += cols[i] + gap;
      if (handles[i]) handles[i].style.left = x - gap / 2 + "px";
    }
  };
  const placeMargins = () => {
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
  const placeAll = () => {
    placeCols();
    placeMargins();
  };

  // boundaryIndex: 0 = left margin | col1, 1..nCols-1 = col borders,
  // nCols = colN | right margin.
  const startDrag = (e, boundaryIndex) => {
    const start = fitDashSizes(currentDashSizes(dash));
    pageDrag(
      e,
      (dx) => {
        applyDashSizes(moveBoundary(start, mins, boundaryIndex, dx));
        placeAll();
      },
      save
    );
  };

  // internal column borders (inside the dashboard)
  for (let i = 0; i < nCols - 1; i++) {
    const handle = document.createElement("div");
    handle.className = "dt-col-handle";
    handle.addEventListener("pointerdown", (e) => startDrag(e, i + 1));
    dash.appendChild(handle);
  }
  // left + right margin borders (on the body so they can sit in the margin)
  [0, nCols].forEach((boundaryIndex) => {
    const h = document.createElement("div");
    h.className = "dt-margin-handle";
    h.addEventListener("pointerdown", (e) => startDrag(e, boundaryIndex));
    document.body.appendChild(h);
    marginHandles.push(h);
  });

  placeAll();
  window.addEventListener("resize", placeAll);
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
      const maxW = itemMaxWidth(el); // stay in-column; outer columns reach the edge
      pageDrag(
        e,
        (dx, dy) => {
          const w = Math.min(maxW, Math.max(80, rect.width + dx));
          const h = Math.max(60, rect.height + dy);
          el.style.width = w + "px";
          if (MIN_HEIGHT_ITEMS.includes(item.id)) {
            // min-height so the box can still stretch for its own content
            el.style.minHeight = h + "px";
            el.style.height = "auto";
          } else {
            el.style.height = h + "px";
          }
          el.style.marginLeft = "auto";
          el.style.marginRight = "auto";
          el.style.flex = "none";
          alignBoxTitles(); // keep the title pinned to the box's top-left
        },
        () => {
          pageLayout().items = pageLayout().items || {};
          pageLayout().items[item.id] = {
            w: Math.round(el.getBoundingClientRect().width),
            h: Math.round(el.getBoundingClientRect().height),
          };
          alignBoxTitles();
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

// The page title + habit labels are only editable in page edit mode (task text
// editing is intentionally left alone). Banner controls are gated via CSS.
function applyEditability() {
  const on = Boolean(pageEditMode);
  const title = document.getElementById("dt-title");
  if (title) title.contentEditable = String(on);
  document
    .querySelectorAll(".habit-check-label")
    .forEach((l) => (l.contentEditable = String(on)));
}

function setPageEdit(on) {
  pageEditMode = on;
  editFmtRange = null;
  const root = document.getElementById("dt-root");
  if (!root) return;
  root.classList.toggle("dt-editing", on);
  const menu = document.getElementById("dt-edit-menu");
  if (menu) menu.classList.toggle("hidden", !on);
  applyEditability();
  teardownPageHandles();
  if (on) {
    buildDashboardHandles();
    const calRow = document.querySelector(".dt-cal-row");
    if (calRow) buildColHandles(calRow, "calCols");
    buildItemHandles();
    syncPageEditColorInputs();
    syncBgImageInputs();
    updateFmtSelectionUI();
  } else {
    // leaving edit mode also exits any active background crop
    const root2 = document.getElementById("dt-root");
    if (root2) root2.classList.remove("dt-bg-editing");
    updateBgParallax(); // resume the parallax offset now that cropping is off
  }
}

// Seed the color <input>s from the current custom colors (or computed defaults).
function syncPageEditColorInputs() {
  const colors = deviceStyle.colors || {};
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
  const textHex = toHex(cs.getPropertyValue("--text")) || "#1b1c1f";
  set("pe-heading", colors.heading || textHex);
}

// Seed the banner toggle + background-image controls from saved state.
function syncBgImageInputs() {
  const bannerOn = document.getElementById("pe-banner-on");
  if (bannerOn) bannerOn.checked = !uiPrefs.bannerHidden;

  const b = bgImageCfg();
  const hasImg = Boolean(b.src);
  const controls = document.getElementById("pe-bgimg-controls");
  if (controls) controls.classList.toggle("hidden", !hasImg);
  const remove = document.getElementById("pe-bgimg-remove");
  if (remove) remove.disabled = !hasImg;
  const zoom = document.getElementById("pe-bgimg-zoom");
  if (zoom) zoom.value = String(b.zoom || 100);
  const height = document.getElementById("pe-bgimg-height");
  if (height) height.value = String(b.height || 900);
  const parallax = document.getElementById("pe-bgimg-parallax");
  if (parallax) parallax.checked = Boolean(b.parallax);
  const solid = document.getElementById("pe-bgend-solid");
  const mirage = document.getElementById("pe-bgend-mirage");
  if (solid) solid.checked = b.end !== "mirage";
  if (mirage) mirage.checked = b.end === "mirage";
  const swatch = document.getElementById("pe-bgend-color");
  if (swatch) {
    const toHex = (c) => {
      const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c || "");
      return m ? "#" + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, "0")).join("") : null;
    };
    swatch.value =
      b.endColor ||
      (deviceStyle.colors && deviceStyle.colors.bg) ||
      toHex(getComputedStyle(document.body).backgroundColor) ||
      "#1b1c1f";
  }
}

// Wire the banner show/hide toggle + all background-image controls (set / clear,
// zoom, height, end-of-scroll fill, and the on-page crop drag). Called once.
function initBannerAndBgControls() {
  const root = document.getElementById("dt-root");

  // --- banner add / remove ---
  const bannerOn = document.getElementById("pe-banner-on");
  if (bannerOn) {
    bannerOn.addEventListener("change", () => {
      uiPrefs.bannerHidden = !bannerOn.checked;
      applyUiPrefs();
      touchUiPrefs();
    });
  }

  // --- background image: set from an upload or a link ---
  const setBgSrc = async (src) => {
    const mirage = await sampleImageColors(src); // null if remote/tainted -> default palette
    saveBgImageCfg({ src, posX: 50, posY: 50, zoom: 100, mirage });
    applyBackgroundImage();
    syncBgImageInputs();
  };
  const fileInput = document.getElementById("pe-bgimg-input");
  const upload = document.getElementById("pe-bgimg-upload");
  if (upload && fileInput) {
    upload.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => downscaleImage(reader.result, 1920, 0.82).then(setBgSrc);
      reader.readAsDataURL(file);
    });
  }
  const link = document.getElementById("pe-bgimg-link");
  if (link) {
    link.addEventListener("click", () => {
      const v = window.prompt("paste an image link (url):", "");
      if (v === null) return;
      const url = v.trim();
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) {
        window.alert("please paste a valid image link starting with http:// or https://");
        return;
      }
      setBgSrc(url);
    });
  }
  const remove = document.getElementById("pe-bgimg-remove");
  if (remove) {
    remove.addEventListener("click", () => {
      if (root) root.classList.remove("dt-bg-editing");
      deviceStyle.bgImage = null;
      saveDeviceStyle();
      applyBackgroundImage();
      syncBgImageInputs();
    });
  }

  // --- zoom / height sliders ---
  const zoom = document.getElementById("pe-bgimg-zoom");
  if (zoom) {
    zoom.addEventListener("input", () => {
      saveBgImageCfg({ zoom: parseInt(zoom.value, 10) || 100 });
      applyBackgroundImage();
    });
  }
  const height = document.getElementById("pe-bgimg-height");
  if (height) {
    height.addEventListener("input", () => {
      saveBgImageCfg({ height: parseInt(height.value, 10) || 900 });
      applyBackgroundImage();
    });
  }

  // --- scroll with background depth (parallax) ---
  const parallax = document.getElementById("pe-bgimg-parallax");
  if (parallax) {
    parallax.addEventListener("change", () => {
      saveBgImageCfg({ parallax: parallax.checked });
      applyBackgroundImage();
    });
  }
  window.addEventListener("scroll", onBgParallaxScroll, { passive: true });

  // --- end-of-scroll fill: solid color vs. mirage blur ---
  const solid = document.getElementById("pe-bgend-solid");
  const mirage = document.getElementById("pe-bgend-mirage");
  if (solid) solid.addEventListener("change", () => { if (solid.checked) { saveBgImageCfg({ end: "solid" }); applyBackgroundImage(); } });
  if (mirage) mirage.addEventListener("change", () => { if (mirage.checked) { saveBgImageCfg({ end: "mirage" }); applyBackgroundImage(); } });
  const swatch = document.getElementById("pe-bgend-color");
  if (swatch) {
    swatch.addEventListener("input", () => {
      saveBgImageCfg({ end: "solid", endColor: swatch.value });
      if (solid) solid.checked = true;
      applyBackgroundImage();
    });
  }

  // --- on-page crop: raise the layer above content, drag to pan, wheel to zoom ---
  const repositionBtn = document.getElementById("pe-bgimg-reposition");
  const layer = document.getElementById("dt-bg-layer");
  if (repositionBtn && layer && root) {
    repositionBtn.addEventListener("click", () => {
      const on = !root.classList.contains("dt-bg-editing");
      root.classList.toggle("dt-bg-editing", on && Boolean(bgImageCfg().src));
      repositionBtn.textContent = root.classList.contains("dt-bg-editing") ? "done cropping" : "reposition / crop";
      updateBgParallax(); // no parallax offset while cropping; restore on exit
    });
    layer.addEventListener("pointerdown", (e) => {
      if (!root.classList.contains("dt-bg-editing") || !bgImageCfg().src) return;
      const start = bgImageCfg();
      const rect = layer.getBoundingClientRect();
      pageDrag(
        e,
        (dx, dy) => {
          const px = Math.max(0, Math.min(100, start.posX - (dx / rect.width) * 100));
          const py = Math.max(0, Math.min(100, start.posY - (dy / Math.max(1, start.height)) * 100));
          deviceStyle.bgImage = { ...bgImageCfg(), posX: px, posY: py };
          document.documentElement.style.setProperty("--dt-bg-pos", `${px}% ${py}%`);
        },
        () => saveDeviceStyle()
      );
    });
    layer.addEventListener(
      "wheel",
      (e) => {
        if (!root.classList.contains("dt-bg-editing") || !bgImageCfg().src) return;
        e.preventDefault();
        const next = Math.max(100, Math.min(300, (bgImageCfg().zoom || 100) + (e.deltaY < 0 ? 6 : -6)));
        saveBgImageCfg({ zoom: next });
        applyBackgroundImage();
        if (zoom) zoom.value = String(next);
      },
      { passive: false }
    );
  }
}

// ==========================================================================
// The draggable page-edit menu: per-device color swatches + rich-text
// formatting (bold / italic / color) for whatever text is highlighted in the
// editable title or habit labels. All of it saves to deviceStyle (local).
// ==========================================================================
let editFmtRange = null; // last non-empty selection inside an editable element

function fmtEditableOf(node) {
  if (!node) return null;
  const el = node.nodeType === 1 ? node : node.parentElement;
  return el ? el.closest(".dt-title, .habit-check-label") : null;
}

// Remember which editable text is currently selected so the format buttons can
// act on it even after focus moves to the menu.
function captureEditSelection() {
  const sel = document.getSelection();
  if (!sel || !sel.rangeCount || sel.isCollapsed) return null;
  const editable = fmtEditableOf(sel.anchorNode);
  if (!editable || !editable.isContentEditable) return null;
  return { range: sel.getRangeAt(0).cloneRange(), editable };
}

function updateFmtSelectionUI() {
  const menu = document.getElementById("dt-edit-menu");
  if (!menu) return;
  menu.classList.toggle("no-selection", !editFmtRange);
  const b = document.getElementById("fmt-bold");
  const it = document.getElementById("fmt-italic");
  try {
    if (b) b.classList.toggle("active", document.queryCommandState("bold"));
    if (it) it.classList.toggle("active", document.queryCommandState("italic"));
  } catch (e) {
    // queryCommandState can throw with no selection; ignore
  }
}

// Persist the editable's formatted HTML per-device (keeping the synced plain
// text in step, so cross-device the base text still matches).
function saveRichText(editable) {
  deviceStyle.richText = deviceStyle.richText || {};
  if (editable.classList.contains("dt-title")) {
    deviceStyle.richText.title = editable.innerHTML;
    uiPrefs.title = (editable.textContent || "").trim() || "pokeplanner";
    touchUiPrefs();
  } else if (editable.classList.contains("habit-check-label")) {
    const labels = [...document.querySelectorAll(".habit-check-label")];
    const i = labels.indexOf(editable);
    if (i >= 0) {
      deviceStyle.richText.habit = deviceStyle.richText.habit || [];
      deviceStyle.richText.habit[i] = editable.innerHTML;
      habitData.labels[i] = (editable.textContent || "").trim() || habitData.labels[i];
      saveHabits();
    }
  }
  saveDeviceStyle();
}

// Run a formatting command on the remembered selection, then save.
function applyFmt(fn) {
  if (!editFmtRange) return;
  const { range, editable } = editFmtRange;
  editable.focus();
  const sel = document.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  fn();
  saveRichText(editable);
  const s = document.getSelection();
  if (s.rangeCount && !s.isCollapsed) {
    editFmtRange = { range: s.getRangeAt(0).cloneRange(), editable };
  }
}

function initEditMenu() {
  const menu = document.getElementById("dt-edit-menu");
  if (!menu) return;

  // per-device color swatches
  // "task info" / "crossed out tasks" live in the "pokemon & tasks" dropdown now.
  const colorInputs = { "pe-bg": "bg", "pe-clock": "clock", "pe-primary": "primary", "pe-secondary": "secondary", "pe-heading": "heading" };
  for (const [id, key] of Object.entries(colorInputs)) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.addEventListener("input", (e) => {
      deviceStyle.colors = deviceStyle.colors || {};
      deviceStyle.colors[key] = e.target.value;
      saveDeviceStyle();
      applyPageLayout();
    });
  }
  const resetBtn = document.getElementById("pe-reset-colors");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      deviceStyle.colors = {};
      saveDeviceStyle();
      applyPageLayout();
      syncPageEditColorInputs();
    });
  }
  const textReset = document.getElementById("pe-textcolors-reset");
  if (textReset) {
    textReset.addEventListener("click", () => {
      if (deviceStyle.colors) delete deviceStyle.colors.heading;
      saveDeviceStyle();
      applyPageLayout();
      syncPageEditColorInputs();
    });
  }
  const doneBtn = document.getElementById("dt-edit-done");
  if (doneBtn) doneBtn.addEventListener("click", () => setPageEdit(false));

  initBannerAndBgControls();

  // restore the last dragged position (per-device)
  if (deviceStyle.menuPos) {
    menu.style.left = deviceStyle.menuPos.left + "px";
    menu.style.top = deviceStyle.menuPos.top + "px";
    menu.style.right = "auto";
    menu.style.bottom = "auto";
  }
  // drag by the header
  const header = document.getElementById("dt-edit-drag");
  if (header) {
    header.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".dt-edit-done")) return;
      const rect = menu.getBoundingClientRect();
      const startLeft = rect.left;
      const startTop = rect.top;
      const w = rect.width;
      const h = rect.height;
      menu.style.right = "auto";
      menu.style.bottom = "auto";
      menu.style.left = startLeft + "px";
      menu.style.top = startTop + "px";
      pageDrag(
        e,
        (dx, dy) => {
          menu.style.left = Math.min(Math.max(0, startLeft + dx), window.innerWidth - w) + "px";
          menu.style.top = Math.min(Math.max(0, startTop + dy), window.innerHeight - h) + "px";
        },
        () => {
          deviceStyle.menuPos = {
            left: Math.round(menu.getBoundingClientRect().left),
            top: Math.round(menu.getBoundingClientRect().top),
          };
          saveDeviceStyle();
        }
      );
    });
  }

  // text formatting acts on the highlighted editable text
  const bold = document.getElementById("fmt-bold");
  const italic = document.getElementById("fmt-italic");
  const color = document.getElementById("fmt-color");
  // keep the selection when pressing the buttons (don't let them steal focus)
  [bold, italic].forEach((b) => {
    if (!b) return;
    b.addEventListener("mousedown", (e) => e.preventDefault());
  });
  if (bold) bold.addEventListener("click", () => applyFmt(() => document.execCommand("bold")));
  if (italic) italic.addEventListener("click", () => applyFmt(() => document.execCommand("italic")));
  if (color) {
    color.addEventListener("input", () =>
      applyFmt(() => document.execCommand("foreColor", false, color.value))
    );
  }

  // track the current text selection while editing
  document.addEventListener("selectionchange", () => {
    if (!pageEditMode) return;
    const cap = captureEditSelection();
    if (cap) editFmtRange = cap;
    updateFmtSelectionUI();
  });

  // style / widgets tabs
  document.querySelectorAll(".dt-edit-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const name = tab.dataset.etab;
      document.querySelectorAll(".dt-edit-tab").forEach((t) => t.classList.toggle("active", t === tab));
      document
        .querySelectorAll(".dt-edit-body[data-epane]")
        .forEach((p) => p.classList.toggle("hidden", p.dataset.epane !== name));
      if (name === "widgets") renderWidgetList();
    });
  });
  renderWidgetList();
  initWidgetDrag();

  // restore the menu's saved size
  if (deviceStyle.menuSize) {
    if (deviceStyle.menuSize.w) menu.style.width = deviceStyle.menuSize.w + "px";
    if (deviceStyle.menuSize.h) menu.style.height = deviceStyle.menuSize.h + "px";
  }

  // Custom corner resize grip. The native CSS `resize` grip does not respond to
  // dragging on this fixed, corner-anchored panel, so we drive width/height
  // ourselves via the same pointer-capturing pageDrag() used elsewhere.
  let resizeGrip = menu.querySelector(":scope > .dt-edit-resize");
  if (!resizeGrip) {
    resizeGrip = document.createElement("div");
    resizeGrip.className = "dt-edit-resize";
    resizeGrip.title = "drag to resize";
    menu.appendChild(resizeGrip);
  }
  resizeGrip.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    const rect = menu.getBoundingClientRect();
    const maxW = window.innerWidth * 0.92;
    const maxH = window.innerHeight * 0.88;
    // Anchor by left/top so the bottom-right corner tracks the cursor instead
    // of staying pinned to the viewport's right/bottom edge.
    menu.style.left = rect.left + "px";
    menu.style.top = rect.top + "px";
    menu.style.right = "auto";
    menu.style.bottom = "auto";
    pageDrag(
      e,
      (dx, dy) => {
        menu.style.width = Math.min(maxW, Math.max(210, rect.width + dx)) + "px";
        menu.style.height = Math.min(maxH, Math.max(190, rect.height + dy)) + "px";
      },
      () => {
        const r = menu.getBoundingClientRect();
        deviceStyle.menuSize = { w: Math.round(r.width), h: Math.round(r.height) };
        deviceStyle.menuPos = { left: Math.round(r.left), top: Math.round(r.top) };
        saveDeviceStyle();
      }
    );
  });

  // spacing-between-widgets slider (widgets tab)
  const gapSlider = document.getElementById("dt-widget-gap");
  if (gapSlider) {
    gapSlider.max = String(WIDGET_GAP_MAX);
    gapSlider.value = String(widgetGap());
    gapSlider.addEventListener("input", () => {
      deviceStyle.widgetGap = parseInt(gapSlider.value, 10) || 0;
      saveDeviceStyle();
      applyWidgetGap();
      fixItemOverlaps();
    });
  }
}

// ==========================================================================
// Widgets: the clock / habit tracker / spotify player / pokepark are wrapped in
// draggable cards that can be toggled on/off from the edit menu and dragged
// between the middle and right columns (per-device placement).
// ==========================================================================
const WIDGET_IDS = ["clock", "habit", "spotify", "spotify2", "pokepark"];
const WIDGET_NAMES = {
  clock: "clock",
  habit: "habit tracker",
  spotify: "spotify embed",
  spotify2: "spotify player",
  pokepark: "pokepark",
  pt: "pokemon & tasks",
  cal: "calendar",
};
// "pokemon & tasks" / "calendar" are settings-only entries (no toggle / drag):
// their parts are always-present structural pieces of the page.
const CUSTOM_ENTRY_IDS = ["pt", "cal"];
// Extra per-part surface controls beyond the generic fill/text. Each surface is
// a background color swatch + a glass checkbox, stored under widgetStyles[id].
const WIDGET_SURFACES = {
  habit: [
    { label: "background box", bgKey: "boxBg", glassKey: "boxGlass", opacityKey: "boxGlassOpacity", opacityVar: "--habit-box-glass-op" },
    { label: "day boxes", bgKey: "dayBg", glassKey: "dayGlass", opacityKey: "dayGlassOpacity", opacityVar: "--habit-day-glass-op" },
    { label: "habit boxes", bgKey: "checkBg", glassKey: "checkGlass", opacityKey: "checkGlassOpacity", opacityVar: "--habit-check-glass-op" },
  ],
  pt: [
    { label: "team bar background", bgKey: "teambarBg", glassKey: "teambarGlass", opacityKey: "teambarGlassOpacity", opacityVar: "--pt-teambar-glass-op" },
    { label: "task list items", bgKey: "taskitemBg", glassKey: "taskitemGlass", opacityKey: "taskitemGlassOpacity", opacityVar: "--pt-taskitem-glass-op" },
    { label: "task bar", bgKey: "taskbarBg", glassKey: "taskbarGlass", opacityKey: "taskbarGlassOpacity", opacityVar: "--pt-taskbar-glass-op" },
  ],
  cal: [
    { label: "calendar box", bgKey: "calBg", glassKey: "calGlass", opacityKey: "calGlassOpacity", opacityVar: "--cal-box-glass-op" },
    { label: "task box", bgKey: "taskBg", glassKey: "taskGlass", opacityKey: "taskGlassOpacity", opacityVar: "--cal-tasks-glass-op" },
    { label: "day cells", bgKey: "dayBg", glassKey: "dayGlass", opacityKey: "dayGlassOpacity", opacityVar: "--cal-day-glass-op" },
  ],
};
const DEFAULT_WIDGET_ORDER = { mid: ["clock", "habit"], right: ["spotify", "pokepark"] };

function widgetOrder() {
  const w = deviceStyle.widgets;
  if (w && w.order && Array.isArray(w.order.mid) && Array.isArray(w.order.right)) {
    return { mid: w.order.mid.slice(), right: w.order.right.slice() };
  }
  return { mid: DEFAULT_WIDGET_ORDER.mid.slice(), right: DEFAULT_WIDGET_ORDER.right.slice() };
}
function saveWidgetOrder(order) {
  deviceStyle.widgets = { order };
  saveDeviceStyle();
}
function widgetPresent(id) {
  const o = widgetOrder();
  return o.mid.includes(id) || o.right.includes(id);
}
function widgetEl(id) {
  return document.querySelector('.dt-widget[data-widget="' + id + '"]');
}

// Arrange the widget cards into the two columns per the saved order; hide any
// that aren't placed.
function applyWidgets() {
  const midCol = document.getElementById("dt-mid-col");
  const rightCol = document.getElementById("dt-right-col");
  if (!midCol || !rightCol) return;
  const o = widgetOrder();
  for (const id of WIDGET_IDS) {
    const el = widgetEl(id);
    if (el) el.classList.toggle("widget-off", !(o.mid.includes(id) || o.right.includes(id)));
  }
  for (const id of o.mid) {
    const el = widgetEl(id);
    if (el) midCol.appendChild(el);
  }
  for (const id of o.right) {
    const el = widgetEl(id);
    if (el) rightCol.appendChild(el);
  }
  applyPageLayout(); // re-clamp resized items to their (possibly new) column
  applyWidgetGap();
  applyWidgetStyles();
  // the custom player needs (re)rendering when it appears
  if (typeof renderSpotifyPlayer === "function" && document.getElementById("dt-splayer")) {
    renderSpotifyPlayer();
    if (spotifyAuth && splayerVisible()) refreshSpotifyPlayer();
  }
}

// ---- per-widget colors + glassmorphism (from the "colors" tab, per-device) ----
function widgetStyleOf(id) {
  const ws = (deviceStyle.widgetStyles && deviceStyle.widgetStyles[id]) || {};
  return { bg: ws.bg || null, text: ws.text || null, glass: !!ws.glass };
}

function applyWidgetStyles() {
  for (const id of WIDGET_IDS) {
    const el = widgetEl(id);
    if (!el) continue;
    const s = widgetStyleOf(id);
    const ws = (deviceStyle.widgetStyles && deviceStyle.widgetStyles[id]) || {};
    if (s.bg) el.style.setProperty("--wbg", s.bg);
    else el.style.removeProperty("--wbg");
    if (s.text) el.style.setProperty("--wtext", s.text);
    else el.style.removeProperty("--wtext");
    el.style.setProperty("--wglass-op", glassOpacityOf(ws, "glassOpacity") + "%");
    el.classList.toggle("w-tint", !!s.bg && !s.glass);
    el.classList.toggle("w-text", !!s.text);
    el.classList.toggle("widget-glass", s.glass);
  }
  applyHabitPartStyles();
  applyPokemonTasksStyles();
  applyCalendarStyles();
}

const rootStyle = () => document.documentElement.style;
function setRootVar(name, val) {
  if (val) rootStyle().setProperty(name, val);
  else rootStyle().removeProperty(name);
}

// Habit "background box / day boxes / habit boxes" overrides (per-part swatches).
function applyHabitPartStyles() {
  const s = (deviceStyle.widgetStyles && deviceStyle.widgetStyles.habit) || {};
  setRootVar("--habit-box-bg", s.boxBg);
  setRootVar("--habit-day-bg", s.dayBg);
  setRootVar("--habit-check-bg", s.checkBg);
  rootStyle().setProperty("--habit-box-glass-op", glassOpacityOf(s, "boxGlassOpacity") + "%");
  rootStyle().setProperty("--habit-day-glass-op", glassOpacityOf(s, "dayGlassOpacity") + "%");
  rootStyle().setProperty("--habit-check-glass-op", glassOpacityOf(s, "checkGlassOpacity") + "%");
  const el = widgetEl("habit");
  if (el) {
    el.classList.toggle("hb-box-glass", !!s.boxGlass);
    el.classList.toggle("hb-day-glass", !!s.dayGlass);
    el.classList.toggle("hb-check-glass", !!s.checkGlass);
  }
}

// "pokemon & tasks" widget: team bar bg, task list items, task bar (add input).
function applyPokemonTasksStyles() {
  const s = (deviceStyle.widgetStyles && deviceStyle.widgetStyles.pt) || {};
  setRootVar("--pt-teambar", s.teambarBg);
  setRootVar("--pt-taskitem", s.taskitemBg);
  setRootVar("--pt-taskbar", s.taskbarBg);
  rootStyle().setProperty("--pt-teambar-glass-op", glassOpacityOf(s, "teambarGlassOpacity") + "%");
  rootStyle().setProperty("--pt-taskitem-glass-op", glassOpacityOf(s, "taskitemGlassOpacity") + "%");
  rootStyle().setProperty("--pt-taskbar-glass-op", glassOpacityOf(s, "taskbarGlassOpacity") + "%");
  const team = document.querySelector(".dt-team-col");
  if (team) team.classList.toggle("pt-teambar-glass", !!s.teambarGlass);
  const tasks = document.querySelector(".dt-tasks");
  if (tasks) {
    tasks.classList.toggle("pt-taskitem-glass", !!s.taskitemGlass);
    tasks.classList.toggle("pt-taskbar-glass", !!s.taskbarGlass);
  }
}

// "calendar" entry: the calendar box + task box surfaces, the day cells, and the
// month / label text colors. Glass toggles live on the (persistent) container
// elements so they survive the calendar's innerHTML re-renders; the day-cell
// glass rides on the calendar container so rebuilt cells still pick it up.
function applyCalendarStyles() {
  const s = (deviceStyle.widgetStyles && deviceStyle.widgetStyles.cal) || {};
  setRootVar("--cal-box-bg", s.calBg);
  setRootVar("--cal-tasks-bg", s.taskBg);
  setRootVar("--cal-day-bg", s.dayBg);
  setRootVar("--cal-month-color", s.monthColor);
  setRootVar("--cal-label-color", s.labelColor);
  rootStyle().setProperty("--cal-box-glass-op", glassOpacityOf(s, "calGlassOpacity") + "%");
  rootStyle().setProperty("--cal-tasks-glass-op", glassOpacityOf(s, "taskGlassOpacity") + "%");
  rootStyle().setProperty("--cal-day-glass-op", glassOpacityOf(s, "dayGlassOpacity") + "%");
  const cal = document.getElementById("dt-calendar");
  if (cal) {
    cal.classList.toggle("cal-box-glass", !!s.calGlass);
    cal.classList.toggle("cal-day-glass", !!s.dayGlass);
  }
  const taskBox = document.getElementById("dt-cal-tasks");
  if (taskBox) taskBox.classList.toggle("cal-tasks-glass", !!s.taskGlass);
}

// Extra vertical space added between stacked widgets, on top of each widget's
// own built-in bottom spacing. 0 (the default) leaves the original look.
const WIDGET_GAP_MAX = 60;
function widgetGap() {
  const g = deviceStyle.widgetGap;
  return typeof g === "number" ? Math.max(0, Math.min(WIDGET_GAP_MAX, g)) : 0;
}
function applyWidgetGap() {
  document.documentElement.style.setProperty("--dt-widget-gap", widgetGap() + "px");
}

function renderWidgetColors() {
  const el = document.getElementById("dt-widget-colors");
  if (!el) return;
  el.innerHTML = "";
  const present = WIDGET_IDS.filter((id) => widgetPresent(id));
  if (!present.length) {
    el.innerHTML = '<div class="dt-edit-hint">add a widget first to color it</div>';
    return;
  }
  for (const id of present) {
    const s = widgetStyleOf(id);
    const section = document.createElement("div");
    section.className = "dt-widget-color";
    section.innerHTML =
      `<div class="dt-wc-name">${WIDGET_NAMES[id]}</div>` +
      '<div class="dt-wc-row">' +
      `<label class="dt-wc-swatch"><input type="color" data-wcprop="bg" value="${s.bg || "#ffffff"}" /><span>fill</span></label>` +
      `<label class="dt-wc-swatch"><input type="color" data-wcprop="text" value="${s.text || "#ffffff"}" /><span>text</span></label>` +
      `<label class="dt-wc-glass"><input type="checkbox" data-wcprop="glass"${s.glass ? " checked" : ""} /><span>glass</span></label>` +
      "</div>";
    section.querySelectorAll("[data-wcprop]").forEach((input) => {
      const prop = input.dataset.wcprop;
      input.addEventListener("input", () => {
        deviceStyle.widgetStyles = deviceStyle.widgetStyles || {};
        const cur = deviceStyle.widgetStyles[id] || {};
        cur[prop] = prop === "glass" ? input.checked : input.value;
        deviceStyle.widgetStyles[id] = cur;
        saveDeviceStyle();
        applyWidgetStyles();
      });
    });
    el.appendChild(section);
  }
}

// Which accordion dropdowns are open (kept across re-renders, per session).
const widgetAccOpen = new Set();

// Write one per-widget style prop, persist, and re-apply live.
function setWidgetStyleProp(id, key, value) {
  deviceStyle.widgetStyles = deviceStyle.widgetStyles || {};
  const cur = deviceStyle.widgetStyles[id] || {};
  cur[key] = value;
  deviceStyle.widgetStyles[id] = cur;
  saveDeviceStyle();
  applyWidgetStyles();
}

// Default glass fill opacity (matches the CSS color-mix fallback).
const GLASS_OPACITY_DEFAULT = 22;
function glassOpacityOf(ws, key) {
  const v = ws && ws[key];
  return typeof v === "number" ? Math.max(0, Math.min(100, v)) : GLASS_OPACITY_DEFAULT;
}

// A background color swatch + glass checkbox (a "surface" control). When glass is
// on, a fill-opacity slider (0% colorless → 100% opaque, reflection kept) shows.
function makeSurfaceCtrl(id, surf) {
  const ws = (deviceStyle.widgetStyles && deviceStyle.widgetStyles[id]) || {};
  const wrap = document.createElement("div");
  wrap.className = "dt-wc-ctrl";

  const row = document.createElement("div");
  row.className = "dt-wc-row";
  row.innerHTML =
    `<span class="dt-wc-rowlabel">${surf.label}</span>` +
    `<label class="dt-wc-swatch"><input type="color" value="${ws[surf.bgKey] || "#ffffff"}" /><span>color</span></label>` +
    `<label class="dt-wc-glass"><input type="checkbox"${ws[surf.glassKey] ? " checked" : ""} /><span>glass</span></label>`;
  const color = row.querySelector('input[type="color"]');
  const glass = row.querySelector('input[type="checkbox"]');

  const op = glassOpacityOf(ws, surf.opacityKey);
  const opRow = document.createElement("label");
  opRow.className = "dt-wc-opacity" + (ws[surf.glassKey] ? "" : " hidden");
  opRow.innerHTML =
    `<span>fill opacity</span>` +
    `<input type="range" min="0" max="100" step="1" value="${op}" />` +
    `<span class="dt-wc-opval">${op}%</span>`;
  const slider = opRow.querySelector('input[type="range"]');
  const opVal = opRow.querySelector(".dt-wc-opval");

  color.addEventListener("input", () => setWidgetStyleProp(id, surf.bgKey, color.value));
  glass.addEventListener("change", () => {
    setWidgetStyleProp(id, surf.glassKey, glass.checked);
    opRow.classList.toggle("hidden", !glass.checked);
  });
  slider.addEventListener("input", () => {
    opVal.textContent = slider.value + "%";
    setWidgetStyleProp(id, surf.opacityKey, parseInt(slider.value, 10));
  });

  wrap.appendChild(row);
  wrap.appendChild(opRow);
  return wrap;
}

// A plain text color swatch (no glass — glass isn't meaningful for text).
function makeTextCtrl(id) {
  const ws = (deviceStyle.widgetStyles && deviceStyle.widgetStyles[id]) || {};
  const row = document.createElement("div");
  row.className = "dt-wc-row";
  row.innerHTML =
    `<span class="dt-wc-rowlabel">text</span>` +
    `<label class="dt-wc-swatch"><input type="color" value="${ws.text || "#ffffff"}" /><span>color</span></label>`;
  const color = row.querySelector('input[type="color"]');
  color.addEventListener("input", () => setWidgetStyleProp(id, "text", color.value));
  return row;
}

// A named text-color swatch stored under widgetStyles[id][key]. Seeds from the
// saved color or a computed default CSS var (e.g. --text / --muted).
function makeWidgetTextCtrl(id, label, key, defaultVar) {
  const ws = (deviceStyle.widgetStyles && deviceStyle.widgetStyles[id]) || {};
  const cs = getComputedStyle(document.documentElement);
  const toHex = (c) => {
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c);
    return m ? "#" + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, "0")).join("") : null;
  };
  const fallback = toHex(cs.getPropertyValue(defaultVar)) || "#888888";
  const row = document.createElement("div");
  row.className = "dt-wc-row";
  row.innerHTML =
    `<span class="dt-wc-rowlabel">${label}</span>` +
    `<label class="dt-wc-swatch"><input type="color" value="${ws[key] || fallback}" /><span>color</span></label>`;
  const color = row.querySelector('input[type="color"]');
  color.addEventListener("input", () => setWidgetStyleProp(id, key, color.value));
  return row;
}

// Task-name text colors live on the dashboard (deviceStyle.colors), but their
// controls sit in the "pokemon & tasks" dropdown. `colorKey` is "task" (the task
// name text) or "taskDone" (done / crossed-out tasks); the swatch seeds from the
// saved color or the current computed default.
function makeTaskTextCtrl(label, colorKey) {
  const colors = deviceStyle.colors || {};
  const cs = getComputedStyle(document.documentElement);
  const toHex = (c) => {
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c);
    return m ? "#" + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, "0")).join("") : null;
  };
  const fallback =
    colorKey === "taskDone"
      ? toHex(cs.getPropertyValue("--muted")) || "#8a8d93"
      : toHex(cs.getPropertyValue("--text")) || "#1b1c1f";
  const row = document.createElement("div");
  row.className = "dt-wc-row";
  row.innerHTML =
    `<span class="dt-wc-rowlabel">${label}</span>` +
    `<label class="dt-wc-swatch"><input type="color" value="${colors[colorKey] || fallback}" /><span>color</span></label>`;
  const color = row.querySelector('input[type="color"]');
  color.addEventListener("input", () => {
    deviceStyle.colors = deviceStyle.colors || {};
    deviceStyle.colors[colorKey] = color.value;
    saveDeviceStyle();
    applyPageLayout();
  });
  return row;
}

// The widgets tab: each widget (+ the settings-only "pokemon & tasks" entry) is
// a collapsible dropdown that reveals its customization controls.
function renderWidgetList() {
  const el = document.getElementById("dt-widget-list");
  if (!el) return;
  el.innerHTML = "";
  for (const id of [...WIDGET_IDS, ...CUSTOM_ENTRY_IDS]) {
    const isReal = !CUSTOM_ENTRY_IDS.includes(id);
    const on = isReal ? widgetPresent(id) : true;
    const acc = document.createElement("div");
    acc.className = "dt-wacc" + (widgetAccOpen.has(id) ? " open" : "") + (isReal && !on ? " dt-wacc-off" : "");
    acc.dataset.widget = id;

    const head = document.createElement("button");
    head.type = "button";
    head.className = "dt-wacc-head";
    head.innerHTML =
      `<span class="dt-wacc-name">${WIDGET_NAMES[id]}</span>` +
      (isReal ? `<span class="dt-wacc-onoff${on ? " on" : ""}" title="add / remove">${on ? "✓" : "+"}</span>` : "") +
      `<span class="dt-wacc-caret">▾</span>`;
    head.addEventListener("click", () => {
      acc.classList.toggle("open");
      if (acc.classList.contains("open")) widgetAccOpen.add(id);
      else widgetAccOpen.delete(id);
    });
    const onoff = head.querySelector(".dt-wacc-onoff");
    if (onoff) onoff.addEventListener("click", (e) => { e.stopPropagation(); toggleWidget(id); });

    const body = document.createElement("div");
    body.className = "dt-wacc-body";
    if (isReal) {
      body.appendChild(makeSurfaceCtrl(id, { label: "fill", bgKey: "bg", glassKey: "glass", opacityKey: "glassOpacity", opacityVar: "--wglass-op" }));
      body.appendChild(makeTextCtrl(id));
    }
    for (const surf of WIDGET_SURFACES[id] || []) body.appendChild(makeSurfaceCtrl(id, surf));
    if (id === "pt") {
      body.appendChild(makeTaskTextCtrl("task info", "task"));
      body.appendChild(makeTaskTextCtrl("crossed out tasks", "taskDone"));
    }
    if (id === "cal") {
      body.appendChild(makeWidgetTextCtrl("cal", "month text", "monthColor", "--text"));
      body.appendChild(makeWidgetTextCtrl("cal", "numbers & day labels", "labelColor", "--muted"));
    }

    acc.appendChild(head);
    acc.appendChild(body);
    el.appendChild(acc);
  }
}

function toggleWidget(id) {
  const o = widgetOrder();
  if (o.mid.includes(id) || o.right.includes(id)) {
    o.mid = o.mid.filter((x) => x !== id);
    o.right = o.right.filter((x) => x !== id);
  } else {
    o.mid.unshift(id); // added widgets land in the top-leftmost spot
  }
  saveWidgetOrder(o);
  applyWidgets();
  renderWidgetList();
}

function initWidgetDrag() {
  document.querySelectorAll(".dt-widget-grip").forEach((grip) => {
    grip.addEventListener("pointerdown", (e) => startWidgetDrag(e, grip.closest(".dt-widget")));
  });
}

// Which column + index the widget would drop into for a given cursor point.
function computeWidgetDrop(x, y, dragEl) {
  const midCol = document.getElementById("dt-mid-col");
  const rightCol = document.getElementById("dt-right-col");
  const rightR = rightCol.getBoundingClientRect();
  const colEl = x >= rightR.left ? rightCol : midCol; // only mid / right are drop zones
  const col = colEl === rightCol ? "right" : "mid";
  const kids = [...colEl.querySelectorAll(":scope > .dt-widget")].filter(
    (w) => w !== dragEl && !w.classList.contains("widget-off")
  );
  let index = kids.length;
  for (let i = 0; i < kids.length; i++) {
    const r = kids[i].getBoundingClientRect();
    if (y < r.top + r.height / 2) {
      index = i;
      break;
    }
  }
  return { col, colEl, index, kids };
}

function startWidgetDrag(startEvent, widget) {
  if (!pageEditMode || !widget) return;
  startEvent.preventDefault();
  const ghost = document.createElement("div");
  ghost.className = "dt-widget-ghost";
  ghost.textContent = WIDGET_NAMES[widget.dataset.widget] || "widget";
  document.body.appendChild(ghost);
  const drop = document.createElement("div");
  drop.className = "dt-widget-drop";
  widget.classList.add("dragging");

  const place = (x, y) => {
    ghost.style.left = x + "px";
    ghost.style.top = y + "px";
    const t = computeWidgetDrop(x, y, widget);
    if (t.index >= t.kids.length) t.colEl.appendChild(drop);
    else t.colEl.insertBefore(drop, t.kids[t.index]);
  };
  place(startEvent.clientX, startEvent.clientY);

  pageDrag(
    startEvent,
    (dx, dy) => place(startEvent.clientX + dx, startEvent.clientY + dy),
    () => {
      if (drop.parentElement) drop.parentElement.insertBefore(widget, drop);
      drop.remove();
      ghost.remove();
      widget.classList.remove("dragging");
      const midCol = document.getElementById("dt-mid-col");
      const rightCol = document.getElementById("dt-right-col");
      saveWidgetOrder({
        mid: [...midCol.querySelectorAll(":scope > .dt-widget:not(.widget-off)")].map((w) => w.dataset.widget),
        right: [...rightCol.querySelectorAll(":scope > .dt-widget:not(.widget-off)")].map((w) => w.dataset.widget),
      });
      // a widget dropped into a narrower column must shrink to fit it (and grow
      // back up to its saved width if moved into a wider one)
      clampItemsToColumns();
      alignBoxTitles();
      fixItemOverlaps();
    }
  );
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
    hEl.textContent = String(hr).padStart(2, "0");
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
let calFilter = "all"; // "all" | "todo" (todo hides completed assignments)

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
      .filter((it) => calFilter === "all" || it.completion !== "done!")
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
    `<div class="dt-cal-month">` +
    `<span class="dt-cal-month-name">${monthName} ${year}</span>` +
    `<span class="dt-cal-tabs">` +
    `<button class="dt-cal-tab${calFilter === "todo" ? " active" : ""}" data-cf="todo" type="button">to-do</button>` +
    `<button class="dt-cal-tab${calFilter === "all" ? " active" : ""}" data-cf="all" type="button">all</button>` +
    `</span>` +
    `</div>` +
    `<div class="dt-cal-grid">${cells}</div>`;

  el.querySelectorAll(".dt-cal-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      calFilter = tab.dataset.cf;
      renderDesktopCalendar();
    });
  });

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
  const bannerMenu = document.getElementById("dt-banner-menu");
  const closeBannerMenu = () => bannerMenu.classList.add("hidden");
  // "change banner" opens a little menu: upload a file or paste an image link
  document.getElementById("dt-banner-edit").addEventListener("click", (e) => {
    e.stopPropagation();
    bannerMenu.classList.toggle("hidden");
  });
  document.addEventListener("click", (e) => {
    if (!bannerMenu.contains(e.target) && e.target.id !== "dt-banner-edit") closeBannerMenu();
  });
  document.getElementById("dt-banner-upload").addEventListener("click", () => {
    closeBannerMenu();
    bannerInput.click();
  });
  document.getElementById("dt-banner-link").addEventListener("click", () => {
    closeBannerMenu();
    const link = window.prompt("paste an image link (url):", "");
    if (link === null) return;
    const url = link.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      window.alert("please paste a valid image link starting with http:// or https://");
      return;
    }
    uiPrefs.banner = url;
    uiPrefs.bannerPos = 50; // reset framing for the new image
    applyUiPrefs();
    touchUiPrefs();
  });
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
    const t = (titleEl.textContent || "").trim();
    if (!t) {
      titleEl.textContent = "pokeplanner";
      if (deviceStyle.richText) delete deviceStyle.richText.title;
    } else {
      // keep this device's formatting, sync the plain text as the shared base
      deviceStyle.richText = deviceStyle.richText || {};
      deviceStyle.richText.title = titleEl.innerHTML;
    }
    saveDeviceStyle();
    const plain = (titleEl.textContent || "").trim() || "pokeplanner";
    if (plain !== uiPrefs.title) {
      uiPrefs.title = plain;
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
  renderHabitTracker();
  applyEditability(); // title/habit labels start locked unless edit mode is on
  initSpotify();
  initEditMenu();
  applyWidgets(); // place / hide widget cards per this device's saved layout

  // one-time migration: adopt any previously-synced page-edit colors as this
  // device's local colors (colors are per-device now, no longer synced)
  const legacyColors = uiPrefs.pageLayout && uiPrefs.pageLayout.colors;
  if (legacyColors && Object.keys(legacyColors).length && !Object.keys(deviceStyle.colors).length) {
    deviceStyle.colors = { ...legacyColors };
    saveDeviceStyle();
    applyPageLayout();
  }
  // edit mode is a transient button now, not a persisted toggle
  if (settings.pageEdit) {
    settings.pageEdit = false;
    saveSettings(settings);
  }
}

if (DESKTOP_MQ.matches) buildDesktop();
// Crossing the breakpoint swaps between two very different layouts; a reload is
// the clean way to rebuild rather than shuffle nodes back and forth live.
DESKTOP_MQ.addEventListener("change", () => location.reload());

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
