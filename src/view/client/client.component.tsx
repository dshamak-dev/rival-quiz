import { ReactElement, ReactNode, useSyncExternalStore } from "react";

interface IProps {
  children?: ReactNode;
  fallback?: React.ReactNode;
}

function subscribe() {
	return () => {};
}

export function useHydrated() {
	return useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);
}


export function ClientComponent({ children, fallback }: IProps) {
  const canUseContent = useHydrated();

  if (!canUseContent) {
    return fallback || null;
  }

  return children || null;
}