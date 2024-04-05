import React, { useCallback, useEffect, useMemo } from "react";
import { Button } from "src/components/atoms/button";
import { SessionList } from "src/components/organizms/session-list";
import { useSessions } from "src/hooks/useSessions";
import { SearchInput } from "src/components/atoms/input/searchInput";
import { SignIn } from "src/components/molecules/auth";
import { useAppContext } from "src/app/context";
import { useSessionForm } from "src/hooks/useSessionForm";
import { SessionFormDrawer } from "src/components/organizms/session-form/session-form-drawer";

export const HomePage = () => {
  const { loading, data, error, load, set } = useSessions({ preload: true });
  const { state, dispatch } = useAppContext();
  const { show } = useSessionForm();

  const isLogged = useMemo(() => {
    return state?.logged;
  }, [state?.logged]);

  const handleSearch = useCallback(() => {
    load();
  }, [load]);

  const handleData = (data) => {
    load();
  };

  return (
    <>
      <article className="flex flex-col gap-8 items-center text-center mx-auto px-6 sm:w-fit">
        <h1 className="mt-8 text-5xl sm:text-6xl">The Quizdation</h1>
        <section className="w-full">
          {isLogged ? (
            <Button
              primary
              className="w-full capitalize"
              onClick={() => show()}
            >
              Create new session
            </Button>
          ) : (
            state?.ready && (
              <SignIn>
                <Button primary className="w-full">
                  Sign In
                </Button>
              </SignIn>
            )
          )}
        </section>
        <section className="flex flex-col gap-4 w-full">
          <SearchInput className="w-full" onSubmit={handleSearch}>
            Search
          </SearchInput>
          <div className="flex flex-col">
            <h3 className="text-left text-xl">Search Results</h3>
            <SessionList loading={loading} items={data || []} />
          </div>
        </section>
      </article>
      <SessionFormDrawer onData={handleData} />
    </>
  );
};
