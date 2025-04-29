import { useEffect, useMemo, useRef } from 'react';

export function useTimeout(callback: () => void, delay: number) {
	const timepitRef = useRef<ReturnType<typeof setTimeout>>();

	const clear = () => clearTimeout(timepitRef?.current);

	useEffect(() => {
		clear();
		const timeoutId = setTimeout(callback, delay);
		timepitRef.current = timeoutId;

		return () => clear();
	}, [callback, delay]);

	return clear;
}

export function useInterval(callback: () => void, delay: number) {
	const timetRef = useRef<ReturnType<typeof setTimeout>>();

	const clear = () => clearInterval(timetRef?.current);

	useEffect(() => {
		clear();
		const timeoutId = setInterval(callback, delay);
		timetRef.current = timeoutId;

		callback();

		return () => clear();
	}, [callback, delay]);

	return clear;
}
