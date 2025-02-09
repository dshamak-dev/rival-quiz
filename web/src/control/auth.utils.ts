import { UserAuthPayloadDTO, UserEmailAuthPayloadDTO } from '@model/user.role';
import { getFormFields } from './form.utils';
import { isNullOrEmpty } from './validate.utils';

export async function getAuthFormPayload(formData: FormData, isNewUser = false): Promise<UserAuthPayloadDTO> {
	const authType = formData.get('authType');
	const payload = getFormFields<UserAuthPayloadDTO>(
		formData,
		authType === 'telegram' ? ['authType', 'id', 'username', 'photoUrl'] : ['email', 'password', 'confirmPassword']
	);

	if (isNullOrEmpty(payload)) {
		console.log('getAuthFormPayload: Invalid form data', payload);
		return Promise.reject('Invalid form data');
	}

	console.log('getAuthFormPayload:', authType, payload);

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
