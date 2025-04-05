import { WEB_API } from '@control/api.control';
import { SessionDTO } from '@model/session.model';

export function fetchSessionUpdateState(
	sessionId: SessionDTO['id'],
	targetDate: string | number | Date,
	params = {}
): Promise<boolean> {
	if (!targetDate || !sessionId){
		return Promise.reject();
	}

	return WEB_API.get(`/sessions/${sessionId}/update?date=${targetDate}`, { ...params })
		.then((res) => true)
		.catch((err) => {
			return false;
		});
}
