# Миграция consumer-проекта на site-core

Пошаговый перенос сайта на shared-пакет. Шаги можно проходить **частями**; после каждого — `npm run lint-format`.

| Шаг | Что сделать |
| --- | --- |
| Зависимость | `"site-core": "file:../site-core"`, импорты `#core/*`, bin `site-core-lint` / `site-core-run` / `site-core-dev` |
| Biome | `biome.json` → `"extends": ["./node_modules/site-core/config/biome.core.json"]` |
| Экспорты | Все модули — `export { … }` в конце файла, имена по алфавиту |
| site-config | `configure-site.js` + `setSiteConfig({ routes })` в `app/server/lib/app.js`; client — `src/client/entries/main.js` |
| app factory | Тонкий `app.js` через `#core/server/lib/http-server.js` и `route-dispatcher.js` |
| dev | `"dev": "site-core-dev"`, `"preview": "site-core-dev --preview"`; `DEV_PORT` / `PORT` в `.env` или CI; `createApp` — динамический import `app/server/lib/app.js` (`SITE_CORE_APP`); `app/server/main.js` / `src/server/main.js` не нужны |
| package.json (legacy) | Удалить `"main"`, `"name"` (см. [`config/package.host.example.json`](../config/package.host.example.json)); удалить `app/server/main.js` |
| postinstall | `"postinstall": "site-core-postinstall"` — symlink dev-конфига + шрифты + pre-commit hook; `.gitignore` — по [`config/gitignore.host.example`](../config/gitignore.host.example) |
| pre-commit | `"pre-commit": ["lint-format", "test"]` в `package.json`; отдельная зависимость `@fastify/pre-commit` **не нужна** |
| CI (шаг 3) | Reusable `host-ci.yml` — [`config/ci.host.example.yml`](../config/ci.host.example.yml); pin `"site-core": "github:<org>/site-core#X.Y.Z"` |
| Релиз site-core | bump `version` в `package.json` + push в `main` — job `release` в CI site-core |
| Документация (шаг 3) | В README consumer-проекта — одна ссылка на [документацию site-core](https://efiand.github.io/site-core); без дубля CLI/imports/postinstall |

## Эталоны в site-core

| Эталон | Назначение |
| --- | --- |
| [`config/package.host.example.json`](../config/package.host.example.json) | `package.json` хоста: scripts, pre-commit, pin site-core |
| [`config/gitignore.host.example`](../config/gitignore.host.example) | `.gitignore` хоста |
| [`config/env.example`](../config/env.example) | `.env.example` |
| [`config/ci.host.example.yml`](../config/ci.host.example.yml) | thin caller CI (шаг 3) |
| [`config/configure-site.host.example.js`](../config/configure-site.host.example.js) | стартовый `configure-site.js` |
| [`config/view.host.example.d.ts`](../config/view.host.example.d.ts) | расширение типов хоста |

До шага 3 (git pin site-core) хост держит **self-contained** `.github/workflows/ci.yml`. После публикации site-core — caller с `uses: <org>/site-core/.github/workflows/….yml@X.Y.Z`.

## Подключение site-core

**Локально:**

```json
"dependencies": {
  "site-core": "file:../site-core"
}
```

**CI / production:**

```json
"site-core": "github:<org>/site-core#X.Y.Z"
```

См. также [README](../README.md) — импорты `#core/*`, типы, postinstall, Metrika.
