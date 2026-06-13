# Changelog

Формат — [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/), версии — [SemVer](https://semver.org/lang/ru/).

## [1.0.2] - 2026-06-14

### Fixed

- `site-core-upgrade`: не вызывает `npm i …@latest` для зависимостей с `git+`, `file:`, `link:`, `workspace:` и другими не-registry specifier'ами (в т.ч. pin `site-core` на хосте).

### Added

- `test/tools/upgrade.spec.js` — проверка фильтра registry-зависимостей в `tools/upgrade.js`.

## [1.0.1] - 2026-06-14

### Added

- `tools/check-function-order.js` — проверка алфавитного порядка top-level функций, пустых строк между объявлениями и форматирования JSDoc `@type`.
- `tools/lint-static-check.js` — общий шаг `type-check` + `check-function-order` для `site-core-lint` и `npm run lint-static-check`.
- `test/tools/check-function-order.spec.js`.
- `config/htmlvalidate.d.ts`, `tmp/README.md`.

### Changed

- `npm run lint` / `lint-format` в site-core: `lint-static-check` перед Biome.
- Правила в `code-style-core.mdc`: уточнения про пустые строки (только между объявлениями функций), JSDoc `@type` vs inline-cast, `@typedef` только при переиспользовании типа.
- Рефакторинг порядка функций и JSDoc в `tools/*`, `server/lib/*`, `common/templates/page.js`.

### Fixed

- Ложные правки линтера: разрыв шаблонных строк и JSDoc в `db.js`, `dev-middleware.js`, `route-dispatcher.js`, `restore-rolldown-wasm-lockfile.js`, `upgrade-github-actions.js`; лишняя пустая строка в `generate-host-fonts.js`.
- `tools/install-pre-commit.js`: порядок модуля (CLI после функций), `@type` вместо `@param`/`@returns`.

## [1.0.0] - 2026-06-13

### Added

- Первый релиз shared-пакета: SSR, dev-server, lint/type-check CLI, postinstall, reusable GitHub Actions, миграционные шаблоны для хостов.
