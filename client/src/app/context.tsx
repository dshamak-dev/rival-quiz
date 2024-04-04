import React, { createContext, useContext, useEffect, useState } from "react";
import { signIn } from "src/api/user.api";

const initialState = {
  ready: false,
  user: null,
  authUrl: null,
  logged: false,
  sessionFormVisible: false,
  sessionAdminVisible: false,
  targetSession: null,
};

export const AppContext = createContext({
  state: initialState,
  dispatch: (state) => {},
});

export const useAppContext = () => {
  const { state, dispatch } = useContext(AppContext);

  return { state, dispatch };
};

export const AppStore = ({ children }) => {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    signIn()
      .then(({ user, authUrl }: any) => {
        setState((current) => ({
          ...current,
          user,
          authUrl,
          logged: user != null,
        }));
      })
      .catch((error) => {})
      .finally(() => {
        setState((current) => ({ ...current, ready: true }));
      });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch: setState }}>
      {children}
    </AppContext.Provider>
  );
};
