import React, { useMemo, useState } from "react";
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

  const isLogged = useMemo(() => {
    return user?.email != null;
  }, [user]);
  const hasBid = useMemo(() => {
    return state?.option && state?.value;
  }, [state]);

  const handleSubmit = (e, formFields) => {
    e.preventDefault();

    if (!isLogged) {
      return;
    }

    POST_JSON(`/api/games/${data.id}/user/bet`, { body: formFields }).then(
      async (res) => dispatch(await res.json())
    );
  };

  const handleCancelBid = (e) => {
    if (!isLogged) {
      return;
    }

    POST_JSON(`/api/games/${data.id}/user/cancel`, { body: null }).then(
      async (res) => dispatch(await res.json())
    );
  };

  return options?.length ? (
    <section className="flex flex-col items-center">
      <Form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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
          <div className="flex flex-col items-center">
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
      </Form>
    </section>
  ) : null;
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
  const { options = [], state, result } = data;

  const hasReward = useMemo(() => {
    return state?.reward;
  }, [state]);

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
            <p className="text-center text-xl font-bold">
              your reward is {state.reward}
            </p>
          </div>
        ) : (
          <p className="text-center text-xl font-thin">session closed</p>
        )}
      </div>
    </section>
  ) : null;
}
