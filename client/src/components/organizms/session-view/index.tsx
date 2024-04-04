import React, { useMemo } from "react";
import BetView from "./BetView";
import { SessionType } from "src/models/session.model";

export function SessionContent({ data }) {
  if (!data) {
    return null;
  }

  const { type } = data;

  const content = useMemo(() => {
    switch (type) {
      case SessionType.Bet: {
        return <BetView data={data} />;
      }
      default: {
        return null;
      }
    }
  }, [data]);

  return content;
}
