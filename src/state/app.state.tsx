import { ICompany } from "@model/company/company.model";
import { IUser } from "@model/user/user.model";
import { createContext, useEffect, useState } from "react";

interface IState {
  userId: string | null;
  user: IUser | null;
  company: ICompany | null;
}

export const AppContext = createContext<IState>({ userId: null, user: null, company: null });

export function AppContextProvider({ value, children }: any) {
  const [state, setState] = useState(value);

  useEffect(() => {
    setState(value);
  }, [value]);

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>
}