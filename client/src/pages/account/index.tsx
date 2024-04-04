import { faEdit, faTools } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useMemo } from "react";
import { useAppContext } from "src/app/context";
import { Button } from "src/components/atoms/button";
import { SignIn } from "src/components/molecules/auth";
import { SessionList } from "src/components/organizms/session-list";
import { SessionAdminDrawer } from "src/components/organizms/session-admin";
import { useSessionForm } from "src/hooks/useSessionForm";
import { useSessions } from "src/hooks/useSessions";

export const AccountPage = () => {
  const { loading, data, error, load } = useSessions({
    preload: false,
    self: true,
  });
  const { show } = useSessionForm();
  const { state, dispatch } = useAppContext();

  const handleShowAdmin = (game) => {
    dispatch((state) => {
      return { ...state, targetSession: game, sessionAdminVisible: true };
    });
  };

  const isLogged = useMemo(() => {
    return state?.ready && state?.logged;
  }, [state?.ready, state?.logged]);

  useEffect(() => {
    if (isLogged) {
      load();
    }
  }, [isLogged]);

  if (!state?.ready) {
    return null;
  }

  if (!isLogged) {
    return (
      <div className="h-full flex items-center justify-center">
        <SignIn>
          <Button primary>Sign In</Button>
        </SignIn>
      </div>
    );
  }

  const { email, fullName, assets } = state.user;

  const handleItemRender = (game) => {
    if (!game.isAdmin) {
      return null;
    }

    const hasStarted = [2, 3, 4].includes(game.stage);

    return (
      <div className="flex items-center gap-4">
        {hasStarted ? null : (
          <div className="cursor-pointer" onClick={() => show(game)}>
            <FontAwesomeIcon icon={faEdit} />
          </div>
        )}
        <div className="cursor-pointer" onClick={() => handleShowAdmin(game)}>
          <FontAwesomeIcon icon={faTools} />
        </div>
      </div>
    );
  };

  return (
    <>
      <article className="flex flex-col gap-6 px-6">
        <section className="text-center">
          <label className="font-thin text-xs">welcome back</label>
          <h1 className="font-bold text-2xl">{fullName}</h1>
          <h3 className="font-thin text-xl">{email}</h3>
        </section>
        <section className="text-center">
          <h2 className="font-bold text-4xl">{assets || 0}</h2>
          <a
            href="https://user.the-rivals.online/transaction"
            className="link font-thin text-md border-b border-current"
          >
            add balance
          </a>
        </section>
        <section className="flex flex-col gap-4">
          <div>
            <h3 className="text-left font-thin text-md w-full">Sessions</h3>
            <Button primary className="w-full capitalize" onClick={show}>
              Create new session
            </Button>
          </div>
          <SessionList
            loading={loading}
            items={data || []}
            onItemRender={handleItemRender}
          />
        </section>
      </article>
      <SessionAdminDrawer />
    </>
  );
};
