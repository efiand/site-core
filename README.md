# site-core

Shared-библиотека для vanilla JS MPA/fullstack consumer-проектов (отдельный git-репозиторий на каждый сайт).

## Подключение

**Локально:**

```json
"dependencies": {
  "site-core": "file:../site-core"
}
```

**CI / production:**

```json
"site-core": "git+https://github.com/<org>/site-core.git#1.0.0"
```

## Импорты

| Namespace        | Назначение                          |
| ---------------- | ----------------------------------- |
| `#core/common/*` | shared common (log, templates, …)   |
| `#core/server/*` | shared server (db, auth helpers, …) |
| `#core/client/*` | shared client (forms, metrika, …)   |

В `package.json` хоста:

```json
"#core/common/*": "site-core/common/*",
"#core/server/*": "site-core/server/*",
"#core/client/*": "site-core/client/*"
```

Browser dev: importmap `#core/` → `/core/` + static middleware.

## Типы

Entrypoint — [`types/index.d.ts`](types/index.d.ts): только `/// <reference path="…" />` на доменные файлы (**по алфавиту**); без `export {}` / `import type` в global-файлах.

**В `tsconfig.json` хоста:**

```json
"include": [
  "app/**/*.js",
  "src/**/*.js",
  "test/**/*.js",
  "tools/**/*.js",
  "node_modules/site-core/types/index.d.ts"
]
```

`exclude` для JS core — см. `config/tsconfig.host.json`. Дополнительный `"src/types/**/*.d.ts"` — доменные типы хоста.

| Файл                                               | Содержание                                    |
| -------------------------------------------------- | --------------------------------------------- |
| `index.d.ts`                                       | entrypoint (`/// <reference />`, по алфавиту) |
| `global.d.ts`                                      | `Window`, `ProcessEnv`                        |
| `server.d.ts`                                      | `Route*`, `CreateAppOptions`, cookies, DB     |
| `view.d.ts`                                        | `LayoutData`                                  |
| `tools.d.ts`                                       | `BuildStaticPagesOptions`, `onPageBuilt`      |
| `metrika.d.ts`                                     | Yandex Metrika                                |
| `log.d.ts`, `url.d.ts`, `npm.d.ts`, `sitemap.d.ts` | утилиты                                       |
| `toolchain.d.ts`, `hyphen.d.ts`                    | module shims                                  |

Subpath-импорты (`site-core/tools/…`, `#core/common/templates/…`) — **colocated `.d.ts` рядом с `.js`**:

| Элемент     | Правило                                                              |
| ----------- | -------------------------------------------------------------------- |
| Функции     | `export function fn(…): Return;`                                     |
| Константы   | `export declare const NAME: Type;` (не `export const` — Biome parse) |
| Global-типы | `/// <reference path="…/types/index.d.ts" />` при необходимости      |

Примеры: [`tools/build-static-pages.d.ts`](tools/build-static-pages.d.ts), [`common/templates/yandex-metrika.d.ts`](common/templates/yandex-metrika.d.ts), [`common/templates/mailto-privacy.d.ts`](common/templates/mailto-privacy.d.ts).

## Biome

Один пресет [`config/biome.core.json`](config/biome.core.json) для site-core и хостов (`"extends": ["./node_modules/site-core/config/biome.core.json"]`). VS Code: postinstall пишет `.vscode/settings.json` хоста из [`.vscode/settings.json`](.vscode/settings.json) с путями `biome.lsp.bin` на nested Biome.

## Cursor rules и postinstall

После `npm install` в хосте:

```json
"postinstall": "site-core-postinstall"
```

`site-core-postinstall` ([`tools/postinstall.js`](tools/postinstall.js)):

1. Symlink `.cursor/rules/site-core`, `.editorconfig`, `.vscode/extensions.json` → `node_modules/site-core/`; `.vscode/settings.json` — копия core с путями `biome.lsp.bin` для хоста.
2. Сканирует `public/fonts/*.woff2`, переименовывает в `{family-slug}-{weight}[-italic].woff2`, пишет gitignored `src/client/css/common/fonts.css` (хост) и `common/generated/fonts.js` (site-core; preload через import в [`page.js`](common/templates/page.js)).
3. Git pre-commit hook для **хоста** — [`tools/install-pre-commit.js`](tools/install-pre-commit.js); при `file:../site-core` штатный `install.js` `@fastify/pre-commit` ставит hook не в тот `.git`.

Перегенерация шрифтов: `npm run postinstall` (или `npm run build` — postinstall первым).

Файлы в junction — `*-core.mdc`. В корне `.cursor/rules/` хоста — `project.mdc`, `privacy.mdc`, `testing.mdc` и т.п.

`.gitignore` хоста, env и CI — см. раздел [«Файлы конфигурации хоста»](#файлы-конфигурации-хоста)`.

## Файлы конфигурации хоста

Git **не** импортирует внешние файлы — эталоны лежат в [`config/`](config/), в репозиторий хоста переносятся **вручную** (синхронизация при обновлении site-core).

| Эталон в core                                                          | На хосте                   | Что сделать                                                                                                                                                                                                          |
| ---------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`config/gitignore.host.example`](config/gitignore.host.example)       | `.gitignore`               | Скопировать общий блок (строки по алфавиту). Host-only паттерны — **в конце** файла, тоже по алфавиту. Уже в примере: `.editorconfig`, `.vscode/*`, `.cursor/rules/site-core` (junction/postinstall — не коммитить). |
| [`config/env.example`](config/env.example)                             | `.env.example` + `.env`    | В git — `.env.example` (можно взять за основу core + переменные деплоя хоста). `.env` — локально, **не коммитить**. `DEV_PORT` / `PORT` — для `site-core-dev` и prod.                                                |
| [`config/ci.host.example.yml`](config/ci.host.example.yml)             | `.github/workflows/ci.yml` | **Шаг 3** миграции: заменить self-contained `ci.yml` на thin caller с `uses: <org>/site-core/.github/workflows/….yml@X.Y.Z`. До релиза core — свой локальный workflow.                                               |
| [`config/package.host.example.json`](config/package.host.example.json) | `package.json`             | Поле `"pre-commit": ["lint-format", "test"]` + скрипты `lint-format` / `test` / `postinstall`. Отдельная зависимость `@fastify/pre-commit` **не нужна** — hook ставит `site-core-postinstall`.                       |

Дополнительно (по необходимости): [`configure-site.host.example.js`](config/configure-site.host.example.js), [`view.host.example.d.ts`](config/view.host.example.d.ts) — стартовые заготовки для `configure-site` и `src/types/`.

После `npm install` junction-файлы (`.editorconfig`, `.cursor/rules/site-core`, `.vscode/extensions.json`) и сгенерированный `.vscode/settings.json` подтягивает `site-core-postinstall` — их **не** копируют из таблицы выше.

## GitHub Actions (reusable workflows)

Workflow-файлы — в [`site-core/.github/workflows/`](.github/workflows/). **Запуск только на раннерах GitHub**; сервер хостинга получает готовый artifact (scp) и переключает `current` по ssh — см. [`workflow-core.mdc`](.cursor/rules/workflow-core.mdc).

| Workflow                     | Назначение                              |
| ---------------------------- | --------------------------------------- |
| `host-ci.yml`                | lint + test + upload-artifact           |
| `deploy-static-releases.yml` | artifact → scp → ssh (`current` на VPS) |

Шаблон caller для хоста — [`config/ci.host.example.yml`](config/ci.host.example.yml).

**До шага 3** (git pin site-core) хост использует локальный self-contained `ci.yml`. **Шаг 3:** заменить на `uses: <org>/site-core/.github/workflows/….yml@X.Y.Z` — см. `workflow-core.mdc`.

**Релиз site-core:** bump `version` в `package.json`, секция в [`CHANGELOG.md`](CHANGELOG.md), push в `main` — job `release` создаёт tag и GitHub Release (tag уже есть — skip).

**Consumer-проекты (CI/deploy):** deploy **по умолчанию** после CI; opt-out в commit message — **`[no-deploy]`**, **`[WIP]`** (только deploy); **`[skip`** — весь workflow. Таблица и `if:` — [`workflow-core.mdc`](.cursor/rules/workflow-core.mdc).

## Cache busting

`buildAssetQuery(hostVersion)` из `#core/common/lib/asset-version.js` → `?v=N&core=X.Y.Z`.

## Yandex Metrika

| Слой   | Модуль                                                                                      | Назначение                                                                                                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| SSR    | [`renderYandexMetrika`](common/templates/yandex-metrika.js)                                 | только `<noscript>` + комментарии                                                                                                                                                                       |
| SSR    | [`renderYandexMetrikaScript`](common/templates/yandex-metrika-script.js)                    | `<script type="module" src="…/metrika.js">`; URL — [`buildYandexMetrikaScriptUrl`](common/lib/yandex-metrika-script-url.js), guard — [`shouldIncludeYandexMetrika`](common/lib/yandex-metrika-guard.js) |
| Client | [`initYandexMetrika`](client/lib/init-yandex-metrika.js)                                    | загрузка tag.js, `ym(…, "init")`, очередь hits                                                                                                                                                          |
| Client | [`loadScript`](client/lib/load-script.js)                                                   | однократная загрузка внешнего `<script>` по URL                                                                                                                                                         |
| Config | [`getSiteConfig`](common/lib/site-config.js) / [`setSiteConfig`](common/lib/site-config.js) | конфигурация хоста (server + client); init — `app/common/configure-site.js`                                                                                                                             |
| SSR    | [`renderDocumentTitle`](common/templates/document-title.js)                                 | `parts.join('                                                                                                                                                                                           | ') + projectTitle`из`getSiteConfig()` |
| Static | [`STATIC_MIME_TYPES`](common/lib/static-mime-types.js)                                      | MIME dev/static middleware + `staticExtensions`                                                                                                                                                         |
| Хост   | `src/client/entries/metrika.js`                                                             | `import '#common/configure-site.js'` + `initYandexMetrika()`                                                                                                                                            |
| Хост   | `page.js` / assets                                                                          | `renderYandexMetrikaScript({ isDev, pathname })`; CSS — `buildAssetQuery(getSiteConfig().version.CSS)`                                                                                                  |

На `/__*` — без Metrika (ни script, ни noscript). Inline `<script>` с init в SSR **не используем**.

## `buildStaticPages`

Статическая генерация HTML — bin **`site-core-build-static-pages`** (в `npm run build` хоста):

```json
"build": "... && site-core-build-static-pages"
```

`createApp` подгружается из `app/server/lib/app.js` (или `SITE_CORE_APP`) через `process.cwd()` — как у `site-core-dev`.

Программно: `import { buildStaticPages } from 'site-core/tools/build-static-pages.js'` + `{ createApp }`.

| Опция          | Назначение                                                                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createApp`    | app-фабрика хоста                                                                                                                                              |
| `onPageBuilt?` | Колбэк после каждой страницы. **По умолчанию** — `console.info(\`Страница ${url} сгенерирована.\`)`. Итог `✅ Всего сгенерировано страниц: N` — всегда из core |

`host`, `pages` (`getSiteConfig().buildPages`), `waitForApp`, `closeApp` — из site-core.

Типы: [`types/tools.d.ts`](types/tools.d.ts) (globals подтягиваются через [`tools/build-static-pages.d.ts`](tools/build-static-pages.d.ts) при импорте из `node_modules/site-core` — отдельный reference в хосте не нужен).

## Env

Переменные окружения — см. [`config/env.example`](config/env.example) и раздел [«Файлы конфигурации хоста»](#файлы-конфигурации-хоста).

## Scripts (bin)

| Bin                            | Назначение                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `site-core-dev`                | dev/preview: dotenvx + nodemon + dev-middleware; `createApp` из `app/server/lib/app.js`                 |
| `site-core-run`                | toolchain CLI (rolldown, postcss, dotenvx, node…) в cwd хоста                                           |
| `site-core-lint`               | `lint-static-check` + biome в cwd хоста                                                                 |
| `site-core-type-check`         | tsc в cwd хоста                                                                                         |
| `site-core-postinstall`        | symlink dev-конфига + генерация шрифтов хоста                                                           |
| `site-core-build-static-pages` | HTML из `getSiteConfig().buildPages` через running app (`SITE_CORE_APP`, cwd хоста)                     |
| `site-core-build-vendors`      | tinymce vendors (Tier 2)                                                                                |
| `site-core-dump`               | DB dump CLI (Tier 2)                                                                                    |
| `site-core-upgrade`            | `npm run upgrade` — bump git pin `site-core` + reusable `uses:@tag`, registry deps, browserslist, rolldown wasm lockfile, GitHub Actions |

При `"site-core": "file:../site-core"` toolchain-пакеты не hoisting-ятся в хост — в тестах хоста: `site-core-run node --import site-core/tools/register-vendors.js --test …`.

## Разработка site-core

```bash
npm install
npm run lint
npm test
npm run upgrade   # deps + .github/workflows/ site-core
```
