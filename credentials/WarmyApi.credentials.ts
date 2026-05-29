import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

import { WARMY_BASE_URL } from '../nodes/Warmy/GenericFunctions';

export class WarmyApi implements ICredentialType {
	name = 'warmyApi';

	displayName = 'Warmy API';

	icon: Icon = 'file:icon.svg';

	documentationUrl = 'https://www.warmy.io/api-documentation';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Generate or copy from warmy.io → Workspace → Settings → API Keys. Sent as Bearer token.',
		},
		{
			displayName: 'Holder UID',
			name: 'holderUid',
			type: 'string',
			default: '',
			required: true,
			description:
				'Workspace identifier sent in the Holder-Uid header. Get it from https://www.warmy.io/api-documentation.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
				'Holder-Uid': '={{$credentials.holderUid}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: WARMY_BASE_URL,
			url: '/api/v2/mailboxes',
			method: 'GET',
			qs: { per_page: 1 },
		},
	};
}
