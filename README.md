# my team — pokémon to-do list

A to-do list where every task hatches a random Pokémon that evolves as you
make progress: not started → base form, in progress → middle evolution,
done! → final evolution (with Mega Evolution, shinies, and a companion
Pokémon along the way).

## Two ways to run it

### PWA (recommended — installable, works anywhere, no server)

The `docs/` folder is a fully self-contained static app: tasks are stored
on-device in the browser's localStorage and all game logic runs client-side.

**Deploy to GitHub Pages:**

1. Push this repository to GitHub.
2. In the repo: **Settings → Pages → Build and deployment**, set
   *Source* to **Deploy from a branch**, pick your default branch and the
   **`/docs`** folder, then save.
3. Your app goes live at `https://<username>.github.io/<repo>/` within a
   minute or two.
4. On your phone, open that URL and use **Add to Home Screen**
   (Share menu on iOS, browser menu on Android). It installs like a native
   app — full screen, no browser chrome, works offline after first load.

Each device keeps its own task list.

**Preview locally:** `python3 -m http.server 5051 --directory docs`

**Regenerate sprite assets** (only needed if the Pokémon roster changes):
`python3 tools/generate_pwa_assets.py`

### Flask app (original, LAN-shared)

`python3 app.py` serves the same UI at `http://<your-ip>:5050` with tasks
stored in SQLite at `~/.todo-app/todos.db` — one shared list for every
device on your network. Requires `pip install -r requirements.txt`.
