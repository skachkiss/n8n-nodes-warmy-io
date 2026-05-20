import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export const WARMY_BASE_URL = 'https://api.warmy.io';
const API_MAX_PER_PAGE = 100;

type WarmyContext = IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions;

export async function warmyApiRequest(
	this: WarmyContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const options: IHttpRequestOptions = {
		method,
		baseURL: WARMY_BASE_URL,
		url: endpoint,
		headers: {
			'Content-Type': 'application/json',
		},
		qs,
		json: true,
		arrayFormat: 'brackets',
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	try {
		return await this.helpers.httpRequestWithAuthentication.call(this, 'warmyApi', options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export async function warmyApiRequestAllItems(
	this: WarmyContext,
	method: IHttpRequestMethods,
	endpoint: string,
	qs: IDataObject = {},
	maxItems?: number,
	pageSize: number = API_MAX_PER_PAGE,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	const initialPerPage = Math.min(pageSize, maxItems ?? pageSize);
	const query: IDataObject = { ...qs, per_page: initialPerPage, page: 1 };

	let hasMore = true;
	while (hasMore) {
		const response = (await warmyApiRequest.call(this, method, endpoint, {}, query)) as {
			items?: IDataObject[];
			pagination?: { next_page?: number | null };
		};

		const items = response.items ?? [];
		returnData.push(...items);

		if (maxItems !== undefined && returnData.length >= maxItems) {
			break;
		}

		const nextPage = response.pagination?.next_page;
		if (nextPage) {
			query.page = nextPage;
			if (maxItems !== undefined) {
				const remaining = maxItems - returnData.length;
				query.per_page = Math.min(pageSize, remaining);
			}
		} else {
			hasMore = false;
		}
	}

	return maxItems !== undefined ? returnData.slice(0, maxItems) : returnData;
}
