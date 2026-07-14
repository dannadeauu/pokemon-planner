const STATUSES = ["not started", "in progress", "done!"];
const STATUS_LABELS = {
  "not started": "not started",
  "in progress": "in progress...",
  "done!": "done!",
};
const TEAM_SIZE = 6;

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
// These sit on a much bigger canvas than the other companions, so they're
// served pre-cropped by the backend to match everyone else's sizing.
const COMPANION_CROP_OVERRIDES = new Set(["grookey", "scorbunny", "sobble", "froakie"]);

function companionSpriteUrl(name, shiny) {
  if (COMPANION_CROP_OVERRIDES.has(name)) {
    return `/sprites/companion/${name}.gif${shiny ? "?shiny=1" : ""}`;
  }
  const base = shiny ? COMPANION_SPRITE_SHINY_BASE : COMPANION_SPRITE_BASE;
  return `${base}/${name}.gif`;
}

// iOS can leave the document panned after a bottom sheet closes (keyboard or
// scroll chaining), which lingers as a black bar above the fixed pages.
// Force the viewport back to the top whenever an overlay closes.
function resetViewportScroll() {
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

function computeCompanionAccent() {
  if (!settings.companion) return NO_COMPANION_ACCENT;
  const key = settings.companion + (teamFullyEvolved ? "_shiny" : "");
  return COMPANION_ACCENTS[key] || COMPANION_ACCENTS[settings.companion] || NO_COMPANION_ACCENT;
}

function updateMatchCompanionButton() {
  matchCompanionBtnEl.classList.toggle("active", Boolean(settings.matchCompanion));
}

function applyMatchCompanion() {
  if (!settings.matchCompanion) return;
  const accent = computeCompanionAccent();
  if (settings.colors.add !== accent) {
    settings.colors.add = accent;
    saveSettings(settings);
    applyColors();
  }
}

function initSettings() {
  applyTheme();
  applyColors();
  populateCompanionSelect();
  applyCompanion();
  updateMatchCompanionButton();
  applyMatchCompanion();

  matchCompanionBtnEl.addEventListener("click", () => {
    settings.matchCompanion = !settings.matchCompanion;
    saveSettings(settings);
    updateMatchCompanionButton();
    applyMatchCompanion();
  });

  const closeSettings = () => {
    settingsOverlayEl.classList.add("hidden");
    resetViewportScroll();
  };
  settingsFabEl.addEventListener("click", () => settingsOverlayEl.classList.remove("hidden"));
  settingsCloseEl.addEventListener("click", closeSettings);
  settingsOverlayEl.addEventListener("click", (e) => {
    if (e.target === settingsOverlayEl) closeSettings();
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
      if (id === "color-add") {
        settings.matchCompanion = false;
        updateMatchCompanionButton();
      }
      settings.colors[key] = e.target.value;
      saveSettings(settings);
      applyColors();
    });
  }

  companionSelectEl.addEventListener("change", () => {
    settings.companion = companionSelectEl.value;
    saveSettings(settings);
    applyCompanion();
    applyMatchCompanion();
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
  shinyFxEl.src = `/static/shiny_sparkle.webp?t=${Date.now()}`;
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
  const res = await fetch("/api/todos");
  const todos = await res.json();
  renderTodos(todos);
  renderTeam(todos);

  const doneCount = todos.filter((t) => t.status === "done!").length;
  teamFullyEvolved = doneCount >= SHINY_COMPANION_THRESHOLD;
  applyCompanion();
  applyMatchCompanion();
  maybeTriggerShinyFx();
}

async function fetchStats() {
  const res = await fetch("/api/stats");
  const stats = await res.json();
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
  await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  refresh();
}

async function updateStatus(id, status) {
  await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  refresh();
}

async function updateText(id, text) {
  await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  refresh();
}

async function reorderTodos(order) {
  await fetch("/api/todos/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  });
  refresh();
}

async function deleteTodo(id) {
  await fetch(`/api/todos/${id}`, { method: "DELETE" });
  refresh();
}

async function megaEvolve(id, variant) {
  await fetch(`/api/todos/${id}/mega`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variant }),
  });
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
    const width = Math.min(100, (base / 255) * 100);
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
  return `/sprites/icon/${dex}.png${shiny ? "?shiny=1" : ""}`;
}

async function loadDexEntries() {
  const res = await fetch("/api/pokedex");
  return res.json();
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
  if (changed) saveDexDiscoveries();
}

let dexEntriesPromise = null;

function getDexEntries() {
  if (!dexEntriesPromise) dexEntriesPromise = loadDexEntries();
  return dexEntriesPromise;
}

let dexActiveTab = "all";

async function renderDexGrid() {
  const entries = await getDexEntries();
  const shiny = dexActiveTab === "shiny";
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
const friendsOverlayEl = document.getElementById("friends-overlay");
const friendsCloseEl = document.getElementById("friends-close");
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
const accountBtnEl = document.getElementById("account-btn");
const friendsAccountViewEl = document.getElementById("friends-account-view");
const accountBackEl = document.getElementById("account-back");
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
  });
  parkMineEl.appendChild(msg);
  autosize();
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
    friends = (data && data.friends) || [];
    friendRequests = (data && data.requests) || [];
    saveFriends();
    saveRequests();
    renderParkFriends();
    renderFriendRequests();
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

function renderFriendsMenu() {
  friendsHomeViewEl.classList.remove("hidden");
  friendsNicknameViewEl.classList.add("hidden");
  friendsAccountViewEl.classList.add("hidden");
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
  }
}

const closeFriends = () => {
  friendsOverlayEl.classList.add("hidden");
  resetViewportScroll();
};

friendsFabEl.addEventListener("click", () => {
  renderFriendsMenu();
  friendsOverlayEl.classList.remove("hidden");
  refreshFriends();
});
friendsCloseEl.addEventListener("click", closeFriends);
friendsOverlayEl.addEventListener("click", (e) => {
  if (e.target === friendsOverlayEl) closeFriends();
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
  if (navigator.share) {
    try {
      await navigator.share({ text: INVITE_MESSAGE, url });
    } catch (e) {
      // user dismissed the share sheet - nothing to do
    }
    return;
  }
  const ok = await writeClipboard(`${INVITE_MESSAGE} ${url}`);
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

accountBtnEl.addEventListener("click", () => {
  friendsHomeViewEl.classList.add("hidden");
  friendsNicknameViewEl.classList.add("hidden");
  renderAccountView();
  friendsAccountViewEl.classList.remove("hidden");
});

accountBackEl.addEventListener("click", () => renderFriendsMenu());

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
  })();
}

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
