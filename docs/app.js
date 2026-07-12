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
  saveTaskStore();
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
  saveTaskStore();
}

function storeDeleteTodo(id) {
  taskStore.todos = taskStore.todos.filter((t) => t.id !== id);
  saveTaskStore();
}

function storeMegaEvolve(id, variant) {
  const todo = taskStore.todos.find((t) => t.id === id);
  if (!todo || todo.status !== "done!") return;
  const megaOptions = MEGA_DATA[todo.pokemon_family];
  if (!megaOptions || variant < 0 || variant >= megaOptions.length) return;
  todo.is_mega = 1;
  todo.mega_variant = variant;
  saveTaskStore();
}

function storeReorder(order) {
  order.forEach((id, index) => {
    const todo = taskStore.todos.find((t) => t.id === id);
    if (todo) todo.position = index;
  });
  saveTaskStore();
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
const settingsOverlayEl = document.getElementById("settings-overlay");
const settingsCloseEl = document.getElementById("settings-close");
const companionSelectEl = document.getElementById("companion-select");

const COMPANIONS = [
  { value: "", label: "(none)" },
  { value: "pikachu", label: "pikachu (male)" },
  { value: "pikachu-f", label: "pikachu (female)" },
  { value: "pikachu-original", label: "pikachu cap" },
  { value: "eevee", label: "eevee" },
  { value: "pidgey", label: "pidgey" },
  { value: "meowth", label: "meowth" },
  { value: "mimikyu", label: "mimikyu" },
  { value: "cosmog", label: "cosmog" },
  { value: "bidoof", label: "bidoof" },
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
const COMPANION_CROP_OVERRIDES = new Set(["grookey", "scorbunny", "sobble"]);

function companionSpriteUrl(name, shiny) {
  if (COMPANION_CROP_OVERRIDES.has(name)) {
    return `./sprites/companion/${name}${shiny ? "_shiny" : ""}.gif`;
  }
  const base = shiny ? COMPANION_SPRITE_SHINY_BASE : COMPANION_SPRITE_BASE;
  return `${base}/${name}.gif`;
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
};

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

function populateCompanionSelect() {
  companionSelectEl.innerHTML = "";
  for (const c of COMPANIONS) {
    const option = document.createElement("option");
    option.value = c.value;
    option.textContent = c.label;
    if (c.value === settings.companion) option.selected = true;
    companionSelectEl.appendChild(option);
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

function sizeCompanionImage() {
  if (!settings.companion) return;
  const targetWidth = addButtonEl.getBoundingClientRect().width * 0.75;
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

function initSettings() {
  applyTheme();
  applyColors();
  populateCompanionSelect();
  applyCompanion();

  settingsFabEl.addEventListener("click", () => settingsOverlayEl.classList.remove("hidden"));
  settingsCloseEl.addEventListener("click", () => settingsOverlayEl.classList.add("hidden"));
  settingsOverlayEl.addEventListener("click", (e) => {
    if (e.target === settingsOverlayEl) settingsOverlayEl.classList.add("hidden");
  });

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
      settings.colors[key] = e.target.value;
      saveSettings(settings);
      applyColors();
    });
  }

  companionSelectEl.addEventListener("change", () => {
    settings.companion = companionSelectEl.value;
    saveSettings(settings);
    applyCompanion();
  });

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
  maybeTriggerShinyFx();
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

async function renderTeam(todos) {
  renderTeamBlurBg(todos);
  teamGridEl.innerHTML = "";
  const entries = [];

  for (let i = 0; i < TEAM_SIZE; i++) {
    const slot = document.createElement("div");
    const todo = todos[i];
    if (todo) {
      slot.className = "team-slot";
      const img = document.createElement("img");
      img.alt = todo.pokemon.name;
      img.src = todo.pokemon.sprite;
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
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

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
// doesn't work on mobile browsers). The dragged row swaps live with whichever
// neighbor its pointer has crossed the midpoint of.
let dragging = null;

function attachDragHandlers(handle, li) {
  handle.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dragging = li;
    li.classList.add("dragging");
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      // Ignore - dragging still works via document-level listeners below.
    }
    handle.addEventListener("pointermove", onDragMove);
    handle.addEventListener("pointerup", onDragEnd, { once: true });
    handle.addEventListener("pointercancel", onDragEnd, { once: true });
  });
}

function onDragMove(e) {
  if (!dragging) return;
  const pointerY = e.clientY;
  const items = Array.from(listEl.querySelectorAll(".todo-item")).filter((el) => el !== dragging);

  // Recompute the full target position each move (rather than swapping one
  // step at a time), so a fast swipe or a coalesced batch of pointermove
  // events still lands the dragged row in the right place.
  let target = null;
  for (const item of items) {
    const rect = item.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    if (pointerY < mid) {
      target = item;
      break;
    }
  }

  if (target) {
    if (target.previousElementSibling !== dragging) {
      listEl.insertBefore(dragging, target);
    }
  } else if (listEl.lastElementChild !== dragging) {
    listEl.appendChild(dragging);
  }
}

function onDragEnd() {
  if (!dragging) return;
  dragging.classList.remove("dragging");
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

async function megaEvolve(id, variant) {
  storeMegaEvolve(id, variant);
  refresh();
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

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
