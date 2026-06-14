/// <reference path="../../types/index.d.ts" />

import { getSiteConfig } from '#core/common/lib/site-config.js';

/** @type {(baseUrl: string, projectTitle: string, authorName: string, series: ArticleSeriesItem[]) => { '@graph': object[] }} */
function buildArticleHomeGraph(baseUrl, projectTitle, authorName, series) {
	const homeUrl = `${baseUrl}/`;
	const authorId = `${baseUrl}/#author`;
	const siteId = `${baseUrl}/#website`;

	return {
		'@graph': [
			{
				'@id': siteId,
				'@type': 'WebSite',
				inLanguage: 'ru',
				name: projectTitle,
				publisher: { '@id': authorId },
				url: homeUrl,
			},
			{
				'@id': `${baseUrl}/#webpage`,
				'@type': 'WebPage',
				about: { '@id': authorId },
				inLanguage: 'ru',
				isPartOf: { '@id': siteId },
				name: `${authorName} | ${projectTitle}`,
				url: homeUrl,
			},
			{
				'@id': authorId,
				'@type': 'Person',
				name: authorName,
				url: homeUrl,
				worksFor: { '@id': siteId },
			},
			...series.map(({ id, title }) => {
				const seriesId = `${baseUrl}/#${id}`;

				return {
					'@id': seriesId,
					'@type': 'CreativeWorkSeries',
					author: { '@id': authorId },
					name: title,
					url: seriesId,
				};
			}),
		],
	};
}

/** @type {(authorName: string) => { '@type': string; name: string }} */
function buildAuthorNode(authorName) {
	return {
		'@type': 'Person',
		name: authorName,
	};
}

/** @type {(data: LayoutData) => string} */
function renderArticleHead(data) {
	const { articleSeries, articleWork, pathname = '', publishedTime, title = '' } = data;

	if (articleWork) {
		return renderArticleWorkHead(articleWork, pathname, publishedTime, title);
	}

	if (pathname === '/' && articleSeries?.length) {
		return renderArticleHomeHead(articleSeries);
	}

	return '';
}

/** @type {(series: ArticleSeriesItem[]) => string} */
function renderArticleHomeHead(series) {
	const { author, baseUrl, projectTitle } = getSiteConfig();
	const schema = {
		'@context': 'https://schema.org',
		...buildArticleHomeGraph(baseUrl, projectTitle, author, series),
	};

	return /* html */ `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

/** @type {(work: ArticleWorkMeta, pathname: string, publishedTime: string | undefined, title: string) => string} */
function renderArticleWorkHead(work, pathname, publishedTime, title) {
	const { author, baseUrl } = getSiteConfig();
	const { bookId, bookTitle, copyrightYear, createdTime } = work;
	const bookFragmentId = `${baseUrl}/#${bookId}`;
	const url = `${baseUrl}${pathname}`;
	const schema = {
		'@context': 'https://schema.org',
		'@id': `${url}#work`,
		'@type': 'CreativeWork',
		author: buildAuthorNode(author),
		copyrightHolder: {
			'@type': 'Person',
			name: author,
		},
		copyrightYear,
		dateCreated: createdTime,
		...(publishedTime ? { datePublished: publishedTime } : {}),
		headline: title,
		inLanguage: 'ru',
		isPartOf: {
			'@id': bookFragmentId,
			'@type': 'CreativeWorkSeries',
			name: bookTitle,
			url: bookFragmentId,
		},
		mainEntityOfPage: {
			'@id': url,
			'@type': 'WebPage',
		},
		name: title,
		url,
	};

	return /* html */ `
		<meta property="article:publisher" content="${baseUrl}/#author">
		<meta name="copyright" content="© ${author}, ${copyrightYear}">
		<script type="application/ld+json">${JSON.stringify(schema)}</script>
	`;
}

export { renderArticleHead };
