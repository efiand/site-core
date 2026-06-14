import assert from 'node:assert/strict';
import { afterEach, describe, test } from 'node:test';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import { getIntegrationBuildPages } from '#core/test-helpers/integration-fixture.js';

describe('Хелперы/integration-fixture', () => {
	afterEach(() => {
		setSiteConfig({ publicPages: [], routes: {} });
	});

	test('getIntegrationBuildPages исключает sitemap.xml по умолчанию', () => {
		setSiteConfig({
			routes: {
				'/': {},
				'/privacy': {},
				'/sitemap.xml': {},
			},
		});

		assert.deepStrictEqual(getIntegrationBuildPages(), ['/', '/privacy']);
	});

	test('getIntegrationBuildPages поддерживает кастомный excludePages', () => {
		setSiteConfig({
			routes: {
				'/': {},
				'/privacy': {},
				'/sitemap.xml': {},
			},
		});

		assert.deepStrictEqual(getIntegrationBuildPages({ excludePages: ['/privacy'] }), ['/', '/sitemap.xml']);
	});
});
