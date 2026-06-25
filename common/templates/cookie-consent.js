import { COOKIE_CONSENT_BANNER_CLASS, COOKIE_CONSENT_COOKIE_NAME } from '#core/common/lib/cookie-consent-constants.js';
import { resolveCookieConsentShowDelay } from '#core/common/lib/cookie-consent-show-delay.js';
import { getCookieConsentTexts } from '#core/common/lib/cookie-consent-texts.js';
import { getSiteConfig } from '#core/common/lib/site-config.js';
import { shouldIncludeYandexMetrika } from '#core/common/lib/yandex-metrika-guard.js';

/** @type {(options?: Pick<YandexMetrikaOptions, 'pathname'>) => string} */
function renderCookieConsent({ pathname = '' } = {}) {
	if (!shouldIncludeYandexMetrika({ pathname })) {
		return '';
	}

	const { cookieConsent = {} } = getSiteConfig();
	const cookieName = cookieConsent.cookieName ?? COOKIE_CONSENT_COOKIE_NAME;
	const { accept, banner, privacyLink, reject } = getCookieConsentTexts();
	const bannerAttributes = renderCookieConsentBannerAttributes(pathname);

	return /* html */ `
		${renderCookieConsentRevealScript(cookieName)}
		<div class="${COOKIE_CONSENT_BANNER_CLASS}" hidden role="dialog" aria-live="polite" aria-label="Согласие на использование cookies"${bannerAttributes ? ` ${bannerAttributes}` : ''}>
			<p class="cookie-consent__text">
				${banner}
				<a class="cookie-consent__link" href="/privacy">${privacyLink}</a>.
			</p>
			<div class="cookie-consent__actions">
				<button class="cookie-consent__button" type="button" data-cookie-consent-accept>${accept}</button>
				<button
					class="cookie-consent__button cookie-consent__button--reject"
					type="button"
					data-cookie-consent-reject
				>${reject}</button>
			</div>
		</div>
	`;
}

/** @type {(pathname?: string) => string} */
function renderCookieConsentBannerAttributes(pathname = '') {
	const { showDelayMs, showDelayMsReducedMotion } = resolveCookieConsentShowDelay(pathname);

	if (showDelayMs <= 0) {
		return '';
	}

	const attributes = [`data-cookie-consent-show-delay="${showDelayMs}"`];

	if (showDelayMsReducedMotion > 0) {
		attributes.push(`data-cookie-consent-show-delay-reduced="${showDelayMsReducedMotion}"`);
	}

	return attributes.join(' ');
}

/** @type {(cookieName?: string) => string} */
function renderCookieConsentRevealScript(cookieName = COOKIE_CONSENT_COOKIE_NAME) {
	return /* html */ `
		<script>
			try {
				if (!document.cookie.split('; ').some((item) => item.startsWith('${cookieName}='))) {
					const banner = document.querySelector('.${COOKIE_CONSENT_BANNER_CLASS}');

					if (banner) {
						let delayMs = Number(banner.dataset.cookieConsentShowDelay) || 0;
						const delayReducedMs = Number(banner.dataset.cookieConsentShowDelayReduced);

						try {
							if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && delayReducedMs > 0) {
								delayMs = delayReducedMs;
							}
						} catch {}

						function showBanner() {
							banner.removeAttribute('hidden');
							delete banner.dataset.cookieConsentRevealScheduled;
						}

						if (delayMs > 0) {
							banner.dataset.cookieConsentRevealScheduled = '1';
							globalThis.__siteCoreCookieConsentRevealTimeout = globalThis.setTimeout(showBanner, delayMs);
						} else {
							showBanner();
						}
					}
				}
			} catch {}
		</script>`;
}

export { renderCookieConsent };
