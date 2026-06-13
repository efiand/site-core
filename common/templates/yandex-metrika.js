import { resolveYandexMetrikaCounterId, shouldIncludeYandexMetrika } from '#core/common/lib/yandex-metrika-guard.js';

/** @type {(options?: YandexMetrikaOptions) => string} */
function renderYandexMetrika({ counterId, pathname = '' } = {}) {
	if (!shouldIncludeYandexMetrika({ counterId, pathname })) {
		return '';
	}

	const yandexMetrikaId = resolveYandexMetrikaCounterId(counterId);

	return /* html */ `
		<!-- Yandex.Metrika counter -->
		<noscript>
			<img class="_visually-hidden" src="https://mc.yandex.ru/watch/${yandexMetrikaId}" alt="">
		</noscript>
		<!-- /Yandex.Metrika counter -->
	`;
}

export { renderYandexMetrika };
