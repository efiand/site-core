// @ts-nocheck
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { Window } from 'happy-dom';
import { readConsent } from '#core/client/lib/cookie-consent-storage.js';
import { initCookieConsent } from '#core/client/lib/init-cookie-consent.js';
import {
	COOKIE_CONSENT_COOKIE_NAME,
	COOKIE_CONSENT_VALUE_ACCEPTED,
} from '#core/common/lib/cookie-consent-constants.js';
import { setSiteConfig } from '#core/common/lib/site-config.js';

/** @type {Map<string, string>} */
let cookies = new Map();

/** @type {() => void} */
function installCookieMock() {
	Object.defineProperty(globalThis.document, 'cookie', {
		configurable: true,
		get() {
			return [...cookies.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
		},
		set(value) {
			const [pair, ...attributes] = value.split(';');
			const [name, cookieValue = ''] = pair.trim().split('=');
			const maxAgeAttribute = attributes.find((attribute) => attribute.trim().startsWith('max-age='));
			const maxAge = maxAgeAttribute ? Number(maxAgeAttribute.trim().slice('max-age='.length)) : undefined;

			if (!cookieValue || maxAge === 0) {
				cookies.delete(name);
				return;
			}

			cookies.set(name, cookieValue);
		},
	});
}

describe('Клиент/init-cookie-consent', () => {
	beforeEach(() => {
		cookies = new Map();
		const window = new Window({
			settings: {
				disableJavaScriptFileLoading: true,
				handleDisabledFileLoadingAsSuccess: true,
			},
		});
		globalThis.window = window;
		globalThis.document = window.document;
		installCookieMock();
		document.body.innerHTML = /* html */ `
			<div class="cookie-consent">
				<button type="button" data-cookie-consent-accept>Принять</button>
				<button type="button" data-cookie-consent-reject>Отклонить</button>
			</div>
			<button type="button" data-cookie-consent-settings hidden>Настройки cookie</button>
		`;
		setSiteConfig({ yandexMetrikaId: 99938263 });
	});

	afterEach(() => {
		delete process.env.DEV;
		delete globalThis.window;
		delete globalThis.document;
		setSiteConfig({ yandexMetrikaId: 0 });
	});

	test('initCookieConsent без id счётчика не загружает tag.js', () => {
		process.env.DEV = '1';
		setSiteConfig({ yandexMetrikaId: 99938263 });

		initCookieConsent();

		assert.equal(globalThis.document.querySelectorAll('script[src*="mc.yandex.ru"]').length, 0);
	});

	test('accept загружает Metrika', async () => {
		initCookieConsent();

		globalThis.document.querySelector('[data-cookie-consent-accept]').click();
		await new Promise((resolve) => setTimeout(resolve, 0));

		assert.equal(cookies.get(COOKIE_CONSENT_COOKIE_NAME), COOKIE_CONSENT_VALUE_ACCEPTED);
		assert.equal(globalThis.document.querySelectorAll('script[src*="mc.yandex.ru"]').length, 1);
		assert.equal(document.querySelector('[data-cookie-consent-settings]')?.hidden, false);
	});

	test('showDelayMs откладывает показ баннера', async () => {
		document.body.innerHTML = /* html */ `
			<div class="cookie-consent" hidden data-cookie-consent-show-delay="100">
				<button type="button" data-cookie-consent-accept>Принять</button>
				<button type="button" data-cookie-consent-reject>Отклонить</button>
			</div>
			<button type="button" data-cookie-consent-settings hidden>Настройки cookie</button>
		`;

		initCookieConsent();

		assert.ok(document.querySelector('.cookie-consent')?.hasAttribute('hidden'));

		await new Promise((resolve) => setTimeout(resolve, 120));

		assert.equal(document.querySelector('.cookie-consent')?.hasAttribute('hidden'), false);
	});

	test('reject не загружает Metrika', () => {
		initCookieConsent();

		globalThis.document.querySelector('[data-cookie-consent-reject]').click();

		assert.equal(cookies.get(COOKIE_CONSENT_COOKIE_NAME), 'rejected');
		assert.equal(globalThis.document.querySelectorAll('script[src*="mc.yandex.ru"]').length, 0);
	});

	test('повторный визит с accepted не показывает баннер и открывает настройки', async () => {
		// biome-ignore lint/suspicious/noDocumentCookie: cookie mock in test
		document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${COOKIE_CONSENT_VALUE_ACCEPTED}`;

		assert.equal(readConsent(), COOKIE_CONSENT_VALUE_ACCEPTED);

		initCookieConsent();
		await new Promise((resolve) => setTimeout(resolve, 10));

		assert.ok(document.querySelector('.cookie-consent')?.hasAttribute('hidden'));
		assert.equal(document.querySelector('[data-cookie-consent-settings]')?.hidden, false);
	});

	test('excludePathnamePrefixes скрывает UI, но загружает Metrika при accepted', async () => {
		setSiteConfig({
			cookieConsent: { excludePathnamePrefixes: ['/manuscript'] },
			yandexMetrikaId: 99938263,
		});
		// biome-ignore lint/suspicious/noDocumentCookie: cookie mock in test
		document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${COOKIE_CONSENT_VALUE_ACCEPTED}`;
		Object.defineProperty(window.location, 'pathname', {
			configurable: true,
			value: '/manuscript/mad/1',
		});

		initCookieConsent();
		await new Promise((resolve) => setTimeout(resolve, 0));

		assert.ok(document.querySelector('.cookie-consent')?.hasAttribute('hidden'));
		assert.equal(typeof window.ym, 'function');
	});

	test('excludePathnamePrefixes без consent не показывает баннер и не загружает Metrika', () => {
		setSiteConfig({
			cookieConsent: { excludePathnamePrefixes: ['/manuscript'] },
			yandexMetrikaId: 99938263,
		});
		Object.defineProperty(window.location, 'pathname', {
			configurable: true,
			value: '/manuscript/mad/1',
		});

		initCookieConsent();

		assert.ok(document.querySelector('.cookie-consent')?.hasAttribute('hidden'));
		assert.equal(globalThis.document.querySelectorAll('script[src*="mc.yandex.ru"]').length, 0);
	});
});
