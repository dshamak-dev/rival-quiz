import { NavLink } from '@remix-run/react';
import classNames from 'classnames';
import { ComponentProps, PropsWithChildren, useMemo } from 'react';

type Props = Omit<ComponentProps<typeof NavLink>, 'to'> & {
	href?: string;
	disabled?: boolean;
	activeClassName?: string;
	inactiveClassName?: string;
	pendingClassName?: string;
};

export function Anchor({
	children,
	href,
	className,
	activeClassName = 'text-amber-600',
	inactiveClassName = '',
	pendingClassName = 'text-amber-300 animate-pulse',
	onClick,
	...props
}: PropsWithChildren<Props>) {
	const disabled = useMemo(() => {
		return props.disabled || (!href && !onClick);
	}, [props.disabled, onClick, href]);

	return (
		<NavLink
			{...props}
			aria-disabled={disabled}
			to={href || ''}
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
