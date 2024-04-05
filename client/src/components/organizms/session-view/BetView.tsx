import React, { useEffect, useMemo, useState } from "react";
import { CheckList } from "src/components/atoms/input/CheckList";
import { Form } from "src/components/atoms/form";
import { Input } from "src/components/atoms/input";
import { Label } from "src/components/atoms/input/label";
import { Button } from "src/components/atoms/button";
import { SessionStageType } from "src/models/session.model";
import { POST_JSON } from "src/support/request.utils";
import { SignIn } from "src/components/molecules/auth";
import { Poll } from "src/components/molecules/poll";

export default function BetView({ data }) {
  const [session, setSession] = useState(data);

  useEffect(() => {
    setSession(data);
  }, [data]);

  switch (session.stage) {
    case SessionStageType.Draft:
    case SessionStageType.Lobby: {
      return <BetSelectionView data={session} dispatch={setSession} />;
    }
    case SessionStageType.Active: {
      return <BetActiveView data={session} />;
    }
    case SessionStageType.Close: {
      return <BetCloseView data={session} />;
    }
    default: {
      return null;
    }
  }
}

function BetSelectionView({ data, dispatch }) {
  const { user, options = [], users = 0, state } = data;
  const [error, setError] = useState(null);

  const errorText = useMemo(() => {
    if (!error) {
      return null;
    }

    return error?.message || error;
  }, [error]);

  const isLogged = useMemo(() => {
    return user?.email != null;
  }, [user]);
  const hasBid = useMemo(() => {
    return state?.option && state?.value;
  }, [state]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData: any = new FormData(e.target);
    const formFields = {};

    for (let [key, value] of formData) {
      formFields[key] = value;
    }

    if (!isLogged) {
      return;
    }

    setError(null);
    POST_JSON(`/api/games/${data.id}/user/bet`, { body: formFields })
      .then(async (res) => dispatch(await res.json()))
      .catch((error) => {
        setError(error);
      });
  };

  const handleCancelBid = (e) => {
    if (!isLogged) {
      return;
    }

    setError(null);
    POST_JSON(`/api/games/${data.id}/user/cancel`, { body: null })
      .then(async (res) => dispatch(await res.json()))
      .catch((error) => {
        setError(error);
      });
  };

  return (
    <section className="flex flex-col items-center">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <div>
          <h3 className="text-left text-xs font-thin capitalize">
            {hasBid ? "Selected" : "Select option"}
          </h3>
          <div className="min-w-[40vw] relative flex flex-col gap-4 items-center p-4 border border-black">
            <CheckList
              id="option"
              options={options}
              disabled={hasBid}
              defaultValue={state?.option}
              required
            />
          </div>
          <div className="flex justify-center gap-2 items-center font-thin">
            {users ? (
              <>
                <span>{users || 0}</span>
                <span>bids</span>
              </>
            ) : null}
          </div>
        </div>
        {isLogged ? (
          <div className="relative flex flex-col items-center">
            {hasBid ? (
              <strong className="text-center text-4xl">{state?.value}</strong>
            ) : (
              <Input
                id="value"
                type="number"
                required
                min="1"
                defaultValue={hasBid ? state.value : 1}
                className="w-fit text-center text-4xl border-0"
              />
            )}
            <Label className="capitalize text-center">
              {hasBid ? "your bid" : "input a bid"}
            </Label>
            {errorText ? (
              <p className="absolute -bottom-4 text-center text-xs text-rose-600">
                {errorText}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="flex gap-6 justify-center items-center">
          {isLogged ? (
            hasBid ? (
              <Button type="reset" onClick={handleCancelBid}>
                Remove Bid
              </Button>
            ) : (
              <Button primary>Set Bid</Button>
            )
          ) : (
            <SignIn>
              <Button primary>Sing In</Button>
            </SignIn>
          )}
        </div>
      </form>
    </section>
  );
}

function BetActiveView({ data }) {
  const { user, options = [], state } = data;

  const isLogged = useMemo(() => {
    return user?.email != null;
  }, [user]);
  const hasBid = useMemo(() => {
    return state?.option && state?.value;
  }, [state]);

  return options?.length ? (
    <section className="flex flex-col items-center">
      <div className="flex flex-col gap-6">
        <div>
          <div className="min-w-[40vw] relative flex flex-col gap-4 items-center p-4 border border-black">
            <Poll options={options} selected={state?.option} />
          </div>
        </div>
        {isLogged ? (
          <div className="flex flex-col items-center">
            <strong className="text-center text-4xl">
              {state?.value || "no bid"}
            </strong>
            <Label className="capitalize text-center">
              {hasBid ? "your bid" : null}
            </Label>
          </div>
        ) : null}
        <div>
          <p className="text-center text-xl font-thin">waiting for results</p>
        </div>
      </div>
    </section>
  ) : null;
}

function BetCloseView({ data }) {
  const { options = [], user, state, result } = data;

  const userId = useMemo(() => {
    return user?._id || user?.id;
  }, [user])
  const reward = useMemo(() => {
    if (!userId || !result?.winners){
      return null;
    }

    return result.winners[userId]?.value;
  }, [userId, result]);
  const hasReward = useMemo(() => {
    return !!reward;
  }, [reward]);

  return options?.length ? (
    <section className="flex flex-col items-center">
      <div className="flex flex-col gap-6">
        <div>
          <div className="min-w-[40vw] relative flex flex-col gap-4 items-center p-4 border border-black">
            <Poll
              options={options}
              selected={state?.option}
              answer={result?.answer}
            />
          </div>
        </div>
        {hasReward ? (
          <div>
            <p className="text-center text-2xl font-thin">
              your reward: <strong className="font-bold">{reward}</strong>
            </p>
          </div>
        ) : (
          <p className="text-center text-xl font-thin">session closed</p>
        )}
      </div>
    </section>
  ) : null;
}
