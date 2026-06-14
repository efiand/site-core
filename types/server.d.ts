type AppDispatch = (req?: import('node:http').IncomingMessage, res?: RouteResponse) => void | Promise<void>;

type CreateHttpServerOptions = {
	dispatch?: ServerMiddleware;
	isQuiet?: boolean;
	middleware?: ServerMiddleware;
	port?: number;
	renderErrorPage: (statusCode: number, message: string) => string;
	renderPage: (page: LayoutData) => Promise<string>;
};

type CookieBody = {
	domain?: string;
	expires?: Date;
	httpOnly?: boolean;
	maxAge?: string | number;
	name: string;
	path?: string;
	sameSite?: 'Lax' | 'None' | 'Strict';
	secure?: boolean;
	value: string;
};

type CreateDevMiddlewareOptions = {
	onStaticRequest?: (context: DevStaticRequestContext) => Promise<boolean>;
};

type DevStaticRequestContext = {
	ext: string;
	next?: ServerMiddleware;
	pathname: string;
	req: import('node:http').IncomingMessage;
	res: RouteResponse;
};

type CreateAppOptions = {
	isQuiet?: boolean;
	middleware?: ServerMiddleware;
	port?: number;
};

type CreateStandardRouteDispatcherOptions = {
	isQuiet?: boolean;
	renderErrorPage: (statusCode: number, message: string) => string;
	renderPage: (page: LayoutData) => Promise<string>;
	resolveRequest?: ResolveRequest;
};

type DbPlaceholder = DbPlaceholder[] | null | number | string;

type ReqBody = Record<string, unknown>;

type ResolveRequest = (url: URL) => ResolvedRequest;

type ResolvedRequest = {
	context?: Record<string, unknown>;
	pathname: string;
};

type Route = Record<string, RouteMethod>;

type RouteData = {
	contentType?: string;
	page?: LayoutData;
	statusCode?: number;
	template?: string;
};

type RouteMethod = (params: RouteParams) => Promise<RouteData>;

interface RouteParams {
	body?: ReqBody;
	id: number;
	isAuthorized?: boolean;
	req: RouteRequest;
	res: RouteResponse;
}

type RouteRequest = import('node:http').IncomingMessage;

type RouteResponse = import('node:http').ServerResponse<import('node:http').IncomingMessage> & {
	req: import('node:http').IncomingMessage;
};

type ServerMiddleware = (
	req: import('node:http').IncomingMessage,
	res: RouteResponse,
	next?: ServerMiddleware,
) => Promise<void>;
