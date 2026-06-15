import { getSiteConfig } from '#core/common/lib/site-config.js';
import { renderPageAssets } from '#core/common/templates/page-assets.js';
import { renderYandexMetrikaInlineHead } from '#core/common/templates/yandex-metrika-inline.js';
import { getCss, getJs } from '#core/server/lib/inline-bundle.js';

/**
 * Фабрика inline-ассетов для `createRenderPage({ renderPageAssetsFn })`.
 *
 * @type {(options: CreateRenderInlinePageAssetsOptions) => RenderPageAssetsFn}
 */
function createRenderInlinePageAssets({
	cssEntry = 'main.css',
	cwd = process.cwd(),
	includeInlineMetrika = true,
	jsEntry = 'entries/main.js',
} = {}) {
	let cssCache = '';
	let jsCache = '';

	return async function renderInlinePageAssets(pageAssetsOptions = {}) {
		const { isDev } = getSiteConfig();

		if (isDev) {
			return renderPageAssets(pageAssetsOptions);
		}

		if (!cssCache) {
			cssCache = await getCss(cssEntry, { cwd });
		}

		if (!jsCache) {
			jsCache = await getJs(jsEntry, { cwd });
		}

		const metrikaTemplate = includeInlineMetrika
			? renderYandexMetrikaInlineHead({ pathname: pageAssetsOptions.pathname })
			: '';

		return /* html */ `
			<style>${cssCache}</style>
			<script type="module">${jsCache}</script>
			${metrikaTemplate}
		`;
	};
}

export { createRenderInlinePageAssets };
