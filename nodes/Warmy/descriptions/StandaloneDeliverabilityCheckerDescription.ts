import type { INodeProperties } from 'n8n-workflow';

const SHOW_FOR_SDC = { resource: ['standaloneDeliverabilityChecker'] };

export const standaloneDeliverabilityCheckerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: SHOW_FOR_SDC },
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a deliverability test without a connected mailbox',
				action: 'Create a standalone deliverability checker',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a standalone deliverability checker by uniq token',
				action: 'Get a standalone deliverability checker',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List standalone deliverability checkers',
				action: 'Get many standalone deliverability checkers',
			},
			{
				name: 'Get Possible Providers',
				value: 'getPossibleProviders',
				description: 'List providers available for standalone deliverability testing',
				action: 'Get possible providers',
			},
		],
		default: 'getAll',
	},
];

export const standaloneDeliverabilityCheckerFields: INodeProperties[] = [
	{
		displayName: 'Uniq Token',
		name: 'sdcUniqToken',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['standaloneDeliverabilityChecker'], operation: ['get'] },
		},
		description: 'Unique test token (SID) returned from the Create operation',
	},

	// getAll pagination — server-side max per_page is 25
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['standaloneDeliverabilityChecker'], operation: ['getAll'] },
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
				resource: ['standaloneDeliverabilityChecker'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
	},

	// create — required providers (dynamically loaded from API)
	{
		displayName: 'Provider Names or IDs',
		name: 'sdcProviders',
		type: 'multiOptions',
		required: true,
		default: [],
		typeOptions: {
			loadOptionsMethod: 'getStandaloneDeliverabilityProviders',
		},
		displayOptions: {
			show: { resource: ['standaloneDeliverabilityChecker'], operation: ['create'] },
		},
		description: 'List of providers to run the test against. Loaded from Warmy account settings. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];
