/// <reference path="../../types/index.d.ts" />

/** @type {(options?: FaviconLinksOptions) => string} */
function renderFaviconLinks({ faviconPrefix = '' } = {}) {
	return /* html */ `
		<link rel="icon" type="image/png" href="${faviconPrefix}/favicon-96x96.png" sizes="96x96">
		<link rel="icon" type="image/svg+xml" href="${faviconPrefix}/favicon.svg">
		<link rel="apple-touch-icon" sizes="180x180" href="${faviconPrefix}/apple-touch-icon.png">
		<link rel="manifest" href="${faviconPrefix}/site.webmanifest">
	`;
}

export { renderFaviconLinks };
