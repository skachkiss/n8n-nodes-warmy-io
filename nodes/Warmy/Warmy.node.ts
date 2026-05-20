import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchResult,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

const MAILBOX_SEARCH_PAGE_SIZE = 20;

const PROVIDER_LABELS: Record<string, string> = {
	GOOGLE: 'Google',
	GSUITE: 'Gsuite',
	OUTLOOK: 'Outlook',
	OUTLOOKBUSINESS: 'Outlook Business',
	YAHOO: 'Yahoo',
	ZOHO: 'Zoho',
	ZOHOPRO: 'Zoho Pro',
	OTHER: 'Other',
};

import { warmyApiRequest, warmyApiRequestAllItems } from './GenericFunctions';
import {
	deliverabilityCheckerFields,
	deliverabilityCheckerOperations,
	mailboxFields,
	mailboxOperations,
	seedlistFields,
	seedlistOperations,
	standaloneDeliverabilityCheckerFields,
	standaloneDeliverabilityCheckerOperations,
	userTemplateFields,
	userTemplateOperations,
} from './descriptions';

const USER_TEMPLATE_SEARCH_PAGE_SIZE = 20;

const SEEDLIST_PAGE_SIZE = 5000;
const DC_PAGE_SIZE = 25;
const SDC_PAGE_SIZE = 25;

async function executeUserTemplate(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const buildListFiltersQs = (): IDataObject => {
		const filters = this.getNodeParameter('templateFilters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (filters.name) qs['filter[name]'] = filters.name;
		if (filters.searchable) qs['filter[searchable]'] = filters.searchable;
		if (filters.subject) qs['filter[subject]'] = filters.subject;
		if (filters.appearance) qs['filter[appearance]'] = filters.appearance;
		if (filters.moderationState) qs['filter[moderation_state]'] = filters.moderationState;
		if (filters.abTestEligible === true) qs['filter[ab_test_eligible]'] = true;
		return qs;
	};

	if (operation === 'getAll' || operation === 'getMany' || operation === 'getManyWithStats') {
		const endpointByOp: Record<string, string> = {
			getAll: '/api/v2/user_templates',
			getMany: '/api/v2/user_templates/list',
			getManyWithStats: '/api/v2/user_templates/stats',
		};
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const maxItems = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
		return await warmyApiRequestAllItems.call(
			this,
			'GET',
			endpointByOp[operation],
			buildListFiltersQs(),
			maxItems,
		);
	}

	if (operation === 'get') {
		const id = this.getNodeParameter('templateId', i, undefined, {
			extractValue: true,
		}) as string;
		return (await warmyApiRequest.call(
			this,
			'GET',
			`/api/v2/user_templates/${id}`,
		)) as IDataObject;
	}

	if (operation === 'delete') {
		const id = this.getNodeParameter('templateId', i, undefined, {
			extractValue: true,
		}) as string;
		await warmyApiRequest.call(this, 'DELETE', `/api/v2/user_templates/${id}`);
		return { success: true };
	}

	if (operation === 'create') {
		const additional = this.getNodeParameter('createAdditionalFields', i, {}) as IDataObject;
		const template: IDataObject = {
			subject: this.getNodeParameter('createSubject', i),
			body: this.getNodeParameter('createBody', i),
			language_code: this.getNodeParameter('createLanguageCode', i),
		};
		if (additional.appearance) template.appearance = additional.appearance;
		if (additional.name) template.name = additional.name;
		if (additional.mailboxIds) {
			const ids = (additional.mailboxIds as string)
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s.length > 0)
				.map((s) => Number(s));
			if (ids.length > 0) template.mailbox_ids = ids;
		}
		return (await warmyApiRequest.call(this, 'POST', '/api/v2/user_templates', {
			user_template: template,
		})) as IDataObject;
	}

	if (operation === 'update') {
		const id = this.getNodeParameter('templateId', i, undefined, {
			extractValue: true,
		}) as string;
		const fields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
		const template: IDataObject = {};
		if (fields.subject !== undefined && fields.subject !== '') template.subject = fields.subject;
		if (fields.body !== undefined && fields.body !== '') template.body = fields.body;
		if (fields.languageCode !== undefined && fields.languageCode !== '') {
			template.language_code = fields.languageCode;
		}
		if (fields.appearance !== undefined && fields.appearance !== '') {
			template.appearance = fields.appearance;
		}
		if (fields.name !== undefined && fields.name !== '') template.name = fields.name;
		if (typeof fields.warming === 'boolean') template.warming = fields.warming;

		const body: IDataObject = { user_template: template };
		if (fields.runModeration === true) body.run_moderation = true;

		return (await warmyApiRequest.call(
			this,
			'PUT',
			`/api/v2/user_templates/${id}`,
			body,
		)) as IDataObject;
	}

	if (operation === 'getStatistics') {
		const types = this.getNodeParameter('statisticsTypes', i, []) as string[];
		const filters = this.getNodeParameter('statisticsFilters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (Array.isArray(types) && types.length > 0) qs['types[]'] = types;
		if (filters.period) qs['filter[period]'] = filters.period;
		if (filters.startDate) qs['filter[start_date]'] = filters.startDate;
		if (filters.endDate) qs['filter[end_date]'] = filters.endDate;
		if (filters.templateIds) {
			const ids = (filters.templateIds as string)
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s.length > 0)
				.map((s) => Number(s));
			if (ids.length > 0) qs['filter[template_ids][]'] = ids;
		}
		if (filters.providers) {
			const provs = (filters.providers as string)
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s.length > 0);
			if (provs.length > 0) qs['filter[providers][]'] = provs;
		}
		return (await warmyApiRequest.call(
			this,
			'GET',
			'/api/v2/user_templates/statistics',
			{},
			qs,
		)) as IDataObject;
	}

	return [];
}

async function executeStandaloneDeliverabilityChecker(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const maxItems = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
		return await warmyApiRequestAllItems.call(
			this,
			'GET',
			'/api/v2/standalone_deliverability_checkers',
			{},
			maxItems,
			SDC_PAGE_SIZE,
		);
	}

	if (operation === 'get') {
		const uniqToken = this.getNodeParameter('sdcUniqToken', i) as string;
		return (await warmyApiRequest.call(
			this,
			'GET',
			`/api/v2/standalone_deliverability_checkers/${uniqToken}`,
		)) as IDataObject;
	}

	if (operation === 'getPossibleProviders') {
		return (await warmyApiRequest.call(
			this,
			'GET',
			'/api/v2/standalone_deliverability_checkers/possible_providers',
		)) as IDataObject;
	}

	if (operation === 'create') {
		const providers = this.getNodeParameter('sdcProviders', i) as string[];
		return (await warmyApiRequest.call(
			this,
			'POST',
			'/api/v2/standalone_deliverability_checkers',
			{ providers },
		)) as IDataObject;
	}

	return [];
}

async function executeDeliverabilityChecker(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getAll') {
		const mailboxId = this.getNodeParameter('dcMailboxId', i, undefined, { extractValue: true }) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const maxItems = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
		return await warmyApiRequestAllItems.call(
			this,
			'GET',
			`/api/v2/mailboxes/${mailboxId}/deliverability_checkers`,
			{},
			maxItems,
			DC_PAGE_SIZE,
		);
	}

	if (operation === 'get') {
		const mailboxId = this.getNodeParameter('dcMailboxId', i, undefined, { extractValue: true }) as string;
		const uniqToken = this.getNodeParameter('uniqToken', i) as string;
		return (await warmyApiRequest.call(
			this,
			'GET',
			`/api/v2/mailboxes/${mailboxId}/deliverability_checkers/${uniqToken}`,
		)) as IDataObject;
	}

	if (operation === 'create') {
		const mailboxId = this.getNodeParameter('dcMailboxId', i, undefined, { extractValue: true }) as string;
		const fields = this.getNodeParameter('createFields', i, {}) as IDataObject;
		const body: IDataObject = {};
		if (Array.isArray(fields.providers)) body.providers = fields.providers;
		if (fields.userTemplateId) body.user_template_id = fields.userTemplateId;
		return (await warmyApiRequest.call(
			this,
			'POST',
			`/api/v2/mailboxes/${mailboxId}/deliverability_checkers`,
			body,
		)) as IDataObject;
	}

	if (operation === 'toggleAutoChecker') {
		const mailboxId = this.getNodeParameter('dcMailboxId', i, undefined, { extractValue: true }) as string;
		const active = this.getNodeParameter('autoCheckerActive', i) as boolean;
		return (await warmyApiRequest.call(
			this,
			'PUT',
			`/api/v2/mailboxes/${mailboxId}/deliverability_checkers/toggle_auto_checker`,
			{ mailbox: { auto_checker_attributes: { active } } },
		)) as IDataObject;
	}

	if (operation === 'massUpdateAutoChecker') {
		const active = this.getNodeParameter('massActive', i) as boolean;
		const fields = this.getNodeParameter('massFields', i, {}) as IDataObject;
		const mailbox: IDataObject = { active };
		if (fields.mailboxIds) {
			const ids = (fields.mailboxIds as string)
				.split(',')
				.map((s) => s.trim())
				.filter((s) => s.length > 0)
				.map((s) => Number(s));
			mailbox.mailbox_ids = ids;
		} else {
			mailbox.mailbox_ids = [];
		}
		if (fields.userTemplateId !== undefined && fields.userTemplateId !== '') {
			mailbox.user_template_id = fields.userTemplateId;
		}
		return (await warmyApiRequest.call(
			this,
			'PUT',
			'/api/v2/deliverability_checkers/mass_update_auto_checker',
			{ mailbox },
		)) as IDataObject;
	}

	return [];
}

async function executeSeedlist(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	if (operation === 'getManySenders') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('senderFilters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (filters.email) qs['filter[email]'] = filters.email;
		const maxItems = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
		return await warmyApiRequestAllItems.call(
			this,
			'GET',
			'/api/v2/seedlist_senders',
			qs,
			maxItems,
		);
	}

	if (operation === 'getManySplits') {
		const filters = this.getNodeParameter('splitFilters', i, {}) as IDataObject;
		const qs: IDataObject = {};
		if (filters.groupName) qs['filter[group_name]'] = filters.groupName;
		if (filters.provider) qs['filter[provider]'] = filters.provider;
		const res = (await warmyApiRequest.call(this, 'GET', '/api/v2/users_splits', {}, qs)) as {
			users_splits?: IDataObject[];
		};
		return res.users_splits ?? [];
	}

	if (operation === 'getSplit') {
		const id = this.getNodeParameter('splitId', i) as string;
		return (await warmyApiRequest.call(this, 'GET', `/api/v2/users_splits/${id}`)) as IDataObject;
	}

	if (operation === 'updateSplit') {
		const id = this.getNodeParameter('splitId', i) as string;
		const senders = this.getNodeParameter('senders', i, {}) as {
			sender?: Array<{ email?: string; senderId?: number; destroy?: boolean }>;
		};
		const attrs = (senders.sender ?? []).map((s) => {
			const item: IDataObject = {};
			if (s.senderId) item.id = s.senderId;
			if (s.email) item.email = s.email;
			if (s.destroy) item._destroy = true;
			return item;
		});
		return (await warmyApiRequest.call(this, 'PUT', `/api/v2/users_splits/${id}`, {
			users_split: { users_splits_senders_attributes: attrs },
		})) as IDataObject;
	}

	if (operation === 'getSplitEmails') {
		const id = this.getNodeParameter('splitId', i) as string;
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const maxItems = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
		const emails = (await warmyApiRequestAllItems.call(
			this,
			'GET',
			`/api/v2/users_splits/${id}/seedlist_emails`,
			{},
			maxItems,
			SEEDLIST_PAGE_SIZE,
		)) as unknown[];
		return emails.map((email) => ({ email: email as string }));
	}

	return [];
}

export class Warmy implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Warmy',
		name: 'warmy',
		icon: 'file:warmy.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage Warmy.io mailboxes and warmup settings',
		defaults: {
			name: 'Warmy',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'warmyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Deliverability Checker',
						value: 'deliverabilityChecker',
					},
					{
						name: 'Mailbox',
						value: 'mailbox',
					},
					{
						name: 'Seedlist',
						value: 'seedlist',
					},
					{
						name: 'Standalone Deliverability Checker',
						value: 'standaloneDeliverabilityChecker',
					},
					{
						name: 'User Template',
						value: 'userTemplate',
					},
				],
				default: 'mailbox',
			},
			...deliverabilityCheckerOperations,
			...deliverabilityCheckerFields,
			...mailboxOperations,
			...mailboxFields,
			...seedlistOperations,
			...seedlistFields,
			...standaloneDeliverabilityCheckerOperations,
			...standaloneDeliverabilityCheckerFields,
			...userTemplateOperations,
			...userTemplateFields,
		],
	};

	methods = {
		listSearch: {
			async searchMailboxes(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				const page = paginationToken ? Number(paginationToken) : 1;
				const qs: IDataObject = {
					response_type: 'simple',
					per_page: MAILBOX_SEARCH_PAGE_SIZE,
					page,
				};
				if (filter) qs['filter[email]'] = filter;

				const res = (await warmyApiRequest.call(this, 'GET', '/api/v2/mailboxes', {}, qs)) as {
					items?: Array<{ id: number; email: string }>;
					pagination?: { next_page?: number | null };
				};

				const results = (res.items ?? []).map((m) => ({
					name: m.email,
					value: String(m.id),
				}));
				const nextPage = res.pagination?.next_page;
				return {
					results,
					paginationToken: nextPage ? String(nextPage) : undefined,
				};
			},

			async searchUserTemplates(
				this: ILoadOptionsFunctions,
				filter?: string,
				paginationToken?: string,
			): Promise<INodeListSearchResult> {
				const page = paginationToken ? Number(paginationToken) : 1;
				const qs: IDataObject = {
					per_page: USER_TEMPLATE_SEARCH_PAGE_SIZE,
					page,
				};
				if (filter) qs['filter[searchable]'] = filter;

				const res = (await warmyApiRequest.call(
					this,
					'GET',
					'/api/v2/user_templates/list',
					{},
					qs,
				)) as {
					items?: Array<{ id: number; name?: string; subject?: string }>;
					pagination?: { next_page?: number | null };
				};

				const results = (res.items ?? []).map((t) => ({
					name:
						t.name && t.subject
							? `${t.name} — ${t.subject}`
							: t.name ?? t.subject ?? `Template #${t.id}`,
					value: String(t.id),
				}));
				const nextPage = res.pagination?.next_page;
				return {
					results,
					paginationToken: nextPage ? String(nextPage) : undefined,
				};
			},
		},

		loadOptions: {
			async getStandaloneDeliverabilityProviders(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				const res = (await warmyApiRequest.call(
					this,
					'GET',
					'/api/v2/standalone_deliverability_checkers/possible_providers',
				)) as { providers?: string[] };
				const providers = res.providers ?? [];
				return providers
					.map((value) => ({ name: PROVIDER_LABELS[value] ?? value, value }))
					.sort((a, b) => a.name.localeCompare(b.name));
			},

			async getSeedlistSplits(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				const res = (await warmyApiRequest.call(this, 'GET', '/api/v2/users_splits')) as {
					users_splits?: Array<{ id: number; provider?: string; group_name?: string }>;
				};
				const splits = res.users_splits ?? [];
				return splits
					.map((s) => ({
						name: `${s.provider ?? '?'} / ${s.group_name ?? '?'} (#${s.id})`,
						value: String(s.id),
					}))
					.sort((a, b) => a.name.localeCompare(b.name));
			},

			async getTariffPlanTypes(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				const res = (await warmyApiRequest.call(
					this,
					'GET',
					'/api/v2/tariff_plan_types',
				)) as Array<{ id: number; name: string }>;
				return (res ?? [])
					.map((t) => ({ name: `${t.name} (#${t.id})`, value: String(t.id) }))
					.sort((a, b) => a.name.localeCompare(b.name));
			},

			async getTariffPlanTypesWithUnselected(
				this: ILoadOptionsFunctions,
			): Promise<INodePropertyOptions[]> {
				const res = (await warmyApiRequest.call(
					this,
					'GET',
					'/api/v2/tariff_plan_types',
				)) as Array<{ id: number; name: string }>;
				const options = (res ?? [])
					.map((t) => ({ name: `${t.name} (#${t.id})`, value: String(t.id) }))
					.sort((a, b) => a.name.localeCompare(b.name));
				return [{ name: 'Unselected (NULL)', value: '' }, ...options];
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				if (resource === 'seedlist') {
					responseData = await executeSeedlist.call(this, operation, i);
				} else if (resource === 'deliverabilityChecker') {
					responseData = await executeDeliverabilityChecker.call(this, operation, i);
				} else if (resource === 'standaloneDeliverabilityChecker') {
					responseData = await executeStandaloneDeliverabilityChecker.call(
						this,
						operation,
						i,
					);
				} else if (resource === 'userTemplate') {
					responseData = await executeUserTemplate.call(this, operation, i);
				} else if (resource !== 'mailbox') {
					continue;
				} else if (operation === 'getAll') {
					const returnAll = this.getNodeParameter('returnAll', i) as boolean;
					const additionalFields = this.getNodeParameter(
						'additionalFields',
						i,
						{},
					) as IDataObject;

					const qs: IDataObject = {};
					if (additionalFields.responseType) qs.response_type = additionalFields.responseType;
					if (additionalFields.filterEmail) qs['filter[email]'] = additionalFields.filterEmail;
					if (additionalFields.filterGroupId) {
						qs['filter[group_id]'] = additionalFields.filterGroupId;
					}
					if (
						Array.isArray(additionalFields.filterProviders) &&
						(additionalFields.filterProviders as string[]).length > 0
					) {
						qs['filter[providers][]'] = additionalFields.filterProviders;
					}
					if (additionalFields.filterDomainIds) {
						const domainIds = (additionalFields.filterDomainIds as string)
							.split(',')
							.map((s) => s.trim())
							.filter((s) => s.length > 0);
						if (domainIds.length > 0) qs['filter[domains][]'] = domainIds;
					}
					if (additionalFields.sortingEmail) {
						qs['sorting[email]'] = additionalFields.sortingEmail;
					}

					const maxItems = returnAll
						? undefined
						: (this.getNodeParameter('limit', i) as number);
					responseData = await warmyApiRequestAllItems.call(
						this,
						'GET',
						'/api/v2/mailboxes',
						qs,
						maxItems,
					);
				} else if (operation === 'get') {
					const id = this.getNodeParameter('mailboxId', i, undefined, { extractValue: true }) as string;
					responseData = await warmyApiRequest.call(this, 'GET', `/api/v2/mailboxes/${id}`);
				} else if (operation === 'create') {
					const provider = this.getNodeParameter('provider', i) as string;
					const email = this.getNodeParameter('createEmail', i) as string;
					const tariffPlanTypeId = Number(
						this.getNodeParameter('createTariffPlanTypeId', i),
					);
					const additional = this.getNodeParameter(
						'createAdditionalFields',
						i,
						{},
					) as IDataObject;

					const mailbox: IDataObject = {
						provider,
						email,
						tariff_plan_type_id: tariffPlanTypeId,
					};

					const APP_PASSWORD = ['aol', 'gmail', 'outlook', 'yahoo', 'zoho', 'zohopro'];
					const SMTP_GROUP = ['smtp', 'sendgrid', 'mailgun'];
					const ADDITIONAL_KEY = ['sendgrid', 'mailgun'];

					if (APP_PASSWORD.includes(provider)) {
						mailbox.password = this.getNodeParameter('createPassword', i);
					} else if (SMTP_GROUP.includes(provider)) {
						mailbox.smtp_address = this.getNodeParameter('createSmtpAddress', i);
						mailbox.smtp_port = this.getNodeParameter('createSmtpPort', i);
						mailbox.smtp_ssl = this.getNodeParameter('createSmtpSsl', i);
						mailbox.smtp_user_name = this.getNodeParameter('createSmtpUserName', i);
						mailbox.smtp_password = this.getNodeParameter('createSmtpPassword', i);
						if (ADDITIONAL_KEY.includes(provider)) {
							mailbox.additional_key = this.getNodeParameter('createAdditionalKey', i);
						}
					} else if (provider === 'oauth_google') {
						mailbox.access_token = this.getNodeParameter('createAccessTokenGoogle', i);
						mailbox.refresh_token = this.getNodeParameter('createRefreshTokenGoogle', i);
						mailbox.expires_at = this.getNodeParameter('createExpiresAt', i);
						mailbox.client_id = this.getNodeParameter('createClientIdGoogle', i);
						mailbox.redirect_uri = this.getNodeParameter('createRedirectUri', i);
						mailbox.token_credential_uri = this.getNodeParameter(
							'createTokenCredentialUri',
							i,
						);
					} else if (provider === 'oauth_outlook') {
						mailbox.access_token = this.getNodeParameter('createAccessTokenOutlook', i);
						mailbox.refresh_token = this.getNodeParameter('createRefreshTokenOutlook', i);
						mailbox.client_id = this.getNodeParameter('createClientIdOutlook', i);
						mailbox.client_secret = this.getNodeParameter('createClientSecretOutlook', i);
					}

					const passthroughKeys = [
						'from_name',
						'group_id',
						'use_imap',
						'imap_address',
						'imap_port',
						'imap_ssl',
						'imap_user_name',
						'imap_password',
					];
					for (const key of passthroughKeys) {
						const value = additional[key];
						if (value !== undefined && value !== '' && value !== null) {
							mailbox[key] = value;
						}
					}

					const settingAttrs: IDataObject = {};
					if (additional.settingSpeedMode) settingAttrs.speed_mode = additional.settingSpeedMode;
					if (additional.settingUserMaxLimit) {
						settingAttrs.user_max_limit = additional.settingUserMaxLimit;
					}
					if (additional.settingReplyRate) {
						settingAttrs.reply_rate = additional.settingReplyRate;
					}
					if (Object.keys(settingAttrs).length > 0) {
						mailbox.setting_attributes = settingAttrs;
					}

					responseData = await warmyApiRequest.call(
						this,
						'POST',
						'/api/v2/mailboxes',
						{ mailbox },
					);
				} else if (operation === 'update') {
					const id = this.getNodeParameter('mailboxId', i, undefined, { extractValue: true }) as string;
					const settingMode = this.getNodeParameter('settingMode', i) as string;
					const additional = this.getNodeParameter(
						'updateAdditionalFields',
						i,
						{},
					) as IDataObject;

					const settingAttrs: IDataObject = {};
					if (additional.settingsId) settingAttrs.id = additional.settingsId;

					if (settingMode === 'speed_form') {
						settingAttrs.speed_mode = this.getNodeParameter('updateSpeedMode', i);
					} else {
						settingAttrs.setting_mode = settingMode;
						const startOnDayOne = this.getNodeParameter('updateStartOnDayOne', i) as number;
						const increasePerDay = this.getNodeParameter('updateIncreasePerDay', i) as number;
						if (startOnDayOne) settingAttrs.start_on_day_one = startOnDayOne;
						if (increasePerDay) settingAttrs.increase_per_day = increasePerDay;
					}

					const userMaxLimit = this.getNodeParameter('updateUserMaxLimit', i) as number;
					const replyRate = this.getNodeParameter('updateReplyRate', i) as number;
					if (userMaxLimit) settingAttrs.user_max_limit = userMaxLimit;
					if (replyRate) settingAttrs.reply_rate = replyRate;

					const mailbox: IDataObject = { setting_attributes: settingAttrs };
					if (additional.from_name) mailbox.from_name = additional.from_name;

					responseData = await warmyApiRequest.call(
						this,
						'PUT',
						`/api/v2/mailboxes/${id}`,
						{ mailbox },
					);
				} else if (operation === 'delete') {
					const id = this.getNodeParameter('mailboxId', i, undefined, { extractValue: true }) as string;
					const reasonFields = this.getNodeParameter('deleteReason', i, {}) as IDataObject;
					const body: IDataObject = {};
					if (reasonFields.reason || reasonFields.reasonText) {
						body.reason = {
							reason: reasonFields.reason ?? '',
							reason_text: reasonFields.reasonText ?? '',
						};
					}
					responseData = (await warmyApiRequest.call(
						this,
						'DELETE',
						`/api/v2/mailboxes/${id}`,
						body,
					)) ?? { success: true };
				} else if (operation === 'updateState') {
					const id = this.getNodeParameter('mailboxId', i, undefined, { extractValue: true }) as string;
					const state = this.getNodeParameter('state', i) as string;
					responseData = await warmyApiRequest.call(
						this,
						'PUT',
						`/api/v2/mailboxes/${id}/update_state`,
						{ mailbox: { state } },
					);
				} else if (operation === 'changeTariffPlan') {
					const id = this.getNodeParameter('mailboxId', i, undefined, { extractValue: true }) as string;
					const raw = (this.getNodeParameter('tariffPlanTypeId', i) as string).trim();
					const tariffPlanTypeId = raw === '' ? null : Number(raw);
					responseData = await warmyApiRequest.call(
						this,
						'PUT',
						`/api/v2/mailboxes/${id}/change_tariff_plan`,
						{ mailbox: { tariff_plan_type_id: tariffPlanTypeId } },
					);
				} else if (operation === 'reconnect') {
					const id = this.getNodeParameter('mailboxId', i, undefined, { extractValue: true }) as string;
					const fields = this.getNodeParameter('reconnectFields', i, {}) as IDataObject;
					const mailbox: IDataObject = {};
					for (const [k, v] of Object.entries(fields)) {
						if (v === '' || v === undefined || v === null) continue;
						mailbox[k] = k === 'tariff_plan_type_id' ? Number(v) : v;
					}
					responseData = await warmyApiRequest.call(
						this,
						'POST',
						`/api/v2/mailboxes/${id}/reconnect`,
						{ mailbox },
					);
				} else if (operation === 'healthCheck') {
					const id = this.getNodeParameter('mailboxId', i, undefined, { extractValue: true }) as string;
					responseData = await warmyApiRequest.call(
						this,
						'POST',
						`/api/v2/mailboxes/${id}/resent_health_check`,
					);
				} else if (operation === 'healthCheckAll') {
					responseData = await warmyApiRequest.call(
						this,
						'POST',
						'/api/v2/mailboxes/health_check_by_user',
					);
				} else if (operation === 'getDomainsList') {
					const res = (await warmyApiRequest.call(
						this,
						'GET',
						'/api/v2/mailboxes/domains_list',
					)) as { domains?: IDataObject[] };
					responseData = res.domains ?? [];
				} else if (operation === 'getProvidersList') {
					const res = (await warmyApiRequest.call(
						this,
						'GET',
						'/api/v2/mailboxes/providers_list',
					)) as { providers?: IDataObject[] };
					responseData = res.providers ?? [];
				} else if (operation === 'getWarmupStatistics') {
					const qs: IDataObject = {
						'filter[time_bucket]': this.getNodeParameter('timeBucket', i),
						'filter[from]': this.getNodeParameter('from', i),
						'filter[mailbox_ids]': this.getNodeParameter('mailboxIds', i),
					};
					const to = (this.getNodeParameter('to', i, '') as string).trim();
					if (to) qs['filter[to]'] = to;
					responseData = (await warmyApiRequest.call(
						this,
						'GET',
						'/api/v2/mailboxes/warmup_statistics',
						{},
						qs,
					)) as IDataObject[];
				} else if (operation === 'getWarmupStatisticsByProvider') {
					const id = this.getNodeParameter('mailboxId', i, undefined, { extractValue: true }) as string;
					const period = this.getNodeParameter('period', i) as string;
					responseData = await warmyApiRequest.call(
						this,
						'GET',
						`/api/v2/mailboxes/${id}/warmup_statistics_by_provider`,
						{},
						{ 'filter[period]': period },
					);
				} else if (operation === 'getTotalWarmupStatistics') {
					const id = this.getNodeParameter('mailboxId', i, undefined, { extractValue: true }) as string;
					responseData = await warmyApiRequest.call(
						this,
						'GET',
						`/api/v2/mailboxes/${id}/total_warmup_statistics`,
					);
				} else {
					continue;
				}

				const arr = Array.isArray(responseData) ? responseData : [responseData];
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(arr),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
