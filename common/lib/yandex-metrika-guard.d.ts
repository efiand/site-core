/// <reference path="../../types/index.d.ts" />

declare function resolveYandexMetrikaCounterId(counterId?: number): number;

declare function shouldIncludeYandexMetrika(options?: Pick<YandexMetrikaOptions, 'counterId' | 'pathname'>): boolean;

export { resolveYandexMetrikaCounterId, shouldIncludeYandexMetrika };
