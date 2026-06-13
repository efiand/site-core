import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { getEmailLink } from '#core/common/lib/get-email-link.js';
import { setSiteConfig } from '#core/common/lib/site-config.js';

const TEST_EMAIL = 'hello@example.com';

describe('Общее/get-email-link', () => {
	beforeEach(() => {
		setSiteConfig({ email: TEST_EMAIL });
	});

	afterEach(() => {
		setSiteConfig({ email: '', routes: {} });
	});

	test('Берёт email из site config по умолчанию', () => {
		assert.strictEqual(getEmailLink({ subject: 'Hello' }), 'mailto:hello@example.com?subject=Hello');
	});

	test('Падает, если email нет ни в params, ни в config', () => {
		setSiteConfig({ email: '' });

		assert.throws(() => getEmailLink({ subject: 'Hello' }), /email is required/);
	});

	test('Собирает mailto только с subject (%20 вместо +)', () => {
		const result = getEmailLink({
			email: TEST_EMAIL,
			subject: 'Hello world',
		});

		assert.strictEqual(result, 'mailto:hello@example.com?subject=Hello%20world');
	});

	test('Кодирует unicode и кавычки', () => {
		const result = getEmailLink({
			email: TEST_EMAIL,
			subject: 'Отзыв на произведение «Тест»',
		});

		assert.strictEqual(
			result,
			'mailto:hello@example.com?subject=%D0%9E%D1%82%D0%B7%D1%8B%D0%B2%20%D0%BD%D0%B0%20%D0%BF%D1%80%D0%BE%D0%B8%D0%B7%D0%B2%D0%B5%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5%20%C2%AB%D0%A2%D0%B5%D1%81%D1%82%C2%BB',
		);
	});

	test('Добавляет body и кодирует переносы строк', () => {
		const result = getEmailLink({
			body: 'Line 1\nLine 2',
			email: TEST_EMAIL,
			subject: 'Test',
		});

		assert.strictEqual(result, 'mailto:hello@example.com?subject=Test&body=Line%201%0ALine%202');
	});

	test('Кодирует спецсимволы URL (&, ?, =)', () => {
		const result = getEmailLink({
			body: 'a=1&b=2',
			email: TEST_EMAIL,
			subject: 'Test & check?',
		});

		assert.strictEqual(result, 'mailto:hello@example.com?subject=Test%20%26%20check%3F&body=a%3D1%26b%3D2');
	});

	test('Поддерживает emoji и нелатиницу', () => {
		const result = getEmailLink({
			email: TEST_EMAIL,
			subject: 'Hello 👋 世界',
		});

		assert.strictEqual(result, 'mailto:hello@example.com?subject=Hello%20%F0%9F%91%8B%20%E4%B8%96%E7%95%8C');
	});

	test('Принимает кастомный email', () => {
		const result = getEmailLink({
			email: 'test@example.com',
			subject: 'Hello',
		});

		assert.strictEqual(result, 'mailto:test@example.com?subject=Hello');
	});

	test('Не добавляет body, если undefined', () => {
		const result = getEmailLink({
			body: undefined,
			email: TEST_EMAIL,
			subject: 'Hello',
		});

		assert.strictEqual(result, 'mailto:hello@example.com?subject=Hello');
	});

	test('Не добавляет body при пустой строке', () => {
		const result = getEmailLink({
			body: '',
			email: TEST_EMAIL,
			subject: 'Hello',
		});

		assert.strictEqual(result, 'mailto:hello@example.com?subject=Hello');
	});

	test('Порядок параметров стабилен (сначала subject, потом body)', () => {
		const result = getEmailLink({
			body: 'B',
			email: TEST_EMAIL,
			subject: 'S',
		});

		assert.strictEqual(result, 'mailto:hello@example.com?subject=S&body=B');
	});
});
