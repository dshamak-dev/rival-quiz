import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faHome,
  faSignIn,
  faSignOut,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "src/components/atoms/link";
import { useLocation } from "react-router-dom";
import "./style.css";
import { useAppContext } from "src/app/context";
import { SignIn, SignOut } from "src/components/molecules/auth";

export const Navigation = () => {
  let location = useLocation();
  const { state, dispatch } = useAppContext();

  const isLogged = useMemo(() => {
    return state?.logged;
  }, [state?.logged]);

  // const isGame = useMemo(() => {
  //   return /^\/play\//.exec(location.pathname) != null;
  // }, [location.pathname]);
  const isAccount = useMemo(() => {
    return /^\/(account)/.exec(location.pathname) != null;
  }, [location.pathname]);
  // const isHome = !isAccount && !isGame;

  const userLink = useMemo(() => {
    if (isAccount) {
      return isLogged ? (
        <SignOut>
          <FontAwesomeIcon icon={faSignOut} />
        </SignOut>
      ) : (
        <SignIn>
          <FontAwesomeIcon icon={faSignIn} />
        </SignIn>
      );
    }

    return (
      <NavLink to="/account">
        <FontAwesomeIcon icon={faUser} />
      </NavLink>
    );
  }, [isLogged, isAccount]);

  return (
    <nav>
      <NavLink to="/">
        <FontAwesomeIcon icon={faHome} />
      </NavLink>
      {userLink}
    </nav>
  );
};
