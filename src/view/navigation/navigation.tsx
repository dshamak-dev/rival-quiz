import { Anchor } from '@view/anchor';
import { Typography } from '@view/typography/typography';
import { UserAuthBadge } from '@view/user/user.auth-badge';
import classNames from 'classnames';

import logoImage from '@assets/logo.png';
import { Image } from '@view/image/image';

export function Navigation() {
	return (
		<nav
			className={classNames('grid grid-cols-[auto_1fr_auto] items-center gap-8 py-4 px-8', 'text-sm font-light')}
		>
			<div>
				<Anchor end href='/' className='relative -left-4 flex gap-2 items-center' activeClassName=''>
					<Image src={logoImage} style={{ width: 24 }} />
					<Typography className='uppercase text-xs font-black'>Quizdation</Typography>
				</Anchor>
			</div>
			<div className='flex gap-8'>
				<Anchor href='/profile' className='uppercase text-inherit font-inherit hover:underline'>
					profile
				</Anchor>
				<Anchor href='/emails' className='uppercase text-inherit font-inherit hover:underline'>
					support
				</Anchor>
			</div>
			<div className='flex items-center justify-end gap-8'>
				<UserAuthBadge />
			</div>
		</nav>
	);
}
