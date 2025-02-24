import { createContext, ReactNode, useContext, useRef } from 'react';

type DrawerProviderProps = {
	children: ReactNode;
};

export type DrawerProviderState = {
	addDrawer: (el: Element) => void;
	removeDrawer: (el: Element) => void;
} | null;

export const DrawerContext = createContext<DrawerProviderState>(null);

export function useDrawer() {
	const context = useContext(DrawerContext);
	if (!context) {
		throw new Error('DrawerProvider must be used within a DrawerProvider');
	}
	return context;
}

export function DrawerProvider({ children }: DrawerProviderProps) {
	const ref = useRef<HTMLDivElement>(null);
	const addDrawer = (el: Element) => {
		if (el && ref.current) {
			ref.current.append(el);
		}
	};

	const removeDrawer = (el: Element) => {
		if (el && ref.current) {
			el.remove();
		}
	};

	return (
		<>
			<DrawerContext.Provider value={{ addDrawer, removeDrawer }}>{children}</DrawerContext.Provider>
			<div ref={ref} className="fixed top-0 right-0 z-40"></div>
		</>
	);
}
