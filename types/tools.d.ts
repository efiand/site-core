type BuildStaticPagesOptions = {
	createApp: (options?: CreateAppOptions) => import('node:http').Server;
	/**
	 * Вызывается после успешной записи каждой страницы на диск.
	 * По умолчанию — `console.info(\`Страница ${url} сгенерирована.\`)`.
	 * Итоговая строка `✅ Всего сгенерировано страниц: N` выводится всегда (не через колбэк).
	 */
	onPageBuilt?: (url: string) => void;
};

type BuildStaticPagesResult = Promise<number>;

type FunctionOrderViolation = {
	expected: string[];
	file: string;
	names: string[];
};

type FunctionSpacingViolation = {
	after: string;
	before: string;
	file: string;
};

type JsdocFormattingViolation = {
	file: string;
	line: number;
	message: string;
};
