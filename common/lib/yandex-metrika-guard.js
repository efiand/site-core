import { getSiteConfig } from '#core/common/lib/site-config.js';

/** @type {(pathname?: string, requestPathname?: string) => string[]} */
function getCookieConsentPathCandidates(pathname = '', requestPathname = '') {
	return [...new Set([requestPathname, pathname].filter(Boolean))];
}

/** @type {(pathname?: string, requestPathname?: string) => boolean} */
function isExcludedCookieConsentPath(pathname = '', requestPathname = '') {
	const candidates = getCookieConsentPathCandidates(pathname, requestPathname);

	if (candidates.some((candidate) => candidate.startsWith('/__'))) {
		return true;
	}

	const { excludePathnamePrefixes = [] } = getSiteConfig().cookieConsent ?? {};

	if (!excludePathnamePrefixes.length) {
		return false;
	}

	return candidates.some((candidate) => excludePathnamePrefixes.some((prefix) => candidate.startsWith(prefix)));
}

/** @type {(counterId?: number) => number} */
function resolveYandexMetrikaCounterId(counterId) {
	return counterId ?? getSiteConfig().yandexMetrikaId;
}

/** @type {(options?: Pick<YandexMetrikaOptions, 'counterId' | 'pathname' | 'requestPathname'>) => boolean} */
function shouldIncludeYandexMetrika({ counterId, pathname = '', requestPathname = '' } = {}) {
	const yandexMetrikaId = counterId ?? getSiteConfig().yandexMetrikaId;

	return Boolean(yandexMetrikaId && !isExcludedCookieConsentPath(pathname, requestPathname));
}

export {
	getCookieConsentPathCandidates,
	isExcludedCookieConsentPath,
	resolveYandexMetrikaCounterId,
	shouldIncludeYandexMetrika,
};
