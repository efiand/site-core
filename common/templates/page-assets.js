/// <reference path="../../types/index.d.ts" />

import { buildAssetQuery } from '#core/common/lib/asset-version.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';
import { renderClientEntryScript } from '#core/common/templates/client-entry-script.js';

const DEFAULT_IMPORTMAP = {
	imports: {
		'#client/': '/client/',
		'#common/': '/common/',
		'#core/': '/core/',
	},
};

const DEV_INLINE_SCRIPT = /* js */ `
window.DEV=1;
const eventSource=new EventSource('/dev/watch');
function onMessage({data}){if(data==='reload'){eventSource.removeEventListener('message',onMessage);eventSource.close();window.location.reload();}}
eventSource.addEventListener('message',onMessage);
`.trim();

/** @type {(options?: PageAssetsOptions) => string} */
function renderPageAssets({
	cssEntry = 'main',
	devCssPath = '/client/css/main.css',
	importMap = DEFAULT_IMPORTMAP,
	pathname = '',
} = {}) {
	const { isDev, version } = getSiteConfig();

	if (isDev) {
		return /* html */ `
			<link rel="stylesheet" href="${devCssPath}">
			<script type="importmap">${JSON.stringify(importMap)}</script>
			<script>${DEV_INLINE_SCRIPT}</script>
		`;
	}

	return /* html */ `
		<link rel="stylesheet" href="/bundles/${cssEntry}.css${buildAssetQuery(version.CSS)}">
		${renderClientEntryScript({ pathname })}
	`;
}

export { renderPageAssets };
