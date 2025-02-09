import { authCookie, getAuthCookie } from '@/auth';
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Form, useActionData, useSearchParams, useSubmit } from '@remix-run/react';
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
import { useUI } from '@control/ui.control';
import { APP_NAME } from 'src/constants/config.constants';
import { useTelegram } from 'src/hooks/telegram.hook';
import { getAuthFormPayload } from '@control/auth.utils';
import { UserAuthPayloadDTO } from '@model/user.role';
import { isNullOrEmpty } from '@control/validate.utils';

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const searchActionProps = getRequestSearchField(request, 'action');

	const isSignUp = searchActionProps === 'create';

	const [payload, payloadError] = await getAuthFormPayload(formData, isSignUp)
		.then((res: UserAuthPayloadDTO): [UserAuthPayloadDTO, null] => {
			return [res, null];
		})
		.catch((err): [null, any] => [null, getErrorMessage(err)]);

	if (isNullOrEmpty(payload) || payloadError) {
		return {
			error: payloadError || 'Invalid form data.',
			payload: null,
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
				...payload,
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

export async function loader({ request }: LoaderFunctionArgs) {
	const authToken = await getAuthCookie(request);

	if (!authToken) {
		return null;
	}

	const urlParts = new URL(request.url);
	const redirectUrl = urlParts.searchParams.get('continue') || '/';

	return redirect(redirectUrl);
}

export default function LoginPage() {
	const [searchParams] = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const actionData = useActionData<typeof action>();

	const { isTelegram, metadata } = useTelegram();

	const actionError = useMemo(() => {
		return actionData?.error || null;
	}, [actionData?.error]);
	const { deviceType, isMobile } = useUI();

	const handleSubmit = useSubmit();

	const continueUrl = useMemo(() => {
		return searchParams.get('continue') || '/';
	}, []);

	const telegramAuthLink = useMemo(() => {
		if (!isTelegram || !metadata) {
			return null;
		}

		const telegramFormData = new FormData();
		telegramFormData.append('authType', 'telegram');
		telegramFormData.append('id', metadata.id.toString());
		telegramFormData.append('username', metadata.username);
		telegramFormData.append('photoUrl', metadata.photoUrl);

		const handleAuthWithTelegram = (e: any) => {
			e.stopPropagation();
			e.preventDefault();

			fetch(`/login?action=create&continue=${continueUrl}`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: new URLSearchParams({
					authType: 'telegram',
					id: metadata.id.toString(),
					username: metadata.username,
					photoUrl: metadata.photoUrl,
				}),
			}).then((res) => {
				if (res.ok) {
					window.location.href = `/`;
				}
			});

			// handleSubmit(telegramFormData, { replace: true });
		};

		return (
			<Button type="reset" className="w-full" onClick={handleAuthWithTelegram}>
				Auth as @{metadata.username}
			</Button>
		);
	}, [isTelegram, metadata, handleSubmit, continueUrl]);

	const [isSignUp, setIsSignUp] = useState(actionData?.payload?.isSignUp || false);

	return (
		<div className="bg-contain bg-center">
			<div className={classNames('h-full flex flex-col gap-4 justify-center items-center p-4')}>
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
								email: (actionData?.payload as any)?.email ?? '',
							} as any
						}
						method="POST"
						action={`/login?action=${isSignUp ? 'create' : 'enter'}&continue=${continueUrl}`}
						className={classNames(
							'grid grid-cols-1 gap-6 justify-center items-center',
							'relative -top-6 bg-gray-100',
							{
								'p-6 w-full': isMobile,
								'py-12 px-12 min-w-[520px]': deviceType && !isMobile,
							}
						)}
						onSubmitCapture={(ev) => {
							console.log('Form submitted:', ev.currentTarget);
							setIsLoading(true);
							handleSubmit(ev.currentTarget, { replace: true });
						}}
					>
						<div className="flex flex-col justify-center items-center">
							<Typography className="text-xl font-semibold">
								{isSignUp ? 'Sign up' : 'Log in'} to {APP_NAME}
							</Typography>
							{actionError ? <p className="text-red-600">{actionError}</p> : null}
						</div>
						<div className="grid grid-cols-1 gap-4 w-full">
							<FormField
								label="Email"
								id="email"
								type="email"
								defaultValue={(actionData?.payload as any)?.email || undefined}
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
								inputProps={{
									autocomplete: 'password',
								}}
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
						<div className="flex flex-col gap-4">
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
							{telegramAuthLink}
						</div>
					</Form>
				</ClientComponent>
			</div>
		</div>
	);
}
