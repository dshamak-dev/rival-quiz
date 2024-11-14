import { DeviceType } from '@model/ui.model';
import { useEffect, useMemo, useState } from 'react';

export function useUI() {
	const [deviceType, setDeviceType] = useState<DeviceType | null>(null);

	const isMobile = useMemo(() => {
		return deviceType === DeviceType.Mobile;
	}, [deviceType]);

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;

			setDeviceType(getDeviceTypeByWidth(width));
		};

		window.addEventListener('resize', handleResize);
		handleResize();

		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return { deviceType, isMobile };
}

export function getDeviceTypeByWidth(width: number): DeviceType {
	if (width < 860) {
		return DeviceType.Mobile;
	} else if (width < 1024) {
		return DeviceType.Tablet;
	}

	return DeviceType.Desktop;
}
