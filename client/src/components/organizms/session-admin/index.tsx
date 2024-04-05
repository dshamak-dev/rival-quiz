import React, { useCallback, useMemo } from "react";
import { useAppContext } from "src/app/context";
import { Drawer } from "src/components/atoms/drawer";
import { Button } from "src/components/atoms/button";
import { getSessionStageLabel } from "src/support/session.utils";
import { SessionStageType } from "src/models/session.model";
import { POST_JSON } from "src/support/request.utils";
import { Form } from "src/components/atoms/form";
import Select from "src/components/atoms/input/select";
import { Label } from "src/components/atoms/input/label";

export const SessionAdminDrawer = ({ onData = null }) => {
  const { state, dispatch } = useAppContext();

  const handleClose = useCallback(() => {
    dispatch((state) => {
      return { ...state, sessionAdminVisible: false };
    });
  }, [dispatch]);

  const handleEnd = (payload) => {
    if (onData){
      onData(payload);
    }

    handleClose();
  };

  const handleProgress = () => {};

  return (
    <Drawer
      open={state?.sessionAdminVisible && state?.targetSession}
      destroyOnClose
      onClose={handleClose}
      minWidth="60vw"
    >
      <div className="px-6 relative h-full overflow-y-auto">
        <SessionAdmin onProgress={handleProgress} onEnd={handleEnd} />
      </div>
    </Drawer>
  );
};

function SessionAdmin({ onProgress, onEnd }) {
  const { state, dispatch } = useAppContext();
  const { targetSession } = state;

  if (!targetSession) {
    return <div>Nothing here</div>;
  }

  const fields = useMemo(() => {
    const { id, title, details, users, stage, capacity } = targetSession;

    return [
      { label: "title", text: title },
      { label: "details", text: details || "not set" },
      { label: "users", text: `${users || 0} / ${capacity}` },
      { label: "stage", text: getSessionStageLabel(stage) },
    ];
  }, [targetSession]);

  const handleStart = () => {
    if (onProgress) {
      onProgress();
    }

    POST_JSON(`/api/games/${targetSession.id}/user/start`, { body: {} })
      .then((res) => res.json())
      .then(async (res) => {
        dispatch((state) => {
          return { ...state, targetSession: res };
        });
      });
  };

  const handleEnd = (e, formFields) => {
    e.preventDefault();

    if (onProgress) {
      onProgress();
    }

    POST_JSON(`/api/games/${targetSession.id}/user/end`, {
      body: formFields,
    })
      .then((res) => res.json())
      .then(async (res) => {
        dispatch((state) => {
          return { ...state, targetSession: res };
        });
      });
  };

  const controls = useMemo(() => {
    switch (targetSession.stage) {
      case SessionStageType.Draft:
      case SessionStageType.Lobby: {
        return (
          <Button primary className="w-full capitalize" onClick={handleStart}>
            start session
          </Button>
        );
      }
      case SessionStageType.Active: {
        const answerOptions = targetSession.options;

        return (
          <Form onSubmit={handleEnd} className="flex flex-col gap-2">
            <div className="flex flex-col">
              <Label required id="answer">
                Select Answer
              </Label>
              <Select
                id="answer"
                options={answerOptions}
                className="w-full"
              ></Select>
            </div>
            <Button primary className="w-full capitalize">
              end session
            </Button>
          </Form>
        );
      }
      default: {
        return null;
      }
    }
  }, [targetSession.stage]);

  return (
    <div className="flex flex-col gap-4">
      {fields.map(({ label, text }, index) => {
        return (
          <div key={index} className="flex flex-col">
            <strong className="text-xs">{label}</strong>
            <p className="text-lg font-thin">{text}</p>
          </div>
        );
      })}
      {controls ? (
        <div className="sticky bottom-0 py-2 w-full bg-white border-t border-black">
          {controls}
        </div>
      ) : null}
    </div>
  );
}
