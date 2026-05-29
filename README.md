# n8n-nodes-warmy-io

[![npm version](https://img.shields.io/npm/v/n8n-nodes-warmy-io.svg)](https://www.npmjs.com/package/n8n-nodes-warmy-io)

n8n community node for the [Warmy.io](https://warmy.io) email-warmup API.

## Resources & operations

| Resource | Operations |
| --- | --- |
| **Mailbox** | List, Get, Create, Update, Delete, Pause, Resume, change tariff plan, and more (15 operations total). |
| **Seedlist** | List splits, list emails, manage seedlist providers (5 operations). |
| **Deliverability Checker** | List, get, run, and inspect deliverability checks (5 operations). |
| **Standalone Deliverability Checker** | List, get, and inspect standalone deliverability runs (4 operations). |
| **User Template** | Manage warmup email templates. |

All endpoints back the official Warmy.io REST API. Pagination is handled transparently via a `Return All` toggle on every list operation.

## Installation

### As an n8n community node (recommended)

In your n8n instance: **Settings → Community Nodes → Install** and enter:

```
n8n-nodes-warmy-io
```

### Manual install (self-hosted n8n)

```bash
cd ~/.n8n/custom
npm init -y                          # only if ~/.n8n/custom is empty
npm install n8n-nodes-warmy-io
n8n start
```

In the browser open `http://localhost:5678`, create a workflow, and search for the **Warmy** node.

## Credentials setup

1. In n8n: **Credentials → New → Warmy API**.
2. Fill in:
   - **API Token** — generate on warmy.io → Workspace → Settings → API Keys.
   - **Holder UID** — get it from [warmy.io/api-documentation](https://www.warmy.io/api-documentation).
3. Press **Test** — should return success.

## Local development

Requires **Node.js 22 LTS** (n8n's native `isolated-vm` won't build on Node 25+).

```bash
git clone https://github.com/skachkiss/n8n-nodes-warmy-io.git
cd n8n-nodes-warmy-io
npm install
npm run build                        # tsc → dist/, then gulp copies icons
npm link                             # expose the package globally

cd ~/.n8n/custom
npm init -y                          # only if not already initialised
npm link n8n-nodes-warmy-io

n8n start
```

n8n loads custom nodes once at startup — restart the process after every `npm run build`. The browser also caches the SVG icon aggressively; hard-refresh (Cmd+Shift+R) if a logo change doesn't appear.

### Dev scripts

```bash
npm run dev      # tsc --watch (does NOT re-copy icons; rerun build if svg changes)
npm run lint     # eslint via eslint-plugin-n8n-nodes-base
npm run lintfix  # auto-fix most n8n-nodes-base lint rules
npm run format   # prettier
```

## Adding a new resource

1. Read the relevant section of the Warmy OpenAPI spec.
2. Create `nodes/Warmy/descriptions/<Resource>Description.ts` exporting `<resource>Operations` and `<resource>Fields`.
3. Re-export from `nodes/Warmy/descriptions/index.ts`.
4. In `nodes/Warmy/Warmy.node.ts`: add the resource value to the resource dropdown, spread the new operations/fields, and add a dispatch branch in `execute()` calling your `execute<Resource>` function.
5. `npm run build && npm run lintfix`.

## License

[MIT](LICENSE)
