import { getSiteConfig } from '#core/common/lib/site-config.js';
import { shouldIncludeYandexMetrika } from '#core/common/lib/yandex-metrika-guard.js';
import { buildYandexMetrikaScriptUrl } from '#core/common/lib/yandex-metrika-script-url.js';

/** @type {(options?: YandexMetrikaScriptOptions) => string} */
function renderYandexMetrikaScript({ isDev = getSiteConfig().isDev, pathname = '' } = {}) {
	if (!shouldIncludeYandexMetrika({ pathname })) {
		return '';
	}

	const src = buildYandexMetrikaScriptUrl({ isDev });

	return /* html */ `<script type="module" src="${src}" defer></script>`;
}

export { renderYandexMetrikaScript };
