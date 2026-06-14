import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { setSiteConfig } from '#core/common/lib/site-config.js';
import { assertPrivacyPolicyPage } from '#core/test-helpers/privacy-route-tests.js';

describe('Test-helpers/privacy-route-tests', () => {
	test('assertPrivacyPolicyPage проверяет базовый набор', () => {
		setSiteConfig({ email: 'operator@example.com' });

		assertPrivacyPolicyPage(
			{
				heading: 'Политика обработки персональных данных',
				pageTemplate: /* html */ `
					<p>Сайт не содержит форм сбора персональных данных.</p>
					<p>mailto: operator@example.com</p>
					<p>152-ФЗ серверные журналы карту кликов и запись сессий</p>
					<h2>4. Правовые основания обработки</h2>
					<h2>6. Сроки хранения данных</h2>
					<time datetime="2026-01-01"></time>
					<p>project phrase</p>
				`,
			},
			{ hasEmail: true, patterns: [/project phrase/] },
		);
	});

	test('assertPrivacyPolicyPage падает без обязательных разделов', () => {
		assert.throws(() => {
			assertPrivacyPolicyPage({ heading: 'Политика обработки персональных данных', pageTemplate: '' });
		}, assert.AssertionError);
	});
});
