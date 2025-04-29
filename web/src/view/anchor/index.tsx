import { NavLink } from '@remix-run/react';
import classNames from 'classnames';
import { ComponentProps, PropsWithChildren, useMemo } from 'react';

type Props = Omit<ComponentProps<typeof NavLink>, 'to'> & {
	href?: string;
	disabled?: boolean;
	activeClassName?: string;
	inactiveClassName?: string;
	pendingClassName?: string;
	/** @param {boolean | string} redirect - Used to specify a url to redirect to (True for the current one) */
	redirect?: boolean | string;
};

export function Anchor({
	children,
	href,
	className,
	activeClassName = 'text-amber-600',
	inactiveClassName = 'cursor-pointer',
	pendingClassName = 'cursor-pointer text-amber-300 animate-pulse',
	redirect = false,
	onClick,
	...props
}: PropsWithChildren<Props>) {
	const disabled = useMemo(() => {
		return props.disabled || (!href && !onClick);
	}, [props.disabled, onClick, href]);
	const toPath = useMemo(() => {
		if (!redirect || !href) {
			return href;
		}

		const redirectUrl = typeof redirect === 'string' ? redirect : window.location.pathname;

		return `${href}?continue=${redirectUrl}`;
	}, [href, redirect]);

	return (
		<NavLink
			{...props}
			aria-disabled={disabled}
			to={toPath || ''}
			onClick={(e) => {
				// const isActive = (e.currentTarget as Element).classList.contains('active');

				if (disabled) {
					e.preventDefault();
				}
			}}
			className={({ isActive, isPending }) =>
				classNames(className, {
					[inactiveClassName]: !isActive,
					active: isActive,
					[activeClassName]: isActive && href,
					[pendingClassName]: isPending,
					'pointer-events-none opacity-40': disabled,
				})
			}
		>
			{children}
		</NavLink>
	);
}
