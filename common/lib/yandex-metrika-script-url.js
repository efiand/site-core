/// <reference path="../../types/index.d.ts" />

import { buildAssetQuery } from '#core/common/lib/asset-version.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';

const MAIN_DEV_SRC = '/client/entries/main.js';
const MAIN_PROD_SRC = '/bundles/main.js';

/** @type {(options?: { assetVersion?: number; isDev?: boolean }) => string} */
function buildYandexMetrikaScriptUrl({ assetVersion, isDev = false } = {}) {
	if (isDev) {
		return MAIN_DEV_SRC;
	}

	const jsVersion = assetVersion ?? getSiteConfig().version.JS;

	return `${MAIN_PROD_SRC}${buildAssetQuery(jsVersion)}`;
}

export { buildYandexMetrikaScriptUrl };
