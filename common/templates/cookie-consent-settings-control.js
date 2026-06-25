/// <reference path="../../types/index.d.ts" />

import { COOKIE_CONSENT_SETTINGS_ATTR } from '#core/common/lib/cookie-consent-constants.js';
import { getCookieConsentTexts } from '#core/common/lib/cookie-consent-texts.js';
import { shouldIncludeYandexMetrika } from '#core/common/lib/yandex-metrika-guard.js';

/** @type {(options?: CookieConsentSettingsControlOptions) => string} */
function renderCookieConsentSettingsControl({ className = '', pathname = '' } = {}) {
	if (!shouldIncludeYandexMetrika({ pathname })) {
		return '';
	}

	const { settings } = getCookieConsentTexts();
	const classAttribute = className ? ` class="${className}"` : '';

	return /* html */ `<button type="button"${classAttribute} ${COOKIE_CONSENT_SETTINGS_ATTR} hidden>${settings}</button>`;
}

export { renderCookieConsentSettingsControl };
