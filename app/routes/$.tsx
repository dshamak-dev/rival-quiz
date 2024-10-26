import { Icon } from '@view/icon';

export default function NotFoundPage() {
	return (
		<div className='h-full flex items-center justify-center'>
			<div className='flex flex-col items-center gap-8'>
				<Icon name='Ban' size={78} className='relative -top-6 text-red-600 animate-bounce' />
				<i>This place is closed. Come back later.</i>
			</div>
		</div>
	);
}
