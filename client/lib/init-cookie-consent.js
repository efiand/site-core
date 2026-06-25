/// <reference path="../../types/index.d.ts" />

import { clearConsent, readConsent, writeConsent } from '#core/client/lib/cookie-consent-storage.js';
import { initYandexMetrika } from '#core/client/lib/init-yandex-metrika.js';
import {
	COOKIE_CONSENT_BANNER_CLASS,
	COOKIE_CONSENT_SETTINGS_SELECTOR,
	COOKIE_CONSENT_VALUE_ACCEPTED,
	COOKIE_CONSENT_VALUE_REJECTED,
} from '#core/common/lib/cookie-consent-constants.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';
import { isExcludedCookieConsentPath } from '#core/common/lib/yandex-metrika-guard.js';

/** @type {(banner: ParentNode) => void} */
function bindCookieConsentBanner(banner) {
	const acceptButton = banner.querySelector('[data-cookie-consent-accept]');
	const rejectButton = banner.querySelector('[data-cookie-consent-reject]');

	if (!acceptButton || !rejectButton) {
		return;
	}

	acceptButton.addEventListener('click', () => {
		writeConsent(COOKIE_CONSENT_VALUE_ACCEPTED);
		hideCookieConsentBanner();
		setCookieConsentSettingsVisible(true);
		initYandexMetrika({ delayMs: 0 });
	});

	rejectButton.addEventListener('click', () => {
		writeConsent(COOKIE_CONSENT_VALUE_REJECTED);
		hideCookieConsentBanner();
		setCookieConsentSettingsVisible(true);
	});
}

/** @type {() => void} */
function bindCookieConsentSettings() {
	for (const control of getCookieConsentSettingsControls()) {
		if (control.dataset.cookieConsentBound) {
			continue;
		}

		control.dataset.cookieConsentBound = '1';
		control.addEventListener('click', reopenCookieConsent);
	}
}

/** @type {() => void} */
function cancelCookieConsentBannerReveal() {
	const timeoutId = window.__siteCoreCookieConsentRevealTimeout;

	if (timeoutId) {
		window.clearTimeout(timeoutId);
		window.__siteCoreCookieConsentRevealTimeout = 0;
	}
}

/** @type {() => HTMLElement | null} */
function getCookieConsentBanner() {
	return document.querySelector(`.${COOKIE_CONSENT_BANNER_CLASS}`);
}

/** @type {() => HTMLElement[]} */
function getCookieConsentSettingsControls() {
	return /** @type {HTMLElement[]} */ ([...document.querySelectorAll(COOKIE_CONSENT_SETTINGS_SELECTOR)]);
}

/** @type {() => void} */
function hideCookieConsentBanner() {
	cancelCookieConsentBannerReveal();
	getCookieConsentBanner()?.setAttribute('hidden', '');
}

/** @type {() => void} */
function initCookieConsent() {
	if (!getSiteConfig().yandexMetrikaId) {
		hideCookieConsentBanner();
		return;
	}

	const consent = readConsent();

	if (isExcludedCookieConsentPath(window.location.pathname)) {
		hideCookieConsentBanner();

		if (consent === COOKIE_CONSENT_VALUE_ACCEPTED) {
			initYandexMetrika({ delayMs: 0 });
		}

		return;
	}

	bindCookieConsentSettings();

	if (consent === COOKIE_CONSENT_VALUE_ACCEPTED) {
		hideCookieConsentBanner();
		setCookieConsentSettingsVisible(true);
		initYandexMetrika({ delayMs: 0 });
		return;
	}

	if (consent === COOKIE_CONSENT_VALUE_REJECTED) {
		hideCookieConsentBanner();
		setCookieConsentSettingsVisible(true);
		return;
	}

	const banner = getCookieConsentBanner();
	if (banner?.hasAttribute('hidden') && !banner.dataset.cookieConsentRevealScheduled) {
		showCookieConsentBanner();
	}

	if (banner) {
		bindCookieConsentBanner(banner);
	}

	setCookieConsentSettingsVisible(false);
}

/** @type {() => void} */
function reopenCookieConsent() {
	clearConsent();
	showCookieConsentBanner({ immediate: true });
	setCookieConsentSettingsVisible(false);

	const banner = getCookieConsentBanner();
	if (banner) {
		bindCookieConsentBanner(banner);
	}
}

/** @type {(banner: HTMLElement) => number} */
function resolveBannerShowDelayMs(banner) {
	const showDelayMs = Number(banner.dataset.cookieConsentShowDelay) || 0;

	if (showDelayMs <= 0) {
		return 0;
	}

	const reducedDelayMs = Number(banner.dataset.cookieConsentShowDelayReduced);

	try {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && reducedDelayMs > 0) {
			return reducedDelayMs;
		}
	} catch {}

	return showDelayMs;
}

/** @type {(visible: boolean) => void} */
function setCookieConsentSettingsVisible(visible) {
	for (const control of getCookieConsentSettingsControls()) {
		if (visible) {
			control.removeAttribute('hidden');
			continue;
		}

		control.setAttribute('hidden', '');
	}
}

/** @type {(options?: { immediate?: boolean }) => void} */
function showCookieConsentBanner({ immediate = false } = {}) {
	const banner = getCookieConsentBanner();
	if (!banner) {
		return;
	}

	cancelCookieConsentBannerReveal();
	delete banner.dataset.cookieConsentRevealScheduled;

	if (immediate) {
		banner.removeAttribute('hidden');
		return;
	}

	const delayMs = resolveBannerShowDelayMs(banner);

	if (delayMs <= 0) {
		banner.removeAttribute('hidden');
		return;
	}

	banner.dataset.cookieConsentRevealScheduled = '1';
	window.__siteCoreCookieConsentRevealTimeout = window.setTimeout(() => {
		window.__siteCoreCookieConsentRevealTimeout = 0;
		delete banner.dataset.cookieConsentRevealScheduled;
		banner.removeAttribute('hidden');
	}, delayMs);
}

export { initCookieConsent };
