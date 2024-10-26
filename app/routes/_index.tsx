import { Typography } from '@view/typography/typography';

import logoImage from '@assets/logo.png';
import { Image } from '@view/image/image';
import { useAPI } from '@api/api.hook';
import { WEB_API } from '@control/api.control';
import { useEffect } from 'react';

export default function LandingPage() {
	const { data, loading, dispatch } = useAPI({ initialState: null, request: () => WEB_API.get('/health') });

	useEffect(() => {
		dispatch();
	}, []);

	return (
		<div className='h-screen max-h-full flex flex-col items-center justify-center'>
			<Image src={logoImage} style={{ width: 48 }} className='relative -top-6 animate-bounce' />
			<Typography className=''>Quizdation starts here</Typography>
		</div>
	);
}
