import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RCDrawer, { DrawerProps as RCDrawerProps } from "rc-drawer";
import React, { useMemo } from "react";
import "./style.css";

interface Props extends RCDrawerProps, React.PropsWithChildren {
  onClose: () => void;
  open: boolean;
  destroyOnClose?: boolean;
  minWidth?: string;
}

export function Drawer({
  onClose,
  open,
  destroyOnClose = false,
  minWidth,
  children,
}: Props) {
  const shouldRender = useMemo(() => {
    return destroyOnClose ? open : true;
  }, [destroyOnClose, open]);

  const style: any = useMemo(() => {
    return { "--min-width": minWidth };
  }, [minWidth]);

  return (
    <RCDrawer
      maskClosable
      open={open}
      onClose={onClose}
      destroyOnClose={destroyOnClose}
      styles={{ wrapper: style }}
    >
      {shouldRender ? (
        <div className="grid grid-rows-[auto_1fr] h-full">
          <div className="flex justify-end">
            <div className="cursor-pointer p-2" onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} />
            </div>
          </div>
          <div className="h-full overflow-hidden">{children}</div>
        </div>
      ) : null}
    </RCDrawer>
  );
}
