/// <reference path="../../types/index.d.ts" />

/** @type {Map<string, Promise<HTMLScriptElement>>} */
const cache = new Map();

/**
 * Загружает скрипт по URL один раз; повторные вызовы с тем же src возвращают тот же Promise.
 * @type {(src: string, options?: LoadScriptOptions) => Promise<HTMLScriptElement>}
 */
function loadScript(src, { async = true, defer = true, type = '' } = {}) {
	const cached = cache.get(src);
	if (cached) {
		return cached;
	}

	const promise = new Promise((resolve, reject) => {
		const element = document.createElement('script');

		element.src = src;
		element.async = async;
		element.defer = defer;
		if (type) {
			element.type = type;
			if (type === 'module') {
				element.defer = false;
			}
		}

		element.onload = () => resolve(element);
		element.onerror = () => reject(new Error(`Не удалось загрузить скрипт: ${src}`));

		document.head.append(element);
	});

	cache.set(src, promise);
	return promise;
}

export { loadScript };
