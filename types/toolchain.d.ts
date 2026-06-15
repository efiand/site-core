declare module 'fast-xml-validator' {
	export const SyntaxValidator: {
		validate(xml: string): true | { err: { col: number; line: number; msg: string } };
	};
}

declare module 'html-validate' {
	export function defineConfig<T>(config: T): T;

	export class HtmlValidate {
		constructor(config?: unknown);
		validateString(html: string): Promise<{
			results: Array<{ messages: Array<{ column: number; line: number; message: string; ruleUrl: string }> }>;
			valid: boolean;
		}>;
	}
}

declare module 'posthtml-bem-linter' {
	export function lintBem(options: { content: string; log?: (...args: unknown[]) => void; name?: string }): {
		warningCount: number;
	};
}

declare module 'rolldown' {
	export function defineConfig<T>(config: T): T;

	type RolldownBuild = {
		close(): Promise<void>;
		generate(options: { format?: string; minify?: boolean }): Promise<{ output: Array<{ code: string }> }>;
	};

	type RolldownOptions = {
		cwd?: string;
		input?: string;
		output?: {
			file?: string;
			format?: string;
			minify?: boolean;
		};
		resolve?: {
			alias?: Record<string, string>;
		};
	};

	export function rolldown(options: RolldownOptions): Promise<RolldownBuild>;
}
