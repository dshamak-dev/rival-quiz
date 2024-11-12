import { authCookie } from '@/auth';
import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useLocation, useSearchParams, useSubmit } from '@remix-run/react';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import cookie from 'cookie';

import { useMemo, useState } from 'react';
import { ClientComponent } from '@view/client/client.component';
import { Icon } from '@view/icon';
import { getErrorMessage, getRequestSearchField, WEB_API } from '@control/api.control';
import { AuthDTO } from '@model/user.model';
import { FormField } from '@view/form/form.field';
import { Button } from '@view/button/button';

type AuthPayload = {
	email?: string;
	password?: string;
	isSignUp?: boolean;
};

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const searchActionProps = getRequestSearchField(request, 'action');

	const isSignUp = searchActionProps === 'create';

	const payload: AuthPayload = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	};

	if (isSignUp && payload.password !== formData.get('confirmPassword')) {
		return {
			user: null,
			error: 'Pasword is not matching confirmation password',
			payload: {
				email: payload.email,
				isSignUp,
			},
		};
	}

	if (!payload.email || !payload.password) {
		return {
			email: null,
			error: 'Email and password required',
			payload: {
				email: payload?.email,
				isSignUp,
			},
		};
	}

	const [auth, error]: [AuthDTO | null, string | null] = await WEB_API.post<Response>(
		isSignUp ? 'users/create' : 'users/login',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		},
		true
	)
		.then(async (res): Promise<[AuthDTO, string | null]> => {
			const cookies = res.headers.get('Set-Cookie');
			const cookieEntries = cookies ? cookie.parse(cookies) : null;

			const token = cookieEntries?.authToken;

			if (token) {
				WEB_API.setJWT(token);
			}

			return res.json();
		})
		.then((user: any): [AuthDTO, string | null] => {
			return [
				{
					user,
					token: WEB_API.JWT || undefined,
				},
				null,
			];
		})
		.catch((err): [null, string | null] => {
			return [null, getErrorMessage(err)];
		});

	if (!auth?.user || !auth.token || error) {
		return {
			user: null,
			error,
			payload: {
				email: payload.email,
				isSignUp,
			},
		};
	}

	const urlParts = new URL(request.url);
	const redirectUrl = urlParts.searchParams.get('continue') || '/';

	return redirect(redirectUrl, {
		headers: {
			'Set-Cookie': await authCookie.serialize(auth.token),
		},
	});
}

export default function LoginPage() {
	const [searchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const actionData = useActionData<typeof action>();
	const actionError = useMemo(() => {
		return actionData?.error || null;
	}, [actionData?.error]);

	const handleSubmit = useSubmit();

	const continueUrl = useMemo(() => {
		return searchParams.get('continue') || '/';
	}, []);

	const [isSignUp, setIsSignUp] = useState(actionData?.payload?.isSignUp || false);

	return (
		<div className="bg-contain bg-center">
			<div className={classNames('h-full flex flex-col gap-4 justify-center items-center')}>
				<ClientComponent
					fallback={
						<div className="py-12">
							<Icon name="PersonArmsUp" size={48} className="text-white animate-bounce" />
						</div>
					}
				>
					<Form
						// disabled={isLoading}
						defaultValue={
							{
								email: actionData?.payload?.email,
							} as any
						}
						method="POST"
						action={`/login?action=${isSignUp ? 'create' : 'enter'}&continue=${continueUrl}`}
						className={classNames(
							'grid grid-cols-1 gap-6 justify-center items-center py-12 px-12 min-w-[520px]',
							'relative -top-6 bg-gray-100'
						)}
						onSubmitCapture={(ev) => {
							setIsLoading(true);
							handleSubmit(ev.currentTarget, { replace: true });
						}}
					>
						<div className="flex flex-col justify-center items-center">
							<Typography className="text-xl font-semibold">
								{isSignUp ? 'Sign up' : 'Log in'} to Quizdation
							</Typography>
							{actionError ? <p className="text-red-600">{actionError}</p> : null}
						</div>
						<div className="grid grid-cols-1 gap-4 w-full">
							<FormField
								label="Email"
								id="email"
								type="email"
								defaultValue={actionData?.payload?.email || undefined}
								required

								// rules={[{ required: true, message: 'Please input your email!' }]}
							/>

							<FormField
								label="Password"
								id="password"
								type="password"
								// rules={[{ required: true, message: 'Please input your password!' }]}
								required
								className="flex flex-col"
							/>

							{isSignUp && (
								<FormField
									label="Confirm Password"
									id="confirmPassword"
									type="password"
									// rules={[{ required: true, message: 'Please input your password!' }]}
									required
									size="large"
									className="flex flex-col"
								/>
							)}
						</div>
						<div className="flex">
							<Typography
								className="cursor-pointer hover:text-sky-500 underline"
								onClick={() => setIsSignUp(!isSignUp)}
							>
								{isSignUp ? 'I have account' : "I don't have account"}
							</Typography>
						</div>
						<div>
							<Button
								// type='primary'
								type="submit"
								size="base"
								// loading={isLoading}
								disabled={isLoading}
								className="w-full"
							>
								{isSignUp ? 'Create account' : 'Log in'}
							</Button>
						</div>
					</Form>
				</ClientComponent>
			</div>
		</div>
	);
}
