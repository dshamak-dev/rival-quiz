import { useAPI } from '@api/api.hook';
import { findUserByToken } from '@api/user.api';
import { UserDTO } from '@model/user.model';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useAuth } from '@state/auth.hook';
import { LinkButton } from '@view/anchor/link.button';
import { Button } from '@view/button/button';
import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { useEffect, useMemo, useRef } from 'react';

const fieldsMap: (keyof UserDTO)[] = ['authType', 'name', 'email'];

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await findUserByToken().catch((err) => null);

	return user;
}

export default function ProfileIntoPage() {
	const user = useLoaderData<UserDTO>();
	const { logOut } = useAuth();

	const fields = useMemo(() => {
		if (!user) {
			return null;
		}

		return fieldsMap.map((key) => {
			const value = user[key];

			if (value == null) {
				return null;
			}

			return (
				<Typography key={key} className="text-sm flex gap-2">
					<span className="capitalize">{key}:</span>
					<b>{value}</b>
				</Typography>
			);
		});
	}, [user]);

	if (user == null) {
		return (
			<div className="h-full flex flex-col items-center justify-center justify-self-center align-self-center">
				<Icon size={48} name="Person" className={classNames('relative -top-6 animate-bounce')} />
				<Typography className="text-center relative">Profile not found</Typography>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 p-4">
			<h2>Profile Details</h2>
			<div className="flex flex-col gap-2">{fields}</div>
			<div>
				<Button onClick={logOut}>Loug Out</Button>
			</div>
		</div>
	);
}
