import { createSession } from '@api/session.api';
import { getErrorMessage, WEB_API } from '@control/api.control';
import { SessionDTO } from '@model/session.model';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { Button } from '@view/button/button';
import { FormField } from '@view/form/form.field';
import { Typography } from '@view/typography/typography';

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const entries = formData.entries();
	const payload: Record<string, any> = {};

	for (const [key, value] of entries) {
		payload[key] = value;
	}

	const [session, error]: [SessionDTO | null, string | null] = await createSession(payload)
		.then((res: SessionDTO): [SessionDTO, null] => [res, null])
		.catch((err) => [null, getErrorMessage(err)]);

	if (!session) {
		return { error: error || 'Session was not created.', payload };
	}

	// Save session to database
	// Return session ID or redirect to session page
	return redirect(`/sessions/${session.id}`);
}

export default function CreateSessionPage() {
	const actionData = useActionData<typeof action>();
	const error = actionData?.error || null;
	const initialState = actionData?.payload;

	return (
		<div className="flex justify-center">
			<Form className="p-6 flex flex-col gap-6" method="POST" relative="path">
				<div className="flex flex-col gap-4">
					<FormField
						type="text"
						id="title"
						placeholder="Enter session title"
						defaultValue={initialState?.title || ''}
					/>
				</div>
				<div>
					<Button type="submit">Create Session</Button>
					{error && <Typography className="text-red-500">{error}</Typography>}
				</div>
			</Form>
		</div>
	);
}
