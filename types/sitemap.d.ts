type SitemapPage = {
	lastmod?: string;
	loc: string;
	priority?: string;
};

type SitemapPagesInput = Iterable<SitemapPage | string>;

type SitemapPagesResolver = (() => Promise<SitemapPagesInput> | SitemapPagesInput) | SitemapPagesInput;
