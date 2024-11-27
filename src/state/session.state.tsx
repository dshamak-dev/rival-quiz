import { SessionDTO } from '@model/session.model';
import { createContext, useContext, useEffect, useState } from 'react';

interface IState {
	session?: SessionDTO;
}

export const SessionContext = createContext<IState>({ session: undefined });

export function SessionContextProvider({ value, children }: any) {
	const [session, setState] = useState(value);

	useEffect(() => {
		setState(value);
	}, [value]);

	return <SessionContext.Provider value={{ session }}>{children}</SessionContext.Provider>;
}

export function useSession() {
	const context = useContext(SessionContext);

	if (!context) {
		throw new Error('useSession must be used within a SessionContextProvider');
	}

	return context;
}
