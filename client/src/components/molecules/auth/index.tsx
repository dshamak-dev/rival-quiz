import classNames from "classnames";
import React, { useCallback } from "react";
// import classNames from "classnames";
import { signOut } from "src/api/user.api";
import { useAppContext } from "src/app/context";

export const SignIn: React.FC<any> = ({ children, className }) => {
  const { state } = useAppContext();

  const handleClick = useCallback(async () => {
    location.href = state.authUrl;
  }, [state?.authUrl]);

  return (
    <div
      onClick={handleClick}
      className={classNames("cursor-pointer", className)}
    >
      {children}
    </div>
  );
};

export const SignOut: React.FC<any> = ({ children, className }) => {
  const { state, dispatch } = useAppContext();

  const handleClick = useCallback(async () => {
    signOut().then(async (res) => {
      dispatch((current) => {
        return { ...current, logged: false, user: null };
      });
    });
  }, []);

  return (
    <div
      onClick={handleClick}
      className={classNames("cursor-pointer", className)}
    >
      {children}
    </div>
  );
};
