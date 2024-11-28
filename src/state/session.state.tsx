import { SessionDTO } from '@model/session.model';
import { createContext, useContext, useEffect, useReducer, useState } from 'react';

interface IState {
	session?: SessionDTO;
	userProgress?: number;
	dispatch?: (action: Action) => void;
}

type Action =
	| { type: 'SET_SESSION'; payload: SessionDTO }
	| { type: 'SET_USER_PROGRESS'; payload: number }
	| { type: 'SYNC_STATE'; payload?: undefined };

export const SessionContext = createContext<IState>({ session: undefined });

export function SessionContextProvider({ value, children }: { value: SessionDTO; children: React.ReactNode }) {
	const [state, dispatch] = useReducer(reducer, { session: value, userProgress: 0 });

	useEffect(() => {
		if (value) {
			dispatch({ type: 'SET_SESSION', payload: value });
		}
	}, [value]);

	return <SessionContext.Provider value={{ ...state, dispatch }}>{children}</SessionContext.Provider>;
}

function reducer(state: IState, action: Action) {
	switch (action.type) {
		case 'SET_SESSION': {
			return { ...state, session: action.payload };
		}
		case 'SET_USER_PROGRESS': {
			return { ...state, userProgress: action.payload };
		}
		default: {
			return state;
		}
	}
}

export function useSession() {
	const context = useContext(SessionContext);

	if (!context) {
		throw new Error('useSession must be used within a SessionContextProvider');
	}

	return context;
}
