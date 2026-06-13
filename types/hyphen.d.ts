declare module 'hyphen/ru/index.js' {
	export type HyphenateOptions = {
		exceptions?: string[];
		html?: boolean;
		hyphenChar?: string;
		minWordLength?: number;
	};

	export type Hyphenator = (text: string, options?: HyphenateOptions) => Promise<string>;

	export const hyphenate: Hyphenator;
}
