import type { INodeProperties } from 'n8n-workflow';

const SHOW_FOR_MAILBOX = { resource: ['mailbox'] };

const OPS_WITH_MAILBOX_ID = [
	'changeTariffPlan',
	'delete',
	'get',
	'getTotalWarmupStatistics',
	'getWarmupStatisticsByProvider',
	'healthCheck',
	'reconnect',
	'update',
	'updateState',
];

const APP_PASSWORD_PROVIDERS = ['aol', 'gmail', 'outlook', 'yahoo', 'zoho', 'zohopro'];
const SMTP_PROVIDERS = ['mailgun', 'sendgrid', 'smtp'];
const ADDITIONAL_KEY_PROVIDERS = ['mailgun', 'sendgrid'];
const ALL_NON_OAUTH_PROVIDERS = [...APP_PASSWORD_PROVIDERS, ...SMTP_PROVIDERS];

export const mailboxOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: SHOW_FOR_MAILBOX },
		options: [
			{
				name: 'Change Tariff Plan',
				value: 'changeTariffPlan',
				description: 'Change tariff plan for a mailbox',
				action: 'Change tariff plan',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new mailbox',
				action: 'Create a mailbox',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a mailbox',
				action: 'Delete a mailbox',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get details of a single mailbox',
				action: 'Get a mailbox',
			},
			{
				name: 'Get Domains List',
				value: 'getDomainsList',
				description: 'Get unique domains used by workspace mailboxes',
				action: 'Get domains list',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get a list of mailboxes',
				action: 'Get many mailboxes',
			},
			{
				name: 'Get Providers List',
				value: 'getProvidersList',
				description: 'Get email providers used by workspace mailboxes',
				action: 'Get providers list',
			},
			{
				name: 'Get Total Warmup Statistics',
				value: 'getTotalWarmupStatistics',
				description: 'Get total warmup counts for a mailbox',
				action: 'Get total warmup statistics',
			},
			{
				name: 'Get Warmup Statistics',
				value: 'getWarmupStatistics',
				description: 'Get inbox/spam placement stats across mailboxes',
				action: 'Get warmup statistics',
			},
			{
				name: 'Get Warmup Statistics by Provider',
				value: 'getWarmupStatisticsByProvider',
				description: 'Get warmup stats grouped by provider for a mailbox',
				action: 'Get warmup statistics by provider',
			},
			{
				name: 'Health Check',
				value: 'healthCheck',
				description: 'Trigger health check for a single mailbox',
				action: 'Run health check',
			},
			{
				name: 'Health Check All',
				value: 'healthCheckAll',
				description: 'Trigger health check for all active mailboxes',
				action: 'Run health check for all',
			},
			{
				name: 'Reconnect',
				value: 'reconnect',
				description: 'Reconnect an SMTP/IMAP mailbox with updated credentials',
				action: 'Reconnect a mailbox',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update mailbox warmup settings',
				action: 'Update mailbox settings',
			},
			{
				name: 'Update State',
				value: 'updateState',
				description: 'Activate or pause a mailbox',
				action: 'Update mailbox state',
			},
		],
		default: 'getAll',
	},
];

export const mailboxFields: INodeProperties[] = [
	// ----------------------------------------------------------------------
	// Shared: Mailbox ID
	// ----------------------------------------------------------------------
	{
		displayName: 'Mailbox',
		name: 'mailboxId',
		type: 'resourceLocator',
		required: true,
		default: { mode: 'list', value: '' },
		displayOptions: {
			show: { resource: ['mailbox'], operation: OPS_WITH_MAILBOX_ID },
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

	// ----------------------------------------------------------------------
	// getAll
	// ----------------------------------------------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: { show: { resource: ['mailbox'], operation: ['getAll'] } },
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1 },
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['getAll'], returnAll: [false] },
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['mailbox'], operation: ['getAll'] } },
		options: [
			{
				displayName: 'Filter by Domain IDs',
				name: 'filterDomainIds',
				type: 'string',
				default: '',
				placeholder: '12,34,56',
				description: 'Comma-separated list of domain IDs',
			},
			{
				displayName: 'Filter by Email',
				name: 'filterEmail',
				type: 'string',
				default: '',
				placeholder: 'user@example.com',
				description: 'Email substring (case-insensitive)',
			},
			{
				displayName: 'Filter by Group ID',
				name: 'filterGroupId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Filter by Providers',
				name: 'filterProviders',
				type: 'multiOptions',
				options: [
					{ name: 'AOL', value: 'aol' },
					{ name: 'Gmail', value: 'gmail' },
					{ name: 'Mailgun', value: 'mailgun' },
					{ name: 'OAuth Google', value: 'oauth_google' },
					{ name: 'OAuth Outlook', value: 'oauth_outlook' },
					{ name: 'Outlook', value: 'outlook' },
					{ name: 'SendGrid', value: 'sendgrid' },
					{ name: 'SMTP', value: 'smtp' },
					{ name: 'Yahoo', value: 'yahoo' },
					{ name: 'Zoho', value: 'zoho' },
					{ name: 'Zohopro', value: 'zohopro' },
				],
				default: [],
				description: 'Filter mailboxes by one or more providers',
			},
			{
				displayName: 'Response Type',
				name: 'responseType',
				type: 'options',
				options: [
					{ name: 'Default (Full)', value: '', description: 'Full mailbox data' },
					{ name: 'Simple', value: 'simple', description: 'Only ID and email' },
				],
				default: '',
				description: 'Use "Simple" for lightweight {ID, email} response',
			},
			{
				displayName: 'Sort by Email',
				name: 'sortingEmail',
				type: 'options',
				options: [
					{ name: 'None', value: '' },
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: '',
				description: 'Sort by email (only works when Response Type is Simple)',
			},
		],
	},

	// ----------------------------------------------------------------------
	// delete — optional reason
	// ----------------------------------------------------------------------
	{
		displayName: 'Reason',
		name: 'deleteReason',
		type: 'collection',
		placeholder: 'Add Reason Field',
		default: {},
		displayOptions: { show: { resource: ['mailbox'], operation: ['delete'] } },
		options: [
			{
				displayName: 'Reason Code',
				name: 'reason',
				type: 'string',
				default: '',
				description: 'Short reason code for deletion',
			},
			{
				displayName: 'Reason Text',
				name: 'reasonText',
				type: 'string',
				default: '',
				description: 'Detailed reason for deletion',
			},
		],
	},

	// ----------------------------------------------------------------------
	// updateState
	// ----------------------------------------------------------------------
	{
		displayName: 'State',
		name: 'state',
		type: 'options',
		required: true,
		default: 'activate!',
		displayOptions: { show: { resource: ['mailbox'], operation: ['updateState'] } },
		options: [
			{ name: 'Activate', value: 'activate!' },
			{ name: 'Pause', value: 'pause!' },
		],
		description: 'New state for the mailbox',
	},

	// ----------------------------------------------------------------------
	// changeTariffPlan
	// ----------------------------------------------------------------------
	{
		displayName: 'Tariff Plan Type Name or ID',
		name: 'tariffPlanTypeId',
		type: 'options',
		default: '',
		typeOptions: { loadOptionsMethod: 'getTariffPlanTypesWithUnselected' },
		displayOptions: { show: { resource: ['mailbox'], operation: ['changeTariffPlan'] } },
		description: 'New tariff plan. Select "Unselected" to clear. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ----------------------------------------------------------------------
	// reconnect — all fields optional (SMTP/IMAP credentials)
	// ----------------------------------------------------------------------
	{
		displayName: 'Reconnect Fields',
		name: 'reconnectFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['mailbox'], operation: ['reconnect'] } },
		options: [
			{
				displayName: 'Additional Key',
				name: 'additional_key',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Additional authentication key (e.g. API key for Mailgun/SendGrid)',
			},
			{
				displayName: 'From Name',
				name: 'from_name',
				type: 'string',
				default: '',
				description: 'Sender display name',
			},
			{
				displayName: 'IMAP Address',
				name: 'imap_address',
				type: 'string',
				default: '',
			},
			{
				displayName: 'IMAP Password',
				name: 'imap_password',
				type: 'string',
				typeOptions: { password: true },
				default: '',
			},
			{
				displayName: 'IMAP Port',
				name: 'imap_port',
				type: 'number',
				default: 993,
			},
			{
				displayName: 'IMAP SSL',
				name: 'imap_ssl',
				type: 'boolean',
				default: true,
				description: 'Whether to use SSL for IMAP',
			},
			{
				displayName: 'IMAP User Name',
				name: 'imap_user_name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Password',
				name: 'password',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Account password',
			},
			{
				displayName: 'SMTP Address',
				name: 'smtp_address',
				type: 'string',
				default: '',
			},
			{
				displayName: 'SMTP Password',
				name: 'smtp_password',
				type: 'string',
				typeOptions: { password: true },
				default: '',
			},
			{
				displayName: 'SMTP Port',
				name: 'smtp_port',
				type: 'number',
				default: 587,
			},
			{
				displayName: 'SMTP SSL',
				name: 'smtp_ssl',
				type: 'boolean',
				default: true,
				description: 'Whether to use SSL for SMTP',
			},
			{
				displayName: 'SMTP User Name',
				name: 'smtp_user_name',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Tariff Plan Type Name or ID',
				name: 'tariff_plan_type_id',
				type: 'options',
				default: '',
				typeOptions: { loadOptionsMethod: 'getTariffPlanTypes' },
				description: 'Tariff plan to assign on reconnect. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Use IMAP',
				name: 'use_imap',
				type: 'boolean',
				default: false,
				description: 'Whether to enable IMAP usage',
			},
		],
	},

	// ----------------------------------------------------------------------
	// getWarmupStatistics
	// ----------------------------------------------------------------------
	{
		displayName: 'Time Bucket',
		name: 'timeBucket',
		type: 'options',
		required: true,
		default: 'daily',
		displayOptions: { show: { resource: ['mailbox'], operation: ['getWarmupStatistics'] } },
		options: [
			{ name: 'Daily', value: 'daily', description: 'Last 30 days' },
			{ name: 'Hourly', value: 'hourly', description: 'Last 7 days' },
			{ name: 'Monthly', value: 'monthly', description: 'Older than 30 days' },
		],
	},
	{
		displayName: 'From',
		name: 'from',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'YYYY-MM-DD',
		displayOptions: { show: { resource: ['mailbox'], operation: ['getWarmupStatistics'] } },
		description: 'Start date in YYYY-MM-DD format',
	},
	{
		displayName: 'Mailbox IDs',
		name: 'mailboxIds',
		type: 'string',
		required: true,
		default: '',
		placeholder: '1722,2096',
		displayOptions: { show: { resource: ['mailbox'], operation: ['getWarmupStatistics'] } },
		description: 'Comma-separated list of mailbox IDs',
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		default: '',
		placeholder: 'YYYY-MM-DD',
		displayOptions: { show: { resource: ['mailbox'], operation: ['getWarmupStatistics'] } },
		description: 'End date in YYYY-MM-DD format. Defaults to current date.',
	},

	// ----------------------------------------------------------------------
	// getWarmupStatisticsByProvider
	// ----------------------------------------------------------------------
	{
		displayName: 'Period',
		name: 'period',
		type: 'options',
		required: true,
		default: 'week',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['getWarmupStatisticsByProvider'] },
		},
		options: [
			{ name: 'Month', value: 'month' },
			{ name: 'Quarter', value: 'quarter' },
			{ name: 'Today', value: 'today' },
			{ name: 'Week', value: 'week' },
			{ name: 'Year', value: 'year' },
			{ name: 'Yesterday', value: 'yesterday' },
		],
	},

	// ======================================================================
	// CREATE — provider-aware fields
	// ======================================================================
	{
		displayName: 'Provider',
		name: 'provider',
		type: 'options',
		required: true,
		default: 'gmail',
		displayOptions: { show: { resource: ['mailbox'], operation: ['create'] } },
		options: [
			{ name: 'AOL', value: 'aol' },
			{ name: 'Gmail', value: 'gmail' },
			{ name: 'Mailgun', value: 'mailgun' },
			{ name: 'OAuth Google', value: 'oauth_google' },
			{ name: 'OAuth Outlook', value: 'oauth_outlook' },
			{ name: 'Outlook', value: 'outlook' },
			{ name: 'SendGrid', value: 'sendgrid' },
			{ name: 'SMTP', value: 'smtp' },
			{ name: 'Yahoo', value: 'yahoo' },
			{ name: 'Zoho', value: 'zoho' },
			{ name: 'Zohopro', value: 'zohopro' },
		],
	},
	{
		displayName: 'Email',
		name: 'createEmail',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'user@example.com',
		displayOptions: { show: { resource: ['mailbox'], operation: ['create'] } },
	},
	{
		displayName: 'Tariff Plan Type Name or ID',
		name: 'createTariffPlanTypeId',
		type: 'options',
		required: true,
		default: '',
		typeOptions: { loadOptionsMethod: 'getTariffPlanTypes' },
		displayOptions: { show: { resource: ['mailbox'], operation: ['create'] } },
		description: 'Tariff plan to assign on creation. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// --- App Password providers ---
	{
		displayName: 'Password',
		name: 'createPassword',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['create'],
				provider: APP_PASSWORD_PROVIDERS,
			},
		},
		description: 'App password for the mailbox',
	},

	// --- SMTP providers (smtp/sendgrid/mailgun) ---
	{
		displayName: 'SMTP Address',
		name: 'createSmtpAddress',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: SMTP_PROVIDERS },
		},
	},
	{
		displayName: 'SMTP Port',
		name: 'createSmtpPort',
		type: 'number',
		required: true,
		default: 587,
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: SMTP_PROVIDERS },
		},
	},
	{
		displayName: 'SMTP SSL',
		name: 'createSmtpSsl',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: SMTP_PROVIDERS },
		},
		description: 'Whether to use SSL for SMTP',
	},
	{
		displayName: 'SMTP User Name',
		name: 'createSmtpUserName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: SMTP_PROVIDERS },
		},
	},
	{
		displayName: 'SMTP Password',
		name: 'createSmtpPassword',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: SMTP_PROVIDERS },
		},
	},
	{
		displayName: 'Additional Key (API Key)',
		name: 'createAdditionalKey',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['create'],
				provider: ADDITIONAL_KEY_PROVIDERS,
			},
		},
		description: 'API key (required for SendGrid and Mailgun)',
	},

	// --- OAuth Google ---
	{
		displayName: 'Access Token',
		name: 'createAccessTokenGoogle',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: ['oauth_google'] },
		},
	},
	{
		displayName: 'Refresh Token',
		name: 'createRefreshTokenGoogle',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: ['oauth_google'] },
		},
	},
	{
		displayName: 'Expires At',
		name: 'createExpiresAt',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: ['oauth_google'] },
		},
		description: 'Token expiration timestamp (unix seconds)',
	},
	{
		displayName: 'Client ID',
		name: 'createClientIdGoogle',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: ['oauth_google'] },
		},
	},
	{
		displayName: 'Redirect URI',
		name: 'createRedirectUri',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: ['oauth_google'] },
		},
	},
	{
		displayName: 'Token Credential URI',
		name: 'createTokenCredentialUri',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: 'https://oauth2.googleapis.com/token',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: ['oauth_google'] },
		},
	},

	// --- OAuth Outlook ---
	{
		displayName: 'Access Token',
		name: 'createAccessTokenOutlook',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: ['oauth_outlook'] },
		},
	},
	{
		displayName: 'Refresh Token',
		name: 'createRefreshTokenOutlook',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: ['oauth_outlook'] },
		},
	},
	{
		displayName: 'Client ID',
		name: 'createClientIdOutlook',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: ['oauth_outlook'] },
		},
	},
	{
		displayName: 'Client Secret',
		name: 'createClientSecretOutlook',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['create'], provider: ['oauth_outlook'] },
		},
	},

	// --- Optional common + SMTP-specific advanced ---
	{
		displayName: 'Additional Fields',
		name: 'createAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['mailbox'], operation: ['create'] } },
		options: [
			{
				displayName: 'From Name',
				name: 'from_name',
				type: 'string',
				default: '',
				description: 'Sender display name',
			},
			{
				displayName: 'Group ID',
				name: 'group_id',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'IMAP Address',
				name: 'imap_address',
				type: 'string',
				default: '',
				displayOptions: {
					show: { '/provider': ALL_NON_OAUTH_PROVIDERS },
				},
			},
			{
				displayName: 'IMAP Password',
				name: 'imap_password',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				displayOptions: {
					show: { '/provider': SMTP_PROVIDERS },
				},
			},
			{
				displayName: 'IMAP Port',
				name: 'imap_port',
				type: 'number',
				default: 993,
				displayOptions: {
					show: { '/provider': SMTP_PROVIDERS },
				},
			},
			{
				displayName: 'IMAP SSL',
				name: 'imap_ssl',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: { '/provider': SMTP_PROVIDERS },
				},
				description: 'Whether to use SSL for IMAP',
			},
			{
				displayName: 'IMAP User Name',
				name: 'imap_user_name',
				type: 'string',
				default: '',
				displayOptions: {
					show: { '/provider': SMTP_PROVIDERS },
				},
			},
			{
				displayName: 'Setting: Reply Rate',
				name: 'settingReplyRate',
				type: 'number',
				default: 0,
				description: 'Reply rate percentage (max 35)',
			},
			{
				displayName: 'Setting: Speed Mode',
				name: 'settingSpeedMode',
				type: 'options',
				options: [
					{ name: 'Slow', value: 'slow' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'Fast', value: 'fast' },
				],
				default: 'medium',
			},
			{
				displayName: 'Setting: User Max Limit',
				name: 'settingUserMaxLimit',
				type: 'number',
				default: 0,
				description: 'Maximum daily email limit',
			},
			{
				displayName: 'Use IMAP',
				name: 'use_imap',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: { '/provider': ALL_NON_OAUTH_PROVIDERS },
				},
				description: 'Whether to enable IMAP usage',
			},
		],
	},

	// ======================================================================
	// UPDATE — workspace setting form mode
	// ======================================================================
	{
		displayName: 'Setting Mode',
		name: 'settingMode',
		type: 'options',
		required: true,
		default: 'speed_form',
		displayOptions: { show: { resource: ['mailbox'], operation: ['update'] } },
		options: [
			{
				name: 'Speed Form',
				value: 'speed_form',
				description: 'Workspace uses speed_form mode',
			},
			{
				name: 'Detail Default',
				value: 'detail_default',
				description: 'Workspace uses detail_form mode (default preset)',
			},
			{
				name: 'Detail Custom',
				value: 'detail_custom',
				description: 'Workspace uses detail_form mode (custom values)',
			},
		],
		description: 'Match this to your workspace settings_form_mode',
	},
	{
		displayName: 'Speed Mode',
		name: 'updateSpeedMode',
		type: 'options',
		default: 'medium',
		displayOptions: {
			show: { resource: ['mailbox'], operation: ['update'], settingMode: ['speed_form'] },
		},
		options: [
			{ name: 'Slow', value: 'slow' },
			{ name: 'Medium', value: 'medium' },
			{ name: 'Fast', value: 'fast' },
		],
	},
	{
		displayName: 'Start on Day One',
		name: 'updateStartOnDayOne',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['update'],
				settingMode: ['detail_default', 'detail_custom'],
			},
		},
		description: 'Starting emails on day one',
	},
	{
		displayName: 'Increase per Day',
		name: 'updateIncreasePerDay',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['mailbox'],
				operation: ['update'],
				settingMode: ['detail_default', 'detail_custom'],
			},
		},
		description: 'Daily increase amount',
	},
	{
		displayName: 'User Max Limit',
		name: 'updateUserMaxLimit',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['mailbox'], operation: ['update'] } },
		description: 'Maximum daily email limit',
	},
	{
		displayName: 'Reply Rate',
		name: 'updateReplyRate',
		type: 'number',
		default: 0,
		displayOptions: { show: { resource: ['mailbox'], operation: ['update'] } },
		description: 'Reply rate percentage (should not exceed 35)',
	},
	{
		displayName: 'Update Fields',
		name: 'updateAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['mailbox'], operation: ['update'] } },
		options: [
			{
				displayName: 'From Name',
				name: 'from_name',
				type: 'string',
				default: '',
				description: 'Sender display name',
			},
			{
				displayName: 'Settings ID',
				name: 'settingsId',
				type: 'number',
				default: 0,
				description: 'ID of the mailbox setting record to update (optional)',
			},
		],
	},
];
