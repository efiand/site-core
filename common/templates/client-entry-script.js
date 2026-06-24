import { buildAssetQuery } from '#core/common/lib/asset-version.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';

const MAIN_DEV_SRC = '/client/entries/main.js';
const MAIN_PROD_SRC = '/bundles/main.js';

/** @type {() => string} */
function buildClientEntryScriptUrl() {
	const { isDev, version } = getSiteConfig();

	if (isDev) {
		return MAIN_DEV_SRC;
	}

	return `${MAIN_PROD_SRC}${buildAssetQuery(version.JS)}`;
}

/** @type {(options?: ClientEntryScriptOptions) => string} */
function renderClientEntryScript({ pathname = '' } = {}) {
	if (pathname.startsWith('/__')) {
		return '';
	}

	const src = buildClientEntryScriptUrl();

	return /* html */ `<script type="module" src="${src}" defer></script>`;
}

export { renderClientEntryScript };
