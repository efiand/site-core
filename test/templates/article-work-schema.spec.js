import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import { renderArticleHead } from '#core/common/templates/article-work-schema.js';

describe('Общее/article-work-schema', () => {
	test('renderArticleHead пустой без articleWork и articleSeries', () => {
		setSiteConfig({
			author: 'Автор',
			baseHost: 'example.com',
			projectTitle: 'example',
		});

		assert.equal(renderArticleHead({ pathname: '/' }), '');
	});

	test('renderArticleHead рендерит home graph', () => {
		setSiteConfig({
			author: 'Автор',
			baseHost: 'example.com',
			projectTitle: 'example',
		});

		const markup = renderArticleHead({
			articleSeries: [{ id: 'mad', title: 'Стихотворения' }],
			pathname: '/',
		});
		const match = markup.match(/<script type="application\/ld\+json">(.+)<\/script>/s);
		const schema = JSON.parse(match?.[1] ?? '{}');

		assert.strictEqual(schema['@context'], 'https://schema.org');
		assert.ok(schema['@graph'].some((/** @type {{ '@type'?: string }} */ node) => node['@type'] === 'WebSite'));
	});

	test('renderArticleHead рендерит work schema с dateCreated и datePublished', () => {
		setSiteConfig({
			author: 'Автор',
			baseHost: 'example.com',
			projectTitle: 'example',
		});

		const markup = renderArticleHead({
			articleWork: {
				bookId: 'mad',
				bookTitle: 'Стихотворения',
				copyrightYear: '2003',
				createdTime: '2003-04-19',
			},
			pathname: '/mad/1',
			publishedTime: '2026-06-14T12:00:00.000Z',
			title: 'Прекрасная пора',
		});
		const match = markup.match(/<script type="application\/ld\+json">(.+)<\/script>/s);
		const schema = JSON.parse(match?.[1] ?? '{}');

		assert.strictEqual(schema['@type'], 'CreativeWork');
		assert.strictEqual(schema.dateCreated, '2003-04-19');
		assert.strictEqual(schema.datePublished, '2026-06-14T12:00:00.000Z');
		assert.match(markup, /property="article:publisher" content="https:\/\/example.com\/#author"/);
		assert.match(markup, /name="copyright" content="© Автор, 2003"/);
	});
});
