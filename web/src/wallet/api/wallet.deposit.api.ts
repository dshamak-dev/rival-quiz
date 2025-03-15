import { WEB_API } from '@control/api.control';
import { InvoiceCreateDTO, InvoiceDTO } from '../type/wallet.invoice-type';

export async function fetchDepositRequest(payload: InvoiceCreateDTO): Promise<InvoiceDTO> {
	return WEB_API.post<InvoiceDTO>(`/invoices`, payload);
}
