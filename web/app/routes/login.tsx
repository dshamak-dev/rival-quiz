import { authCookie, getAuthCookie } from '@/auth';
import { ActionFunctionArgs, json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { ClientComponent } from '@view/client/client.component';
import { Icon } from '@view/icon';
import { getErrorMessage, validateJSONResponse } from '@control/api.control';
import { UserDTO } from '@model/user.model';
import { FormField } from '@view/form/form.field';
import { Button } from '@view/button/button';
import { useUI } from '@control/ui.control';
import { APP_NAME } from 'src/constants/config.constants';
import { useTelegram } from 'src/hooks/telegram.hook';
import { useAPI } from '@api/api.hook';
import { UserAuthPayloadDTO } from '@model/user.role';
import { loginUser, signupUser } from '@api/user.api';
import { getRedirectUrl } from '@control/auth.utils';

export async function action({ request }: ActionFunctionArgs) {
	const payload = await request.json();
	const url = new URL(request.url);
	const urlSearchParams = new URLSearchParams(url.search);

	const isSignUp = urlSearchParams.get('action') === 'create';

	if (isSignUp) {
		return signupUser(payload);
	}

	return loginUser(payload);

	// TODO: Add form validation errors
}

export async function loader({ request }: LoaderFunctionArgs) {
	const authToken = await getAuthCookie(request);
	const continueUrl = getRedirectUrl(request.url);

	if (!authToken) {
		return json({
			continueUrl,
		});
	}

	return redirect(continueUrl);
}

export default function LoginPage() {
	const [isLoading, setIsLoading] = useState(false);
	const { continueUrl } = useLoaderData<typeof loader>();

	const [authResponse, setAuthResponse] = useState<{ user?: UserDTO; error?: string; payload: any } | null>(null);

	const { dispatch } = useAPI<{ action: string; payload: UserAuthPayloadDTO }, any>({
		request: ({ action, payload }) => {
			return fetch(`/login?action=${action}&continue=${continueUrl}`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			}).then((response) => {
				if (response.ok) {
					window.location.href = continueUrl;
				} else {
					setAuthResponse({
						error:
							response.status == 400
								? 'Invalid credentials'
								: 'Failed to authenticate. Please try again.',
						payload,
					});
				}
			});
		},
	});

	const { isTelegram, metadata } = useTelegram();

	const actionError = useMemo(() => {
		return authResponse?.error || null;
	}, [authResponse?.error]);
	const { deviceType, isMobile } = useUI();

	const handleSubmitForm = (action = 'enter', payload: UserAuthPayloadDTO) => {
		setIsLoading(true);

		dispatch({ action, payload })
			.catch((err) => {
				setAuthResponse({
					error: getErrorMessage(err),
					payload,
				});
			})
			.finally(() => {
				setIsLoading(false);
			});
	};

	const telegramAuthLink = useMemo(() => {
		if (!isTelegram || !metadata) {
			return null;
		}

		const handleAuthWithTelegram = (e: any) => {
			e.stopPropagation();
			e.preventDefault();

			handleSubmitForm('create', {
				authType: 'telegram',
				id: metadata.id,
				name: metadata.name,
				photoUrl: metadata.photoUrl,
			});
		};

		return (
			<Button type="reset" className="w-full" onClick={handleAuthWithTelegram}>
				Login with Telegram
			</Button>
		);
	}, [isTelegram, metadata, continueUrl]);

	const [isSignUp, setIsSignUp] = useState(authResponse?.payload?.isSignUp || false);

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
								email: (authResponse?.payload as any)?.email ?? '',
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
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
						onSubmitCapture={(ev) => {
							ev.preventDefault();
							ev.stopPropagation();

							const formData = new FormData(ev.currentTarget);
							const payload = Object.fromEntries(formData.entries());

							handleSubmitForm(isSignUp ? 'create' : 'enter', {
								...payload,
								authType: 'email',
							} as UserAuthPayloadDTO);
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
								defaultValue={(authResponse?.payload as any)?.email || undefined}
								required
							/>

							{isSignUp && <FormField label="Name" id="name" className="flex flex-col" />}

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
									className="flex flex-col"
								/>
							)}
						</div>
						<div className="flex">
							<Typography
								className="cursor-pointer hover:text-sky-500 underline"
								onClick={() => setIsSignUp(!isSignUp)}
							>
								{isSignUp ? 'I have an account' : "I don't have account"}
							</Typography>
						</div>
						<div className="flex flex-col gap-4">
							<Button
								layout="primary"
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
