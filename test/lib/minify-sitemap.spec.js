import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { minifySitemap } from '#core/common/lib/minify-sitemap.js';

describe('Общее/minify-sitemap', () => {
	test('Убирает комментарии и схлопывает пробелы', () => {
		const xml = /* xml */ `
		<!-- comment -->
		<urlset>
			<url>
				<loc>https://example.com/</loc>
			</url>
		</urlset>
		`;

		const result = minifySitemap(xml);

		assert.doesNotMatch(result, /<!--/);
		assert.match(result, /<urlset><url><loc>https:\/\/example.com\/<\/loc><\/url><\/urlset>/);
	});
});
