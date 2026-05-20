import type { INodeProperties } from 'n8n-workflow';

const SHOW_FOR_TEMPLATE = { resource: ['userTemplate'] };

const OPS_WITH_TEMPLATE_ID = ['delete', 'get', 'update'];
const OPS_WITH_PAGINATION = ['getAll', 'getMany', 'getManyWithStats'];
const OPS_WITH_LIST_FILTERS = ['getAll', 'getMany', 'getManyWithStats'];

const APPEARANCE_OPTIONS = [
	{ name: 'HTML', value: 'html' },
	{ name: 'Text', value: 'text' },
];

const MODERATION_OPTIONS = [
	{ name: 'Approved', value: 'approved' },
	{ name: 'No State', value: 'no_state' },
	{ name: 'Pending', value: 'pending' },
	{ name: 'Rejected', value: 'rejected' },
];

const TEMPLATE_RESOURCE_LOCATOR_MODES = [
	{
		displayName: 'From List',
		name: 'list' as const,
		type: 'list' as const,
		placeholder: 'Select a template…',
		typeOptions: {
			searchListMethod: 'searchUserTemplates',
			searchable: true,
		},
	},
	{
		displayName: 'By ID',
		name: 'id' as const,
		type: 'string' as const,
		placeholder: '123',
	},
];

export const userTemplateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: SHOW_FOR_TEMPLATE },
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new user template',
				action: 'Create a user template',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a user template',
				action: 'Delete a user template',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get details of a single user template',
				action: 'Get a user template',
			},
			{
				name: 'Get Aggregate Statistics',
				value: 'getStatistics',
				description: 'Get aggregated statistics across templates',
				action: 'Get aggregate template statistics',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve user templates with optional filters',
				action: 'Get many user templates',
			},
			{
				name: 'Get Many Simple',
				value: 'getMany',
				description: 'Lightweight list of templates with only ID, name and subject',
				action: 'Get many user templates simple',
			},
			{
				name: 'Get Many with Stats',
				value: 'getManyWithStats',
				description: 'List templates with per-template performance metrics',
				action: 'Get many user templates with stats',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing user template',
				action: 'Update a user template',
			},
		],
		default: 'getAll',
	},
];

export const userTemplateFields: INodeProperties[] = [
	// Shared template ID — dynamically loaded via listSearch
	{
		displayName: 'Template',
		name: 'templateId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list', value: '' },
		displayOptions: {
			show: { resource: ['userTemplate'], operation: OPS_WITH_TEMPLATE_ID },
		},
		description: 'User template to act on',
		modes: TEMPLATE_RESOURCE_LOCATOR_MODES,
	},

	// Shared pagination — getAll, getMany, getManyWithStats
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['userTemplate'], operation: OPS_WITH_PAGINATION },
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['userTemplate'],
				operation: OPS_WITH_PAGINATION,
				returnAll: [false],
			},
		},
	},

	// Shared filters — getAll, getMany, getManyWithStats
	{
		displayName: 'Filters',
		name: 'templateFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: { resource: ['userTemplate'], operation: OPS_WITH_LIST_FILTERS },
		},
		options: [
			{
				displayName: 'A/B Test Eligible',
				name: 'abTestEligible',
				type: 'boolean',
				default: false,
				description:
					'Whether to return only templates eligible for A/B testing (Get Many only)',
				displayOptions: {
					show: { '/operation': ['getAll'] },
				},
			},
			{
				displayName: 'Appearance',
				name: 'appearance',
				type: 'options',
				options: [
					{ name: 'HTML', value: 'html' },
					{ name: 'Hubspot', value: 'hubspot' },
					{ name: 'Text', value: 'text' },
				],
				default: 'text',
			},
			{
				displayName: 'Moderation State',
				name: 'moderationState',
				type: 'options',
				options: MODERATION_OPTIONS,
				default: 'approved',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by template name',
			},
			{
				displayName: 'Searchable',
				name: 'searchable',
				type: 'string',
				default: '',
				description: 'Search in both name and subject',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Filter by template subject',
			},
		],
	},

	// ----------------------------------------------------------------------
	// create
	// ----------------------------------------------------------------------
	{
		displayName: 'Subject',
		name: 'createSubject',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['userTemplate'], operation: ['create'] } },
		description: 'Email subject line (max 100 characters)',
	},
	{
		displayName: 'Body',
		name: 'createBody',
		type: 'string',
		typeOptions: { rows: 6 },
		required: true,
		default: '',
		displayOptions: { show: { resource: ['userTemplate'], operation: ['create'] } },
		description:
			'Template body. Text templates must contain the placeholder {{ Recipient_Name }}.',
	},
	{
		displayName: 'Language Code',
		name: 'createLanguageCode',
		type: 'string',
		required: true,
		default: 'en',
		displayOptions: { show: { resource: ['userTemplate'], operation: ['create'] } },
		description: 'ISO 639-1 language code, for example "en", "es", "fr"',
	},
	{
		displayName: 'Additional Fields',
		name: 'createAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['userTemplate'], operation: ['create'] } },
		options: [
			{
				displayName: 'Appearance',
				name: 'appearance',
				type: 'options',
				options: APPEARANCE_OPTIONS,
				default: 'text',
			},
			{
				displayName: 'Mailbox IDs',
				name: 'mailboxIds',
				type: 'string',
				default: '',
				placeholder: '12,34,56',
				description:
					'Comma-separated mailbox IDs to assign. Auto-activates warmup for the template.',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			},
		],
	},

	// ----------------------------------------------------------------------
	// update
	// ----------------------------------------------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['userTemplate'], operation: ['update'] } },
		options: [
			{
				displayName: 'Appearance',
				name: 'appearance',
				type: 'options',
				options: APPEARANCE_OPTIONS,
				default: 'text',
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				typeOptions: { rows: 6 },
				default: '',
				description:
					'Template body. Text templates must contain the placeholder {{ Recipient_Name }}.',
			},
			{
				displayName: 'Language Code',
				name: 'languageCode',
				type: 'string',
				default: 'en',
				description: 'ISO 639-1 language code',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Run Moderation Synchronously',
				name: 'runModeration',
				type: 'boolean',
				default: false,
				description:
					'Whether to run AI moderation in the request instead of in the background',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Email subject line (max 100 characters)',
			},
			{
				displayName: 'Warming',
				name: 'warming',
				type: 'boolean',
				default: false,
				description: 'Whether the template is currently warming (requires assigned mailboxes)',
			},
		],
	},

	// ----------------------------------------------------------------------
	// getStatistics (aggregate)
	// ----------------------------------------------------------------------
	{
		displayName: 'Types',
		name: 'statisticsTypes',
		type: 'multiOptions',
		default: ['total', 'by_providers'],
		displayOptions: {
			show: { resource: ['userTemplate'], operation: ['getStatistics'] },
		},
		options: [
			{ name: 'Total (Aggregated)', value: 'total' },
			{ name: 'By Providers (Breakdown)', value: 'by_providers' },
		],
		description: 'Which statistics buckets to include in the response',
	},
	{
		displayName: 'Statistics Filters',
		name: 'statisticsFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: { resource: ['userTemplate'], operation: ['getStatistics'] },
		},
		options: [
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
				description: 'Custom range end date (ISO 8601)',
			},
			{
				displayName: 'Period',
				name: 'period',
				type: 'options',
				options: [
					{ name: 'Month', value: 'month' },
					{ name: 'Today', value: 'today' },
					{ name: 'Week', value: 'week' },
					{ name: 'Yesterday', value: 'yesterday' },
				],
				default: 'week',
				description: 'Predefined time period (ignored when start_date/end_date are set)',
			},
			{
				displayName: 'Providers',
				name: 'providers',
				type: 'string',
				default: '',
				placeholder: 'gmail,outlook,yahoo',
				description: 'Comma-separated email provider codes',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
				description: 'Custom range start date (ISO 8601)',
			},
			{
				displayName: 'Template IDs',
				name: 'templateIds',
				type: 'string',
				default: '',
				placeholder: '12,34,56',
				description: 'Comma-separated template IDs to include',
			},
		],
	},
];
