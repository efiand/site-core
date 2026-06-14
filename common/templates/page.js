/// <reference path="../../types/index.d.ts" />

import { fonts as defaultFonts } from '#core/common/generated/fonts.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';
import { renderDocumentTitle } from '#core/common/templates/document-title.js';
import { renderFaviconLinks } from '#core/common/templates/favicon-links.js';
import { renderFontPreloads } from '#core/common/templates/font-preloads.js';
import { renderPageAssets } from '#core/common/templates/page-assets.js';
import { renderYandexMetrika } from '#core/common/templates/yandex-metrika.js';

/** @type {(options: CreateRenderPageOptions) => (data: LayoutData) => Promise<string>} */
function createRenderPage({
	defaultOgImage = '/web-app-manifest-512x512.png',
	defaultOgImageHeight = 512,
	defaultOgImageWidth = 512,
	faviconPrefix: defaultFaviconPrefix = '',
	fonts: fontsOption,
	getHtmlPrefix,
	getPageAssetsOptions,
	getUrlMeta,
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
		ogPathname,
		pageTemplate = '',
		pathname = '',
		title = '',
		webAppTitle,
		...layoutRest
	}) {
		const { baseHost, baseUrl, projectTitle } = getSiteConfig();
		const siteName = baseHost || projectTitle;
		const layoutData = {
			description,
			faviconPrefix,
			heading,
			ogPathname,
			pageTemplate,
			pathname,
			title,
			webAppTitle,
			...layoutRest,
		};
		const documentTitle = renderDocumentTitle([title, pathname === '/' ? '' : heading].filter(Boolean));
		const htmlPrefixValue = getHtmlPrefix ? getHtmlPrefix(layoutData) : htmlPrefix;
		const pageAssetsOptions = getPageAssetsOptions ? getPageAssetsOptions(layoutData) : { pathname };
		const urlMeta = getUrlMeta
			? getUrlMeta(pathname, baseUrl, layoutData)
			: renderUrlMeta(pathname, baseUrl, ogPathname);
		const webAppTitleValue = webAppTitle ?? projectTitle;
		const descriptionTemplate = description
			? /* html */ `
				<meta name="description" content="${description}">
				<meta property="og:description" content="${description}">
			`
			: '';

		return /* html */ `
			<!DOCTYPE html>
			<html lang="${htmlLang}" prefix="${htmlPrefixValue}">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1">
				<meta name="apple-mobile-web-app-title" content="${webAppTitleValue}">
				<meta name="apple-mobile-web-app-capable" content="yes">
				<meta name="mobile-web-app-capable" content="yes">

				<title>${documentTitle}</title>
				${urlMeta}
				<meta property="og:title" content="${documentTitle}">
				<meta property="og:locale" content="ru_RU">
				<meta property="og:type" content="website">
				<meta property="og:site_name" content="${siteName}">
				<meta property="og:image" content="${ogImage}">
				<meta property="og:image:width" content="${ogImageWidth}">
				<meta property="og:image:height" content="${ogImageHeight}">

				${descriptionTemplate}
				${renderPageAssets(pageAssetsOptions)}
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

/** @type {(layoutData: LayoutData, pathname: string, renderLayout: (data: LayoutData) => string) => string} */
function renderBody(layoutData, pathname, renderLayout) {
	return /* html */ `
		<body>
			${renderYandexMetrika({ pathname })}
			${renderLayout(layoutData)}
		</body>
	`;
}

/** @type {(pathname: string, baseUrl: string, ogPathname?: string) => string} */
function renderUrlMeta(pathname, baseUrl, ogPathname) {
	if (!pathname) {
		return /* html */ `<meta name="robots" content="noindex, nofollow">`;
	}

	const ogUrlPath = ogPathname ?? pathname;
	let template = /* html */ `<meta property="og:url" content="${baseUrl}${ogUrlPath}">`;
	if (!pathname.startsWith('/__')) {
		template += /* html */ `<link rel="canonical" href="${baseUrl}${pathname}">`;
	}

	return template;
}

export { createRenderPage };
