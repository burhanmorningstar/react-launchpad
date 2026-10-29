# Local Graphify tooling

- Graphify is installed only in `.devtools/graphify`. On Windows, invoke `.devtools/graphify/Scripts/python.exe -m graphify`; do not install it globally.
- Use `.agents/skills/graphify/SKILL.md` for graph queries and `graphify-out/graph.json` as the existing project map. Cross-check important findings against source files.
- Keep analysis local: set `GRAPHIFY_BACKEND=none`, extract with `--code-only`, and generate reports with `cluster-only . --no-label`. Do not enable API providers, cloud features, watchers, or hooks without a user request.
- Follow `.graphifyignore`. Tool environments and generated graphs are excluded locally through `.git/info/exclude`.
