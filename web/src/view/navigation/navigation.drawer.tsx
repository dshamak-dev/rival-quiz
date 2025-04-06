import { useUI } from '@control/ui.control';
import { getUserRoleLabel, validateUserPermissions } from '@control/user.control';
import { isNullOrEmpty } from '@control/validate.utils';
import { USER_ROLE_TYPE } from '@model/user.role';
import { useAuth } from '@state/auth.hook';
import { usePermissions } from '@state/permissions.hook';
import { Anchor } from '@view/anchor';
import { Button } from '@view/button/button';
import { Chip } from '@view/chip';
import { Drawer } from '@view/drawer/drawer';
import { Icon, IconType } from '@view/icon';
import { Image } from '@view/image/image';
import { SessionCreateButton } from '@view/session/session.create-button';
import { Typography } from '@view/typography/typography';
import classNames from 'classnames';
import { ReactNode, Suspense, useMemo, useRef, useState } from 'react';
import { PERMISSION_TYPE } from 'src/constants/permission.constants';
import { WalletDepositButton } from 'src/wallet/view/wallet.deposit-button';
import { WalletWithdrawButton } from 'src/wallet/view/wallet.withdraw-button';

type NavigationDrawerProps = {
	children?: ReactNode | ((open: boolean) => ReactNode);
	offsetY?: number;
};

type NavLinkItem = { link: string; text: string; icon: IconType; permissions?: USER_ROLE_TYPE[] };

export function NavigationDrawer({ children, offsetY = 0 }: NavigationDrawerProps) {
	const { isMobile } = useUI();
	const { isLoggedIn, user, logOut, processing, requestRoleUpdate } = useAuth();
	const can = usePermissions();
	const canCreateSession = can(PERMISSION_TYPE.CREATE_SESSION);

	const [isOpen, setIsOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const handleClick = () => {
		setIsOpen(!isOpen);
	};

	const handleLogout = () => {
		setIsOpen(false);
		logOut();
	};

	const trigger = useMemo(() => {
		if (!children) {
			return <Icon name={isOpen ? 'XLg' : 'List'} size={24} />;
		}

		if (typeof children === 'function') {
			return children(isOpen);
		}

		return children;
	}, [isOpen, children]);

	const links = useMemo((): NavLinkItem[] => {
		return [
			{ link: '/wallet', text: 'Wallet', icon: 'Wallet2' },
			{ link: '/history', text: 'History', icon: 'ClockHistory' },
			{
				link: '/profile/sessions',
				text: 'Custom Sessions',
				icon: 'Grid',
				permissions: [USER_ROLE_TYPE.ADMIN, USER_ROLE_TYPE.CREATOR],
			},
		].filter((it) => {
			if (!it?.link) {
				return false;
			}

			if (!it.permissions?.length) {
				return true;
			}

			return validateUserPermissions(user, it.permissions);
		}) as NavLinkItem[];
	}, [user]);

	const userInfoContent = useMemo(() => {
		if (!user) {
			return null;
		}

		const fields = [user.name, user.email].filter((it) => !!it?.trim());

		return fields.map((field, index) => {
			return (
				<Typography
					key={index}
					className={classNames('max-w-[20rem]', {
						'text-lg font-bold leading-none': index === 0,
						'text-sm font-light': index > 0,
					})}
					truncate="true"
				>
					{field}
				</Typography>
			);
		});
	}, [user]);

	const handleRequestVIP = () => {
		requestRoleUpdate(USER_ROLE_TYPE.CREATOR);
	};

	const content = useMemo(() => {
		if (!isLoggedIn || !user) {
			return null;
		}

		const vipControls = !canCreateSession ? (
			<div>
				<Button layout="tertiary" onClick={handleRequestVIP} loading={processing}>
					Request VIP
				</Button>
			</div>
		) : (
			<Chip className="uppercase bg-black text-amber-400 text-xs">{getUserRoleLabel(user.role as USER_ROLE_TYPE)}</Chip>
		);

		return (
			<div className="h-full grid grid-rows-[1fr_auto] gap-6 p-4">
				<div className="flex flex-col gap-6">
					<div data-testid="profile-info" className="flex flex-col gap-4">
						<div
							className={classNames('grid gap-4', {
								'grid-cols-[auto_1fr]': !isNullOrEmpty(user.photoUrl),
								'grid-cols-[1fr]': isNullOrEmpty(user.photoUrl),
							})}
						>
							{!isNullOrEmpty(user.photoUrl) && (
								<div className="flex min-h-full">
									<Image
										src={user.photoUrl}
										className="w-[48px] h-[48px] rounded-full overflow-hidden object-cover"
									/>
								</div>
							)}
							<div className="flex flex-col gap-2">
								<div className="grid grid-cols-[1fr_auto]">
									<div className="max-w-full overflow-hidden">{userInfoContent}</div>
									{vipControls}
								</div>
								<Typography className="flex gap-2 items-center uppercase text-xs">
									<span>#{user.tag || user.id}</span> <Icon name="Copy" size={12} />
								</Typography>
							</div>
						</div>
						<section data-testid="payment-section">
							{/* <WalletWithdrawButton /> */}
							<WalletDepositButton />
						</section>
					</div>
					{/* SHOW LAST X ACTIVE SESSIONS */}
					<div className="flex flex-col gap-4">
						{links.map(({ link, text, icon }, index) => (
							<Anchor
								end
								key={index}
								href={link}
								activeClassName="font-bold"
								className={classNames(
									'flex justify-between gap-4 items-center py-2 px-4 bg-gray-50',
									'uppercase text-inherit font-inherit hover:bg-gray-200'
								)}
							>
								<div className="flex items-center gap-2">
									<Icon name={icon} size={16} className="mr-2" />
									{text}
								</div>
								<Icon name="ArrowRight" size={16} />
							</Anchor>
						))}
					</div>
					<div>
						<SessionCreateButton className="w-full" onSubmit={() => setIsOpen(false)} />
					</div>
				</div>
				<div>
					<Button onClick={handleLogout} className="w-full">
						Log Out
					</Button>
				</div>
			</div>
		);
	}, [isLoggedIn, user, links, processing]);

	if (!isLoggedIn) {
		return null;
	}

	return (
		<Suspense fallback={null}>
			<Drawer
				open={isOpen}
				onClose={() => setIsOpen(false)}
				offsetTop={isMobile ? 0 : offsetY}
				offsetBottom={isMobile ? offsetY : 0}
			>
				{content}
			</Drawer>
			<div ref={ref} onClick={handleClick} className="cursor-pointer">
				{trigger}
			</div>
		</Suspense>
	);
}
