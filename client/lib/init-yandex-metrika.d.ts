/// <reference path="../../types/index.d.ts" />

declare function initYandexMetrika(options?: YandexMetrikaInitOptions): void;

declare function trackPageView(url: string, title: string, counterId?: number): void;

export { initYandexMetrika, trackPageView };
