/// <reference path="../types/index.d.ts" />

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { createRouteParams } from '#core/test-helpers/route-params.js';

/** @type {(page: LayoutData | undefined, options?: PrivacyRouteTestsOptions) => void} */
function assertPrivacyPolicyPage(page, { email, hasCookieConsent = false, hasEmail = false, patterns = [] } = {}) {
	const heading = page?.heading ?? '';
	const markup = `${heading}${page?.pageTemplate ?? ''}`.replaceAll('\u00a0', ' ');
	const expectedEmail = email;

	assert.match(heading, /Политика обработки персональных данных/);
	assert.match(markup, /152-ФЗ/);
	assert.match(markup, /серверн(?:ые|ых) журнал/);
	assert.match(markup, /карт(?:у|а) кликов и запись сессий/);
	assert.match(markup, /Правовые основания обработки/);
	assert.match(markup, /Сроки хранения данных/);
	assert.match(markup, /datetime="\d{4}-\d{2}-\d{2}"/);

	if (expectedEmail) {
		assert.ok(markup.includes(expectedEmail), `ожидался email ${expectedEmail}`);
	}

	if (hasEmail) {
		assert.match(markup, /mailto:/);
		assert.match(markup, /не\s+содержит форм/);
	}

	if (hasCookieConsent) {
		assert.match(markup, /cookie-баннер|cookie баннер/i);
		assert.match(markup, /согласи[ея].*cookie|cookie.*согласи/i);
		assert.match(markup, /только после|после согласия|после принятия/i);
	}

	for (const pattern of patterns) {
		assert.match(markup, pattern);
	}
}

/** @type {(privacyRoute: Route, options?: PrivacyRouteTestsOptions) => void} */
function registerPrivacyRouteTests(privacyRoute, options = {}) {
	describe('Маршруты/privacy', () => {
		test('Возвращает стабильный контент между запросами', async () => {
			const first = await privacyRoute.GET(createRouteParams());
			const second = await privacyRoute.GET(createRouteParams());

			assert.strictEqual(first.page?.pageTemplate, second.page?.pageTemplate);
		});

		test('Содержит базовые разделы политики', async () => {
			const { page } = await privacyRoute.GET(createRouteParams());

			assertPrivacyPolicyPage(page, options);
		});
	});
}

export { assertPrivacyPolicyPage, registerPrivacyRouteTests };
