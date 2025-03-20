import { WEB_API } from '@control/api.control';
import { InvoiceDTO, InvoiceCreateDTO } from '../type';
import { InvoiceStatus } from '@shared/invoice/type';

const rootPath = `/invoices`;

export async function createInvoice(payload: InvoiceCreateDTO): Promise<InvoiceDTO> {
	return WEB_API.post<InvoiceDTO>(`${rootPath}`, {
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
}

export async function getInvoices(params = {}) {
	return WEB_API.get<InvoiceDTO[]>(`${rootPath}`, params);
}

export async function getUserInvoices(params = {}) {
	return WEB_API.get<InvoiceDTO[]>(`${rootPath}/self`, params);
}

export async function updateInvoice(
	id: InvoiceDTO['id'],
	payload: Partial<InvoiceDTO>,
	params: any
): Promise<InvoiceDTO> {
	return WEB_API.patch<InvoiceDTO>(`${rootPath}/${id}`, {
		...params,
		body: JSON.stringify(payload),
	});
}

export async function completeInvoice(
	id: InvoiceDTO['id'],
	payload: Partial<InvoiceDTO>,
	params: any
): Promise<InvoiceDTO> {
	return WEB_API.post<InvoiceDTO>(`${rootPath}/${id}/complete`, {
		...params,
		body: JSON.stringify(payload),
	});
}

export async function cancelInvoice(id: InvoiceDTO['id'], params: any): Promise<InvoiceDTO> {
	return WEB_API.patch<InvoiceDTO>(`${rootPath}/${id}`, {
		...params,
		body: JSON.stringify({
			status: InvoiceStatus.OVERDUE,
		}),
	});
}
