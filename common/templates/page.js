/// <reference path="../../types/index.d.ts" />

import { fonts as defaultFonts } from '#core/common/generated/fonts.js';
import {
	ARTICLE_OGP_PREFIX,
	DEFAULT_HTML_PREFIX,
	OGP_PREFIX_ARTICLE,
	OGP_PREFIX_OG,
	buildHtmlPrefix,
} from '#core/common/lib/html-prefix.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';
import { renderArticleHead } from '#core/common/templates/article-work-schema.js';
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
	htmlPrefix = DEFAULT_HTML_PREFIX,
	renderLayout,
	renderPageAssetsFn,
}) {
	const fonts = fontsOption ?? defaultFonts;

	return async function renderPage({
		author,
		description = getSiteConfig().projectDescription,
		faviconPrefix = defaultFaviconPrefix,
		headTemplate = '',
		heading = '',
		articleSeries,
		articleWork,
		ogImage = defaultOgImage,
		ogImageHeight = defaultOgImageHeight,
		ogImageWidth = defaultOgImageWidth,
		ogPathname,
		ogType = 'website',
		pageTemplate = '',
		pathname = '',
		publishedTime,
		title = '',
		webAppTitle,
		...layoutRest
	}) {
		const { author: configAuthor, baseHost, baseUrl, projectTitle } = getSiteConfig();
		const authorValue = author ?? configAuthor;
		const siteName = baseHost || projectTitle;
		const layoutData = {
			articleSeries,
			articleWork,
			author: authorValue,
			description,
			faviconPrefix,
			heading,
			ogPathname,
			ogType,
			pageTemplate,
			pathname,
			publishedTime,
			title,
			webAppTitle,
			...layoutRest,
		};
		const documentTitle = renderDocumentTitle([title, pathname === '/' ? '' : heading].filter(Boolean));
		const htmlPrefixRaw = getHtmlPrefix ? getHtmlPrefix(layoutData) : htmlPrefix;
		const htmlPrefixValue = ensureArticleHtmlPrefix(htmlPrefixRaw, ogType);
		const pageAssetsOptions = getPageAssetsOptions ? getPageAssetsOptions(layoutData) : { pathname };
		const urlMeta = getUrlMeta
			? getUrlMeta(pathname, baseUrl, layoutData)
			: renderUrlMeta(pathname, baseUrl, ogPathname);
		const webAppTitleValue = webAppTitle ?? projectTitle;
		const authorMeta = renderAuthorMeta(authorValue, baseUrl, ogType, publishedTime);
		const articleHead = renderArticleHead(layoutData);
		const descriptionTemplate = description
			? /* html */ `
				<meta name="description" content="${description}">
				<meta property="og:description" content="${description}">
			`
			: '';
		const pageAssetsMarkup = renderPageAssetsFn
			? await renderPageAssetsFn(pageAssetsOptions)
			: renderPageAssets(pageAssetsOptions);

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
				<meta property="og:type" content="${ogType}">
				<meta property="og:site_name" content="${siteName}">
				<meta property="og:image" content="${ogImage}">
				<meta property="og:image:width" content="${ogImageWidth}">
				<meta property="og:image:height" content="${ogImageHeight}">

				${descriptionTemplate}
				${authorMeta}
				${articleHead}
				${pageAssetsMarkup}
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

/** @type {(prefix: string, ogType: string) => string} */
function ensureArticleHtmlPrefix(prefix, ogType) {
	if (ogType !== 'article' || prefix.includes(ARTICLE_OGP_PREFIX)) {
		return prefix;
	}

	return buildHtmlPrefix([OGP_PREFIX_OG, OGP_PREFIX_ARTICLE]);
}

/** @type {(author: string, baseUrl: string, ogType: string, publishedTime?: string) => string} */
function renderAuthorMeta(author, baseUrl, ogType, publishedTime) {
	if (!author) {
		return '';
	}

	const articleAuthor = baseUrl ? `${baseUrl}/#author` : author;
	const authorTemplate = /* html */ `<meta name="author" content="${author}">`;

	if (ogType !== 'article') {
		return authorTemplate;
	}

	const publishedTimeTemplate = publishedTime
		? /* html */ `
		<meta property="article:published_time" content="${publishedTime}">`
		: '';

	return /* html */ `
		${authorTemplate}
		<meta property="article:author" content="${articleAuthor}">${publishedTimeTemplate}
	`;
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

	if (pathname.startsWith('/__')) {
		return '';
	}

	const ogUrlPath = ogPathname ?? pathname;

	return /* html */ `
		<meta property="og:url" content="${baseUrl}${ogUrlPath}">
		<link rel="canonical" href="${baseUrl}${pathname}">
	`;
}

export { createRenderPage };
