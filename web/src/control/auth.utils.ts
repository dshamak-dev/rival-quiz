import { UserAuthPayloadDTO, UserEmailAuthPayloadDTO } from '@model/user.role';
import { getFormFields } from './form.utils';
import { isNullOrEmpty } from './validate.utils';

export function getRedirectUrl(url: string): string {
	try {
		const urlParts = new URL(url);
		const redirectUrl = urlParts.searchParams.get('continue');

		if (!redirectUrl) {
			return '/';
		}

		if (!redirectUrl.startsWith('http')) {
			return redirectUrl;
		}

		const continueParts = new URL(redirectUrl);

		return continueParts.pathname;
	} catch (error) {
		return '/';
	}
}

export async function getAuthFormPayload(formData: FormData, isNewUser = false): Promise<UserAuthPayloadDTO> {
	const authType = formData.get('authType');
	const payload = getFormFields<UserAuthPayloadDTO>(
		formData,
		authType === 'telegram'
			? ['authType', 'id', 'name', 'photoUrl']
			: ['email', 'name', 'password', 'confirmPassword']
	);

	if (isNullOrEmpty(payload)) {
		return Promise.reject('Invalid form data');
	}

	if (authType == 'telegram') {
		return payload;
	}

	const emailPayload = payload as UserEmailAuthPayloadDTO;

	if (isNewUser && emailPayload.password !== formData.get('confirmPassword')) {
		return Promise.reject('Pasword is not matching confirmation password');
	}

	if (!emailPayload.email || !emailPayload.password) {
		return Promise.reject('Email and password required');
	}

	return {
		...emailPayload,
		authType: 'email',
	};
}
