import { createElement, useMemo } from 'react';
import * as icons from 'react-bootstrap-icons';

type BootstrapIconName = keyof typeof icons;

export type IconType = 'Logo' | BootstrapIconName;

interface Props {
	name: IconType;
	size?: number | string;
	className?: string;
}

export function Icon({ name, ...props }: Props) {
	const content = useMemo(() => {
		let iconName: BootstrapIconName | null = null;

		switch (name) {
			case 'Logo': {
				iconName = 'Dice3';
				break;
			}
			default: {
				iconName = name as BootstrapIconName;
			}
		}

		const Icon = iconName ? icons[iconName] : null;

		return Icon || null;
	}, [name]);

	if (!content) {
		return null;
	}

	return createElement(content, props);
}
