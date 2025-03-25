import { getAuthHeaders } from '@/auth';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';
import { InvoiceStatus } from '@shared/invoice/type';
import { Typography } from '@view/typography/typography';
import { completeInvoice, fetchSupportInvoices } from 'src/invoice/api';
import { normalizeInvoicePaymentDTO } from 'src/invoice/helper';
import { InvoiceDTO } from 'src/invoice/type';
import { InvoicePaymentCard } from 'src/invoice/view/invoice.payment.card';

export async function loader({ request }: LoaderFunctionArgs) {
	const headers = await getAuthHeaders(request).catch((err) => null);

	if (!headers) {
		return null;
	}

	const data = await fetchSupportInvoices({ headers })
		.then((items) => {
			return Promise.all(items.map((it) => normalizeInvoicePaymentDTO(it)));
		})
		.catch((err) => {
			console.error('Failed to fetch support invoices:', err);
			return null;
		});

	return json(data);
}

export default function SupportPage() {
	const navigate = useNavigate();
	const data = useLoaderData<typeof loader>();

	if (!data?.length) {
		return <Typography>No support requests</Typography>;
	}

	const handleInvoiceConfirm = async (invoice: InvoiceDTO, payload: any) => {
		await completeInvoice(
			invoice.id,
			{
				status: InvoiceStatus.PAID,
				metadata: {
					...invoice.metadata,
					payment: payload,
				},
			},
			{}
		).then((res) => {
			navigate('.', { replace: true });
			return res;
		});
	};

	return (
		<div className="grid grid-cols-4 gap-8 justify-center h-fit p-8">
			{data.map((it) => (
				<InvoicePaymentCard
					key={it.id}
					invoice={it}
					onConfirm={(payload) => handleInvoiceConfirm(it, payload)}
				/>
			))}
		</div>
	);
}
