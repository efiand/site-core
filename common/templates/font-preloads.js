/// <reference path="../../types/index.d.ts" />

const FONT_PRELOAD_PATH = '/fonts/';

/** @type {(fonts?: Iterable<string>) => string} */
function renderFontPreloads(fonts = []) {
	let template = '';

	for (const filename of fonts) {
		template += /* html */ `
			<link href="${FONT_PRELOAD_PATH}${filename}" rel="preload" as="font" type="font/woff2" crossorigin="anonymous">
		`;
	}

	return template;
}

export { renderFontPreloads };
