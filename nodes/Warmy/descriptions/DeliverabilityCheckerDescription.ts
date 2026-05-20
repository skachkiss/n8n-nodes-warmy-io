import type { INodeProperties } from 'n8n-workflow';

const SHOW_FOR_DC = { resource: ['deliverabilityChecker'] };

const OPS_WITH_MAILBOX_ID = ['create', 'get', 'getAll', 'toggleAutoChecker'];

export const deliverabilityCheckerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: SHOW_FOR_DC },
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Run a new deliverability test',
				action: 'Create a deliverability checker',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get full info about a deliverability checker by token',
				action: 'Get a deliverability checker',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List deliverability checkers for a mailbox',
				action: 'Get many deliverability checkers',
			},
			{
				name: 'Mass Update Auto Checker',
				value: 'massUpdateAutoChecker',
				description: 'Change auto checker settings for many mailboxes at once',
				action: 'Mass update auto checker',
			},
			{
				name: 'Toggle Auto Checker',
				value: 'toggleAutoChecker',
				description: 'Activate or deactivate auto checker for a single mailbox',
				action: 'Toggle auto checker',
			},
		],
		default: 'getAll',
	},
];

export const deliverabilityCheckerFields: INodeProperties[] = [
	{
		displayName: 'Mailbox',
		name: 'dcMailboxId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list', value: '' },
		displayOptions: {
			show: { resource: ['deliverabilityChecker'], operation: OPS_WITH_MAILBOX_ID },
		},
		description: 'Mailbox to act on',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				placeholder: 'Select a mailbox…',
				typeOptions: {
					searchListMethod: 'searchMailboxes',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: '123',
			},
		],
	},
	{
		displayName: 'Uniq Token',
		name: 'uniqToken',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: { show: { resource: ['deliverabilityChecker'], operation: ['get'] } },
		description: 'Unique token of the deliverability checker',
	},

	// getAll pagination — API caps per_page at 25
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['deliverabilityChecker'], operation: ['getAll'] } },
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
				resource: ['deliverabilityChecker'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},

	// create — optional providers + user_template_id
	{
		displayName: 'Create Fields',
		name: 'createFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['deliverabilityChecker'], operation: ['create'] } },
		options: [
			{
				displayName: 'Providers',
				name: 'providers',
				type: 'multiOptions',
				options: [
					{ name: 'Google', value: 'GOOGLE' },
					{ name: 'Gsuite', value: 'GSUITE' },
					{ name: 'Other', value: 'OTHER' },
					{ name: 'Outlook', value: 'OUTLOOK' },
					{ name: 'Outlook Business', value: 'OUTLOOKBUSINESS' },
					{ name: 'Yahoo', value: 'YAHOO' },
					{ name: 'Zoho', value: 'ZOHO' },
					{ name: 'Zoho Pro', value: 'ZOHOPRO' },
				],
				default: [],
				description: 'Leave empty to test all available providers',
			},
			{
				displayName: 'User Template ID',
				name: 'userTemplateId',
				type: 'number',
				default: 0,
				description: 'Optional template ID to use for the test',
			},
		],
	},

	// toggleAutoChecker — required Active
	{
		displayName: 'Active',
		name: 'autoCheckerActive',
		type: 'boolean',
		required: true,
		default: true,
		displayOptions: {
			show: { resource: ['deliverabilityChecker'], operation: ['toggleAutoChecker'] },
		},
		description: 'Whether the auto checker should be enabled',
	},

	// massUpdateAutoChecker
	{
		displayName: 'Active',
		name: 'massActive',
		type: 'boolean',
		required: true,
		default: true,
		displayOptions: {
			show: { resource: ['deliverabilityChecker'], operation: ['massUpdateAutoChecker'] },
		},
		description: 'Whether the auto checker should be enabled for the mailboxes',
	},
	{
		displayName: 'Mass Update Fields',
		name: 'massFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { resource: ['deliverabilityChecker'], operation: ['massUpdateAutoChecker'] },
		},
		options: [
			{
				displayName: 'Mailbox IDs',
				name: 'mailboxIds',
				type: 'string',
				default: '',
				placeholder: '12,34,56',
				description:
					'Comma-separated list of mailbox IDs. Leave empty to apply to all mailboxes.',
			},
			{
				displayName: 'User Template ID',
				name: 'userTemplateId',
				type: 'number',
				default: 0,
				description:
					'Template ID. Omit to keep previous template; pass 0 to fall back to default.',
			},
		],
	},
];
