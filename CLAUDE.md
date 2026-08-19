# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A plugin repository for **LeafBook** — a reading app. This repo hosts a catalog (`leafbook-plugins.json`) of independent JavaScript plugins, each implementing the `leafbook-source-v1` API contract.

## Code Architecture

### Plugin Contract (`leafbook-source-v1`)

Each plugin is a standalone `.js` file in `plugins/` that assigns an immutable object to `globalThis.LeafBookPlugin`:

```js
globalThis.LeafBookPlugin = Object.freeze({
  id: "plugin.unique.id",
  popular(page) { /* returns [{ name, path, cover }] */ },
  article(path)   { /* returns { title, content } */ }  // optional
});
```

Plugins run inside the LeafBook app which provides a `LeafBook` global API:
- `LeafBook.httpGet(url)` — fetches and returns response body as string
- `LeafBook.parseXml(xmlString)` — returns a DOM-like document with `querySelector` / `querySelectorAll`
- `LeafBook.parseHtml(htmlString)` — returns a DOM-like document for HTML content

### Catalog (`leafbook-plugins.json`)

JSON array declaring each plugin's metadata: `id`, `name`, `site`, `lang`, `version`, `url` (relative path to plugin script), `iconUrl`, `api` (always `"leafbook-source-v1"`), and `sha256` hash of the plugin script. LeafBook verifies SHA-256 before installing a plugin.

### Tests

Each plugin has a corresponding `tests/*.test.js` file that:
1. Mocks the `LeafBook` global with `Object.freeze`
2. Loads the plugin via `vm.runInThisContext(fs.readFileSync(...))`
3. Asserts expected behavior with `node:assert/strict`

### Hash Update (`update-hash.js`)

Node script that recomputes SHA-256 hashes for all plugin scripts listed in `leafbook-plugins.json` and writes them back. **Run this after any plugin change.**

## Commands

```bash
# Run all tests
node tests/openlibrary.test.js
node tests/vnexpress.test.js

# Recompute plugin SHA-256 hashes (required after modifying any plugin)
node update-hash.js
```

Tests use Node.js built-in modules only (`node:assert`, `node:fs`, `node:vm`) — no `npm install` or build step needed.

## Adding a New Plugin

1. Create `plugins/<name>.js` implementing the `leafbook-source-v1` contract
2. Create `tests/<name>.test.js` with a mock `LeafBook` global and assertions
3. Add an entry to `leafbook-plugins.json` (set `sha256` to a placeholder, it will be updated)
4. Run `node update-hash.js` to compute the correct SHA-256
5. Run `node tests/<name>.test.js` to verify
