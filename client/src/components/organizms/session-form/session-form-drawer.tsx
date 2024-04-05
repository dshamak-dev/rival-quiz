import React, { useCallback } from "react";
import { useAppContext } from "src/app/context";
import { Drawer } from "src/components/atoms/drawer";
import { SessionForm } from ".";
import { Button } from "src/components/atoms/button";

export const SessionFormDrawer = ({ data = null, onData = null } = {}) => {
  const { state, dispatch } = useAppContext();

  const handleClose = useCallback(() => {
    dispatch((state) => {
      return { ...state, sessionFormVisible: false, targetSession: null };
    });
  }, [dispatch]);

  const handleEnd = (payload) => {
    if (onData){
      onData(payload);
    }

    handleClose();
  };

  const handleProgress = () => {};

  const handleDiscard = () => {
    handleClose();
  };

  return (
    <Drawer
      open={state?.sessionFormVisible}
      destroyOnClose
      onClose={handleClose}
      minWidth="60vw"
    >
      <div className="px-6 relative h-full overflow-y-auto">
        <SessionForm data={data} onProgress={handleProgress} onEnd={handleEnd}>
          <div className="sticky bottom-0 py-2 flex gap-4 items-center bg-white border-t border-black">
            <Button primary className="grow">
              Submit
            </Button>
            <Button type="reset" onClick={handleDiscard} className="grow">
              Discard
            </Button>
          </div>
        </SessionForm>
      </div>
    </Drawer>
  );
};
