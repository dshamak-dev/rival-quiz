import { Icon } from '@view/icon';
import { Typography } from '@view/typography/typography';

export function MobileSupportPlaceholder() {
	return (
		<div className="flex flex-col gap-2 items-center">
			<Icon name="HourglassSplit" size={36} />
			<Typography className="text-center text-xs">
				The mobile version is in development.<br />Switch to the desktop to continue.
			</Typography>
		</div>
	);
}
