import { UserDTO } from '@model/user.model';
import { WalletDTO } from '@model/wallet.model';
import { ClientComponent } from '@view/client/client.component';
import React, { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';

export interface AppState {
	userId: string | null;
	user: UserDTO | null;
	wallet?: WalletDTO;
}

type AppContextState = AppState & {
	dispatch?: Dispatch<SetStateAction<AppState>>;
};

export const AppContext = createContext<AppContextState>({ userId: null, user: null });

export function AppContextProvider({ value, children }: any) {
	const [state, setState] = useState(value);

	useEffect(() => {
		setState(value);
	}, [value]);

	return (
		<AppContext.Provider value={{ ...state, dispatch: setState }}>
			<ClientComponent>{children}</ClientComponent>
		</AppContext.Provider>
	);
}
