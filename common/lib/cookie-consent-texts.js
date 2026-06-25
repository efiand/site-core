/// <reference path="../../types/index.d.ts" />

import { getSiteConfig } from '#core/common/lib/site-config.js';

/** @type {() => Required<CookieConsentTexts>} */
function getCookieConsentTexts() {
	const { cookieConsent = {} } = getSiteConfig();
	const { texts = {} } = cookieConsent;

	return {
		accept: texts.accept ?? 'Принять',
		banner:
			texts.banner ??
			'Сайт использует cookies и сервис веб-аналитики для анализа посещаемости. Подробнее — в Политике обработки персональных данных.',
		privacyLink: texts.privacyLink ?? 'Политика обработки персональных данных',
		reject: texts.reject ?? 'Отклонить',
		settings: texts.settings ?? 'Настройки cookie',
	};
}

export { getCookieConsentTexts };
