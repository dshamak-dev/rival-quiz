import { UserDTO } from '@model/user.model';
import { WalletDTO } from '@model/wallet.model';
import { ClientComponent } from '@view/client/client.component';
import { createContext, useEffect, useState } from 'react';

interface IState {
	userId: string | null;
	user: UserDTO | null;
	wallet?: WalletDTO;
}

export const AppContext = createContext<IState>({ userId: null, user: null });

export function AppContextProvider({ value, children }: any) {
	const [state, setState] = useState(value);

	useEffect(() => {
		setState(value);
	}, [value]);

	return <AppContext.Provider value={state}><ClientComponent>{children}</ClientComponent></AppContext.Provider>;
}
