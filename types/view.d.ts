interface LayoutData {
	author?: string;
	description?: string;
	faviconPrefix?: string;
	headTemplate?: string;
	heading?: string;
	isDev?: boolean;
	articleSeries?: ArticleSeriesItem[];
	articleWork?: ArticleWorkMeta;
	ogImage?: string;
	ogImageHeight?: string | number;
	ogImageWidth?: string | number;
	ogPathname?: string;
	ogType?: string;
	pageTemplate?: string;
	pathname?: string;
	publishedTime?: string;
	title?: string;
	webAppTitle?: string;
}

type PageAssetsOptions = {
	cssEntry?: string;
	devCssPath?: string;
	importMap?: { imports: Record<string, string> };
	pathname?: string;
};

type CreateRenderPageOptions = {
	defaultOgImage?: string;
	defaultOgImageHeight?: number;
	defaultOgImageWidth?: number;
	faviconPrefix?: string;
	fonts?: Iterable<string>;
	getHtmlPrefix?: (data: LayoutData) => string;
	getPageAssetsOptions?: (data: LayoutData) => PageAssetsOptions;
	getUrlMeta?: (pathname: string, baseUrl: string, data: LayoutData) => string;
	headExtras?: string;
	htmlLang?: string;
	htmlPrefix?: string;
	/** Контент страницы внутри `<body>`; **без** `<body>`, Metrika и `<html>`. */
	renderLayout: (data: LayoutData) => string;
};

type FaviconLinksOptions = {
	faviconPrefix?: string;
};
