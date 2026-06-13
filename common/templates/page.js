/// <reference path="../../types/index.d.ts" />

import { fonts as defaultFonts } from '#core/common/generated/fonts.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';
import { renderDocumentTitle } from '#core/common/templates/document-title.js';
import { renderFaviconLinks } from '#core/common/templates/favicon-links.js';
import { renderFontPreloads } from '#core/common/templates/font-preloads.js';
import { renderPageAssets } from '#core/common/templates/page-assets.js';
import { renderYandexMetrika } from '#core/common/templates/yandex-metrika.js';

/** @type {(pathname: string, baseUrl: string) => string} */
function renderUrlMeta(pathname, baseUrl) {
	if (!pathname) {
		return /* html */ `<meta name="robots" content="noindex, nofollow">`;
	}

	let template = /* html */ `<meta property="og:url" content="${baseUrl}${pathname}">`;
	if (!pathname.startsWith('/__')) {
		template += /* html */ `<link rel="canonical" href="${baseUrl}${pathname}">`;
	}

	return template;
}

/** @type {(layoutData: LayoutData, pathname: string, renderLayout: (data: LayoutData) => string) => string} */
function renderBody(layoutData, pathname, renderLayout) {
	return /* html */ `
		<body>
			${renderYandexMetrika({ pathname })}
			${renderLayout(layoutData)}
		</body>
	`;
}

/** @type {(options: CreateRenderPageOptions) => (data: LayoutData) => Promise<string>} */
function createRenderPage({
	defaultOgImage = '/web-app-manifest-512x512.png',
	defaultOgImageHeight = 512,
	defaultOgImageWidth = 512,
	faviconPrefix: defaultFaviconPrefix = '',
	fonts: fontsOption,
	headExtras = '',
	htmlLang = 'ru',
	htmlPrefix = 'og: http://ogp.me/ns#',
	renderLayout,
}) {
	const fonts = fontsOption ?? defaultFonts;

	return async function renderPage({
		description = getSiteConfig().projectDescription,
		faviconPrefix = defaultFaviconPrefix,
		headTemplate = '',
		heading = '',
		ogImage = defaultOgImage,
		ogImageHeight = defaultOgImageHeight,
		ogImageWidth = defaultOgImageWidth,
		pageTemplate = '',
		pathname = '',
		...layoutRest
	}) {
		const { baseHost, baseUrl, projectTitle } = getSiteConfig();
		const siteName = baseHost || projectTitle;
		const title = renderDocumentTitle([heading].filter(Boolean));
		const layoutData = { description, heading, pageTemplate, pathname, ...layoutRest };
		const descriptionTemplate = description
			? /* html */ `
				<meta name="description" content="${description}">
				<meta property="og:description" content="${description}">
			`
			: '';

		return /* html */ `
			<!DOCTYPE html>
			<html lang="${htmlLang}" prefix="${htmlPrefix}">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<meta name="apple-mobile-web-app-title" content="${projectTitle}">
				<meta name="apple-mobile-web-app-capable" content="yes">
				<meta name="mobile-web-app-capable" content="yes">

				<title>${title}</title>
				${renderUrlMeta(pathname, baseUrl)}
				<meta property="og:title" content="${title}">
				<meta property="og:locale" content="ru_RU">
				<meta property="og:type" content="website">
				<meta property="og:site_name" content="${siteName}">
				<meta property="og:image" content="${ogImage}">
				<meta property="og:image:width" content="${ogImageWidth}">
				<meta property="og:image:height" content="${ogImageHeight}">

				${descriptionTemplate}
				${renderPageAssets({ pathname })}
				${renderFaviconLinks({ faviconPrefix })}
				${renderFontPreloads(fonts)}
				${headExtras}
				${headTemplate}
			</head>

			${renderBody(layoutData, pathname, renderLayout)}
			</html>
		`;
	};
}

export { createRenderPage };
