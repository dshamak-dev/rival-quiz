import { useUI } from '@control/ui.control';
import { DeviceType } from '@model/ui.model';

import { NavigationMobile } from '@view/navigation/navigation.mobile';
import { NavigationDesktop } from '@view/navigation/navigation.desktop';

export function Navigation() {
	const { deviceType } = useUI();

	if (deviceType && [DeviceType.Desktop, DeviceType.Tablet].includes(deviceType)) {
		return <NavigationDesktop />;
	}

	return <NavigationMobile />;
}
