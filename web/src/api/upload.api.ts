import { WEB_API } from '@control/api.control';

export async function uploadFile(file: File) {
	const formData = new FormData();
	formData.append('file', file);

	return WEB_API.post<any>('/uploads', {
		remix: true,
		defaultHeaders: true,
		body: formData,
		credentials: 'include',
	}).then(res => res.imageUrl);
}
