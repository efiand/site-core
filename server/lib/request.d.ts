/// <reference path="../../types/index.d.ts" />

declare function getRequestBody(req: RouteRequest): Promise<ReqBody>;

export { getRequestBody };
