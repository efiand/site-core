import { getSiteConfig } from '#core/common/lib/site-config.js';
import { resolveYandexMetrikaCounterId, shouldIncludeYandexMetrika } from '#core/common/lib/yandex-metrika-guard.js';

const YANDEX_METRIKA_TAG_URL = 'https://mc.yandex.ru/metrika/tag.js';

/** @type {(options?: YandexMetrikaInlineOptions) => string} */
function renderYandexMetrikaInline({ counterId, pathname = '' } = {}) {
	if (!shouldIncludeYandexMetrika({ counterId, pathname })) {
		return '';
	}

	const yandexMetrikaId = resolveYandexMetrikaCounterId(counterId);

	return /* html */ `
		${renderYandexMetrikaInlineScript({ counterId, pathname })}
		<noscript>
			<img class="_visually-hidden" src="https://mc.yandex.ru/watch/${yandexMetrikaId}" alt="">
		</noscript>
	`;
}

/** @type {(options?: YandexMetrikaInlineOptions) => string} */
function renderYandexMetrikaInlineHead({ counterId, pathname = '' } = {}) {
	if (getSiteConfig().isDev) {
		return '';
	}

	return renderYandexMetrikaInlineScript({ counterId, pathname });
}

/** @type {(options?: YandexMetrikaInlineOptions) => string} */
function renderYandexMetrikaInlineScript({ counterId, pathname = '' } = {}) {
	if (!shouldIncludeYandexMetrika({ counterId, pathname })) {
		return '';
	}

	const yandexMetrikaId = resolveYandexMetrikaCounterId(counterId);

	return /* html */ `
		<!-- Yandex.Metrika counter -->
		<script>
			setTimeout(() => {
				window.ym = window.ym || function () {
					(window.ym.a = window.ym.a || []).push(arguments);
				};
				window.ym.l = Date.now();

				const isTagLoaded = [...document.scripts].some(
					(scriptElement) => scriptElement.src === "${YANDEX_METRIKA_TAG_URL}",
				);
				if (!isTagLoaded) {
					const newScriptElement = document.createElement("script");
					newScriptElement.async = 1;
					newScriptElement.src = "${YANDEX_METRIKA_TAG_URL}";

					const [firstScriptElement] = document.scripts;
					firstScriptElement.parentNode.insertBefore(newScriptElement, firstScriptElement);
				}

				ym(${yandexMetrikaId}, "init", {
					accurateTrackBounce: true,
					clickmap: true,
					trackLinks: true,
					webvisor: true,
				});
			}, 3000);
		</script>
		<!-- /Yandex.Metrika counter -->
	`;
}

export { renderYandexMetrikaInline, renderYandexMetrikaInlineHead, renderYandexMetrikaInlineScript };
