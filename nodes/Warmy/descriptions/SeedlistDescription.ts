import type { INodeProperties } from 'n8n-workflow';

const SHOW_FOR_SEEDLIST = { resource: ['seedlist'] };

const OPS_WITH_SPLIT_ID = ['getSplit', 'getSplitEmails', 'updateSplit'];
const OPS_WITH_PAGINATION = ['getManySenders', 'getSplitEmails'];

export const seedlistOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: SHOW_FOR_SEEDLIST },
		options: [
			{
				name: 'Get Many Senders',
				value: 'getManySenders',
				description: 'Get whitelisted seedlist sender emails for the workspace',
				action: 'Get many seedlist senders',
			},
			{
				name: 'Get Many Splits',
				value: 'getManySplits',
				description: 'Retrieve seedlist splits with optional filters',
				action: 'Get many seedlist splits',
			},
			{
				name: 'Get Split',
				value: 'getSplit',
				description: 'Get details of a single seedlist split',
				action: 'Get a seedlist split',
			},
			{
				name: 'Get Split Emails',
				value: 'getSplitEmails',
				description: 'List seedlist email addresses for a split',
				action: 'Get split emails',
			},
			{
				name: 'Update Split',
				value: 'updateSplit',
				description: 'Add, update, or remove sender emails on a split',
				action: 'Update a seedlist split',
			},
		],
		default: 'getManySenders',
	},
];

export const seedlistFields: INodeProperties[] = [
	// Shared split ID — dynamically loaded from API
	{
		displayName: 'Split Name or ID',
		name: 'splitId',
		type: 'options',
		required: true,
		default: '',
		typeOptions: { loadOptionsMethod: 'getSeedlistSplits' },
		displayOptions: {
			show: { resource: ['seedlist'], operation: OPS_WITH_SPLIT_ID },
		},
		description: 'Seedlist split to operate on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// Shared pagination — getManySenders, getSplitEmails
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['seedlist'], operation: OPS_WITH_PAGINATION },
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
				resource: ['seedlist'],
				operation: OPS_WITH_PAGINATION,
				returnAll: [false],
			},
		},
	},

	// getManySenders — filters
	{
		displayName: 'Filters',
		name: 'senderFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['seedlist'], operation: ['getManySenders'] } },
		options: [
			{
				displayName: 'Email Substring',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'sender@example.com',
				description: 'Filter senders whose email contains this substring',
			},
		],
	},

	// getManySplits — filters
	{
		displayName: 'Filters',
		name: 'splitFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['seedlist'], operation: ['getManySplits'] } },
		options: [
			{
				displayName: 'Group Name',
				name: 'groupName',
				type: 'options',
				options: [
					{ name: 'Standard', value: 'standard' },
					{ name: 'Premium', value: 'premium' },
				],
				default: 'standard',
			},
			{
				displayName: 'Provider',
				name: 'provider',
				type: 'options',
				options: [
					{ name: 'Gmail', value: 'Gmail' },
					{ name: 'Gsuit', value: 'Gsuit' },
					{ name: 'Outlook', value: 'Outlook' },
					{ name: 'Yahoo', value: 'Yahoo' },
				],
				default: 'Gmail',
			},
		],
	},

	// updateSplit — senders
	{
		displayName: 'Senders',
		name: 'senders',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Sender',
		default: {},
		displayOptions: { show: { resource: ['seedlist'], operation: ['updateSplit'] } },
		options: [
			{
				displayName: 'Sender',
				name: 'sender',
				values: [
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						default: '',
						placeholder: 'sender@example.com',
						description: 'Email address of the sender',
					},
					{
						displayName: 'Existing Sender ID',
						name: 'senderId',
						type: 'number',
						default: 0,
						description:
							'Leave 0 to add a new sender. Set to existing sender ID to update or delete.',
					},
					{
						displayName: 'Remove',
						name: 'destroy',
						type: 'boolean',
						default: false,
						description:
							'Whether to remove this sender (requires Existing Sender ID to be set)',
					},
				],
			},
		],
	},
];
