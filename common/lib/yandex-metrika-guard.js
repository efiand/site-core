import { getSiteConfig } from '#core/common/lib/site-config.js';

/** @type {(counterId?: number) => number} */
function resolveYandexMetrikaCounterId(counterId) {
	return counterId ?? getSiteConfig().yandexMetrikaId;
}

/** @type {(options?: Pick<YandexMetrikaOptions, 'counterId' | 'pathname'>) => boolean} */
function shouldIncludeYandexMetrika({ counterId, pathname = '' } = {}) {
	const yandexMetrikaId = counterId ?? getSiteConfig().yandexMetrikaId;

	return Boolean(yandexMetrikaId && !pathname.startsWith('/__'));
}

export { resolveYandexMetrikaCounterId, shouldIncludeYandexMetrika };
