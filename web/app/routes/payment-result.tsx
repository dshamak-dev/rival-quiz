
import { expandResponse } from '@shared/async/helpers';
import { useLoaderData } from '@remix-run/react';
import { Typography } from '@view/typography/typography';
import { useMemo } from 'react';
import { getAuthHeaders } from '@/auth';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { InvoiceStatus } from '@shared/invoice/type';
import { completeInvoice } from 'src/invoice/api';

export async function loader({ request }: LoaderFunctionArgs) {
	const { search } = new URL(request.url);
	const searchParams = new URLSearchParams(search);

	const searchEntries = search.replace(/^\?/, '').split('&');
	const searchData = searchEntries.reduce((acc, entry) => {
		const [key, value] = entry.split('=');
		acc[key] = decodeURIComponent(value);
		return acc;
	}, {} as { [key: string]: string });

	const continueUrl = searchParams.get('continue') || '/';

	if (!searchData) {
		return json({ error: 'Failed to authenticate user', invoice: null, continueUrl }, { status: 500 });
	}

	const { invoice_id, payment_intent, payment_intent_client_secret, redirect_status } = searchData;

	// Confirm invoice and payment intent
	const headers = await getAuthHeaders(request).catch((err) => null);

	if (!headers) {
		return json(
			{ error: 'Failed to authenticate user', invoice: { id: invoice_id }, continueUrl },
			{ status: 500 }
		);
	}

	const payload = {
		status: redirect_status === 'succeeded' ? InvoiceStatus.PAID : InvoiceStatus.OVERDUE,
		metadata: {
			payment: {
				payment_intent,
				payment_intent_client_secret,
			},
		},
	};

	if (payload.status !== InvoiceStatus.PAID) {
		return json({ invoice: { id: invoice_id }, continueUrl, error: { message: 'Payment failed' }, status: 500 });
	}

	const [invoice, error] = await expandResponse(completeInvoice(invoice_id, payload, { headers }));

	if (error) {
		return json({ invoice, continueUrl, error: error?.message || 'Failed to update invoice' }, { status: 500 });
	}

	return json({ invoice, continueUrl, error: null }, { status: 200 });
}

export default function PaymentPage() {
	const data = useLoaderData<typeof loader>();
	const { invoice, continueUrl, error } = data;

	const title = useMemo(() => {
		if (error) {
			return 'Payment Error';
		}

		return 'Payment Sussess';
	}, [invoice, error]);

	return (
		<div>
			<Typography>{title}</Typography>
			{invoice && <Typography>Invoice ID: {invoice.id}</Typography>}
			{error && <Typography className="text-red-500">{error}</Typography>}
			<a href={continueUrl}>Redirecting to: {continueUrl}</a>
		</div>
	);
}