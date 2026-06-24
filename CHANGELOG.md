# Changelog

Формат — [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/), версии — [SemVer](https://semver.org/lang/ru/).

## [1.3.0] - 2026-06-24

### Added

- [`common/templates/client-entry-script.js`](common/templates/client-entry-script.js) (`renderClientEntryScript`) — prod `<script type="module" src="…/main.js">`; dev — `/client/entries/main.js`; без `/__*`.
- [`tools/post-build.js`](tools/post-build.js) (`runPostBuild`), `npm run build` — сборка `dist/` для GitHub Pages (Jekyll: README, CHANGELOG, `docs/`).
- [`docs/migration.md`](docs/migration.md), [`docs/architecture.md`](docs/architecture.md) — миграция consumer-проекта и обзор архитектуры.
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml): job `deploy-docs` — публикация документации на GitHub Pages после push в `main` (opt-out: `[no-deploy]`, `[WIP]`).

### Changed

- [`common/lib/site-config.js`](common/lib/site-config.js) (`setSiteConfig`): в dev обнуляет `yandexMetrikaId` — Metrika и guard'ы опираются на `0`, без отдельных `isDev`-проверок.
- [`common/templates/page-assets.js`](common/templates/page-assets.js) (`renderPageAssets`): client entry через `renderClientEntryScript` вместо `renderYandexMetrikaScript`.
- [`common/templates/render-inline-page-assets.js`](common/templates/render-inline-page-assets.js) (`createRenderInlinePageAssets`): без inline Metrika в `<head>`; init — только client [`initYandexMetrika`](client/lib/init-yandex-metrika.js) в `src/client/entries/main.js`.
- [README.md](README.md): badges CI/docs, секция «Документация», ссылка на [GitHub Pages](https://efiand.github.io/site-core); раздел Yandex Metrika — `renderClientEntryScript`, единый entry `main.js` с `initYandexMetrika`.
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml), [`.github/workflows/host-ci.yml`](.github/workflows/host-ci.yml): `actions/checkout@v7`.

### Removed

- [`common/lib/yandex-metrika-script-url.js`](common/lib/yandex-metrika-script-url.js) (`buildYandexMetrikaScriptUrl`) — вместо него `renderClientEntryScript`.
- [`common/templates/yandex-metrika-script.js`](common/templates/yandex-metrika-script.js) (`renderYandexMetrikaScript`) — вместо него `renderClientEntryScript`.
- [`common/templates/yandex-metrika-inline.js`](common/templates/yandex-metrika-inline.js) (`renderYandexMetrikaInline`, `renderYandexMetrikaInlineHead`, `renderYandexMetrikaInlineScript`).
- [`common/templates/render-inline-page-assets.js`](common/templates/render-inline-page-assets.js): опция `includeInlineMetrika`.
- Хост: убрать отдельный `src/client/entries/metrika.js` и импорты `renderYandexMetrikaScript` / `buildYandexMetrikaScriptUrl` / `renderYandexMetrikaInline*`; client init Metrika — в `main.js` (`configure-site` + `initYandexMetrika`).

## [1.2.2] - 2026-06-15

### Fixed

- [`tools/restore-rolldown-wasm-lockfile.js`](tools/restore-rolldown-wasm-lockfile.js) (`restoreRolldownWasmLockfile`): при установке site-core из git в `node_modules` читает `package-lock.json` хоста (`INIT_CWD`), а не несуществующий lock внутри пакета.

## [1.2.1] - 2026-06-15

### Changed

- [`tools/generate-host-fonts.js`](tools/generate-host-fonts.js) (`generateHostFonts`): без `public/fonts` или без `.woff2` в каталоге — не создаёт `fonts.css` и не создаёт пустой `public/fonts`; удаляет устаревший `fonts.css`, если был.
- [`tools/check-function-order.js`](tools/check-function-order.js): явнее оформлены сообщения об ошибках (❌, позиция первого расхождения).

## [1.2.0] - 2026-06-15

### Added

- [`common/lib/shuffle-array.js`](common/lib/shuffle-array.js) (`shuffleArray`) — Fisher–Yates.
- [`server/lib/inline-bundle.js`](server/lib/inline-bundle.js) (`getCss` / `getJs`) — inline SSR-бандлинг (PostCSS + Rolldown).
- [`common/templates/render-inline-page-assets.js`](common/templates/render-inline-page-assets.js) (`createRenderInlinePageAssets`) — prod: inline `<style>` / `<script type="module">`; dev: `renderPageAssets`.
- [`common/templates/yandex-metrika-inline.js`](common/templates/yandex-metrika-inline.js) (`renderYandexMetrikaInline`, `renderYandexMetrikaInlineHead`) — inline Metrika для single-page хостов.
- [`common/templates/page.js`](common/templates/page.js) (`createRenderPage({ renderPageAssetsFn })`) — кастомная подстановка ассетов вместо `renderPageAssets`.
- [`tools/vendor-resolver.js`](tools/vendor-resolver.js) (`register-vendors`): entry для `rolldown` → `dist/index.mjs`.
- [`.github/workflows/deploy-github-pages.yml`](.github/workflows/deploy-github-pages.yml) — reusable workflow для GitHub Pages (`configure-pages`, опц. `jekyll-build-pages`, `upload-pages-artifact`, `deploy-pages`) вместо peaceiris и ветки `gh-pages`.

### Changed

- [`config/ci.host.example.yml`](config/ci.host.example.yml), [`.cursor/rules/workflow-core.mdc`](.cursor/rules/workflow-core.mdc), [README.md](README.md): GitHub Pages — официальные actions; в Settings репозитория **Source: GitHub Actions**.

## [1.1.8] - 2026-06-14

### Added

- [`common/lib/static-mime-types.js`](common/lib/static-mime-types.js) (`STATIC_MIME_TYPES`): `.webp` → `image/webp` (отдача статики в dev/preview).

### Changed

- Эталон git pin хоста — `github:<org>/site-core#X.Y.Z` в [README.md](README.md) и [`config/package.host.example.json`](config/package.host.example.json); `git+https://…#X.Y.Z` по-прежнему поддерживается [`tools/upgrade.js`](tools/upgrade.js) (`site-core-upgrade`).

## [1.1.7] - 2026-06-14

### Added

- [`common/lib/html-prefix.js`](common/lib/html-prefix.js) (`buildHtmlPrefix`, `DEFAULT_HTML_PREFIX`, `OGP_PREFIX_*`) — сборка атрибута `prefix` для Open Graph.
- [`common/templates/sitemap-xml.js`](common/templates/sitemap-xml.js) (`createSitemapXmlRoute(pages?)`) — роут `/sitemap.xml`; `pages` как у `renderSitemap` или `() => …` для выборки на запрос.
- [`server/lib/route-dispatcher.js`](server/lib/route-dispatcher.js) (`createStandardRouteDispatcher({ resolveRequest })`) — контекст запроса (`pathname`, `context`) для зеркал и прочих префиксов.
- [`common/lib/site-config.js`](common/lib/site-config.js) (`getSiteConfig` / `setSiteConfig`): опциональные поля `author`, `privacyRevisionDate`, `pubDate` для авторских article-сайтов и даты редакции политики.
- [`common/templates/page.js`](common/templates/page.js) (`createRenderPage`): при непустом `author` — `<meta name="author">`; для `ogType: "article"` — `article:author`, `article:published_time` из `LayoutData.publishedTime` (хост), article `prefix`.
- [`common/templates/article-work-schema.js`](common/templates/article-work-schema.js) (`renderArticleHead`) — JSON-LD home/work при `LayoutData.articleWork` / `articleSeries` (`dateCreated` / `datePublished`), `article:publisher`, `copyright`.
- [`common/lib/resolve-source-published-time.js`](common/lib/resolve-source-published-time.js) (`resolveSourcePublishedTime`) — утилита хоста: dev → `fallback`, prod → mtime файла (sitemap и `publishedTime` на усмотрение хоста).
- [`common/lib/normalize-datetime.js`](common/lib/normalize-datetime.js) (`normalizeDatetime`) — общий формат `SiteDatetimeInput` (`YYYY-MM-DD`, ISO с временем, MySQL `YYYY-MM-DD HH:mm:ss`) для `renderTimeTag` и sitemap `lastmod` у `/privacy`.
- [`common/templates/time.js`](common/templates/time.js) (`renderTimeTag`) — `<time>` с `datetime` из `date` (`SiteDatetimeInput`) и текстом из `text` или `DD.MM.YYYY`.
- [`test-helpers/privacy-route-tests.js`](test-helpers/privacy-route-tests.js) (`registerPrivacyRouteTests`, `assertPrivacyPolicyPage`) — базовые проверки роута `/privacy` для хостов.
- [`common/templates/sitemap-xml.js`](common/templates/sitemap-xml.js) (`renderSitemap`, `renderSitemapUrl`) — сборка XML sitemap из `SitemapPage[]`.
- [`server/lib/route-dispatcher.js`](server/lib/route-dispatcher.js) (`resolvePathnamePrefix`) — снятие path-префикса (`/manuscript` → `/`, `/manuscript/mad/1` → `/mad/1`).
- [`test-helpers/integration-fixture.js`](test-helpers/integration-fixture.js) (`useIntegrationFixture`, `getIntegrationBuildPages`, `registerMarkupValidationTests`) — shared HTTP-fixture и блок «Разметка» для integration-тестов хостов.
- [`test-helpers/og-markup.js`](test-helpers/og-markup.js) (`validateOgMarkup` / `lintOgMarkup`) — программная проверка Open Graph (без внешних OG-пакетов); `ARTICLE_OGP_PREFIX`; хелперы `assertSingleOgType`, `assertHtmlPrefixIncludes`, `getHtmlPrefixAttribute`, `getOgTypeValues`.

### Changed

- [`config/biome.core.json`](config/biome.core.json): `noSvgWithoutTitle` off для `src/client/icons/**` (CSS-иконки хостов).
- [`server/lib/hyphenate.js`](server/lib/hyphenate.js) (`hyphenateRu`): fallback на nested `hyphen` при git/file pin site-core; тесты перенесены в core.
- [`common/templates/sitemap-xml.js`](common/templates/sitemap-xml.js) (`renderSitemap`) принимает `Iterable<string>` (пути → `loc`/`lastmod` из `getSiteConfig()`) или `SitemapPage[]`; без аргумента — `publicPages`; для URL, оканчивающихся на `/privacy`, `lastmod` — `privacyRevisionDate` (если хост не передал свой).
- [`common/templates/page.js`](common/templates/page.js) (`renderUrlMeta`): служебные пути `/__/…` без `og:url` и `canonical` (как у Metrika).

## [1.1.6] - 2026-06-14

### Added

- [`common/templates/page.js`](common/templates/page.js) (`createRenderPage`): `title` + `heading` в document title; опции `getPageAssetsOptions`, `getHtmlPrefix`, `getUrlMeta`; поля `LayoutData.ogPathname`, `webAppTitle`.
- [`config/nodemon.host.json`](config/nodemon.host.json): `html` в `ext` для хостов с HTML-данными в `app/server/data/`.

### Fixed

- `LayoutData`: убрано хостовое поле `isManuscript` из core — расширение через `src/types/view.d.ts` хоста.

## [1.1.5] - 2026-06-14

### Fixed

- [`tools/resolve-bin.js`](tools/resolve-bin.js) (`resolvePackageDir`): fallback на `${pkgName}/package.json` для CLI-only пакетов без `main`/`exports` (например `@biomejs/biome`); pre-commit `lint-format` на Windows больше не падает с «Cannot resolve biome without shell».

## [1.1.4] - 2026-06-14

### Fixed

- [`tools/upgrade.js`](tools/upgrade.js) (`site-core-upgrade`): распознаёт git pin в формате `github:owner/repo#tag` — не пытается ставить `site-core@latest` из npm registry.
- [`tools/postinstall.js`](tools/postinstall.js), [`tools/upgrade-site-core-pin.js`](tools/upgrade-site-core-pin.js): `restoreRolldownWasmLockfile` после `npm install` — optional `@emnapi/*` для rolldown wasm не выпадают из lockfile на Windows.

## [1.1.3] - 2026-06-14

### Fixed

- [`tools/upgrade.js`](tools/upgrade.js): `BROWSERSLIST_IGNORE_OLD_DATA` при вызове `update-browserslist-db` — убирает ложное «N months old» при уже актуальной npm-версии `caniuse-lite`.

## [1.1.2] - 2026-06-14

### Fixed

- [`tools/vendor-resolver.js`](tools/vendor-resolver.js), [`tools/install-pre-commit.js`](tools/install-pre-commit.js): резолв toolchain-пакетов и `@fastify/pre-commit` через `resolvePackageDir` — работает и при nested `node_modules/site-core`, и при hoisting зависимостей в корень хоста (git pin).
- [`tools/resolve-bin.js`](tools/resolve-bin.js): `resolvePackageDir` ищет корень пакета через `require.resolve(name)`, без subpath `package.json` (у части deps он не экспортируется).

## [1.1.1] - 2026-06-14

### Added

- [`tools/upgrade-site-core-pin.js`](tools/upgrade-site-core-pin.js) — [`tools/upgrade.js`](tools/upgrade.js) (`site-core-upgrade`) поднимает git pin `site-core` и `uses: …/site-core/.github/workflows/…@tag` до latest GitHub Release.

## [1.1.0] - 2026-06-14

### Changed

- **Breaking (CI):** deploy consumer-проекта **по умолчанию** после успешного CI; opt-out — `[no-deploy]` или `[WIP]` в commit message (вместо opt-in `[deploy]`). Обновите `ci.yml` и README хоста по [`config/ci.host.example.yml`](config/ci.host.example.yml) и [`.cursor/rules/workflow-core.mdc`](.cursor/rules/workflow-core.mdc).
- [`config/ci.host.example.yml`](config/ci.host.example.yml): GitHub Pages — deploy через artifact из `host-ci` (`download-artifact` → peaceiris), без повторного `npm ci`/`test`.
- [`config/biome.core.json`](config/biome.core.json): отдельный override для `types/**/*.d.ts` (`noUnusedVariables` и др. off); типы lint-tools — в [`types/tools.d.ts`](types/tools.d.ts), не `@typedef` в `.js`.
- Документация и rules: нейтральные формулировки «consumer-проект» вместо имён конкретных хостов.

### Added

- [`config/github-workflow.schema.json`](config/github-workflow.schema.json) — JSON Schema для `.github/workflows/*.{yml,yaml}`; [`tools/postinstall.js`](tools/postinstall.js) (`site-core-postinstall`) подставляет путь под nested `node_modules/site-core` в `.vscode/settings.json`.
- Рекомендуемое расширение VS Code: `redhat.vscode-yaml`.

### Fixed

- [`test/tools/install-pre-commit.spec.js`](test/tools/install-pre-commit.spec.js): проверка nested `@fastify/pre-commit` через временный каталог, без зависимости от локального пути `efiand.ru`.

## [1.0.2] - 2026-06-14

### Fixed

- [`tools/upgrade.js`](tools/upgrade.js) (`site-core-upgrade`): не вызывает `npm i …@latest` для зависимостей с `git+`, `file:`, `link:`, `workspace:` и другими не-registry specifier'ами (в т.ч. pin `site-core` на хосте).

### Added

- [`test/tools/upgrade.spec.js`](test/tools/upgrade.spec.js) — проверка фильтра registry-зависимостей в [`tools/upgrade.js`](tools/upgrade.js).

## [1.0.1] - 2026-06-14

### Added

- [`tools/check-function-order.js`](tools/check-function-order.js) — проверка алфавитного порядка top-level функций, пустых строк между объявлениями и форматирования JSDoc `@type`.
- [`tools/lint-static-check.js`](tools/lint-static-check.js) — общий шаг `type-check` + `check-function-order` для `site-core-lint` и `npm run lint-static-check`.
- [`test/tools/check-function-order.spec.js`](test/tools/check-function-order.spec.js).
- [`config/htmlvalidate.d.ts`](config/htmlvalidate.d.ts), [`tmp/README.md`](tmp/README.md).

### Changed

- `npm run lint` / `lint-format` в site-core: `lint-static-check` перед Biome.
- [`.cursor/rules/code-style-core.mdc`](.cursor/rules/code-style-core.mdc): уточнения про пустые строки (только между объявлениями функций), JSDoc `@type` vs inline-cast, `@typedef` только при переиспользовании типа.
- Рефакторинг порядка функций и JSDoc в `tools/*`, `server/lib/*`, [`common/templates/page.js`](common/templates/page.js).

### Fixed

- Ложные правки линтера: разрыв шаблонных строк и JSDoc в [`server/lib/db.js`](server/lib/db.js), [`server/lib/dev-middleware.js`](server/lib/dev-middleware.js), [`server/lib/route-dispatcher.js`](server/lib/route-dispatcher.js), [`tools/restore-rolldown-wasm-lockfile.js`](tools/restore-rolldown-wasm-lockfile.js), [`tools/upgrade-github-actions.js`](tools/upgrade-github-actions.js); лишняя пустая строка в [`tools/generate-host-fonts.js`](tools/generate-host-fonts.js).
- [`tools/install-pre-commit.js`](tools/install-pre-commit.js): порядок модуля (CLI после функций), `@type` вместо `@param`/`@returns`.

## [1.0.0] - 2026-06-13

### Added

- Первый релиз shared-пакета: SSR, dev-server, lint/type-check CLI, postinstall, reusable GitHub Actions, миграционные шаблоны для хостов.
